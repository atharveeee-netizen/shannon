"""
Shannon Model Parser
Parses computational graphs, ONNX definitions, and JSON models into Shannon IR.
"""

from typing import Dict, Any, List
import numpy as np
from .ir import ModelGraph, Tensor, Layer

class ModelParser:
    @staticmethod
    def parse_dict(data: Dict[str, Any]) -> ModelGraph:
        """
        Parses a structured dictionary / JSON into Shannon ModelGraph IR.
        """
        name = data.get("name", "CustomModel")
        graph = ModelGraph(name)
        
        # 1. Parse Tensors
        tensors_data = data.get("tensors", {})
        for t_name, t_info in tensors_data.items():
            shape = tuple(t_info.get("shape", [1]))
            dtype = t_info.get("dtype", "float32")
            raw_data = t_info.get("data")
            np_data = np.array(raw_data, dtype=np.float32) if raw_data is not None else None
            tensor = Tensor(t_name, shape, dtype, np_data)
            graph.add_tensor(tensor)

        # 2. Parse Layers
        layers_data = data.get("layers", [])
        for l_info in layers_data:
            layer = Layer(
                layer_id=l_info.get("layer_id", f"layer_{len(graph.layers)}"),
                op_type=l_info.get("op_type", "Dense"),
                inputs=l_info.get("inputs", []),
                outputs=l_info.get("outputs", []),
                params=l_info.get("params", {})
            )
            
            # Attach weights if present
            w_info = l_info.get("weights")
            if w_info:
                w_shape = tuple(w_info.get("shape", [1, 1]))
                w_data = np.array(w_info.get("data"), dtype=np.float32) if "data" in w_info else np.random.randn(*w_shape).astype(np.float32) * 0.1
                layer.weights = Tensor(f"{layer.layer_id}_w", w_shape, "float32", w_data)
            
            b_info = l_info.get("bias")
            if b_info:
                b_shape = tuple(b_info.get("shape", [1]))
                b_data = np.array(b_info.get("data"), dtype=np.float32) if "data" in b_info else np.zeros(b_shape, dtype=np.float32)
                layer.bias = Tensor(f"{layer.layer_id}_b", b_shape, "float32", b_data)

            graph.add_layer(layer)

        graph.inputs = data.get("inputs", [graph.layers[0].inputs[0]] if graph.layers else [])
        graph.outputs = data.get("outputs", [graph.layers[-1].outputs[0]] if graph.layers else [])
        graph.compute_stats()
        return graph