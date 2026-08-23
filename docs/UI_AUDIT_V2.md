# Shannon UI / UX Audit V2: Real Developer Software

## 1. Problem Statement & Second-Pass Diagnosis
While the previous iteration removed cyberpunk neon and duplicate components, it still retained the visual signatures of an AI-generated dashboard:
- Visual numbered steps ("1. SELECT NEURAL NETWORK MODEL", "2. COMPILATION RESULT", "3. TECHNICAL INSPECTOR").
- Gratuitous badges on everything (0 MALLOC in the top header, INT8 badges, version chips, keyboard shortcut chips).
- The 4-card grid model selector looking like a SaaS pricing card template.
- 3 floating metric cards for the optimization delta instead of a clean, dense tabular comparison.
- Random rainbow colors in the SRAM memory timeline.
- Monospace font applied to regular UI headings and labels instead of strictly for technical data.

---

## 2. Deconstruction & Removal List

| Element / Pattern | Previous State | V2 Replacement |
| :--- | :--- | :--- |
| **Header** | `SHANNON v2.4`, subtitle, `0 MALLOC` badge, `Target:` chip, `⌘K` chip. | Quiet 48px header: `SHANNON`, Search/Commands button, Theme toggle, GitHub link. |
| **Model Selection** | 4 large cards with domain tags, border rings, and file drop card. | Compact model selector: native-style select / row picker + standard file upload. |
| **Target Hardware** | Dropdown styled like a card tag inside header. | Inline form control alongside model selection in the main compiler controls. |
| **Primary Action** | "Recompile" inside a card header with glowing icons. | Single dominant `Compile` / `Recompile` control. |
| **Optimization Delta** | 3 separate rounded cards with arrows and percentages. | Compact comparison table: `Baseline`, `Compiled`, `Change`. |
| **Memory Timeline** | Rainbow blocks (`#106BA3`, `#0D8050`, `#2B95D6`, `#D9822B`). | Neutral monochrome memory layout with single accent & clear byte offsets (`0x20000000` to `0x20000460`). |
| **Audit & Proof** | "MISRA-C:2012 Rule 21.3 compliant" and "mathematically proved". | Factually accurate verification rows: "No runtime dynamic allocation detected (0 Bytes malloc)", "0 buffer overlaps detected", "4-byte word aligned". |
| **AI Layer** | Top-level "Compiler Explainer" tab. | Contextual "Why?" button next to peak SRAM and optimization table. |

---

## 3. Typography & Hierarchy Standard
- **UI / Labels / Body**: System sans-serif (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`).
- **Technical Numbers / Addresses / Code**: Monospace (`ui-monospace, "SF Mono", Menlo, Consolas, monospace`) with tabular numerals.
- **No uppercase monospace on section titles.** Use normal casing (`Model`, `Target`, `Result`, `Optimization`, `Memory`, `Code`, `Audit`).

---

## 4. Component Structure
```text
src/
├── components/
│   ├── AppHeader.tsx          # Minimal 48px header (Brand, Search, Theme, GitHub)
│   ├── CompilerControls.tsx   # Model picker, target selector, Compile button
│   ├── CompileResult.tsx      # PASS/FAIL banner + primary metrics
│   ├── OptimizationTable.tsx  # Dense comparison table (Baseline vs Compiled vs Change)
│   ├── TechnicalInspector.tsx # Tabs: Overview/Layers, Memory, Code, Audit + Contextual "Why?"
│   └── CommandPalette.tsx     # Native Cmd+K / Ctrl+K palette
├── services/
│   └── api.ts                 # Backend API client with deterministic fallback
├── types/
│   └── index.ts               # Clean TypeScript definitions
└── App.tsx                    # Main compiler workspace
```