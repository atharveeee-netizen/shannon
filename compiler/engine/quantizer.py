"""
Shannon Quantizer
Post-Training Symmetric INT8 / INT4 Quantization Engine with Mixed-Precision Support.
"""

from typing import Tuple, Dict, Any, List
import numpy as np
from .ir import ModelGraph, Tensor, Layer

class Quantizer:
    def __init__(self, bits: int = 8, symmetric: bool = True, mixed_precision: bool = False):
        self.bits = bits
        self.symmetric = symmetric
        self.mixed_precision = mixed_precision
        self.qmin = -(2 ** (bits - 1)) if symmetric else 0
        self.qmax = (2 ** (bits - 1)) - 1 if symmetric else (2 ** bits) - 1

    def _get_layer_bitwidth(self, layer_idx: int, total_layers: int, op_type: str) -> int:
        """
        Mixed-Precision policy (based on HAWQ research):
        - First Conv and Final Classifier layers: High sensitivity -> INT8
        - Intermediate deep projection layers: Low sensitivity -> INT4
        """
        if not self.mixed_precision:
            return self.bits
        if layer_idx == 0 or layer_idx == total_layers - 1:
            return 8
        if op_type in ["Dense", "Conv2D"]:
            return 4
        return 8

    def quantize_tensor(self, tensor: Tensor, target_bits: int = 8) -> Tuple[Tensor, float, int]:
        if tensor.data is None or tensor.dtype in ["int8", "int4"]:
            return tensor, tensor.scale, tensor.zero_point

        data = tensor.data.astype(np.float32)
        min_val = float(np.min(data))
        max_val = float(np.max(data))

        qmin = -(2 ** (target_bits - 1)) if self.symmetric else 0
        qmax = (2 ** (target_bits - 1)) - 1 if self.symmetric else (2 ** target_bits) - 1

        if self.symmetric:
            max_abs = max(abs(min_val), abs(max_val), 1e-7)
            scale = max_abs / qmax
            zero_point = 0
            qdata = np.clip(np.round(data / scale), qmin, qmax).astype(np.int8)
        else:
            scale = max((max_val - min_val) / (qmax - qmin), 1e-7)
            zero_point = int(np.clip(np.round(-min_val / scale), qmin, qmax))
            qdata = np.clip(np.round(data / scale) + zero_point, qmin, qmax).astype(np.int8)

        quantized_tensor = Tensor(
            name=tensor.name,
            shape=tensor.shape,
            dtype="int8" if target_bits == 8 else "int4",
            data=qdata
        )
        quantized_tensor.scale = scale
        quantized_tensor.zero_point = zero_point
        return quantized_tensor, scale, zero_point

    def quantize_graph(self, graph: ModelGraph) -> ModelGraph:
        total_layers = len(graph.layers)
        for idx, layer in enumerate(graph.layers):
            layer_bits = self._get_layer_bitwidth(idx, total_layers, layer.op_type)
            if layer.weights is not None:
                layer.weights, _, _ = self.quantize_tensor(layer.weights, target_bits=layer_bits)
            if layer.bias is not None:
                layer.bias.dtype = "int32"
                layer.bias.size_bytes = int(np.prod(layer.bias.shape)) * 4 if layer.bias.shape else 4
                if layer.bias.data is not None:
                    w_scale = layer.weights.scale if layer.weights else 1.0
                    b_scale = w_scale * 0.01
                    layer.bias.data = np.clip(np.round(layer.bias.data / b_scale), -2147483648, 2147483647).astype(np.int32)
                    layer.bias.scale = b_scale

        for tensor_name, tensor in graph.tensors.items():
            if tensor.dtype == "float32":
                tensor.dtype = "int8"
                tensor.size_bytes = int(np.prod(tensor.shape)) if tensor.shape else 1

        graph.compute_stats()
        return graph