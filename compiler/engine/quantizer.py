"""
Shannon Quantizer
Post-Training Symmetric INT8 / INT4 Quantization Engine.
"""

from typing import Tuple, Dict, Any
import numpy as np
from .ir import ModelGraph, Tensor, Layer

class Quantizer:
    def __init__(self, bits: int = 8, symmetric: bool = True):
        self.bits = bits
        self.symmetric = symmetric
        self.qmin = -(2 ** (bits - 1)) if symmetric else 0
        self.qmax = (2 ** (bits - 1)) - 1 if symmetric else (2 ** bits) - 1

    def quantize_tensor(self, tensor: Tensor) -> Tuple[Tensor, float, int]:
        """
        Quantizes floating point numpy array to integer representation.
        """
        if tensor.data is None or tensor.dtype in ["int8", "int4"]:
            return tensor, tensor.scale, tensor.zero_point

        data = tensor.data.astype(np.float32)
        min_val = float(np.min(data))
        max_val = float(np.max(data))

        if self.symmetric:
            max_abs = max(abs(min_val), abs(max_val), 1e-7)
            scale = max_abs / self.qmax
            zero_point = 0
            qdata = np.clip(np.round(data / scale), self.qmin, self.qmax).astype(np.int8)
        else:
            scale = max((max_val - min_val) / (self.qmax - self.qmin), 1e-7)
            zero_point = int(np.clip(np.round(-min_val / scale), self.qmin, self.qmax))
            qdata = np.clip(np.round(data / scale) + zero_point, self.qmin, self.qmax).astype(np.int8)

        quantized_tensor = Tensor(
            name=tensor.name,
            shape=tensor.shape,
            dtype="int8" if self.bits == 8 else "int4",
            data=qdata
        )
        quantized_tensor.scale = scale
        quantized_tensor.zero_point = zero_point
        return quantized_tensor, scale, zero_point

    def quantize_graph(self, graph: ModelGraph) -> ModelGraph:
        """
        Quantizes all weights and biases in the model graph.
        """
        for layer in graph.layers:
            if layer.weights is not None:
                layer.weights, _, _ = self.quantize_tensor(layer.weights)
            if layer.bias is not None:
                # Bias is typically quantized to int32 using input_scale * weight_scale
                layer.bias.dtype = "int32"
                layer.bias.size_bytes = int(np.prod(layer.bias.shape)) * 4 if layer.bias.shape else 4
                if layer.bias.data is not None:
                    # Convert to int32 scaled bias
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