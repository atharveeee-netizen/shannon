import { ModelGraph, Tensor, Layer } from './ir';

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
