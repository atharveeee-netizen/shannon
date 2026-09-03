# 🎬 SHANNON — 5-MINUTE VIDEO DEMO SCRIPT & OPERATOR PLAYBOOK
### *Master Submission Walkthrough for Judges & Hackathon Evaluators*

**Live Studio URL:** [https://atharveeee-netizen.github.io/shannon/](https://atharveeee-netizen.github.io/shannon/)  
**Target Duration:** 5:00 – 6:30 Minutes  
**Resolution:** 1080p / 4K Full-Screen Browser (F11 / Clean Desktop)  

---

## ⏱️ Video Timeline & Stage Map

| Time | Stage | View / Feature | Key Value Highlight |
| :--- | :--- | :--- | :--- |
| **0:00 – 0:45** | **1. The Problem & Introduction** | **Dashboard** | Why Edge ML fails (memory fragmentation, dynamic malloc crashes) and Shannon's 0-malloc solution. |
| **0:45 – 1:30** | **2. Model Zoo & Sensory DSP** | **Models & Inputs** | 3 Production TinyML models (Audio, Vision, Anomaly) & multi-stage DSP feature pipelines. |
| **1:30 – 2:30** | **3. Computational IR Graph** | **Graph Workspace** | Interactive AST DAG with pan, zoom, minimap, upstream/downstream tracing, and verified operator telemetry. |
| **2:30 – 3:30** | **4. Quantization & Memory Arena** | **Quantization & Memory Arena** | Jacob symmetric INT8/INT4 PTQ & 2D greedy interval graph coloring memory reuse map at `0x20000000`. |
| **3:30 – 4:30** | **5. Native Simulation & Parity** | **Signal Flow & FP32 vs INT8** | Live sensor-to-silicon signal streaming & layer-by-layer float-vs-int numerical error verification. |
| **4:30 – 5:15** | **6. Firmware Generation & Deployment** | **Deployment & CodeGen** | Standalone MISRA-C:2012 C header, Arduino `.ino`, and bare-metal `.c` starter packages. |
| **5:15 – 5:45** | **7. Summary & Vision** | **Dashboard / Settings** | Fully autonomous edge AI compiler ready for real silicon deployment. |

---

## 🎬 Section-by-Section Walkthrough

---

### ⏱️ SECTION 1: THE HOOK & INTRODUCTION (0:00 – 0:45)
**Active Page:** `PROJECT` $\to$ **Dashboard**

#### 🖱️ Screen Actions:
1. Open the browser to `https://atharveeee-netizen.github.io/shannon/` in full screen.
2. Start on the **Dashboard** view.
3. Slowly hover over the top status cards: **Peak Static SRAM (1.12 KB)**, **Flash Footprint (24.0 KB)**, **Target Hardware (STM32H7)**, and **0 Malloc Verified** badge.
4. Briefly toggle the Dark/Light theme button in the top right to show design responsiveness, then return to Dark mode.

#### 🎙️ Spoken Narration:
> *"Hello judges! Welcome to Shannon, an autonomous TinyML Silicon Compiler and Engineering Studio.*
>
> *Deploying deep learning to edge microcontrollers has always been held back by two fatal issues: unpredictable memory fragmentation caused by dynamic heap allocations, and software emulations that crush real-time latency.*
>
> *Shannon solves this at the compiler level. It is a zero-malloc TinyML compiler that ingests neural network models, quantizes weights with bit-accurate symmetric INT8 and mixed-precision INT4 schemes, plans a single contiguous static memory arena using greedy interval graph coloring, and compiles pure, deterministic, MISRA-C:2012 compliant C firmware."*

---

### ⏱️ SECTION 2: MODEL CATALOG & SENSORY DSP (0:45 – 1:30)
**Active Page:** `PROJECT` $\to$ **Models** $\to$ **Inputs**

#### 🖱️ Screen Actions:
1. In the left sidebar, click **Models** under `PROJECT`.
2. Click through the 3 preset models:
   * **Keyword Spotting (KWS)** (Google Speech Commands)
   * **Micro-Vision** (Visual Wake Words)
   * **Motor Vibration Anomaly** (NASA Bearing Dataset)
3. Select **Keyword Spotting**.
4. In the sidebar, click **Inputs**.
5. Scroll down to show the raw waveform, the 32ms Hanning slice, and the 10-bin Mel Filterbank energy distribution.

#### 🎙️ Spoken Narration:
> *"Let’s look at the model zoo. Shannon includes production-trained reference topologies across three fundamental edge AI domains: acoustic keyword spotting, computer vision person detection, and 3-axis industrial vibration anomaly detection.*
>
> *In the Inputs view, we can inspect the sensory digital signal processing pipeline. Before a model ever executes, Shannon models the hardware DSP stages—from analog microphone sampling at 16 kHz, through a 32-millisecond Hanning window, into a 10-bin Mel Filterbank spectrogram that directly feeds our static input tensor."*

---

### ⏱️ SECTION 3: COMPILER AST & INTERACTIVE GRAPH (1:30 – 2:30)
**Active Page:** `COMPILER` $\to$ **Graph**

#### 🖱️ Screen Actions:
1. In the left sidebar, click **Graph** under `COMPILER`.
2. Click and drag on the canvas to demonstrate **Pan**.
3. Use the top toolbar or mouse wheel to **Zoom In** and **Zoom Out** ($40\% - 200\%$).
4. Click on **`#01 conv1`** $\to$ point out the cyan glowing spline tracing upstream from the input tensor and the emerald spline connecting downstream to `#02 pool1`.
5. Point out the bottom-right **Graph Minimap**.
6. On the right-hand **IR Node Inspector**, toggle between **Operator**, **Tensors**, and **Memory** tabs to show the exact MAC operations, tensor dimensions, and physical SRAM hex offsets.

#### 🎙️ Spoken Narration:
> *"Now let's enter the compiler workspace. This is the Shannon Computational Graph representing our verified Internal Representation AST.*
>
> *Every node here is a real compiler operator—there are zero placeholder nodes. We have full interactive pan, zoom, and a real-time minimap tracking our position.*
>
> *When I click on `conv1`, Shannon immediately highlights dataflow dependencies—tracing upstream producers with cyan connections and downstream consumers with emerald connections.*
>
> *On the right-hand inspector, we see ground-truth compiler telemetry: 46,368 MACs, verified Flash weight ROM sizes, and the exact physical memory offset `0x20000000` with 4-byte word bus alignment."*

---

### ⏱️ SECTION 4: QUANTIZATION & ZERO-MALLOC MEMORY ARENA (2:30 – 3:30)
**Active Page:** `COMPILER` $\to$ **Quantization** $\to$ **Memory Arena**

#### 🖱️ Screen Actions:
1. In the left sidebar, click **Quantization** under `COMPILER`.
2. Point out the bitwidth toggle (**INT8 Symmetric / INT4 Mixed-Precision**) and the layer-by-layer scale factor ($S$) and zero point ($Z = 0$) table.
3. In the left sidebar, click **Memory Arena**.
4. Scroll through the **2D Memory Arena Spatial Layout**. Hover over the color-coded tensor blocks (`input_audio`, `conv1_out`, `pool1_out`, `dense1_out`).
5. Point out the **Peak Static SRAM Arena** metric (**1.12 KB**) and the **0 Bytes Dynamic Malloc** indicator.

#### 🎙️ Spoken Narration:
> *"Next, let's look at Shannon's quantization and memory planning engines.*
>
> *Under Quantization, Shannon applies Jacob et al. post-training quantization with HAWQ-inspired mixed-precision support. It computes per-layer scale factors, locking zero points to zero for high-throughput symmetric integer SIMD execution.*
>
> *Now, the crown jewel of Shannon: the Memory Arena. Traditional runtimes allocate memory dynamically on the heap during inference, which causes fatal memory leaks on microcontrollers.*
>
> *Shannon uses a greedy interval graph coloring algorithm to calculate the precise lifetime window of every activation tensor. As soon as `conv1_out` is consumed by `pool1`, that SRAM buffer is immediately recycled for `dense1_out`. The entire model executes inside a single 1.12 KB static BSS arena with zero malloc calls."*

---

### ⏱️ SECTION 5: REAL-TIME SIMULATION & BIT-ACCURATE PARITY (3:30 – 4:30)
**Active Page:** `SIMULATION` $\to$ **Signal Flow** $\to$ **FP32 vs INT8**

#### 🖱️ Screen Actions:
1. In the left sidebar, click **Signal Flow** under `SIMULATION`.
2. Show the live animated oscilloscope streaming frames and point out the ring buffer pointer updating.
3. In the left sidebar, click **FP32 vs INT8**.
4. Point out the **Output Logit Distribution Comparison** table showing reference Float32 Softmax vs INT8 Shannon dequantized values ($q \times S$) with 100% Top-1 argmax agreement.
5. Point out the **Layer-Wise Numerical Discrepancy** table and the `[SIMULATED]` provenance label.

#### 🎙️ Spoken Narration:
> *"In the Simulation workspace, Shannon provides native end-to-end simulation.*
>
> *Under Signal Flow, we can observe real-time sensor ingestion streaming through DMA ring buffers into the inference engine.*
>
> *Under FP32 vs INT8, Shannon verifies bit-accurate numerical parity. Here we compare reference PyTorch floating-point logits against Shannon's fixed-point INT8 engine. The maximum absolute error is bounded at 0.00312, with a 100% Top-1 classification match across all test tensors.*
>
> *Notice that every metric is labeled with clear provenance—such as `[SIMULATED]` or `[MEASURED]`—ensuring complete technical truthfulness."*

---

### ⏱️ SECTION 6: FIRMWARE GENERATION & DEPLOYMENT (4:30 – 5:15)
**Active Page:** `COMPILER` $\to$ **Code Generation** $\to$ `HARDWARE` $\to$ **Deployment**

#### 🖱️ Screen Actions:
1. In the left sidebar, click **Code Generation** under `COMPILER`.
2. Scroll through the generated pure C header code (`shannon_kws_model.h`). Point out the `static const int8_t conv1_weights[]` array and 4-way unrolled `#pragma` SIMD loop.
3. Click the **Copy Code** button or **Download .h** button.
4. In the left sidebar, click **Deployment** under `HARDWARE`.
5. Show the three exportable starter kits:
   * **C++ Standalone Header**
   * **Arduino IDE Sketch (`.ino`)**
   * **Bare-Metal Pico/STM32 (`.c`)**
6. Click **Download .ino Sketch** or **Download .c Source** to demonstrate live artifact export.

#### 🎙️ Spoken Narration:
> *"Under Code Generation, we see the generated firmware. Shannon outputs pure, standalone C headers containing all quantized weights in Flash ROM, static activation pointers, and 4-way vectorized SIMD loops.*
>
> *Finally, under Deployment, we can export turnkey firmware starter packages tailored for STM32, ESP32, Raspberry Pi Pico, and Arduino.*
>
> *I can click 'Download .ino Sketch' or 'Download .h Header' to instantly obtain production-ready source code that flashes directly onto physical hardware with zero dependencies."*

---

### ⏱️ SECTION 7: WRAP-UP & CONCLUSION (5:15 – 5:45)
**Active Page:** `PROJECT` $\to$ **Dashboard**

#### 🖱️ Screen Actions:
1. Return to the **Dashboard**.
2. Press `Cmd+K` (or `Ctrl+K`) to open the **Command Palette**, search for `"STM32"`, switch targets, and close.
3. Conclude on the main dashboard showing the full workflow pipeline.

#### 🎙️ Spoken Narration:
> *"To summarize: Shannon bridges the gap between high-level machine learning research and deterministic silicon execution. With zero dynamic memory allocation, bit-accurate integer quantization, and standalone C code generation, Shannon makes edge AI truly reliable, predictable, and deployable.*
>
> *The entire studio is live on GitHub Pages with an open-source toolchain ready to compile your edge intelligence. Thank you for your time!"*

---

## 💡 Quick Tips for a Flawless Recording

1. **Browser Zoom:** Set your browser zoom to $100\%$ or $90\%$ so all panels and navigation fit without scrolling awkwardness.
2. **Smooth Mouse Movement:** Move the cursor deliberately to the buttons, give 1–2 seconds for each view to display clearly, and avoid rapid fidgeting.
3. **Audio Quality:** Use a clean microphone with noise cancellation enabled. Speak with a confident, clear pace.
4. **Shortcut Demo:** Using `Cmd+K` / `Ctrl+K` once during the intro or outro shows off the IDE-grade engineering feel of the studio.
