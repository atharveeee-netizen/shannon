"""
Shannon Model Parser
Parses computational graphs, ONNX definitions, and JSON models into Shannon IR.
Enforces strict schema validation and rejects malformed inputs.
"""

from typing import Dict, Any, List
import numpy as np
from .ir import ModelGraph, Tensor, Layer

class ModelParser:
    @staticmethod
    def parse_dict(data: Dict[str, Any]) -> ModelGraph:
        """
        Parses a structured dictionary / JSON into Shannon ModelGraph IR.
        Strictly validates schema, rejecting malformed definitions.
        """
        if not isinstance(data, dict):
            raise TypeError(f"Model definition must be a dictionary, got {type(data).__name__}")
            
        if "layers" not in data:
            raise KeyError("Missing required 'layers' list in model definition.")
            
        layers_data = data["layers"]
        if not isinstance(layers_data, list):
            raise TypeError(f"Field 'layers' must be a list, got {type(layers_data).__name__}")
            
        if len(layers_data) == 0:
            raise ValueError("Model must contain at least one layer.")
            
        name = data.get("name", "CustomModel")
        graph = ModelGraph(name)
        
        # 1. Parse Tensors
        tensors_data = data.get("tensors", {})
        if not isinstance(tensors_data, dict):
            raise TypeError(f"Field 'tensors' must be a dictionary, got {type(tensors_data).__name__}")
            
        for t_name, t_info in tensors_data.items():
            if not isinstance(t_info, dict):
                raise TypeError(f"Tensor '{t_name}' specification must be a dictionary.")
            shape = tuple(t_info.get("shape", [1]))
            dtype = t_info.get("dtype", "float32")
            raw_data = t_info.get("data")
            np_data = np.array(raw_data, dtype=np.float32) if raw_data is not None else None
            tensor = Tensor(t_name, shape, dtype, np_data)
            graph.add_tensor(tensor)

        # 2. Parse Layers
        for idx, l_info in enumerate(layers_data):
            if not isinstance(l_info, dict):
                raise TypeError(f"Layer at index {idx} must be a dictionary.")
                
            required_keys = ["layer_id", "op_type", "inputs", "outputs"]
            missing = [k for k in required_keys if k not in l_info]
            if missing:
                raise KeyError(f"Layer at index {idx} is missing required fields: {missing}")
                
            layer = Layer(
                layer_id=l_info["layer_id"],
                op_type=l_info["op_type"],
                inputs=list(l_info["inputs"]),
                outputs=list(l_info["outputs"]),
                params=l_info.get("params", {})
            )
            
            # Attach weights if present
            w_info = l_info.get("weights")
            if w_info and isinstance(w_info, dict):
                w_shape = tuple(w_info.get("shape", [1, 1]))
                w_data = np.array(w_info["data"], dtype=np.float32) if "data" in w_info else np.zeros(w_shape, dtype=np.float32)
                layer.weights = Tensor(f"{layer.layer_id}_w", w_shape, "float32", w_data)
            
            b_info = l_info.get("bias")
            if b_info and isinstance(b_info, dict):
                b_shape = tuple(b_info.get("shape", [1]))
                b_data = np.array(b_info.get("data"), dtype=np.float32) if "data" in b_info else np.zeros(b_shape, dtype=np.float32)
                layer.bias = Tensor(f"{layer.layer_id}_b", b_shape, "float32", b_data)

            graph.add_layer(layer)

        default_inputs = [graph.layers[0].inputs[0]] if (graph.layers and graph.layers[0].inputs) else []
        default_outputs = [graph.layers[-1].outputs[0]] if (graph.layers and graph.layers[-1].outputs) else []
        graph.inputs = data.get("inputs", default_inputs)
        graph.outputs = data.get("outputs", default_outputs)
        graph.compute_stats()
        return graph