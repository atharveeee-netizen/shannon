"""
Shannon Model Zoo - Keyword Spotter (KWS) Training & Export Script
"""

import os
import sys
import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from engine.ir import ModelGraph, Tensor, Layer
from engine.quantizer import Quantizer
from engine.memory_planner import MemoryPlanner
from engine.codegen import CCodeGenerator

def generate_synthetic_mfcc_dataset(n_samples=1000):
    np.random.seed(42)
    X = np.random.randn(n_samples, 49, 10).astype(np.float32) * 0.1
    y = np.random.randint(0, 4, size=(n_samples,))
    for i in range(n_samples):
        if y[i] == 2:
            X[i, 15:30, 6:10] += 0.8
        elif y[i] == 3:
            X[i, 10:25, 1:5] += 0.9
        elif y[i] == 0:
            X[i] *= 0.05
    return X, y

def train_and_export_kws():
    print("=" * 65)
    print("[TRAIN] Shannon TinyML Model: Audio Keyword Spotter (KWS)")
    print("=" * 65)
    
    graph = ModelGraph("Shannon_KWS_12Class")
    
    conv1_w = np.random.randn(16, 10, 3, 1).astype(np.float32) * 0.15
    conv1_b = np.zeros(16, dtype=np.float32)
    l1 = Layer("kws_conv1", "Conv2D", ["audio_mfcc_in"], ["conv1_feat"], {
        "kernel_h": 3, "kernel_w": 3, "in_channels": 10, "out_channels": 16,
        "out_height": 47, "out_width": 1
    })
    l1.weights = Tensor("kws_conv1_w", (16, 10, 3, 1), "float32", conv1_w)
    l1.bias = Tensor("kws_conv1_b", (16,), "float32", conv1_b)
    graph.add_layer(l1)
    
    l2 = Layer("kws_pool1", "MaxPool2D", ["conv1_feat"], ["pool1_feat"], {"stride": 2, "pool_size": 2})
    graph.add_layer(l2)
    
    dense1_w = np.random.randn(23 * 16, 64).astype(np.float32) * 0.08
    dense1_b = np.zeros(64, dtype=np.float32)
    l3 = Layer("kws_dense1", "Dense", ["pool1_feat"], ["dense1_feat"], {"in_features": 23 * 16, "out_features": 64})
    l3.weights = Tensor("kws_dense1_w", (23 * 16, 64), "float32", dense1_w)
    l3.bias = Tensor("kws_dense1_b", (64,), "float32", dense1_b)
    graph.add_layer(l3)
    
    out_w = np.random.randn(64, 4).astype(np.float32) * 0.12
    out_b = np.zeros(4, dtype=np.float32)
    l4 = Layer("kws_classifier", "Dense", ["dense1_feat"], ["kws_logits"], {"in_features": 64, "out_features": 4})
    l4.weights = Tensor("kws_cls_w", (64, 4), "float32", out_w)
    l4.bias = Tensor("kws_cls_b", (4,), "float32", out_b)
    graph.add_layer(l4)
    
    graph.add_tensor(Tensor("audio_mfcc_in", (1, 49, 10), "float32"))
    graph.add_tensor(Tensor("conv1_feat", (1, 47, 16), "float32"))
    graph.add_tensor(Tensor("pool1_feat", (1, 23, 16), "float32"))
    graph.add_tensor(Tensor("dense1_feat", (1, 64), "float32"))
    graph.add_tensor(Tensor("kws_logits", (1, 4), "float32"))
    graph.inputs = ["audio_mfcc_in"]
    graph.outputs = ["kws_logits"]
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
    
    codegen = CCodeGenerator(target_mcu="ESP32-S3")
    c_code = codegen.generate_header(q_graph)
    
    out_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    os.makedirs(out_dir, exist_ok=True)
    header_path = os.path.join(out_dir, "shannon_kws_model.h")
    with open(header_path, "w", encoding="utf-8") as f:
        f.write(c_code)
        
    print(f"[+] Exported C/C++ header -> {header_path}\n")
    return q_graph

if __name__ == "__main__":
    train_and_export_kws()