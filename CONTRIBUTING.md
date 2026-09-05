# Contributing to Shannon

Thank you for your interest in contributing to Shannon. We welcome contributions that expand microcontroller support, optimize SIMD micro-kernels, and enhance static compiler verification.

---

## Core Engineering Principles

All contributions must adhere to our fundamental architectural rules:

1. **Zero Dynamic Allocation (0 B Malloc):**  
   Under no circumstances will changes introducing `malloc()`, `calloc()`, `realloc()`, or `free()` to the emitted C headers be accepted. All memory must be statically planned.
2. **Deterministic Output:**  
   Compiling an identical graph must always produce identical byte offsets and emitted C code.
3. **Mathematical Verifiability:**  
   Quantization layers and memory planning algorithms must be backed by automated unit tests with numeric assertions (MSE, SQNR, collision freedom).

---

## Development Setup

### 1. Python Compiler Core
```bash
git clone https://github.com/atharveeee-netizen/shannon.git
cd shannon

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r compiler/requirements.txt
pip install pytest pytest-subtests

# Run test suite
python -m pytest compiler/ -v
```

### 2. Frontend EDA Workstation
```bash
cd frontend
npm install
npm run dev
```

---

## How to Add a New Microcontroller Target

1. Open `compiler/engine/ir.py` and locate the `HARDWARE_PROFILES` dictionary.
2. Add your hardware specification with on-chip SRAM capacity, Flash capacity, clock frequency, architecture, and SIMD instruction capabilities:
   ```python
   "my_mcu": {
       "name": "My MCU Name",
       "sram_kb": 512,
       "flash_mb": 2.0,
       "clock_mhz": 240,
       "arch": "ARM Cortex-M7",
       "simd": "ARM CMSIS-NN __SMLAD",
       "active_ma": 35.0,
       "sleep_ua": 12.0
   }
   ```
3. Update `frontend/src/compiler/benchmarks.ts` with matching parameters to reflect the target in the client-side EDA workstation.
4. Add a test case in `compiler/test_compiler.py` under `test_all_hardware_profiles_compatibility`.

---

## Pull Request Checklist

Before submitting a PR, verify:
- [ ] `python -m pytest compiler/ -v` passes 100% (all 15 unit and regression tests).
- [ ] Frontend builds without TypeScript errors (`cd frontend && npm run build`).
- [ ] Emitted C headers pass standard C99 syntax checks with zero warnings.
- [ ] Commit messages are concise and descriptive.
