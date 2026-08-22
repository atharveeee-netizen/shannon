"""
Shannon Model Zoo - Motor Vibration Anomaly Autoencoder Training & Export Script
"""

import os
import sys
import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from engine.ir import ModelGraph, Tensor, Layer
from engine.quantizer import Quantizer
from engine.memory_planner import MemoryPlanner
from engine.codegen import CCodeGenerator

def train_and_export_anomaly():
    print("=" * 65)
    print("[TRAIN] Shannon TinyML Model: Motor Anomaly Autoencoder")
    print("=" * 65)
    
    graph = ModelGraph("Shannon_Vibration_Autoencoder")
    
    enc1_w = np.random.randn(64, 32).astype(np.float32) * 0.1
    enc1_b = np.zeros(32, dtype=np.float32)
    l1 = Layer("enc_dense1", "Dense", ["fft_spectrum_in"], ["enc1_out"], {"in_features": 64, "out_features": 32})
    l1.weights = Tensor("enc1_w", (64, 32), "float32", enc1_w)
    l1.bias = Tensor("enc1_b", (32,), "float32", enc1_b)
    graph.add_layer(l1)
    
    bot_w = np.random.randn(32, 8).astype(np.float32) * 0.1
    bot_b = np.zeros(8, dtype=np.float32)
    l2 = Layer("enc_bottleneck", "Dense", ["enc1_out"], ["bot_out"], {"in_features": 32, "out_features": 8})
    l2.weights = Tensor("bot_w", (32, 8), "float32", bot_w)
    l2.bias = Tensor("bot_b", (8,), "float32", bot_b)
    graph.add_layer(l2)
    
    dec1_w = np.random.randn(8, 32).astype(np.float32) * 0.1
    dec1_b = np.zeros(32, dtype=np.float32)
    l3 = Layer("dec_dense1", "Dense", ["bot_out"], ["dec1_out"], {"in_features": 8, "out_features": 32})
    l3.weights = Tensor("dec1_w", (8, 32), "float32", dec1_w)
    l3.bias = Tensor("dec1_b", (32,), "float32", dec1_b)
    graph.add_layer(l3)
    
    rec_w = np.random.randn(32, 64).astype(np.float32) * 0.1
    rec_b = np.zeros(64, dtype=np.float32)
    l4 = Layer("dec_reconstruction", "Dense", ["dec1_out"], ["rec_out"], {"in_features": 32, "out_features": 64})
    l4.weights = Tensor("rec_w", (32, 64), "float32", rec_w)
    l4.bias = Tensor("rec_b", (64,), "float32", rec_b)
    graph.add_layer(l4)
    
    graph.add_tensor(Tensor("fft_spectrum_in", (1, 64), "float32"))
    graph.add_tensor(Tensor("enc1_out", (1, 32), "float32"))
    graph.add_tensor(Tensor("bot_out", (1, 8), "float32"))
    graph.add_tensor(Tensor("dec1_out", (1, 32), "float32"))
    graph.add_tensor(Tensor("rec_out", (1, 64), "float32"))
    
    graph.inputs = ["fft_spectrum_in"]
    graph.outputs = ["rec_out"]
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
    
    codegen = CCodeGenerator(target_mcu="RP2040 (Pico)")
    c_code = codegen.generate_header(q_graph)
    
    out_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    os.makedirs(out_dir, exist_ok=True)
    header_path = os.path.join(out_dir, "shannon_anomaly_model.h")
    with open(header_path, "w", encoding="utf-8") as f:
        f.write(c_code)
        
    print(f"[+] Exported C/C++ header -> {header_path}\n")
    return q_graph

if __name__ == "__main__":
    train_and_export_anomaly()