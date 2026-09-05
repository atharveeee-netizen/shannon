# Security and Memory Safety Policy

## Memory Safety Philosophy: 0 Bytes Dynamic Allocation

Shannon is designed specifically for safety-critical edge systems, aerospace telematics, industrial robotics, and medical sensing. The primary security vulnerability in embedded C firmware stems from buffer overflows, heap fragmentation, and non-deterministic memory allocation.

Shannon addresses this at compile time:

1. **MISRA-C:2012 Rule 21.3 Compliance:**  
   The emitted C headers strictly prohibit runtime heap allocation. Functions such as `malloc()`, `calloc()`, `realloc()`, and `free()` do not exist in the generated firmware code.
2. **Static BSS Tensor Allocation:**  
   Activation buffers and weights are placed exclusively in Flash ROM (`.rodata`) and the statically allocated BSS segment (`.bss`).
3. **Deterministic Collision Freedom:**  
   The greedy interval graph coloring memory planner mathematically guarantees that non-overlapping tensor lifetimes occupy verified, collision-free memory offsets.
4. **4-Byte Word Alignment:**  
   All emitted memory arrays are explicitly tagged with `__attribute__((aligned(4)))` to prevent unaligned memory access hard faults on 32-bit ARM Cortex-M and Xtensa architectures.

---

## Supported Versions

Security and compiler patches are actively maintained for the following branches:

| Version | Supported | Status |
| :--- | :--- | :--- |
| 1.0.x | Yes | Active Stable Release |
| main | Yes | Development Branch |

---

## Reporting a Vulnerability

If you discover a security vulnerability or a mathematical edge-case collision in the memory planner:

1. **Do not create a public GitHub issue.**
2. Send a detailed report to the repository maintainer via GitHub Security Advisories or by email.
3. Include:
   - The `.onnx` model topology or test case JSON.
   - The compiler configuration (precision, target MCU).
   - Expected vs observed memory offsets.
4. The maintainer will respond within 48 hours with an assessment and remediation patch.
