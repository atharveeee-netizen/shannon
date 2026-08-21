# 🏗️ Shannon Architecture & Compiler Design

## 1. System Philosophy: "Zero Malloc, Zero Cloud"
Microcontrollers used in smart IoT, wearables, and industrial automation typically operate under severe physical constraints:
- **Limited SRAM:** 256 KB to 1024 KB.
- **No Dynamic Heap Allocation:** Calling `malloc()` in real-time embedded loops leads to heap fragmentation and hard faults.
- **Zero Cloud Reliance:** Inference must execute on-device in under 5ms with zero internet connection.

Shannon bridges high-level deep learning frameworks with bare-metal microcontrollers through a 4-stage optimization pipeline.

```
+------------------+      +-------------------+      +-------------------+      +-------------------+
|  Model Ingestion | ---> |  Shannon IR &     | ---> |  Greedy Tensor    | ---> | Zero-Dependency   |
|  (ONNX / PyTorch)|      |  INT8 Quantizer   |      |  Arena Planner    |      | C/C++ Emitter     |
+------------------+      +-------------------+      +-------------------+      +-------------------+
```

---

## 2. Technical Pipeline Stages

### Stage 1: Model Ingestion & Shannon IR
The model computational graph is mapped to **Shannon IR** (`compiler/engine/ir.py`). Operators are decomposed into standard micro-kernels:
- `Conv2D` / `DepthwiseConv2D`
- `Dense` (Matrix-Vector Multiplication)
- `MaxPool2D` / `AveragePool2D`
- `ReLU` / `ReLU6`
- `Softmax`

### Stage 2: Post-Training Symmetric INT8 Quantization
Floating-point weights ($W_{FP32}$) and activations are scaled into 8-bit signed integers ($W_{INT8} \in [-128, 127]$):
$$S = \frac{\max(|X|)}{127}$$
$$X_{INT8} = \text{clamp}\left(\text{round}\left(\frac{X}{S}\right), -128, 127\right)$$

Biases are quantized to 32-bit integers to prevent accumulator overflow during unrolled matrix multiplications.

### Stage 3: Greedy Tensor Arena Memory Planner
Instead of allocating separate memory buffers for every layer's output, Shannon performs **interval lifetime coloring**.
- Non-overlapping activations share the exact same SRAM memory offsets.
- Reduces peak SRAM footprint by up to **65%**, guaranteeing that the entire execution fits in a single contiguous `uint8_t shannon_tensor_arena[ARENA_SIZE]`.

### Stage 4: Zero-Dependency C/C++ Header Codegen
The compiler outputs a single standalone header (`shannon_model.h`):
- Weights and biases are stored in **Flash ROM** via `const int8_t`.
- Activation memory is bounded to a static buffer.
- Inner multiply-accumulate loops are optimized for **CMSIS-NN** and **ESP-NN** SIMD instructions.