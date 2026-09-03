import React from 'react';
import { Binary, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useCompiler } from '../../context/CompilerContext';
import { EmptyState } from '../ui/EmptyState';
import { Panel } from '../ui/Panel';
import { SpotlightCard } from '../react-bits/SpotlightCard';

export const QuantizationView: React.FC = () => {
  const { loadedModel, compilationResult, setActiveTab } = useCompiler();

  if (!loadedModel || !compilationResult) {
    return (
      <div className="p-6 w-full max-w-none">
        <EmptyState
          title="Quantization Matrix Not Available"
          description="Compile a model to execute the symmetric INT8 calibration and per-layer scale factor quantization passes."
          allowCompile={true}
        />
      </div>
    );
  }

  const layers = compilationResult.layers || [];
  const totalLayers = layers.length;
  const quantLayers = layers.filter((l) => l.flash_bytes > 0).length;
  const fp32Flash = compilationResult.baseline_fp32.flash_bytes;
  const int8Flash = compilationResult.optimized_int8.flash_bytes;

  return (
    <div className="p-6 space-y-6 w-full max-w-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-semibold">
            <Binary className="w-4 h-4" />
            <span>POST-TRAINING QUANTIZATION ENGINE</span>
          </div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            Symmetric INT8 Quantization: {compilationResult.model_name}
          </h1>
          <p className="text-xs text-text-secondary max-w-4xl">
            Per-channel weight scale calibration (S = max(|w|) / 127) with zero-point Z = 0 mapping float32 parameters to 8-bit integer multipliers.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('codegen')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-primary hover:bg-primary-hover text-white text-xs font-bold self-start transition-all cursor-pointer"
        >
          <span>View Emitted Code</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Overview Metrics via SpotlightCards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <SpotlightCard className="p-4 space-y-1">
          <span className="text-[11px] font-mono font-semibold text-text-muted uppercase tracking-wider">
            FP32 &rarr; INT8 Compression
          </span>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {compilationResult.optimized_int8.compression_ratio}x
          </div>
          <p className="text-xs text-text-secondary font-mono">
            {(fp32Flash / 1024).toFixed(1)} KB &rarr; {(int8Flash / 1024).toFixed(1)} KB
          </p>
        </SpotlightCard>

        <SpotlightCard className="p-4 space-y-1">
          <span className="text-[11px] font-mono font-semibold text-text-muted uppercase tracking-wider">
            Flash ROM Reduction
          </span>
          <div className="text-2xl font-bold text-primary font-mono">
            {compilationResult.optimized_int8.flash_reduction_pct}%
          </div>
          <p className="text-xs text-text-secondary font-mono">{(fp32Flash - int8Flash).toLocaleString()} Bytes Saved</p>
        </SpotlightCard>

        <SpotlightCard className="p-4 space-y-1">
          <span className="text-[11px] font-mono font-semibold text-text-muted uppercase tracking-wider">
            Quantized Layers
          </span>
          <div className="text-2xl font-bold text-text-primary font-mono">
            {quantLayers} / {totalLayers}
          </div>
          <p className="text-xs text-text-secondary font-mono">INT8 Calibrated Weight Tensors</p>
        </SpotlightCard>

        <SpotlightCard className="p-4 space-y-1">
          <span className="text-[11px] font-mono font-semibold text-text-muted uppercase tracking-wider">
            Zero-Point Offset
          </span>
          <div className="text-2xl font-bold text-cyan-400 font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5" />
            <span>Z = 0</span>
          </div>
          <p className="text-xs text-text-secondary font-mono">Exact Symmetric Dynamic Range</p>
        </SpotlightCard>
      </div>

      {/* Detailed Quantization Table */}
      <Panel title="Per-Layer Quantization Calibration Table" subtitle="Calibrated scale factors, dynamic range, and parameter reduction" noPadding={true}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-surface-raised/60 text-text-secondary text-xs">
                <th className="py-3 px-4 font-semibold">Layer ID</th>
                <th className="py-3 px-4 font-semibold">Operator</th>
                <th className="py-3 px-4 font-semibold">Precision</th>
                <th className="py-3 px-4 font-semibold">Weight Scale (S)</th>
                <th className="py-3 px-4 font-semibold">Zero Point (Z)</th>
                <th className="py-3 px-4 font-semibold">Range</th>
                <th className="py-3 px-4 font-semibold">INT8 Flash</th>
                <th className="py-3 px-4 font-semibold">FP32 Baseline</th>
                <th className="py-3 px-4 font-semibold">Savings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {layers.map((l) => {
                const fp32Bytes = l.flash_bytes * 4;
                const savingsPct = l.flash_bytes > 0 ? 75 : 0;

                return (
                  <tr key={l.layer_id} className="hover:bg-surface-raised/40 transition-colors">
                    <td className="py-3 px-4 text-text-primary font-bold">{l.layer_id}</td>
                    <td className="py-3 px-4 text-text-secondary">{l.op_type}</td>
                    <td className="py-3 px-4 text-primary font-semibold">INT{l.bitwidth}</td>
                    <td className="py-3 px-4 text-text-primary font-mono">{l.scale_factor.toFixed(6)}</td>
                    <td className="py-3 px-4 text-cyan-400">0</td>
                    <td className="py-3 px-4 text-text-muted">[-128, 127]</td>
                    <td className="py-3 px-4 text-text-primary font-bold">{l.flash_bytes} B</td>
                    <td className="py-3 px-4 text-text-muted">{fp32Bytes} B</td>
                    <td className="py-3 px-4 text-emerald-400 font-semibold">{savingsPct > 0 ? `-${savingsPct}%` : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};
