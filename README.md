<div align="center">

# Shannon TinyML Compiler & Silicon Studio
### Autonomous Static Compiler for Constrained Microcontrollers
*Zero dynamic memory allocation (0 B malloc), INT8 quantization, and SRAM interval arena planning.*

[![Compiler Tests](https://img.shields.io/badge/Pytest-14%20Passed-emerald.svg)](compiler/)
[![Static Safety](https://img.shields.io/badge/Safety-0%20B%20Heap%20(No%20Malloc)-0f62fe.svg)](frontend/src/compiler/)
[![Design System](https://img.shields.io/badge/UI-IBM%20Carbon%200px%20Flat-black.svg)](frontend/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[**Live Compiler Studio**](https://atharveeee-netizen.github.io/shannon/) • [**Regression Tests**](compiler/test_regression.py) • [**Firmware Starters**](firmware/) • [**Architecture Docs**](docs/ARCHITECTURE.md)

</div>

---

## 3-Minute Judge Evaluation Guide

If you are evaluating Shannon in 3 to 5 minutes, follow these exact steps:

1. **Open the Live Web Application:**  
   Visit [https://atharveeee-netizen.github.io/shannon/](https://atharveeee-netizen.github.io/shannon/).
2. **Review the Executive Matrix:**  
   The primary dashboard immediately answers the 8 core compiler questions:
   - **Model**: Neural network topology (e.g. Keyword Spotting, MicroVision, Anomaly Autoencoder).
   - **Target**: Selected microcontroller (ESP32-S3, STM32H7, RP2040, NRF52840).
   - **Precision**: Symmetric signed INT8.
   - **Status**: Compilation state (Compiled / Ready).
   - **SRAM**: Exact peak activation arena bytes vs target chip SRAM.
   - **Flash**: Quantized weights array size vs target chip Flash.
   - **Heap**: Formally verified **0 B** dynamic allocation.
   - **Latency**: Static cycle estimate based on clock MHz and MAC pipeline.
3. **Inspect the Physical Memory Hierarchy:**  
   Scroll down to view the **SRAM Memory Arena**:
   - `FLASH`: Read-only weight constants stored in microsecond ROM.
   - `SRAM`: Input buffer + lifetime-reused activation arena + output buffer.
   - `HEAP`: 0 B (No `malloc`, `calloc`, `realloc`, or `free`).
4. **Inspect & Edit the Generated C Header:**  
   Click **Code Generation** in the sidebar to view the emitted `shannon_model.h`. Edit lines in real time to verify the interactive workstation.
5. **Run Backend Regression Tests:**  
   Run `python -m pytest compiler/ -v` to verify model differences, collision freedom, zero dynamic allocations, and bit-exact determinism.

---

## What is Shannon?

Shannon is a specialized TinyML static compiler designed for bare-metal microcontrollers with severe memory constraints (tens of kilobytes of SRAM).

Existing ML runtimes like TensorFlow Lite Micro or ONNX Runtime introduce 40 to 80 KB of runtime interpreter overhead and rely on manual arena sizing. Shannon eliminates runtime interpreters altogether by compiling neural networks directly into **standalone, static C headers** with pre-planned, collision-free memory addresses.

### Core Technical Pillars

```text
MODEL GRAPH (ONNX / Shannon IR)
       │
       ▼
SYMMETRIC INT8 QUANTIZATION  ──> S = max(|W|) / 127, Z = 0
       │
       ▼
GREEDY INTERVAL GRAPH COLORING ──> Overlapping lifetimes reuse identical SRAM offsets
       │
       ▼
HARDWARE FIT VERIFICATION    ──> Static Flash & SRAM boundary checks
       │
       ▼
STANDALONE C HEADER EMISSION ──> 4-way loop unrolling, 0 B dynamic heap allocation
```

1. **Symmetric INT8 Quantization:**  
   Quantizes weights and activation scaling factors symmetrically ($S = \max(|W|) / 127, Z = 0$). Computes exact mathematical metrics: Mean Squared Error (MSE), Signal-to-Quantization-Noise Ratio (SQNR in dB), and vector cosine similarity.
2. **SRAM Memory Arena (Hero Feature):**  
   Analyzes tensor lifetimes across sequential layer executions. Uses greedy interval graph coloring to assign overlapping activation buffers to shared physical memory offsets, ensuring peak SRAM usage is minimized with mathematical proof of zero collisions.
3. **Zero Dynamic Allocation (0 B Malloc):**  
   All tensors are mapped to either static Flash constants or a fixed BSS segment activation buffer (`static uint8_t shannon_tensor_arena[ARENA_SIZE] __attribute__((aligned(4)))`). No `malloc`, `calloc`, `realloc`, or `free` calls exist in the emitted firmware.
4. **Truthful Telemetry:**  
   Estimated latencies are clearly identified as static estimates based on core clock frequencies and multiply-accumulate operations, not physical silicon measurements.

---

## What is Real vs What is Planned

To maintain absolute technical truthfulness:

| Feature | Status | Implementation Details |
| :--- | :--- | :--- |
| **Symmetric INT8 Quantization** | **Real** | Implemented in `compiler/engine/quantizer.py` and `frontend/src/compiler/quantizer.ts`. Computes real MSE, SQNR, and cosine similarity. |
| **SRAM Arena Lifetime Planning** | **Real** | Implemented in `compiler/engine/memory_planner.py` and `frontend/src/compiler/memory_planner.ts`. Verified collision-free. |
| **Zero-Malloc C Code Emission** | **Real** | Emits complete, standalone C headers with 4-way loop-unrolled INT8 inference loops. |
| **Automated Regression Suite** | **Real** | 14 pytest unit and regression tests in `compiler/test_compiler.py` and `compiler/test_regression.py`. |
| **Client-Side Workstation** | **Real** | Standalone browser compiler runs with zero cloud backend required, using identical IR algorithms. |
| **Live Silicon Telemetry** | **Estimated** | Latency and energy numbers are static approximations calculated from hardware datasheets, not physical oscilloscope traces. |
| **Streaming Sensor Signals** | **Simulated** | Waveforms located under the Experimental tab are synthetic signal simulations for offline testing. |

---

## Repository Structure

```text
shannon/
├── compiler/                         # Python Compiler Core & Test Suite
│   ├── engine/
│   │   ├── ir.py                     # Computational Graph & Tensor IR
│   │   ├── parser.py                 # Shannon IR & Dictionary Parser with Schema Validation
│   │   ├── quantizer.py              # Symmetric INT8 Post-Training Quantizer
│   │   ├── memory_planner.py         # Greedy Interval Graph Coloring Arena Allocator
│   │   ├── codegen.py                # Standalone Static C Header Emitter
│   │   └── presets.py                # Reference Benchmark Topologies (KWS, Vision, Anomaly)
│   ├── agent/
│   │   └── optimizer_agent.py        # Silicon Copilot Reasoner (Telemetry Grounded)
│   ├── api.py                        # FastAPI Backend Service
│   ├── test_compiler.py              # Functional Unit Test Suite (8 Tests)
│   └── test_regression.py            # Edge Case Regression Test Suite (6 Tests)
│
├── frontend/                         # IBM Carbon UI Studio (React 18 + TypeScript + Vite)
│   ├── src/
│   │   ├── compiler/                 # TypeScript Compiler Port (IR, Quantizer, Memory, Codegen)
│   │   ├── components/views/         # Dashboard, Graph, Arena, Codegen, Validation, Targets
│   │   └── context/                  # Compiler State Management
│   ├── index.html                    # IBM Plex Sans / Mono Fonts
│   └── tailwind.config.js            # 0px Flat Geometry Configuration
│
├── firmware/                         # Multi-Target Firmware Starter Kits
│   ├── esp32_arduino/                # ESP32 / ESP32-S3 Firmware
│   ├── rp2040_pico/                  # Raspberry Pi Pico C-SDK Template
│   ├── nrf52_xiao/                   # Nordic nRF52840 BLE Template
│   └── teensy41/                     # ARM Cortex-M7 Firmware Starter
│
└── docs/                             # Technical Documentation
    └── ARCHITECTURE.md               # Compiler Architecture Deep Dive
```

---

## Running the Compiler

### 1. Run Python Tests
```bash
# Install dependencies
pip install -r compiler/requirements.txt

# Run the complete test suite (14 tests passed)
python -m pytest compiler/ -v
```

### 2. Start the FastAPI Service (Optional)
```bash
python -m uvicorn compiler.api:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Run the Frontend Development Server
```bash
cd frontend
npm install
npm run dev
```

### 4. Build Production Bundle
```bash
cd frontend
npm run build
```

---

## License
MIT License. Created for the DevNetwork Hackathon 2026.