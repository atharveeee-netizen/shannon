<div align="center">

# ⚡ Shannon AI Studio
### **Autonomous TinyML Compiler & Hardware Optimization Studio**
*Compressing giant intelligence into micro-scale silicon with zero dynamic malloc.*

[![Hackathon: AI Builders 2026](https://img.shields.io/badge/Hackathon-AI%20Builders%202026-blueviolet.svg?style=for-the-badge)](https://ai-builders-hackathon-2026.devpost.com/)
[![Target Prize: Best SaaS](https://img.shields.io/badge/Target%20Prize-Best%20SaaS%20%28%244%2C000%29-00FFA3.svg?style=for-the-badge)](https://ai-builders-hackathon-2026.devpost.com/)
[![MISRA-C:2012](https://img.shields.io/badge/Compliance-MISRA--C%3A2012%20Rule%2021.3-0EA5E9.svg?style=for-the-badge)](https://www.misra.org.uk/)

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![React 18](https://img.shields.io/badge/React-18-cyan.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple.svg)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-teal.svg)](https://fastapi.tiangolo.com/)

[**Architecture Docs**](docs/ARCHITECTURE.md) • [**10-Slide Pitch Deck**](docs/DECK_OUTLINE.md) • [**Model Zoo & Training**](compiler/training/) • [**Compiler Tests**](compiler/test_compiler.py)

</div>

---

## 🏆 Official Hackathon Submission Details

| Parameter | Details |
| :--- | :--- |
| **Hackathon Name** | **AI Builders Hackathon 2026** |
| **Theme** | *Building the Future of Intelligent Systems. The Internet Needs Better AI.* |
| **Target Track & Awards** | 🥇 **Best SaaS Product ($4,000 Cash)**<br>🚀 **NexFellow Founder’s Choice Award**<br>✨ **NexFellow Product Excellence & Innovation Award** |
| **Primary Category** | **AI Developer Tools**, **AI Agents & Multi-Agent Systems**, **TinyML / Edge AI** |
| **Team** | **Team Shannon** ([@atharveeee-netizen](https://github.com/atharveeee-netizen)) |

---

## 🎯 The Problem: "The Edge AI Wall"
Modern deep learning models are multi-gigabyte monsters requiring power-hungry GPUs. Yet, over 30 billion edge devices (smart health monitors, industrial vibration sensors, security cameras, and drones) run on **$2 to $5 microcontrollers with less than 1 MB of RAM**.

Writing bare-metal C++ firmware, manually quantizing weights, and preventing runtime heap fragmentation takes embedded teams **weeks of tedious manual labor**.

---

## 🚀 The Solution: Shannon AI Studio
**Shannon** is an autonomous SaaS optimization studio and compiler that bridges deep learning with bare-metal microchips:
1. **Upload Model & Select Chip:** Select an AI model and your target hardware (ESP32-S3, STM32H7, RP2040 Pico, nRF52840, Portenta H7).
2. **Symmetric INT8/INT4 Quantization:** Automatically compresses weights (75–90% Flash reduction) without noticeable loss of accuracy.
3. **Zero-Malloc Tensor Arena:** Maps intermediate activations to a single contiguous memory arena in SRAM using greedy interval graph coloring.
4. **Live In-Browser Sensory Simulator:** Test inference directly in the web browser with real-time laptop webcam downsampling (48x48), microphone MFCC spectrograms, or synthetic IMU vibration streams.
5. **1-Click Standalone C/C++ Header Export:** Download zero-dependency C/C++ code ready to flash directly to hardware without TensorFlow Lite Micro or ONNX runtime overhead.

---

## 🧠 The Shannon Model Zoo Benchmarks

| Model Name | Domain | Architecture | Target HW | Flash Savings | Peak SRAM Arena | Total MACs |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Audio Keyword Spotter** | Voice Wake-Word | 1D-CNN (Google Speech Commands) | ESP32-S3 | **75% (24 KB)** | **1.1 KB** | 91,488 |
| **MicroVision Person** | Edge Vision | Depthwise Separable CNN (VWW) | STM32H7 | **65x (1.1 KB)** | **18.0 KB** | 239,680 |
| **Vibration Autoencoder** | Industrial IoT | 5-Layer Autoencoder (NASA Bearing) | RP2040 Pico | **73% (5.0 KB)** | **0.1 KB** | 4,608 |

---

## 🏗️ Repository Architecture

```text
shannon/
├── compiler/                     # Python Core Optimization Engine & API
│   ├── engine/
│   │   ├── ir.py                 # Shannon Intermediate Representation
│   │   ├── parser.py             # ONNX / JSON Graph Parser
│   │   ├── quantizer.py          # Post-Training INT8/INT4 Quantization
│   │   ├── memory_planner.py     # Peak SRAM Arena Allocator & Collision Proof
│   │   ├── codegen.py            # Standalone Zero-Dependency C/C++ Header Emitter
│   │   └── presets.py            # KWS, Anomaly Autoencoder, MicroVision
│   ├── training/                 # PyTorch Training & Parity Evaluation Scripts
│   │   ├── train_kws.py          # Audio Wake-Word Trainer
│   │   ├── train_vision.py       # MobileNet-Tiny Vision Trainer
│   │   ├── train_anomaly.py      # Vibration Autoencoder Trainer
│   │   └── evaluate_all.py       # Benchmark & Parity Verification Suite
│   ├── agent/
│   │   └── optimizer_agent.py    # Autonomous Hardware-Constraint Copilot Reasoner
│   ├── api.py                    # Production FastAPI Server
│   └── test_compiler.py          # Comprehensive Unit Test Suite (8/8 Passed)
│
├── frontend/                     # High-Performance Developer Silicon Studio UI
│   ├── src/
│   │   ├── components/           # Arena Map, Sensory Simulator, Bento Workbench, 3D Die Canvas, Copilot
│   │   ├── services/             # Compiler API Client & Real-time Integration
│   │   └── App.tsx               # Studio Dashboard
│   └── package.json
│
├── firmware/                     # Microcontroller Starter Templates & Demos
│   ├── esp32_starter/            # ESP-IDF & Arduino Sketch (shannon_esp32_demo.ino)
│   └── stm32_starter/            # STM32 CMSIS-NN C Template
│
└── docs/                         # Architecture Specs & 10-Slide Pitch Deck Outline
    ├── ARCHITECTURE.md
    └── DECK_OUTLINE.md
```

---

## ⚡ Quick Start

### 1. Run the Python Compiler Backend & Tests
```bash
cd compiler
pytest test_compiler.py
```

### 2. Run the Benchmark Evaluator
```bash
cd compiler/training
python evaluate_all.py
```

### 3. Launch the Web Studio
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` or `http://localhost:3000` in your browser to experience Shannon AI Studio.

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.