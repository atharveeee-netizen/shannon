<div align="center">

# Shannon TinyML Compiler & Silicon Studio
### Autonomous Static Compiler for Constrained Microcontrollers
*Zero runtime dynamic memory allocation (0 B heap / malloc), symmetric INT8 quantization, and SRAM interval arena planning.*

[![Compiler Tests](https://img.shields.io/badge/Pytest-15%20Passed-emerald.svg)](compiler/)
[![Static Safety](https://img.shields.io/badge/Safety-0%20B%20Heap%20(No%20Malloc)-0ea5e9.svg)](frontend/src/compiler/)
[![Design System](https://img.shields.io/badge/UI-Graphite%20EDA%20Workstation-black.svg)](frontend/)
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
   - **Model**: Neural network topology (e.g. Reference Keyword Spotter, Reference MicroVision, Reference Anomaly Autoencoder).
   - **Target**: Selected microcontroller (ESP32-S3, STM32H7, RP2040, NRF52840, Teensy 4.1).
   - **Precision**: Symmetric signed INT8 ($Z = 0, S = \max(|W|) / 127$).
   - **Status**: Compilation state (Compiled / Ready).
   - **SRAM**: Exact peak activation arena bytes vs target chip SRAM.
   - **Flash**: Quantized weights array size vs target chip Flash.
   - **Heap**: Verified **0 B** dynamic allocation (Zero `malloc`/`free` calls).
   - **Latency**: Static cycle estimate based on clock MHz and MAC pipeline.
3. **Inspect the Physical Memory Hierarchy:**  
   Scroll down to view the **SRAM Memory Arena**:
   - `FLASH`: Read-only weight constants stored in microsecond ROM.
   - `SRAM`: Input buffer + lifetime-reused activation arena + output buffer with physical addresses (Base: `0x20000000`).
   - `HEAP`: 0 B (No `malloc`, `calloc`, `realloc`, or `free`).
4. **Inspect & Edit the Generated C Header:**  
   Click **Code Generation** in the sidebar to view the emitted `shannon_model.h`. Edit lines directly in real time to verify the interactive workstation.
5. **Run Backend Regression Tests:**  
   Run `python -m pytest compiler/ -v` to verify model differences, collision freedom, zero dynamic allocations, genuine ONNX parsing, and bit-exact determinism across all 15 tests.

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

1. **Genuine ONNX Parsing & Strict Validation:**  
   Real ONNX binary protobuf decoder parses operators, initializers, tensor dimensions, and weights. Rejects unsupported operators or corrupted files with explicit errors—zero silent fallbacks.
2. **Symmetric INT8 Quantization:**  
   Quantizes weights and activation scaling factors symmetrically ($S = \max(|W|) / 127, Z = 0$). Computes exact mathematical metrics: Mean Squared Error (MSE), Signal-to-Quantization-Noise Ratio (SQNR in dB), and vector cosine similarity.
3. **SRAM Memory Arena (Hero Feature):**  
   Analyzes tensor lifetimes across sequential layer executions. Uses greedy interval graph coloring to assign non-overlapping activation buffers to shared physical memory offsets, ensuring peak SRAM usage is minimized with mathematical proof of zero collisions.
4. **Zero Dynamic Allocation (0 B Malloc):**  
   All tensors are mapped to either static Flash constants or a fixed BSS segment activation buffer (`static uint8_t shannon_tensor_arena[ARENA_SIZE] __attribute__((aligned(4)))`). No `malloc`, `calloc`, `realloc`, or `free` calls exist in the emitted firmware.
5. **Truthful Telemetry:**  
   Estimated latencies are clearly identified as static approximations based on core clock frequencies and multiply-accumulate operations, not live physical oscilloscope measurements.

---

## What is Real vs What is Planned

To maintain absolute technical truthfulness:

| Feature | Status | Implementation Details |
| :--- | :--- | :--- |
| **Genuine ONNX Parsing** | **Real** | Implemented in `compiler/engine/parser.py` using ONNX protobuf engine. Extracts real weights and maps operators directly into Shannon IR with zero silent fallback. |
| **Symmetric INT8 Quantization** | **Real** | Implemented in `compiler/engine/quantizer.py` and `frontend/src/compiler/quantizer.ts`. Computes real MSE, SQNR, and cosine similarity. |
| **SRAM Arena Lifetime Planning** | **Real** | Implemented in `compiler/engine/memory_planner.py` and `frontend/src/compiler/memory_planner.ts`. Verified collision-free. |
| **Zero-Malloc C Code Emission** | **Real** | Emits complete, standalone C headers with 4-way loop-unrolled INT8 inference loops. |
| **Automated Regression Suite** | **Real** | 15 pytest unit and regression tests in `compiler/test_compiler.py` and `compiler/test_regression.py`. |
| **Client-Side Workstation** | **Real** | Standalone browser compiler runs with zero cloud backend required, using identical IR algorithms. |
| **Live Silicon Telemetry** | **Estimated** | Latency numbers are static cycle approximations calculated from hardware datasheets and clock frequencies, not physical oscilloscope traces. |
| **Streaming Sensor Signals** | **Simulated** | Waveforms located under the Experimental tab are synthetic signal simulations for offline testing. |

---

## Repository Structure

```text
shannon/
├── compiler/                         # Python Compiler Core & Test Suite
│   ├── engine/
│   │   ├── ir.py                     # Computational Graph & Tensor IR
│   │   ├── parser.py                 # Genuine ONNX & Dictionary Parser with Schema Validation
│   │   ├── quantizer.py              # Symmetric INT8 Post-Training Quantizer
│   │   ├── memory_planner.py         # Greedy Interval Graph Coloring Arena Allocator
│   │   ├── codegen.py                # Standalone Static C Header Emitter
│   │   └── presets.py                # Reference Demonstration Topologies (KWS, Vision, Anomaly)
│   ├── agent/
│   │   └── optimizer_agent.py        # Silicon Copilot Reasoner (Telemetry Grounded)
│   ├── api.py                        # FastAPI Backend Service
│   ├── test_compiler.py              # Functional Unit Test Suite (8 Tests)
│   └── test_regression.py            # Edge Case Regression Test Suite (7 Tests)
│
├── frontend/                         # Graphite EDA Workstation (React 18 + TypeScript + Vite)
│   ├── src/
│   │   ├── compiler/                 # TypeScript Compiler Port (IR, Quantizer, Memory, Codegen)
│   │   ├── components/views/         # Dashboard, Graph, Arena, Codegen, Validation, Targets
│   │   ├── components/react-bits/    # SpotlightCard, MagicBento, Stepper, AnimatedList
│   │   └── context/                  # Compiler State Management
│   ├── index.html                    # Inter & JetBrains Mono Fonts
│   └── tailwind.config.js            # Matte Graphite Palette & Restrained Radii
│
├── firmware/                         # Multi-Target Firmware Starter Kits
│   ├── esp32_arduino/                # ESP32 / ESP32-S3 Firmware
│   ├── rp2040_pico/                  # Raspberry Pi Pico C-SDK Template
│   ├── stm32_starter/                # STM32CubeIDE Template
│   ├── arduino_universal/            # Universal Microcontroller Arduino Sketch
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

# Run the complete test suite (15 tests passed)
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