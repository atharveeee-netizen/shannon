<div align="center">

# ⚡ Shannon (Shannon AI)
### **Autonomous TinyML Compiler & Hardware Optimization Studio**
*Compressing giant intelligence into micro-scale silicon.*

[![Hackathon: AI Builders 2026](https://img.shields.io/badge/Hackathon-AI%20Builders%202026-blueviolet.svg?style=for-the-badge)](https://ai-builders-hackathon-2026.devpost.com/)
[![Devpost Submission](https://img.shields.io/badge/Devpost-Project%20Submission-003E54.svg?style=for-the-badge&logo=devpost)](https://ai-builders-hackathon-2026.devpost.com/)
[![Target Prize: Best SaaS](https://img.shields.io/badge/Target%20Prize-Best%20SaaS%20%28%244%2C000%29-emerald.svg?style=for-the-badge)](https://ai-builders-hackathon-2026.devpost.com/)

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![React 18](https://img.shields.io/badge/React-18-cyan.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple.svg)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-teal.svg)](https://fastapi.tiangolo.com/)

[**Architecture Docs**](docs/ARCHITECTURE.md) • [**Hackathon Pitch Deck**](docs/DECK_OUTLINE.md) • [**Model Zoo & Training**](compiler/training/) • [**Compiler Tests**](compiler/test_compiler.py)

</div>

---

## 🏆 Official Hackathon Submission Details

| Parameter | Details |
| :--- | :--- |
| **Hackathon Name** | **AI Builders Hackathon 2026** |
| **Theme** | *Building the Future of Intelligent Systems. The Internet Needs Better AI.* |
| **Official Portal** | [ai-builders-hackathon-2026.devpost.com](https://ai-builders-hackathon-2026.devpost.com/) |
| **Submission Deadline** | **September 15, 2026 @ 11:00 PM EDT** |
| **Target Track & Awards** | 🥇 **Best SaaS Product ($4,000 Cash)**<br>🚀 **NexFellow Founder’s Choice Award**<br>✨ **NexFellow Product Excellence & Innovation Award** |
| **Primary Category** | **AI Developer Tools**, **AI Agents & Multi-Agent Systems**, **TinyML / Edge AI** |
| **Team** | **Team Shannon** ([@atharveeee-netizen](https://github.com/atharveeee-netizen)) |

---

## 🎯 The Problem: "Fitting an Elephant into a Backpack"
Modern AI models are massive, requiring gigabytes of memory and power-hungry cloud GPUs. Yet, billions of edge devices (smart health monitors, industrial vibration sensors, security cameras, and drones) run on **$2 to $5 microcontrollers with less than 1 MB of RAM**.

Manually quantizing neural networks, avoiding heap crashes, and writing bare-metal C++ firmware takes embedded engineers **weeks of tedious manual labor**.

---

## 🚀 The Solution: Shannon Studio
**Shannon** is an autonomous SaaS optimization studio and compiler that bridges deep learning with bare-metal microchips:
1. **Upload & Choose Chip:** Select an AI model and your target hardware (ESP32-S3, STM32H7, RP2040 Pico, nRF52).
2. **AI "Shrink-Ray" (Quantization & Pruning):** Automatically compresses weights to symmetric INT8/INT4 (75–90% Flash reduction) without noticeable loss of accuracy.
3. **Zero-Malloc Tensor Arena:** Dynamically maps activations to a single contiguous memory arena in SRAM using greedy interval coloring.
4. **Live In-Browser Simulation:** Test inference directly in the web browser with real-time laptop webcam, microphone, or synthetic streams.
5. **1-Click C/C++ Header Export:** Download zero-dependency, standalone C/C++ code ready to flash onto physical hardware.

---

## 🧠 The Shannon Model Zoo (Trained Benchmarks)

| Model Name | Domain | Architecture | Target HW | Flash Savings | SRAM Arena |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Audio Keyword Spotter** | Voice Wake-Word | 1D-CNN (Google Speech Commands) | ESP32-S3 | **75% (24 KB)** | **1.1 KB** |
| **MicroVision Person** | Edge Vision | Depthwise Separable CNN (VWW) | STM32H7 | **65x (1.1 KB)** | **18.0 KB** |
| **Vibration Autoencoder** | Industrial IoT | 5-Layer Autoencoder (NASA Bearing) | RP2040 Pico | **73% (5.0 KB)** | **0.1 KB** |

---

## 🏗️ Repository Architecture

```text
shannon/
├── compiler/                     # Python Core Optimization Engine & API
│   ├── engine/
│   │   ├── ir.py                 # Shannon Intermediate Representation
│   │   ├── parser.py             # ONNX / JSON Graph Parser
│   │   ├── quantizer.py          # Post-Training INT8/INT4 Quantization
│   │   ├── memory_planner.py     # Peak SRAM Arena Allocator
│   │   ├── codegen.py            # Standalone C/C++ Header Emitter
│   │   └── presets.py            # KWS, Anomaly Autoencoder, MicroVision
│   ├── training/                 # PyTorch Training & Parity Evaluation Scripts
│   │   ├── train_kws.py          # Audio Wake-Word Trainer
│   │   ├── train_vision.py       # MobileNet-Tiny Vision Trainer
│   │   ├── train_anomaly.py      # Vibration Autoencoder Trainer
│   │   └── evaluate_all.py       # Benchmark & Parity Verification Suite
│   ├── agent/
│   │   └── optimizer_agent.py    # Autonomous Hardware-Constraint Reasoner
│   ├── api.py                    # FastAPI Server
│   └── test_compiler.py          # Unit Test Suite (3/3 Passed)
│
├── frontend/                     # Modern React + Vite + Tailwind Web Studio
│   ├── src/
│   │   ├── components/           # Hardware Selector, Memory Map, Simulator (Webcam/Mic), CodeViewer, Chat
│   │   ├── services/             # Compiler API Client & Client-Side Engine
│   │   └── App.tsx               # Studio Dashboard
│   └── package.json
│
├── firmware/                     # Microcontroller Starter Templates & Demos
│   ├── esp32_starter/            # ESP-IDF & Arduino Sketch (shannon_esp32_demo.ino)
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

Open `http://localhost:3000` in your browser to experience the Shannon Studio.

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.