"""
Shannon TinyML Preset Models & Benchmarks
Contains production-grade baseline TinyML graphs for instant evaluation.
"""

import numpy as np
from .ir import ModelGraph, Tensor, Layer

def get_keyword_spotting_model() -> ModelGraph:
    """
    Audio Keyword Spotting (KWS) 1D-CNN Model
    Input: Audio Spectrogram (49 time steps x 10 MFCC features = 490)
    Output: 4 Classes (Silence, Unknown, "Yes", "No")
    """
    g = ModelGraph("KeywordSpotter_v1")
    
    # Tensors
    g.add_tensor(Tensor("input_audio", (1, 49, 10), "float32"))
    g.add_tensor(Tensor("conv1_out", (1, 47, 16), "float32"))
    g.add_tensor(Tensor("pool1_out", (1, 23, 16), "float32"))
    g.add_tensor(Tensor("dense1_out", (1, 64), "float32"))
    g.add_tensor(Tensor("output_logits", (1, 4), "float32"))
    
    g.inputs = ["input_audio"]
    g.outputs = ["output_logits"]

    # Layer 1: Conv2D
    l1 = Layer("conv1", "Conv2D", ["input_audio"], ["conv1_out"], {
        "kernel_h": 3, "kernel_w": 3, "in_channels": 10, "out_channels": 16,
        "out_height": 47, "out_width": 1
    })
    np.random.seed(42)
    l1.weights = Tensor("conv1_w", (16, 10, 3, 1), "float32", np.random.randn(16, 10, 3, 1).astype(np.float32) * 0.1)
    l1.bias = Tensor("conv1_b", (16,), "float32", np.zeros(16, dtype=np.float32))
    g.add_layer(l1)

    # Layer 2: MaxPool
    l2 = Layer("pool1", "MaxPool2D", ["conv1_out"], ["pool1_out"], {"stride": 2, "pool_size": 2})
    g.add_layer(l2)

    # Layer 3: Dense
    l3 = Layer("dense1", "Dense", ["pool1_out"], ["dense1_out"], {"in_features": 23 * 16, "out_features": 64})
    l3.weights = Tensor("dense1_w", (23 * 16, 64), "float32", np.random.randn(23 * 16, 64).astype(np.float32) * 0.05)
    l3.bias = Tensor("dense1_b", (64,), "float32", np.zeros(64, dtype=np.float32))
    g.add_layer(l3)

    # Layer 4: Output Classifier
    l4 = Layer("classifier", "Dense", ["dense1_out"], ["output_logits"], {"in_features": 64, "out_features": 4})
    l4.weights = Tensor("cls_w", (64, 4), "float32", np.random.randn(64, 4).astype(np.float32) * 0.1)
    l4.bias = Tensor("cls_b", (4,), "float32", np.zeros(4, dtype=np.float32))
    g.add_layer(l4)

    g.compute_stats()
    return g


def get_anomaly_detection_model() -> ModelGraph:
    """
    Industrial Motor Anomaly Detector (Autoencoder)
    Input: 3-Axis Accelerometer FFT spectrum (64 features)
    Output: Reconstructed 64 features (Reconstruction Error = Anomaly Score)
    """
    g = ModelGraph("MotorVibration_Autoencoder")
    
    g.add_tensor(Tensor("imu_spectrum", (1, 64), "float32"))
    g.add_tensor(Tensor("enc1", (1, 32), "float32"))
    g.add_tensor(Tensor("bottleneck", (1, 8), "float32"))
    g.add_tensor(Tensor("dec1", (1, 32), "float32"))
    g.add_tensor(Tensor("reconstruction", (1, 64), "float32"))
    
    g.inputs = ["imu_spectrum"]
    g.outputs = ["reconstruction"]

    np.random.seed(1337)
    # Encoder 1
    l1 = Layer("encoder_dense1", "Dense", ["imu_spectrum"], ["enc1"], {"in_features": 64, "out_features": 32})
    l1.weights = Tensor("enc1_w", (64, 32), "float32", np.random.randn(64, 32).astype(np.float32) * 0.1)
    l1.bias = Tensor("enc1_b", (32,), "float32", np.zeros(32, dtype=np.float32))
    g.add_layer(l1)

    # Bottleneck
    l2 = Layer("bottleneck_layer", "Dense", ["enc1"], ["bottleneck"], {"in_features": 32, "out_features": 8})
    l2.weights = Tensor("bot_w", (32, 8), "float32", np.random.randn(32, 8).astype(np.float32) * 0.1)
    l2.bias = Tensor("bot_b", (8,), "float32", np.zeros(8, dtype=np.float32))
    g.add_layer(l2)

    # Decoder 1
    l3 = Layer("decoder_dense1", "Dense", ["bottleneck"], ["dec1"], {"in_features": 8, "out_features": 32})
    l3.weights = Tensor("dec1_w", (8, 32), "float32", np.random.randn(8, 32).astype(np.float32) * 0.1)
    l3.bias = Tensor("dec1_b", (32,), "float32", np.zeros(32, dtype=np.float32))
    g.add_layer(l3)

    # Reconstruction
    l4 = Layer("reconstruction_layer", "Dense", ["dec1"], ["reconstruction"], {"in_features": 32, "out_features": 64})
    l4.weights = Tensor("rec_w", (32, 64), "float32", np.random.randn(32, 64).astype(np.float32) * 0.1)
    l4.bias = Tensor("rec_b", (64,), "float32", np.zeros(64, dtype=np.float32))
    g.add_layer(l4)

    g.compute_stats()
    return g


def get_vision_classifier_model() -> ModelGraph:
    """
    Micro-Vision Person Detection (MobileNet-style Depthwise Separable CNN)
    Input: Grayscale 48x48 Image (2,304 pixels)
    Output: 2 Classes (Person / No Person)
    """
    g = ModelGraph("MicroVision_PersonDetect")
    
    g.add_tensor(Tensor("camera_frame", (1, 48, 48, 1), "float32"))
    g.add_tensor(Tensor("conv1_out", (1, 24, 24, 16), "float32"))
    g.add_tensor(Tensor("dw_conv_out", (1, 24, 24, 16), "float32"))
    g.add_tensor(Tensor("pw_conv_out", (1, 12, 12, 32), "float32"))
    g.add_tensor(Tensor("pool_out", (1, 1, 1, 32), "float32"))
    g.add_tensor(Tensor("logits", (1, 2), "float32"))

    g.inputs = ["camera_frame"]
    g.outputs = ["logits"]

    np.random.seed(2026)
    # Conv1 (Stride 2)
    l1 = Layer("conv1", "Conv2D", ["camera_frame"], ["conv1_out"], {
        "kernel_h": 3, "kernel_w": 3, "in_channels": 1, "out_channels": 16,
        "out_height": 24, "out_width": 24, "stride": 2
    })
    l1.weights = Tensor("c1_w", (16, 1, 3, 3), "float32", np.random.randn(16, 1, 3, 3).astype(np.float32) * 0.1)
    l1.bias = Tensor("c1_b", (16,), "float32", np.zeros(16, dtype=np.float32))
    g.add_layer(l1)

    # Depthwise Conv
    l2 = Layer("dw_conv", "DepthwiseConv2D", ["conv1_out"], ["dw_conv_out"], {
        "kernel_h": 3, "kernel_w": 3, "in_channels": 16, "out_channels": 16,
        "out_height": 24, "out_width": 24, "stride": 1
    })
    l2.weights = Tensor("dw_w", (16, 1, 3, 3), "float32", np.random.randn(16, 1, 3, 3).astype(np.float32) * 0.1)
    l2.bias = Tensor("dw_b", (16,), "float32", np.zeros(16, dtype=np.float32))
    g.add_layer(l2)

    # Pointwise Conv (Stride 2)
    l3 = Layer("pw_conv", "Conv2D", ["dw_conv_out"], ["pw_conv_out"], {
        "kernel_h": 1, "kernel_w": 1, "in_channels": 16, "out_channels": 32,
        "out_height": 12, "out_width": 12, "stride": 2
    })
    l3.weights = Tensor("pw_w", (32, 16, 1, 1), "float32", np.random.randn(32, 16, 1, 1).astype(np.float32) * 0.1)
    l3.bias = Tensor("pw_b", (32,), "float32", np.zeros(32, dtype=np.float32))
    g.add_layer(l3)

    # MaxPool Global
    l4 = Layer("global_pool", "MaxPool2D", ["pw_conv_out"], ["pool_out"], {"stride": 12, "pool_size": 12})
    g.add_layer(l4)

    # Dense Classifier
    l5 = Layer("classifier", "Dense", ["pool_out"], ["logits"], {"in_features": 32, "out_features": 2})
    l5.weights = Tensor("cls_w", (32, 2), "float32", np.random.randn(32, 2).astype(np.float32) * 0.1)
    l5.bias = Tensor("cls_b", (2,), "float32", np.zeros(2, dtype=np.float32))
    g.add_layer(l5)

    g.compute_stats()
    return g