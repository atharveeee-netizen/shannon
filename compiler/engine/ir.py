"""
Shannon Intermediate Representation (Shannon IR)
Universal tensor graph representation for TinyML and Edge microcontrollers.
"""

from typing import List, Dict, Any, Optional, Tuple
import numpy as np

class Tensor:
    def __init__(self, name: str, shape: Tuple[int, ...], dtype: str = "float32", data: Optional[np.ndarray] = None):
        self.name = name
        self.shape = shape
        self.dtype = dtype
        self.data = data
        self.scale: float = 1.0
        self.zero_point: int = 0
        self.sram_offset: Optional[int] = None
        self.size_bytes: int = self._calculate_size()

    def _calculate_size(self) -> int:
        num_elements = int(np.prod(self.shape)) if self.shape else 1
        if self.dtype in ["int8", "uint8"]:
            return num_elements
        elif self.dtype in ["int16", "uint16", "float16"]:
            return num_elements * 2
        elif self.dtype in ["int32", "uint32", "float32"]:
            return num_elements * 4
        return num_elements

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "shape": list(self.shape),
            "dtype": self.dtype,
            "size_bytes": self.size_bytes,
            "scale": self.scale,
            "zero_point": self.zero_point,
            "sram_offset": self.sram_offset
        }


class Layer:
    def __init__(self, layer_id: str, op_type: str, inputs: List[str], outputs: List[str], params: Dict[str, Any] = None):
        self.layer_id = layer_id
        self.op_type = op_type  # Conv2D, Dense, DepthwiseConv2D, MaxPool2D, ReLU, Softmax, Add
        self.inputs = inputs
        self.outputs = outputs
        self.params = params or {}
        self.weights: Optional[Tensor] = None
        self.bias: Optional[Tensor] = None
        self.macs: int = 0
        self.latency_us: float = 0.0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "layer_id": self.layer_id,
            "op_type": self.op_type,
            "inputs": self.inputs,
            "outputs": self.outputs,
            "params": self.params,
            "macs": self.macs,
            "latency_us": self.latency_us,
            "weights_size_bytes": self.weights.size_bytes if self.weights else 0,
            "bias_size_bytes": self.bias.size_bytes if self.bias else 0
        }


class ModelGraph:
    def __init__(self, name: str):
        self.name = name
        self.layers: List[Layer] = []
        self.tensors: Dict[str, Tensor] = {}
        self.inputs: List[str] = []
        self.outputs: List[str] = []
        self.peak_sram_bytes: int = 0
        self.flash_bytes: int = 0
        self.total_macs: int = 0
        self.estimated_latency_ms: float = 0.0

    def add_layer(self, layer: Layer):
        self.layers.append(layer)

    def add_tensor(self, tensor: Tensor):
        self.tensors[tensor.name] = tensor

    def compute_stats(self, clock_mhz: float = 240.0):
        total_flash = 0
        total_macs = 0
        total_latency_us = 0.0

        for layer in self.layers:
            if layer.weights:
                total_flash += layer.weights.size_bytes
            if layer.bias:
                total_flash += layer.bias.size_bytes
            
            # Estimate MACs & Latency based on op_type
            if layer.op_type == "Dense":
                in_feat = layer.params.get("in_features", 1)
                out_feat = layer.params.get("out_features", 1)
                layer.macs = in_feat * out_feat
            elif layer.op_type in ["Conv2D", "DepthwiseConv2D"]:
                h_out = layer.params.get("out_height", 1)
                w_out = layer.params.get("out_width", 1)
                kh = layer.params.get("kernel_h", 3)
                kw = layer.params.get("kernel_w", 3)
                cin = layer.params.get("in_channels", 1)
                cout = layer.params.get("out_channels", 1)
                if layer.op_type == "DepthwiseConv2D":
                    layer.macs = h_out * w_out * kh * kw * cin
                else:
                    layer.macs = h_out * w_out * kh * kw * cin * cout
            elif layer.op_type == "MaxPool2D":
                layer.macs = 0
            
            total_macs += layer.macs
            # Approximate DSP cycles: 1 MAC ≈ 2 clock cycles on modern MCU with SIMD/CMSIS-NN
            layer.latency_us = (layer.macs * 2.0) / clock_mhz
            total_latency_us += layer.latency_us

        self.flash_bytes = total_flash
        self.total_macs = total_macs
        self.estimated_latency_ms = total_latency_us / 1000.0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "inputs": self.inputs,
            "outputs": self.outputs,
            "peak_sram_bytes": self.peak_sram_bytes,
            "flash_bytes": self.flash_bytes,
            "total_macs": self.total_macs,
            "estimated_latency_ms": round(self.estimated_latency_ms, 3),
            "layers": [l.to_dict() for l in self.layers],
            "tensors": {k: v.to_dict() for k, v in self.tensors.items()}
        }