import React, { useState } from 'react';
import { CompilationResult } from '../types';

interface OptimizationTableProps {
  result: CompilationResult;
}

export const OptimizationTable: React.FC<OptimizationTableProps> = ({ result }) => {
  const [showExplanation, setShowExplanation] = useState(false);

  const fp32FlashKb = (result.baseline_fp32.flash_bytes / 1024).toFixed(1);
  const int8FlashKb = (result.optimized_int8.flash_bytes / 1024).toFixed(1);
  const flashDiffPct = (
    (1 - result.optimized_int8.flash_bytes / Math.max(result.baseline_fp32.flash_bytes, 1)) *
    100
  ).toFixed(0);

  const fp32SramKb = (result.baseline_fp32.peak_sram_bytes / 1024).toFixed(1);
  const int8SramKb = (result.optimized_int8.peak_sram_bytes / 1024).toFixed(1);
  const sramDiffPct = (
    (1 - result.optimized_int8.peak_sram_bytes / Math.max(result.baseline_fp32.peak_sram_bytes, 1)) *
    100
  ).toFixed(0);

  return (
    <div className="space-y-2 border-t border-border pt-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-text-primary">
          Optimization
        </h4>

        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="text-xs text-accent hover:underline focus:outline-none"
        >
          {showExplanation ? 'Hide explanation' : 'Why?'}
        </button>
      </div>

      {showExplanation && (
        <div className="p-3 bg-surface-raised border border-border rounded-[3px] text-xs text-text-secondary leading-relaxed space-y-1">
          <p>
            Shannon quantizes 32-bit floating point weights into symmetric 8-bit integers (4x compression ratio).
          </p>
          <p>
            For SRAM, Shannon runs greedy interval graph coloring on tensor lifetimes, scheduling intermediate activation buffers into a contiguous static tensor arena at base offset <code>0x20000000</code>. This reuses memory slots for non-overlapping operations, avoiding dynamic runtime heap allocation.
          </p>
        </div>
      )}

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-border text-text-secondary text-[11px]">
              <th className="py-2 font-medium">Metric</th>
              <th className="py-2 font-medium">Baseline (FP32)</th>
              <th className="py-2 font-medium">Compiled (Shannon)</th>
              <th className="py-2 font-medium text-right">Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr className="text-text-primary">
              <td className="py-2 text-text-secondary">Flash Storage</td>
              <td className="py-2">{fp32FlashKb} KB</td>
              <td className="py-2 font-semibold text-text-primary">{int8FlashKb} KB</td>
              <td className="py-2 text-right text-success font-semibold">-{flashDiffPct}%</td>
            </tr>
            <tr className="text-text-primary">
              <td className="py-2 text-text-secondary">Peak SRAM</td>
              <td className="py-2">{fp32SramKb} KB</td>
              <td className="py-2 font-semibold text-text-primary">{int8SramKb} KB</td>
              <td className="py-2 text-right text-success font-semibold">-{sramDiffPct}%</td>
            </tr>
            <tr className="text-text-primary">
              <td className="py-2 text-text-secondary">Runtime Allocations</td>
              <td className="py-2">Heap malloc()</td>
              <td className="py-2 font-semibold text-success">Static buffer arena</td>
              <td className="py-2 text-right text-success font-semibold">0 B</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};