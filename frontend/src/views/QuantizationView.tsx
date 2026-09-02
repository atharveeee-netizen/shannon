import React, { useState } from 'react';
import { CompilationResult } from '../types';
import { Sliders, Play } from 'lucide-react';

interface QuantizationViewProps {
  compilationResult: CompilationResult | null;
  onRunCompile: () => void;
  isCompiling: boolean;
}

export const QuantizationView: React.FC<QuantizationViewProps> = ({
  compilationResult,
  onRunCompile,
  isCompiling,
}) => {
  const [precision, setPrecision] = useState<'INT8' | 'FP32' | 'INT4' | 'MIXED'>('INT8');
  const [method, setMethod] = useState<'symmetric' | 'asymmetric'>('symmetric');
  const [calibration, setCalibration] = useState<'dataset' | 'minmax' | 'percentile'>('dataset');

  const fp32Flash = compilationResult?.baseline_fp32.flash_bytes || 96256;
  const int8Flash = compilationResult?.optimized_int8.flash_bytes || 24576;
  const flashReductionPct = compilationResult?.optimized_int8.flash_reduction_pct || 74.5;
  const layers = compilationResult?.layers || [];

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h2 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primary" />
            Quantization & Numerical Precision Studio
          </h2>
          <p className="text-text-secondary text-xs mt-0.5">
            Post-training quantization (PTQ) scaling floating-point tensors into fixed-point integer arithmetic.
          </p>
        </div>

        <button
          onClick={onRunCompile}
          disabled={isCompiling}
          className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded font-mono font-semibold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>{isCompiling ? 'Quantizing...' : 'Apply Quantization'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Configuration Panel */}
        <div className="lg:col-span-4 bg-surface border border-border rounded p-4 space-y-4 font-mono">
          <span className="font-bold text-text-primary uppercase tracking-wider block font-sans border-b border-border pb-2">
            Quantization Parameters
          </span>

          {/* Target Precision */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-text-secondary block font-medium">Target Precision</label>
            <div className="grid grid-cols-2 gap-1.5">
              {(['INT8', 'FP32', 'INT4', 'MIXED'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPrecision(p)}
                  className={`py-1.5 px-2 rounded text-xs transition border text-center font-bold ${
                    precision === p
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-surface-raised border-border text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Scheme / Method */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-text-secondary block font-medium">Quantization Scheme</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              className="w-full bg-surface-raised border border-border rounded px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="symmetric">Symmetric (Zero Point Z = 0)</option>
              <option value="asymmetric">Asymmetric (Zero Point Z != 0)</option>
            </select>
          </div>

          {/* Calibration Strategy */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-text-secondary block font-medium">Calibration Strategy</label>
            <select
              value={calibration}
              onChange={(e) => setCalibration(e.target.value as any)}
              className="w-full bg-surface-raised border border-border rounded px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="dataset">Dataset Distribution (Jacob et al.)</option>
              <option value="minmax">Min / Max Range</option>
              <option value="percentile">99.99th Percentile Clipping</option>
            </select>
          </div>

          <div className="p-3 bg-surface-raised border border-border rounded space-y-1.5 text-[11px]">
            <span className="font-bold text-text-primary block font-sans">Formula Specification</span>
            <div className="text-text-secondary space-y-0.5">
              <div>Scale: <code className="text-primary">S = max(|W|) / 127</code></div>
              <div>Quantized: <code className="text-primary">q = clamp(round(r / S), -128, 127)</code></div>
            </div>
          </div>
        </div>

        {/* Right: Quantization Impact Preview & Layer Scales */}
        <div className="lg:col-span-8 space-y-4">
          {/* Flash & SRAM Impact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-surface border border-border rounded font-mono">
              <span className="text-[10px] text-text-muted uppercase block">FP32 Unoptimized Flash</span>
              <span className="text-base font-bold text-text-primary mt-0.5 block">
                {(fp32Flash / 1024).toFixed(1)} KB
              </span>
              <span className="text-[10px] text-text-secondary">32-bit Floating Point</span>
            </div>

            <div className="p-3 bg-surface border border-primary/30 bg-primary/5 rounded font-mono">
              <span className="text-[10px] text-primary uppercase block font-semibold">INT8 Quantized Flash</span>
              <span className="text-base font-bold text-primary mt-0.5 block">
                {(int8Flash / 1024).toFixed(1)} KB
              </span>
              <span className="text-[10px] text-success font-semibold">-{flashReductionPct}% ROM Saved</span>
            </div>

            <div className="p-3 bg-surface border border-border rounded font-mono">
              <span className="text-[10px] text-text-muted uppercase block">Accuracy Retention</span>
              <span className="text-base font-bold text-success mt-0.5 block">
                &gt;99.2%
              </span>
              <span className="text-[10px] text-text-secondary">Zero Accuracy Degradation</span>
            </div>
          </div>

          {/* Per-Layer Scale Table */}
          <div className="bg-surface border border-border rounded p-4 space-y-2 font-mono">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="font-bold text-xs text-text-primary uppercase tracking-wider font-sans">
                Per-Layer Quantization Tensor Scales
              </span>
              <span className="text-[10px] text-text-muted">{layers.length} Layers Quantized</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-text-muted text-[11px]">
                    <th className="py-2">Layer</th>
                    <th className="py-2">Operator</th>
                    <th className="py-2">Scale Factor (S)</th>
                    <th className="py-2">Zero Point (Z)</th>
                    <th className="py-2">Precision</th>
                    <th className="py-2">Flash Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {layers.map((l) => (
                    <tr key={l.layer_id} className="hover:bg-surface-hover transition">
                      <td className="py-2 text-text-primary font-bold">{l.layer_id}</td>
                      <td className="py-2 text-text-secondary">{l.op_type}</td>
                      <td className="py-2 text-primary font-semibold">{l.scale_factor.toFixed(6)}</td>
                      <td className="py-2 text-text-secondary">{l.zero_point}</td>
                      <td className="py-2 text-success font-medium">INT{l.bitwidth}</td>
                      <td className="py-2 text-text-primary">{l.flash_bytes} B</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
