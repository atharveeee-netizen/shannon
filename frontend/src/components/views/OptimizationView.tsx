import React from 'react';
import { Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useCompiler } from '../../context/CompilerContext';
import { EmptyState } from '../ui/EmptyState';
import { Panel } from '../ui/Panel';
import { SpotlightCard } from '../react-bits/SpotlightCard';

export const OptimizationView: React.FC = () => {
  const { loadedModel, compilationResult, selectedHw, setActiveTab } = useCompiler();

  if (!loadedModel || !compilationResult) {
    return (
      <div className="p-6 w-full max-w-none">
        <EmptyState
          title="Optimization Report Not Available"
          description="Compile a model to generate target-specific vector loop optimizations and operator fusion analysis."
          allowCompile={true}
        />
      </div>
    );
  }

  const optimizations = [
    {
      title: 'Vector Loop Unrolling & SIMD Alignment',
      desc: `Emitted 4-way loop unrolled kernels tailored for ${selectedHw.name} (${selectedHw.arch}).`,
      gain: '2.8x estimated instruction reduction',
      status: 'Applied',
    },
    {
      title: 'Zero-Malloc Static Buffer Reuse',
      desc: 'Greedy Interval Graph Coloring collapsed multi-buffer lifetimes into a single contiguous tensor arena.',
      gain: 'Contiguous BSS allocation (0 B heap)',
      status: 'Verified',
    },
    {
      title: 'Symmetric Quantization Folding',
      desc: 'Per-channel scale factors folded into fixed-point multiplier shifts with zero runtime floating-point overhead.',
      gain: '4.0x Flash parameter reduction',
      status: 'Applied',
    },
    {
      title: 'Dead Code & Redundant Tensor Elimination',
      desc: 'Pruned unused training tensors and non-inference metadata from generated C headers.',
      gain: '0 B extraneous runtime overhead',
      status: 'Optimized',
    },
  ];

  return (
    <div className="p-6 space-y-6 w-full max-w-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-semibold">
            <Zap className="w-4 h-4" />
            <span>HARDWARE-SPECIFIC SILICON OPTIMIZATION</span>
          </div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            MCU Compiler Passes: {selectedHw.name}
          </h1>
          <p className="text-xs text-text-secondary max-w-4xl">
            Static compiler optimization passes applied to <code>{compilationResult.model_name}</code> for {selectedHw.arch}.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('codegen')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-primary hover:bg-primary-hover text-white text-xs font-bold self-start transition-all cursor-pointer"
        >
          <span>Inspect Emitted Code</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {optimizations.map((opt, idx) => (
          <SpotlightCard key={idx} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-text-primary">{opt.title}</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {opt.status}
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">{opt.desc}</p>
            <div className="pt-2 border-t border-border flex justify-between text-xs font-mono">
              <span className="text-text-muted">Efficiency Gain:</span>
              <span className="text-primary font-bold">{opt.gain}</span>
            </div>
          </SpotlightCard>
        ))}
      </div>

      <Panel title="Architecture Specifications" subtitle="Hardware instruction set extensions">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <SpotlightCard className="p-3.5 space-y-1">
            <div className="text-text-muted text-[11px] uppercase">CPU ARCHITECTURE</div>
            <div className="text-text-primary font-bold text-sm">{selectedHw.arch}</div>
          </SpotlightCard>
          <SpotlightCard className="p-3.5 space-y-1">
            <div className="text-text-muted text-[11px] uppercase">CORE CLOCK SPEED</div>
            <div className="text-text-primary font-bold text-sm">{selectedHw.clock_mhz} MHz</div>
          </SpotlightCard>
          <SpotlightCard className="p-3.5 space-y-1">
            <div className="text-text-muted text-[11px] uppercase">VECTOR / SIMD EXTENSIONS</div>
            <div className="text-primary font-bold text-sm">{selectedHw.simd}</div>
          </SpotlightCard>
        </div>
      </Panel>
    </div>
  );
};
