import { ModelGraph, Tensor, Layer } from './ir';

export class ModelParser {
  /**
   * Parses arbitrary JSON model graphs or layer lists into a canonical Shannon ModelGraph.
   */
  static parseDict(data: Record<string, any>): ModelGraph {
    const name = data.name || data.model_name || 'CustomModel';
    const graph = new ModelGraph(name);

    // 1. Parse Tensors
    const tensorsData = data.tensors || {};
    if (typeof tensorsData === 'object' && !Array.isArray(tensorsData)) {
      for (const [tName, tInfo] of Object.entries<any>(tensorsData)) {
        const shape = Array.isArray(tInfo.shape) ? tInfo.shape : [1];
        const dtype = tInfo.dtype || 'float32';
        const rawData = tInfo.data;
        const tensor = new Tensor(tName, shape, dtype, rawData);
        graph.addTensor(tensor);
      }
    }

    // 2. Parse Layers
    const layersData: any[] = Array.isArray(data.layers) ? data.layers : [];
    if (layersData.length === 0) {
      throw new Error(`Model '${name}' contains no layers. Provide a valid 'layers' array.`);
    }

    for (let idx = 0; idx < layersData.length; idx++) {
      const lInfo = layersData[idx];
      const layerId = lInfo.layer_id || lInfo.name || `layer_${idx}`;
      const opType = lInfo.op_type || lInfo.class_name || lInfo.type || 'Dense';
      const inputs = Array.isArray(lInfo.inputs) ? lInfo.inputs : (lInfo.input ? [lInfo.input] : [`t_in_${idx}`]);
      const outputs = Array.isArray(lInfo.outputs) ? lInfo.outputs : (lInfo.output ? [lInfo.output] : [`t_out_${idx}`]);
      const params = lInfo.params || lInfo.config || {};

      const layer = new Layer(layerId, opType, inputs, outputs, params);

      // Attach weights if specified
      if (lInfo.weights) {
        const wShape = Array.isArray(lInfo.weights.shape) ? lInfo.weights.shape : [1, 1];
        const wData = lInfo.weights.data || null;
        layer.weights = new Tensor(`${layerId}_w`, wShape, 'float32', wData);
      } else if (opType === 'Dense' || opType === 'FullyConnected') {
        const inFeat = params.in_features || params.units_in || 32;
        const outFeat = params.out_features || params.units || 16;
        layer.weights = new Tensor(`${layerId}_w`, [inFeat, outFeat], 'float32');
        layer.bias = new Tensor(`${layerId}_b`, [outFeat], 'float32');
      } else if (opType === 'Conv2D' || opType === 'Conv1D' || opType === 'DepthwiseConv2D') {
        const inCh = params.in_channels || 8;
        const outCh = params.out_channels || 16;
        const kh = params.kernel_h || params.kernel_size || 3;
        const kw = params.kernel_w || 1;
        layer.weights = new Tensor(`${layerId}_w`, [outCh, inCh, kh, kw], 'float32');
        layer.bias = new Tensor(`${layerId}_b`, [outCh], 'float32');
      }

      graph.addLayer(layer);

      // Ensure tensors exist in graph
      for (const inT of inputs) {
        if (!graph.tensors[inT]) {
          graph.addTensor(new Tensor(inT, lInfo.in_shape || [1, 32], 'float32'));
        }
      }
      for (const outT of outputs) {
        if (!graph.tensors[outT]) {
          graph.addTensor(new Tensor(outT, lInfo.out_shape || [1, 16], 'float32'));
        }
      }
    }

    graph.inputs = Array.isArray(data.inputs) ? data.inputs : (graph.layers.length > 0 ? graph.layers[0].inputs : []);
    graph.outputs = Array.isArray(data.outputs) ? data.outputs : (graph.layers.length > 0 ? graph.layers[graph.layers.length - 1].outputs : []);
    graph.computeStats();
    return graph;
  }

  /**
   * Parses an uploaded model file into a Shannon ModelGraph.
   * Strictly enforces explicit errors - never silently substitutes another model based on filename.
   */
  static async parseFile(file: File): Promise<ModelGraph> {
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.json')) {
      const text = await file.text();
      try {
        const parsed = JSON.parse(text);
        return ModelParser.parseDict(parsed);
      } catch (err: any) {
        throw new Error(`JSON Syntax Error in ${file.name}: ${err.message}`);
      }
    } else if (fileName.endsWith('.onnx')) {
      // In the browser client without server ONNX protobuf runtime, never silently fall back
      // to another model. Always raise an explicit descriptive error.
      throw new Error(
        `Unsupported ONNX model format in '${file.name}'. Client-side parser requires Shannon IR JSON. Please export your model using the Shannon Python exporter (compiler/api.py) or upload a Shannon JSON graph.`
      );
    } else {
      throw new Error(
        `Unsupported file format '${file.name}'. Please upload a Shannon IR model JSON file (.json).`
      );
    }
  }
}
