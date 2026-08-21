<div align="center">

# ⚡ Shannon (Shannon AI)
### **Autonomous TinyML Compiler & Hardware Optimization Studio**
*Compressing giant intelligence into micro-scale silicon.*

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![React 18](https://img.shields.io/badge/React-18-cyan.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple.svg)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-teal.svg)](https://fastapi.tiangolo.com/)

[**Architecture Docs**](docs/ARCHITECTURE.md) • [**Hackathon Pitch Deck**](docs/DECK_OUTLINE.md) • [**Compiler Test Suite**](compiler/test_compiler.py)

</div>

---

## 🎯 The Problem: "Fitting an Elephant into a Backpack"
Modern AI models are massive, requiring gigabytes of memory and power-hungry cloud GPUs. Yet, billions of edge devices (smart health monitors, industrial vibration sensors, security cameras, and drones) run on **$2 to $5 microcontrollers with less than 1 MB of RAM**.

Manually quantizing neural networks, avoiding heap crashes, and writing bare-metal C++ firmware takes embedded engineers **weeks of tedious manual labor**.

---

## 🚀 The Solution: Shannon Studio
**Shannon** is an autonomous SaaS optimization studio and compiler that bridges deep learning with bare-metal microchips:
1. **Upload & Choose Chip:** Select an AI model and your target hardware (ESP32-S3, STM32H7, RP2040 Pico, nRF52).
2. **AI "Shrink-Ray" (Quantization & Pruning):** Automatically compresses weights to symmetric INT8 (75–90% Flash reduction) without noticeable loss of accuracy.
3. **Zero-Malloc Tensor Arena:** Dynamically maps activations to a single contiguous memory arena in SRAM using greedy interval coloring.
4. **Live In-Browser Simulation:** Test inference directly in the web browser with real-time latency and confidence readouts.
5. **1-Click C/C++ Header Export:** Download zero-dependency, standalone C/C++ code ready to flash onto physical hardware.

---

## 🏗️ Repository Architecture

```text
shannon/
├── compiler/                     # Python Core Optimization Engine & API
│   ├── engine/
│   │   ├── ir.py                 # Shannon Intermediate Representation
│   │   ├── parser.py             # ONNX / JSON Graph Parser
│   │   ├── quantizer.py          # Post-Training INT8 Quantization
│   │   ├── memory_planner.py     # Peak SRAM Arena Allocator
│   │   ├── codegen.py            # Standalone C/C++ Header Emitter
│   │   └── presets.py            # KWS, Anomaly Autoencoder, MicroVision
│   ├── agent/
│   │   └── optimizer_agent.py    # Autonomous Hardware-Constraint Reasoner
│   ├── api.py                    # FastAPI Server
│   └── test_compiler.py          # Unit Test Suite
│
├── frontend/                     # Modern React + Vite + Tailwind Web Studio
│   ├── src/
│   │   ├── components/           # Hardware Selector, Memory Map, Simulator, CodeViewer, Chat
│   │   ├── services/             # Compiler API Client & Client-Side Engine
│   │   └── App.tsx               # Studio Dashboard
│   └── package.json
│
├── firmware/                     # Microcontroller Starter Templates
│   ├── esp32_starter/            # ESP-IDF Real-Time Inference Loop
│   └── stm32_starter/            # STM32 CMSIS-NN C Template
│
└── docs/                         # Architecture Specs & 10-Slide Deck Outline
```

---

## ⚡ Quick Start

### 1. Run the Python Compiler Backend & Tests
```bash
cd compiler
python test_compiler.py
```

### 2. Launch the Web Studio
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser to experience the Shannon Studio.

---

## 🏆 Built for the AI Builders Hackathon 2026
* **Target Category:** Best SaaS Product & AI Developer Tools
* **Authors:** Team Shannon / Atharve Dahima ([@atharveeee-netizen](https://github.com/atharveeee-netizen))