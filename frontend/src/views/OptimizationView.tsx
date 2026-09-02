import React, { useState } from 'react';
import { CompilationResult, HardwareProfile } from '../types';
import { Cpu, Sparkles, Check } from 'lucide-react';

interface OptimizationViewProps {
  compilationResult: CompilationResult | null;
  targetHw: HardwareProfile;
}

export const OptimizationView: React.FC<OptimizationViewProps> = ({
  compilationResult,
  targetHw,
}) => {
  const [objective, setObjective] = useState<'latency' | 'sram' | 'flash' | 'balanced'>('balanced');
  const [kernelType, setKernelType] = useState<'target' | 'dsp' | 'generic'>('target');
  const [appliedRecs, setAppliedRecs] = useState<number[]>([0, 1]);

  const fp32Flash = compilationResult?.baseline_fp32.flash_bytes || 96256;
  const int8Flash = compilationResult?.optimized_int8.flash_bytes || 24576;
  const fp32Sram = compilationResult?.baseline_fp32.peak_sram_bytes || 4512;
  const int8Sram = compilationResult?.optimized_int8.peak_sram_bytes || 1148;
  const fp32Lat = compilationResult?.baseline_fp32.estimated_latency_ms || 4.2;
  const int8Lat = compilationResult?.optimized_int8.estimated_latency_ms || 1.1;

  const recommendations = [
    {
      id: 0,
      title: 'Vectorized SIMD Loop Unrolling',
      category: 'KERNEL',
      description: `Targeting ${targetHw.name} with ${targetHw.simd}. Emits unrolled 4-way MAC inner loop with register caching.`,
      impact: '−65% Latency',
    },
    {
      id: 1,
      title: 'Interval Graph Activation Slot Reuse',
      category: 'MEMORY',
      description: 'Intermediate activation buffers T1 and T3 have non-overlapping lifespans. Recycled physical offset 0x20000000.',
      impact: '−74% Peak SRAM',
    },
    {
      id: 2,
      title: 'Symmetric Fixed-Point Quantization',
      category: 'FLASH',
      description: 'Quantized 32-bit floats into signed 8-bit integers with zero point Z=0 for zero runtime dequantization cycles.',
      impact: '−75% Flash ROM',
    },
  ];

  const toggleApplyRec = (id: number) => {
    setAppliedRecs((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h2 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" />
            Hardware Optimization & SIMD Pipeline
          </h2>
          <p className="text-text-secondary text-xs mt-0.5">
            Deterministic graph-level transformations, operator fusion, and target-specific vector unrolling.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-text-secondary">
          <span>Objective: <strong className="text-primary uppercase">{objective}</strong></span>
          <span>·</span>
          <span>Target: <strong className="text-text-primary">{targetHw.name}</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Tuning Controls */}
        <div className="lg:col-span-4 bg-surface border border-border rounded p-4 space-y-4 font-mono">
          <span className="font-bold text-text-primary uppercase tracking-wider block font-sans border-b border-border pb-2">
            Optimization Directives
          </span>

          <div className="space-y-1.5">
            <label className="text-[11px] text-text-secondary block font-medium">Optimization Goal</label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'balanced', label: 'Balanced' },
                { id: 'latency', label: 'Min Latency' },
                { id: 'sram', label: 'Min SRAM' },
                { id: 'flash', label: 'Min Flash' },
              ].map((obj) => (
                <button
                  key={obj.id}
                  onClick={() => setObjective(obj.id as any)}
                  className={`py-1.5 px-2 rounded text-xs transition border text-center font-bold ${
                    objective === obj.id
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-surface-raised border-border text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {obj.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-text-secondary block font-medium">Kernel Implementation</label>
            <select
              value={kernelType}
              onChange={(e) => setKernelType(e.target.value as any)}
              className="w-full bg-surface-raised border border-border rounded px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="target">Target SIMD Hardware Vectorized ({targetHw.simd})</option>
              <option value="dsp">Standard CMSIS-DSP Integer Math</option>
              <option value="generic">Generic Portable C99 (Scalar)</option>
            </select>
          </div>

          <div className="p-3 bg-surface-raised border border-border rounded space-y-1.5 text-[11px]">
            <span className="font-bold text-text-primary block font-sans">Active Vector Registers</span>
            <div className="text-text-secondary space-y-1">
              <div>SIMD: <strong className="text-primary">{targetHw.simd}</strong></div>
              <div>Clock Speed: <strong className="text-text-primary">{targetHw.clock_mhz} MHz</strong></div>
              <div>Bus Width: <strong className="text-text-primary">32-Bit Word (0x20000000)</strong></div>
            </div>
          </div>
        </div>

        {/* Right: Before / After Telemetry & Compiler Recommendations */}
        <div className="lg:col-span-8 space-y-4">
          {/* Before vs After Telemetry Grid */}
          <div className="bg-surface border border-border rounded p-4 space-y-3 font-mono">
            <span className="font-bold text-xs text-text-primary uppercase tracking-wider block font-sans border-b border-border pb-2">
              Optimization Telemetry Comparison
            </span>

            <div className="grid grid-cols-3 gap-3 text-center">
              {/* Flash */}
              <div className="p-3 bg-surface-raised border border-border rounded space-y-1">
                <span className="text-[10px] text-text-muted uppercase block">Flash ROM (Storage)</span>
                <div className="text-xs text-text-secondary line-through">{(fp32Flash / 1024).toFixed(1)} KB</div>
                <div className="text-base font-bold text-text-primary">{(int8Flash / 1024).toFixed(1)} KB</div>
                <span className="text-[10px] font-bold text-success block">−75.0% ROM Delta</span>
              </div>

              {/* SRAM */}
              <div className="p-3 bg-surface-raised border border-border rounded space-y-1">
                <span className="text-[10px] text-text-muted uppercase block">Peak SRAM (Arena)</span>
                <div className="text-xs text-text-secondary line-through">{(fp32Sram / 1024).toFixed(1)} KB</div>
                <div className="text-base font-bold text-primary">{(int8Sram / 1024).toFixed(2)} KB</div>
                <span className="text-[10px] font-bold text-success block">−74.5% SRAM Delta</span>
              </div>

              {/* Latency */}
              <div className="p-3 bg-surface-raised border border-border rounded space-y-1">
                <span className="text-[10px] text-text-muted uppercase block">Inference Latency</span>
                <div className="text-xs text-text-secondary line-through">{fp32Lat} ms</div>
                <div className="text-base font-bold text-text-primary">{int8Lat} ms</div>
                <span className="text-[10px] font-bold text-success block">−65.2% Faster</span>
              </div>
            </div>
          </div>

          {/* Compiler Recommendations Assistant Panel */}
          <div className="bg-surface border border-border rounded p-4 space-y-3 font-mono">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="font-bold text-xs text-text-primary uppercase tracking-wider font-sans flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Compiler Optimization Recommendations
              </span>
              <span className="text-[10px] text-text-muted">Agent Telemetry Analysis</span>
            </div>

            <div className="space-y-2">
              {recommendations.map((rec) => {
                const isApplied = appliedRecs.includes(rec.id);
                return (
                  <div
                    key={rec.id}
                    className={`p-3 rounded border transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                      isApplied ? 'bg-primary/5 border-primary/30' : 'bg-surface-raised border-border'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text-primary">{rec.title}</span>
                        <span className="text-[9px] font-mono text-primary bg-primary/10 px-1.5 py-0.2 rounded font-semibold">
                          {rec.category}
                        </span>
                        <span className="text-[10px] text-success font-bold">{rec.impact}</span>
                      </div>
                      <p className="text-[11px] text-text-secondary font-sans leading-relaxed">
                        {rec.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => toggleApplyRec(rec.id)}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1 ${
                          isApplied
                            ? 'bg-success text-white'
                            : 'bg-surface border border-border text-text-primary hover:border-primary'
                        }`}
                      >
                        {isApplied ? <Check className="w-3 h-3" /> : null}
                        <span>{isApplied ? 'APPLIED' : 'APPLY'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
