import { ModelGraph, Tensor, Layer } from './ir';
import { QuantizationMetrics, LayerQuantMetric } from '../types';

export interface QuantizationOptions {
  bits: 4 | 8;
  symmetric: boolean;
  mixed_precision: boolean;
}

export class Quantizer {
  bits: 4 | 8;
  symmetric: boolean;
  mixed_precision: boolean;
  q_min: number;
  q_max: number;

  constructor(options: Partial<QuantizationOptions> = {}) {
    this.bits = options.bits || 8;
    this.symmetric = options.symmetric !== undefined ? options.symmetric : true;
    this.mixed_precision = options.mixed_precision || false;

    if (this.bits === 8) {
      this.q_min = this.symmetric ? -127 : -128;
      this.q_max = 127;
    } else {
      this.q_min = -7;
      this.q_max = 7;
    }
  }

  quantizeTensor(tensor: Tensor): Tensor {
    const qType = this.bits === 8 ? 'int8' : 'int8'; // Packed or aligned
    const qTensor = new Tensor(tensor.name, [...tensor.shape], qType);

    if (tensor.data && tensor.data.length > 0) {
      let maxAbs = 0.0001;
      for (let i = 0; i < tensor.data.length; i++) {
        const val = Math.abs(tensor.data[i]);
        if (val > maxAbs) maxAbs = val;
      }

      const scale = maxAbs / this.q_max;
      qTensor.scale = scale;
      qTensor.zero_point = 0;

      const qData = new Int8Array(tensor.data.length);
      for (let i = 0; i < tensor.data.length; i++) {
        const qVal = Math.round(tensor.data[i] / scale);
        qData[i] = Math.max(this.q_min, Math.min(this.q_max, qVal));
      }
      qTensor.data = qData;
    } else {
      qTensor.scale = 0.0078125;
      qTensor.zero_point = 0;
    }

    qTensor.size_bytes = qTensor.calculateSize();
    return qTensor;
  }

  quantizeGraph(graph: ModelGraph): ModelGraph {
    const qGraph = new ModelGraph(`${graph.name}_quantized_int${this.bits}`);

    // Quantize Tensors
    for (const tensor of Object.values(graph.tensors)) {
      const qT = this.quantizeTensor(tensor);
      qGraph.addTensor(qT);
    }

    // Quantize Layers
    for (const layer of graph.layers) {
      const qLayer = new Layer(
        layer.layer_id,
        layer.op_type,
        [...layer.inputs],
        [...layer.outputs],
        { ...layer.params }
      );

      if (layer.weights) {
        qLayer.weights = this.quantizeTensor(layer.weights);
      }
      if (layer.bias) {
        // Biases typically quantized to INT32 or scaled INT8
        const qBias = this.quantizeTensor(layer.bias);
        qLayer.bias = qBias;
      }

      qGraph.addLayer(qLayer);
    }

    qGraph.inputs = [...graph.inputs];
    qGraph.outputs = [...graph.outputs];
    qGraph.computeStats();
    return qGraph;
  }
}

export function computeQuantizationMetrics(
  originalGraph: ModelGraph,
  quantizedGraph: ModelGraph
): QuantizationMetrics {
  let totalSignalPower = 0;
  let totalNoisePower = 0;
  let totalElements = 0;
  let overallMaxError = 0;
  const layerMetrics: LayerQuantMetric[] = [];

  for (let idx = 0; idx < originalGraph.layers.length; idx++) {
    const origLayer = originalGraph.layers[idx];
    const quantLayer = quantizedGraph.layers[idx];
    if (!origLayer || !quantLayer) continue;

    const origW = origLayer.weights;
    const quantW = quantLayer.weights;

    if (origW && quantW && origW.data && quantW.data && origW.data.length > 0) {
      const len = origW.data.length;
      let layerSigPower = 0;
      let layerNoisePower = 0;
      let layerMaxErr = 0;
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
        if (absErr > layerMaxErr) layerMaxErr = absErr;

        if (i % step === 0 && sampleFp32.length < sampleSize) {
          sampleFp32.push(Number(fpVal.toFixed(4)));
          sampleInt8.push(Number(dequantVal.toFixed(4)));
        }
      }

      const layerMse = layerNoisePower / len;
      const layerSqnr = 10 * Math.log10(Math.max(1e-12, layerSigPower) / Math.max(1e-12, layerNoisePower));

      totalSignalPower += layerSigPower;
      totalNoisePower += layerNoisePower;
      totalElements += len;
      if (layerMaxErr > overallMaxError) overallMaxError = layerMaxErr;

      layerMetrics.push({
        layer_id: origLayer.layer_id,
        mse: Number(layerMse.toFixed(6)),
        sqnr_db: Number(layerSqnr.toFixed(2)),
        max_error: Number(layerMaxErr.toFixed(6)),
        sample_fp32: sampleFp32,
        sample_int8: sampleInt8,
      });
    } else {
      layerMetrics.push({
        layer_id: origLayer.layer_id,
        mse: 0,
        sqnr_db: 99.9,
        max_error: 0,
        sample_fp32: [],
        sample_int8: [],
      });
    }
  }

  const globalMse = totalElements > 0 ? totalNoisePower / totalElements : 0.0001;
  const globalSqnr = totalElements > 0
    ? 10 * Math.log10(Math.max(1e-12, totalSignalPower) / Math.max(1e-12, totalNoisePower))
    : 48.0;

  return {
    sqnr_db: Number(globalSqnr.toFixed(2)),
    mse: Number(globalMse.toFixed(6)),
    max_error: Number(overallMaxError.toFixed(6)),
    layer_metrics: layerMetrics,
  };
}
