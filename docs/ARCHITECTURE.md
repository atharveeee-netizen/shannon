# 🏗️ Shannon Architecture & Compiler Design
## Autonomous TinyML Compiler & Hardware Optimization Studio for Edge Silicon

---

## 1. System Philosophy: "Zero Malloc, Zero Cloud"
Modern IoT edge devices, robotics, smart wearables, and industrial nodes operate under severe physical and thermal constraints:
- **Severe SRAM Limits:** Microcontrollers provide between 256 KB and 1024 KB of fast on-chip SRAM.
- **Strict Prohibition of Dynamic Heap (`malloc`):** Calling `malloc()` / `free()` in real-time embedded firmware loops triggers non-deterministic execution times, heap fragmentation, and fatal hard faults under **MISRA-C:2012 Rule 21.3**.
- **Zero Cloud Latency & Privacy:** Sensory processing (keyword audio, vision, vibration anomaly detection) must execute completely offline in **under 1 to 5 ms**.

Shannon bridges deep learning frameworks (PyTorch, ONNX, TensorFlow) with bare-metal microcontrollers through an automated 5-stage optimization pipeline.

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│ 1. Model Parser │ ───> │ 2. Quantizer    │ ───> │ 3. Memory Arena │ ───> │ 4. CodeGen      │ ───> │ 5. Critic Audit │
│ (ONNX / Dict)   │      │ (INT8 / INT4)   │      │ (Interval Graph)│      │ (C99 / C++11)   │      │ (Formal Safety) │
└─────────────────┘      └─────────────────┘      └─────────────────┘      └─────────────────┘      └─────────────────┘
```

---

## 2. Technical Compiler Pipeline Stages

### Stage 1: Computational Graph Parsing & Shannon IR
The model graph is ingested into **Shannon Intermediate Representation** (`compiler/engine/ir.py`). Operators are parsed into standardized mathematical micro-kernels:
- `Conv2D` & `DepthwiseConv2D` (Spatial filter convolutions)
- `Dense` (Linear matrix-vector multiplication with SIMD vectorization)
- `MaxPool2D` & `AveragePool2D` (Spatial downsampling)
- `ReLU` & `ReLU6` (In-place activation rectification)
- `Softmax` (Normalized exponential classification output)

Each tensor maintains explicit tracking of shape, data type, physical SRAM offsets, quantization scaling factors ($S$), and zero points ($Z$).

---

### Stage 2: Post-Training Symmetric INT8 / INT4 Quantization
Floating-point weights ($W_{FP32}$) and activations ($A_{FP32}$) are mapped to discrete integer ranges:
- **INT8 Range:** $[-128, 127]$
- **INT4 Range:** $[-8, 7]$ (Packed 2 weights per byte in Flash ROM)

$$\text{Scale } S = \frac{\max(|X|)}{2^{\text{bits}-1} - 1}$$
$$X_{\text{quant}} = \text{clip}\left(\left\lfloor \frac{X}{S} + 0.5 \right\rfloor, -2^{\text{bits}-1}, 2^{\text{bits}-1} - 1\right)$$

Biases are quantized to 32-bit signed integers ($B_{INT32}$) with scale $S_{\text{bias}} = S_{\text{weight}} \times S_{\text{input}}$ to guarantee exact accumulator math without 32-bit overflow.

---

### Stage 3: Greedy Interval Graph Coloring (Tensor Arena)
Rather than allocating distinct memory buffers for every layer output, Shannon computes exact buffer lifetimes $[t_{\text{start}}, t_{\text{end}}]$ across the computational graph.
1. Computes the active lifespan window for each activation tensor.
2. Applies a greedy interval graph coloring allocator with 4-byte word boundary alignment.
3. Overwrites expired layer activations immediately in the same memory offsets.

**Result:** Reduces peak SRAM footprint by **65% to 85%**, guaranteeing execution in a single contiguous static array:
```c
static uint8_t shannon_tensor_arena[SHANNON_ARENA_SIZE] __attribute__((aligned(4)));
```

---

### Stage 4: Bare-Metal C/C++ Header Synthesis
The compiler synthesizes a single, self-contained, zero-dependency C99 / C++11 header file (`shannon_model.h`):
- Quantized weight matrices are emitted as `static const int8_t` arrays in **Flash ROM**.
- Micro-kernels feature 4-way loop unrolling and target-specific vector intrinsics:
  - **ESP32-S3:** Xtensa PIE 8-bit vector instructions.
  - **STM32H7:** ARM CMSIS-NN `__SMLAD` dual 16-bit MAC hardware instructions.
  - **RP2040 (Pico):** Dual-core ARM Cortex-M0+ unrolled arithmetic.
  - **nRF52840:** ARMv7E-M DSP instructions with low-power BLE sleep cycles.
- Single public entrypoint:
```c
int shannon_run_inference(const int8_t* input_data, int8_t* output_data);
```

---

### Stage 5: Formal Critic Audit & MISRA-C Compliance
The critic verification pass mathematically proves:
1. **Zero Collision Guarantee:** No two concurrently active tensors occupy overlapping byte intervals.
2. **Boundary Safety:** Array bounds never exceed the physical SRAM capacity of the target microcontroller.
3. **MISRA-C:2012 Rule 21.3 Compliance:** 0 calls to dynamic memory functions (`malloc`, `calloc`, `realloc`, `free`).

---

## 3. Supported Hardware Matrix

| Hardware Target | Core Architecture | Clock Frequency | Flash ROM | SRAM Capacity | Vector / SIMD Engine |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ESP32-S3** | Xtensa Dual LX7 | 240 MHz | 8 MB | 512 KB | Xtensa PIE (8-bit SIMD) |
| **STM32H7** | ARM Cortex-M7 | 480 MHz | 2 MB | 1024 KB | ARM `__SMLAD` CMSIS-NN |
| **RP2040 (Pico)** | Dual Cortex-M0+ | 133 MHz | 2 MB | 264 KB | Software Unrolled 32-bit |
| **nRF52840** | ARM Cortex-M4F | 64 MHz | 1 MB | 256 KB | ARMv7E-M DSP Instructions |
| **Portenta H7** | Dual M7 / M4 | 480 MHz | 16 MB | 1024 KB | 4-Way SIMD + SDRAM |