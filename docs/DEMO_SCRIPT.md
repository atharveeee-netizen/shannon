# 🎬 Shannon AI Studio — Official 3-Minute Hackathon Demo Script
### **AI Builders Hackathon 2026 Submission Walkthrough**

---

### **Video Overview & Structure (180 Seconds Total)**

| Timestamp | Screen Action | Narration & Talking Points |
| :--- | :--- | :--- |
| **0:00 - 0:25** | Open Shannon Studio Homepage (Dark mode UI, Silicon trace grid). Show headline and hardware selector. | *"Hello judges! Over 30 billion IoT and edge devices deployed today run on $2 microcontrollers with less than 1MB of RAM. They can't run cloud GPUs or bulky runtime engines like TensorFlow Lite Micro. Today, we're introducing **Shannon AI Studio** — the autonomous TinyML compiler that compresses deep learning models into zero-dependency, zero-dynamic-malloc C/C++ firmware."* |
| **0:25 - 0:55** | Select **Audio Keyword Spotter** $\rightarrow$ Target **ESP32-S3 (Xtensa Dual-Core LX7)**. Click **"Run Silicon Optimization"**. Show compilation telemetry loading in real-time. | *"Let's optimize a 12-class voice wake-word model for an ESP32-S3. With one click, Shannon's pipeline ingests the neural network, applies symmetric INT8 post-training quantization, and executes greedy interval graph coloring to plan a static memory arena in fast SRAM."* |
| **0:55 - 1:25** | Scroll through the **Optimization Telemetry Card**, **Layer Breakdown Table**, and **Interactive Memory Arena Visualizer**. Highlight the physical hex addresses (`0x20000000`). | *"Look at the results: Flash memory footprint is compressed by 75% down to 24 KB. More importantly, peak SRAM activation memory is compacted into just 1.1 KB of contiguous buffer space. Notice that intermediate tensor activations reuse physical memory offsets. This formally guarantees **0 Bytes dynamic malloc()**, fully compliant with **MISRA-C:2012 Rule 21.3**."* |
| **1:25 - 1:55** | Switch to **"Generated Code"** tab. Click **"Copy"** and **"Download shannon_kws_model.h"**. Show the flat weights in Flash ROM and 4-way SIMD unrolled kernels. | *"Under the Code Inspector, Shannon emits clean, standalone C/C++ headers. The weights reside in Flash ROM, the memory arena is statically declared in SRAM, and inner loops are vectorized for the Xtensa PIE 8-bit SIMD instruction set. There are zero external Python or runtime library dependencies."* |
| **1:55 - 2:25** | Open the firmware folder in VSCode/Arduino. Show `firmware/esp32_arduino/shannon_esp32_inmp441_audio.ino` with live I2S microphone DMA sampling. | *"We also bundle production firmware templates for ESP32-CAM vision, INMP441 I2S audio, MPU6050 vibration anomaly detection, Arduino Uno R4, and Raspberry Pi Pico RP2040. You can flash this code directly to real silicon in seconds."* |
| **2:25 - 3:00** | Open the **AI Copilot** and ask: *"How did you optimize memory for the ESP32-S3?"*. Show the dynamic analytical reasoning response. Show GitHub repository and summarize. | *"Shannon includes an embedded AI Copilot that dynamically analyzes silicon constraints, clock speeds, and memory headroom. Shannon turns weeks of tedious embedded ML optimization into a seamless, 60-second SaaS workflow. Thank you for watching!"* |

---

### **Technical Proof Points to Highlight:**
1. **Zero Runtime Malloc:** Formally proven non-overlapping SRAM arena offsets.
2. **Real Converged Models:** 95.8% KWS accuracy, 89.1% MobileNet-Tiny vision accuracy, 85x bearing anomaly separation factor.
3. **Multi-MCU Coverage:** ESP32, STM32, RP2040, nRF52, Arduino, Teensy 4.1.
