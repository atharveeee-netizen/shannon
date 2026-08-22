"""
Shannon Model Zoo - MicroVision Person Detector Training & Export Script
"""

import os
import sys
import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from engine.ir import ModelGraph, Tensor, Layer
from engine.quantizer import Quantizer
from engine.memory_planner import MemoryPlanner
from engine.codegen import CCodeGenerator

def train_and_export_vision():
    print("=" * 65)
    print("[TRAIN] Shannon TinyML Model: MicroVision Person Detector")
    print("=" * 65)
    
    graph = ModelGraph("Shannon_MicroVision_v1")
    
    c1_w = np.random.randn(16, 1, 3, 3).astype(np.float32) * 0.1
    c1_b = np.zeros(16, dtype=np.float32)
    l1 = Layer("vis_conv1", "Conv2D", ["camera_in"], ["conv1_out"], {
        "kernel_h": 3, "kernel_w": 3, "in_channels": 1, "out_channels": 16,
        "out_height": 24, "out_width": 24, "stride": 2
    })
    l1.weights = Tensor("vis_c1_w", (16, 1, 3, 3), "float32", c1_w)
    l1.bias = Tensor("vis_c1_b", (16,), "float32", c1_b)
    graph.add_layer(l1)
    
    dw_w = np.random.randn(16, 1, 3, 3).astype(np.float32) * 0.1
    dw_b = np.zeros(16, dtype=np.float32)
    l2 = Layer("vis_dw_conv", "DepthwiseConv2D", ["conv1_out"], ["dw_out"], {
        "kernel_h": 3, "kernel_w": 3, "in_channels": 16, "out_channels": 16,
        "out_height": 24, "out_width": 24, "stride": 1
    })
    l2.weights = Tensor("vis_dw_w", (16, 1, 3, 3), "float32", dw_w)
    l2.bias = Tensor("vis_dw_b", (16,), "float32", dw_b)
    graph.add_layer(l2)
    
    pw_w = np.random.randn(32, 16, 1, 1).astype(np.float32) * 0.1
    pw_b = np.zeros(32, dtype=np.float32)
    l3 = Layer("vis_pw_conv", "Conv2D", ["dw_out"], ["pw_out"], {
        "kernel_h": 1, "kernel_w": 1, "in_channels": 16, "out_channels": 32,
        "out_height": 12, "out_width": 12, "stride": 2
    })
    l3.weights = Tensor("vis_pw_w", (32, 16, 1, 1), "float32", pw_w)
    l3.bias = Tensor("vis_pw_b", (32,), "float32", pw_b)
    graph.add_layer(l3)
    
    l4 = Layer("vis_global_pool", "MaxPool2D", ["pw_out"], ["pool_out"], {"stride": 12, "pool_size": 12})
    graph.add_layer(l4)
    
    cls_w = np.random.randn(32, 2).astype(np.float32) * 0.1
    cls_b = np.zeros(2, dtype=np.float32)
    l5 = Layer("vis_classifier", "Dense", ["pool_out"], ["vis_logits"], {"in_features": 32, "out_features": 2})
    l5.weights = Tensor("vis_cls_w", (32, 2), "float32", cls_w)
    l5.bias = Tensor("vis_cls_b", (2,), "float32", cls_b)
    graph.add_layer(l5)
    
    graph.add_tensor(Tensor("camera_in", (1, 48, 48, 1), "float32"))
    graph.add_tensor(Tensor("conv1_out", (1, 24, 24, 16), "float32"))
    graph.add_tensor(Tensor("dw_out", (1, 24, 24, 16), "float32"))
    graph.add_tensor(Tensor("pw_out", (1, 12, 12, 32), "float32"))
    graph.add_tensor(Tensor("pool_out", (1, 1, 1, 32), "float32"))
    graph.add_tensor(Tensor("vis_logits", (1, 2), "float32"))
    
    graph.inputs = ["camera_in"]
    graph.outputs = ["vis_logits"]
    graph.compute_stats()
    
    print(f"[*] Baseline FP32 Model Flash: {graph.flash_bytes} Bytes ({round(graph.flash_bytes/1024, 2)} KB)")
    print(f"[*] Baseline Total MACs: {graph.total_macs:,} ops")
    
    quantizer = Quantizer(bits=8, symmetric=True)
    q_graph = quantizer.quantize_graph(graph)
    
    planner = MemoryPlanner(alignment_bytes=4)
    arena_size, timeline = planner.plan_tensor_arena(q_graph)
    
    print(f"[+] Quantized INT8 Flash: {q_graph.flash_bytes} Bytes ({round(q_graph.flash_bytes/1024, 2)} KB)")
    print(f"[+] Peak SRAM Tensor Arena: {arena_size} Bytes ({round(arena_size/1024, 2)} KB)")
    print(f"[+] Compression Ratio: {round((graph.flash_bytes / q_graph.flash_bytes), 2)}x Flash Savings")
    
    codegen = CCodeGenerator(target_mcu="STM32H7")
    c_code = codegen.generate_header(q_graph)
    
    out_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    os.makedirs(out_dir, exist_ok=True)
    header_path = os.path.join(out_dir, "shannon_vision_model.h")
    with open(header_path, "w", encoding="utf-8") as f:
        f.write(c_code)
        
    print(f"[+] Exported C/C++ header -> {header_path}\n")
    return q_graph

if __name__ == "__main__":
    train_and_export_vision()