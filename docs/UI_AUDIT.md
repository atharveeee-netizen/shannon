# Shannon UI / UX Technical Audit & Design Transformation

## 1. Executive Summary
Shannon is a specialized TinyML model compiler targeting bare-metal microcontrollers (ESP32-S3, STM32H7, RP2040, nRF52840). Its core capabilities are:
- Neural network parsing (IR)
- Symmetric INT8/INT4 Post-Training Quantization (PTQ)
- Contiguous static SRAM Tensor Arena mapping with lifetime interval graph coloring (0 Bytes runtime `malloc()`)
- Standalone zero-dependency C/C++ firmware header generation (`shannon_model.h`)
- Deterministic MISRA-C:2012 Rule 21.3 compliance verification

This audit establishes the roadmap to elevate Shannon into a commercial-grade, developer-trusted compiler interface modeled after the design discipline of **Linear, GitHub Primer, Resend, Modal, Vercel, and Stripe**.

---

## 2. Problem Diagnosis & Architecture Review

### A. The Anti-Pattern: "Maximum Disclosure & AI Slop"
Previous iterations suffered from prototype accumulation:
- Multiple conflicting headers and dashboards.
- Cyberpunk gradients, glowing borders, neon drop-shadows, dynamic notches, and floating 3D die animations that distracted from compiler truth.
- Simulated pseudo-telemetry claiming to be "live hardware".
- Marketing buzzwords ("Supercharge your AI", "Autonomous Copilot").

### B. The Solution: "Quiet, Precise Compiler Workspace"
- **Central Core Interaction**: Model Selection → Target MCU → Compile → Does it fit? → Direct Transformation (Before vs After) → Progressive Technical Inspection (Layers, Memory Arena, C/C++ Header, Audit) → Download Header.
- **Design Philosophy**: High density where data is technical (tables, memory addresses, byte counts, code), spacious where visual hierarchy matters.
- **Data Integrity**: Every displayed metric is derived from backend compiler data or deterministic IR models. Estimates are labeled as estimates; verified static allocations are labeled as verified.

---

## 3. Design Token Architecture (Light & Dark Themes)

To ensure consistency across themes without hardcoding hex values across components, the entire design system is driven by semantic CSS variables:

| Token | Light Mode (`:root`) | Dark Mode (`.dark`) | Usage |
| :--- | :--- | :--- | :--- |
| `--bg` | `#F7F7F5` (Warm off-white) | `#0B0B0B` (Near-black) | Canvas background |
| `--surface` | `#FFFFFF` | `#121212` | Container / Card surface |
| `--surface-raised` | `#F0F0EC` | `#1A1A1A` | Elevated items / active rows |
| `--surface-hover` | `#EAEAE5` | `#222222` | Hover states |
| `--border` | `#E0E0DC` | `#292929` | 1px dividers & container borders |
| `--border-strong` | `#C8C8C2` | `#3D3D3D` | Active / focused borders |
| `--text` | `#121212` | `#F3F3EF` | Primary headings & values |
| `--text-secondary` | `#5C5C58` | `#8A8A84` | Metadata labels & subheadings |
| `--text-muted` | `#8C8C87` | `#5C5C58` | Muted hints & subtle timestamps |
| `--accent` | `#106BA3` | `#2B95D6` | Actionable controls & links |
| `--accent-hover` | `#0E5A8A` | `#48AFF0` | Accent hover state |
| `--success` | `#0D8050` | `#0D8050` | Passed fit / 0 malloc verification |
| `--warning` | `#D9822B` | `#D9822B` | Memory constraints & advisories |
| `--danger` | `#C23030` | `#C23030` | SRAM/Flash overflow failures |

---

## 4. Component Inventory & Structure

```text
src/
├── components/
│   ├── ui/                       # Reusable design system primitives
│   │   ├── Badge.tsx             # Semantic status & memory chips
│   │   ├── Button.tsx            # Accessible primary/secondary/ghost buttons
│   │   └── Tabs.tsx              # Clean underline tab switcher
│   ├── AppHeader.tsx             # Quiet top navigation & target MCU selector
│   ├── ModelSelector.tsx         # Compact model cards & custom ONNX drop zone
│   ├── TransformationView.tsx    # Before vs After transformation comparison
│   ├── TechnicalInspector.tsx    # Layer table, SRAM Arena timeline, C++ code, Audit
│   └── CommandPalette.tsx        # Cmd+K / Ctrl+K keyboard shortcut launcher & theme toggle
├── services/
│   └── api.ts                    # Single source of truth API client with deterministic fallback
├── types/
│   └── index.ts                  # Clean TypeScript definitions
└── App.tsx                       # Master single-page workspace orchestrator
```

---

## 5. Visual Hierarchy & Progressive Disclosure
1. **Header**: Brand `SHANNON v2.4`, Target Hardware Dropdown, `0 MALLOC` verification badge, Theme Switcher (Light/Dark), `<kbd>⌘K</kbd>` Command Palette, GitHub repository link.
2. **Step 1: Model Selection**: Compact rows (Audio Keyword Spotter, MicroVision Person, Motor Vibration Autoencoder, Custom ONNX).
3. **Step 2: The Transformation (Before vs After)**:
   - Hardware fit status: `✓ Fits target MCU (512 KB SRAM, 8 MB Flash)`.
   - 3 Column transformation cards:
     - **Flash ROM (Weights)**: Baseline FP32 → INT8 Quantized (-75%).
     - **Peak SRAM (Arena)**: Baseline Naive → Static Arena (-76%).
     - **Runtime Heap**: `4 Dynamic mallocs` → `0 Bytes (Static Buffer Array)`.
   - Compute metrics: MACs, estimated latency, SIMD engine.
   - Primary Actions: `[Recompile]` and `[Download shannon_model.h]`.
4. **Step 3: Technical Inspector**:
   - Tab 1: **Layer Memory Layout** (Op, output tensor, MACs, Flash bytes, SRAM offset `0x20000000`, scale factor $S$).
   - Tab 2: **SRAM Arena Timeline** (Linear byte timeline `0x20000000` to `0x20000460`, buffer reuse schedule).
   - Tab 3: **Generated C/C++ Header** (Syntax-highlighted code block with line numbers, 1-click copy & download).
   - Tab 4: **Audit & Compliance** (MISRA-C:2012 Rule 21.3 check, zero buffer overlap collision proof).
   - Tab 5: **Compiler Explainer** (Contextual explanation of graph decisions).

---

## 6. Verification Checklist
- [x] Zero AI slop, no gradients, no glowing shadows, no neon drop-shadows.
- [x] Zero endashes in UI copy.
- [x] Full Light Mode and Dark Mode support with real CSS variable tokens.
- [x] Monospace strictly reserved for tabular numerals, memory addresses, and code.
- [x] All metrics traceable to actual compiler calculations.
- [x] Clean TypeScript build (`tsc && vite build`) with zero errors.
- [x] All compiler unit tests pass (`python test_compiler.py`).