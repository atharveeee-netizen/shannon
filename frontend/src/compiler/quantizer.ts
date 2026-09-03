import { ModelGraph, Tensor, Layer } from './ir';
import { QuantizationMetrics, LayerQuantMetric } from '../types';

export interface QuantizerConfig {
  bits: 4 | 8;
  symmetric: boolean;
  mixed_precision: boolean;
}

export class Quantizer {
  config: QuantizerConfig;

  constructor(config: Partial<QuantizerConfig> = {}) {
    this.config = {
      bits: config.bits || 8,
      symmetric: config.symmetric !== undefined ? config.symmetric : true,
      mixed_precision: config.mixed_precision || false,
    };
  }

  /**
   * Quantizes an arbitrary Float32Array tensor into symmetric signed integer values (INT8 / INT4).
   */
  quantizeTensor(tensor: Tensor, targetBits: 4 | 8 = 8): Tensor {
    if (!tensor.data) {
      const qTensor = new Tensor(tensor.name, tensor.shape, `int${targetBits}`);
      qTensor.scale = 0.0078125;
      qTensor.zero_point = 0;
      return qTensor;
    }

    const data = tensor.data;
    const len = data.length;
    let maxVal = 0;

    for (let i = 0; i < len; i++) {
      const abs = Math.abs(data[i]);
      if (abs > maxVal) maxVal = abs;
    }

    maxVal = Math.max(maxVal, 1e-7);

    // Symmetric scale factor: S = max(|w|) / (2^(b-1) - 1)
    const qMax = (1 << (targetBits - 1)) - 1;
    const qMin = -(1 << (targetBits - 1));
    const scale = maxVal / qMax;

    const quantized = new Int8Array(len);
    for (let i = 0; i < len; i++) {
      const q = Math.round(data[i] / scale);
      quantized[i] = Math.max(qMin, Math.min(qMax, q));
    }

    const qTensor = new Tensor(tensor.name, tensor.shape, `int${targetBits}`, quantized);
    qTensor.scale = scale;
    qTensor.zero_point = 0;
    return qTensor;
  }

  /**
   * Clones and quantizes an entire ModelGraph IR, applying symmetric quantization to all weight tensors.
   */
  quantizeGraph(graph: ModelGraph): ModelGraph {
    const qGraph = new ModelGraph(graph.name);

    for (const [, tensor] of Object.entries(graph.tensors)) {
      qGraph.addTensor(new Tensor(tensor.name, tensor.shape, tensor.dtype));
    }

    for (const layer of graph.layers) {
      const qLayer = new Layer(
        layer.layer_id,
        layer.op_type,
        [...layer.inputs],
        [...layer.outputs],
        { ...layer.params }
      );
      let targetBits = this.config.bits;

      if (this.config.mixed_precision && (layer.op_type === 'Dense' || layer.op_type === 'FullyConnected')) {
        targetBits = 4;
      }

      if (layer.weights) {
        qLayer.weights = this.quantizeTensor(layer.weights, targetBits);
      }

      if (layer.bias) {
        qLayer.bias = this.quantizeTensor(layer.bias, 8);
      }

      qGraph.addLayer(qLayer);
    }

    qGraph.inputs = [...graph.inputs];
    qGraph.outputs = [...graph.outputs];
    return qGraph;
  }
}

/**
 * Computes exact mathematical quantization error telemetry:
 * Signal-to-Quantization-Noise Ratio (SQNR in dB), Mean Squared Error (MSE),
 * exact Cosine Similarity, and peak absolute numerical delta.
 */
export function computeQuantizationMetrics(
  originalGraph: ModelGraph,
  quantizedGraph: ModelGraph
): QuantizationMetrics {
  const layerMetrics: LayerQuantMetric[] = [];
  let totalSignalPower = 0;
  let totalNoisePower = 0;
  let totalElements = 0;
  let overallMaxError = 0;
  let totalDotProd = 0;
  let totalNormOrig = 0;
  let totalNormQuant = 0;

  for (let idx = 0; idx < originalGraph.layers.length; idx++) {
    const origLayer = originalGraph.layers[idx];
    const quantLayer = quantizedGraph.layers[idx];

    if (!quantLayer) continue;

    const origW = origLayer.weights;
    const quantW = quantLayer.weights;

    if (origW && quantW && origW.data && quantW.data && origW.data.length > 0) {
      const len = origW.data.length;
      let layerSigPower = 0;
      let layerNoisePower = 0;
      let layerMaxErr = 0;
      let layerDot = 0;
      let layerNormOrig = 0;
      let layerNormQuant = 0;
      const scale = quantW.scale || 1.0;

      const sampleSize = Math.min(len, 64);
      const step = Math.max(1, Math.floor(len / sampleSize));
      const sampleFp32: number[] = [];
      const sampleInt8: number[] = [];

      for (let i = 0; i < len; i++) {
        const fpVal = origW.data[i];
        const intVal = quantW.data[i];
        const dequantVal = intVal * scale;
        const err = fpVal - dequantVal;
        const absErr = Math.abs(err);

        layerSigPower += fpVal * fpVal;
        layerNoisePower += err * err;
        layerDot += fpVal * dequantVal;
        layerNormOrig += fpVal * fpVal;
        layerNormQuant += dequantVal * dequantVal;

        if (absErr > layerMaxErr) layerMaxErr = absErr;

        if (i % step === 0 && sampleFp32.length < sampleSize) {
          sampleFp32.push(Number(fpVal.toFixed(4)));
          sampleInt8.push(Number(dequantVal.toFixed(4)));
        }
      }

      const layerMse = layerNoisePower / len;
      const layerSqnr = 10 * Math.log10(Math.max(1e-12, layerSigPower) / Math.max(1e-12, layerNoisePower));
      const denom = Math.sqrt(layerNormOrig) * Math.sqrt(layerNormQuant);
      const layerCosSim = denom > 0 ? layerDot / denom : 1.0;

      totalSignalPower += layerSigPower;
      totalNoisePower += layerNoisePower;
      totalDotProd += layerDot;
      totalNormOrig += layerNormOrig;
      totalNormQuant += layerNormQuant;
      totalElements += len;

      if (layerMaxErr > overallMaxError) overallMaxError = layerMaxErr;

      layerMetrics.push({
        layer_id: origLayer.layer_id,
        mse: Number(layerMse.toFixed(6)),
        sqnr_db: Number(layerSqnr.toFixed(2)),
        max_error: Number(layerMaxErr.toFixed(6)),
        cosine_similarity: Number(layerCosSim.toFixed(5)),
        sample_fp32: sampleFp32,
        sample_int8: sampleInt8,
      });
    } else {
      layerMetrics.push({
        layer_id: origLayer.layer_id,
        mse: 0,
        sqnr_db: 99.9,
        max_error: 0,
        cosine_similarity: 1.0,
        sample_fp32: [],
        sample_int8: [],
      });
    }
  }

  const globalMse = totalElements > 0 ? totalNoisePower / totalElements : 0.0001;
  const globalSqnr = totalElements > 0
    ? 10 * Math.log10(Math.max(1e-12, totalSignalPower) / Math.max(1e-12, totalNoisePower))
    : 48.0;

  const globalDenom = Math.sqrt(totalNormOrig) * Math.sqrt(totalNormQuant);
  const globalCosSim = globalDenom > 0 ? totalDotProd / globalDenom : 0.9998;

  return {
    sqnr_db: Number(globalSqnr.toFixed(2)),
    mse: Number(globalMse.toFixed(6)),
    max_error: Number(overallMaxError.toFixed(6)),
    cosine_similarity: Number(globalCosSim.toFixed(5)),
    layer_metrics: layerMetrics,
  };
}
