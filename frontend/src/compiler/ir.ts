import { TensorInfo } from '../types';

export class Tensor {
  name: string;
  shape: number[];
  dtype: string;
  data: Float32Array | Int8Array | null;
  scale: number;
  zero_point: number;
  sram_offset: number | null;
  size_bytes: number;

  constructor(
    name: string,
    shape: number[],
    dtype: string = 'float32',
    data: Float32Array | Int8Array | number[] | null = null
  ) {
    this.name = name;
    this.shape = shape;
    this.dtype = dtype;
    this.data = data ? (data instanceof Float32Array || data instanceof Int8Array ? data : new Float32Array(data)) : null;
    this.scale = 1.0;
    this.zero_point = 0;
    this.sram_offset = null;
    this.size_bytes = this.calculateSize();
  }

  calculateSize(): number {
    const numElements = this.shape && this.shape.length > 0 ? this.shape.reduce((a, b) => a * b, 1) : 1;
    if (this.dtype === 'int8' || this.dtype === 'uint8') {
      return numElements;
    } else if (this.dtype === 'int16' || this.dtype === 'uint16' || this.dtype === 'float16') {
      return numElements * 2;
    } else if (this.dtype === 'int32' || this.dtype === 'uint32' || this.dtype === 'float32') {
      return numElements * 4;
    }
    return numElements;
  }

  toDict(): TensorInfo {
    return {
      name: this.name,
      shape: [...this.shape],
      dtype: this.dtype,
      size_bytes: this.size_bytes,
      scale: this.scale,
      zero_point: this.zero_point,
      sram_offset: this.sram_offset ?? undefined,
      sram_offset_hex: this.sram_offset !== null ? `0x${(0x20000000 + this.sram_offset).toString(16).toUpperCase()}` : undefined,
    };
  }
}

export class Layer {
  layer_id: string;
  op_type: string;
  inputs: string[];
  outputs: string[];
  params: Record<string, any>;
  weights: Tensor | null;
  bias: Tensor | null;
  macs: number;
  latency_us: number;

  constructor(
    layer_id: string,
    op_type: string,
    inputs: string[],
    outputs: string[],
    params: Record<string, any> = {}
  ) {
    this.layer_id = layer_id;
    this.op_type = op_type;
    this.inputs = inputs;
    this.outputs = outputs;
    this.params = params;
    this.weights = null;
    this.bias = null;
    this.macs = 0;
    this.latency_us = 0;
  }
}

export class ModelGraph {
  name: string;
  layers: Layer[];
  tensors: Record<string, Tensor>;
  inputs: string[];
  outputs: string[];
  peak_sram_bytes: number;
  flash_bytes: number;
  total_macs: number;
  estimated_latency_ms: number;

  constructor(name: string) {
    this.name = name;
    this.layers = [];
    this.tensors = {};
    this.inputs = [];
    this.outputs = [];
    this.peak_sram_bytes = 0;
    this.flash_bytes = 0;
    this.total_macs = 0;
    this.estimated_latency_ms = 0.0;
  }

  addLayer(layer: Layer) {
    this.layers.push(layer);
  }

  addTensor(tensor: Tensor) {
    this.tensors[tensor.name] = tensor;
  }

  computeStats(clockMhz: number = 240.0) {
    let totalFlash = 0;
    let totalMacs = 0;
    let totalLatencyUs = 0.0;

    for (const layer of this.layers) {
      if (layer.weights) {
        totalFlash += layer.weights.size_bytes;
      }
      if (layer.bias) {
        totalFlash += layer.bias.size_bytes;
      }

      // MAC & Latency calculation based on op_type
      if (layer.op_type === 'Dense' || layer.op_type === 'FullyConnected') {
        const inFeat = layer.params.in_features || 1;
        const outFeat = layer.params.out_features || 1;
        layer.macs = inFeat * outFeat;
        layer.latency_us = (layer.macs / (clockMhz * 1.0)) * 1.2;
      } else if (layer.op_type === 'Conv1D') {
        const kernel = layer.params.kernel_size || 3;
        const inCh = layer.params.in_channels || 1;
        const outCh = layer.params.out_channels || 1;
        const outLen = layer.params.out_length || 1;
        layer.macs = outLen * outCh * inCh * kernel;
        layer.latency_us = (layer.macs / (clockMhz * 1.0)) * 1.4;
      } else if (layer.op_type === 'Conv2D') {
        const kh = layer.params.kernel_h || 3;
        const kw = layer.params.kernel_w || 3;
        const inCh = layer.params.in_channels || 1;
        const outCh = layer.params.out_channels || 1;
        const outH = layer.params.out_height || 1;
        const outW = layer.params.out_width || 1;
        layer.macs = outH * outW * outCh * inCh * kh * kw;
        layer.latency_us = (layer.macs / (clockMhz * 1.0)) * 1.5;
      } else if (layer.op_type === 'DepthwiseConv2D') {
        const kh = layer.params.kernel_h || 3;
        const kw = layer.params.kernel_w || 3;
        const inCh = layer.params.in_channels || 1;
        const outH = layer.params.out_height || 1;
        const outW = layer.params.out_width || 1;
        layer.macs = outH * outW * inCh * kh * kw;
        layer.latency_us = (layer.macs / (clockMhz * 1.0)) * 1.2;
      } else if (layer.op_type === 'MaxPool2D' || layer.op_type === 'AvgPool2D' || layer.op_type === 'GlobalAvgPool2D') {
        layer.macs = 0;
        const outBytes = layer.outputs[0] && this.tensors[layer.outputs[0]] ? this.tensors[layer.outputs[0]].size_bytes : 100;
        layer.latency_us = (outBytes / clockMhz) * 0.5;
      } else if (layer.op_type === 'ReLU' || layer.op_type === 'Softmax') {
        layer.macs = 0;
        layer.latency_us = 2.0;
      } else {
        layer.macs = layer.params.macs || 0;
        layer.latency_us = (layer.macs / (clockMhz * 1.0)) * 1.2;
      }

      totalMacs += layer.macs;
      totalLatencyUs += layer.latency_us;
    }

    this.flash_bytes = totalFlash;
    this.total_macs = totalMacs;
    this.estimated_latency_ms = totalLatencyUs / 1000.0;
  }
}
