import React from 'react';
import { Binary, ArrowRight } from 'lucide-react';
import { useCompiler } from '../../context/CompilerContext';
import { EmptyState } from '../ui/EmptyState';
import { Panel } from '../ui/Panel';

export const QuantizationView: React.FC = () => {
  const { loadedModel, compilationResult, setActiveTab } = useCompiler();

  if (!loadedModel || !compilationResult) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
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

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-accent">
            <Binary className="w-4 h-4" />
            <span>POST-TRAINING QUANTIZATION ENGINE</span>
          </div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            Symmetric INT8 Quantization: {compilationResult.model_name}
          </h1>
          <p className="text-xs text-text-secondary">
            Per-channel weight scale calibration (S = max(|w|) / 127) with zero-point Z = 0 mapping float32 parameters to 8-bit integer multipliers.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('codegen')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-accent hover:bg-accent-hover text-black text-xs font-bold self-start"
        >
          <span>View Emitted Code</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded bg-surface border border-border space-y-1">
          <span className="text-[11px] font-mono font-semibold text-text-muted uppercase tracking-wider">
            Quantized Parameters
          </span>
          <div className="text-2xl font-bold text-accent font-mono">
            {quantLayers} / {totalLayers} <span className="text-xs text-text-secondary font-normal font-sans">Layers</span>
          </div>
          <p className="text-xs text-text-secondary font-mono">Symmetric INT8 Bitwidth</p>
        </div>

        <div className="p-4 rounded bg-surface border border-border space-y-1">
          <span className="text-[11px] font-mono font-semibold text-text-muted uppercase tracking-wider">
            Flash ROM Reduction
          </span>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {compilationResult.optimized_int8.flash_reduction_pct}%
          </div>
          <p className="text-xs text-text-secondary font-mono">
            {compilationResult.optimized_int8.compression_ratio}x Parameter Compression
          </p>
        </div>

        <div className="p-4 rounded bg-surface border border-border space-y-1">
          <span className="text-[11px] font-mono font-semibold text-text-muted uppercase tracking-wider">
            Arithmetic Zero-Point
          </span>
          <div className="text-2xl font-bold text-cyan-400 font-mono">Z = 0 (Exact Symmetric)</div>
          <p className="text-xs text-text-secondary font-mono">Zero Accumulator Offsets</p>
        </div>
      </div>

      {/* Detailed Quantization Table */}
      <Panel title="Per-Layer Quantization Calibration Table" subtitle="Calibrated scale factors and parameter sizes" noPadding={true}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-surface-raised/40 text-text-secondary text-xs">
                <th className="py-3 px-4 font-semibold">Layer ID</th>
                <th className="py-3 px-4 font-semibold">Operator</th>
                <th className="py-3 px-4 font-semibold">Precision</th>
                <th className="py-3 px-4 font-semibold">Weight Scale (S)</th>
                <th className="py-3 px-4 font-semibold">Zero Point (Z)</th>
                <th className="py-3 px-4 font-semibold">INT8 Flash</th>
                <th className="py-3 px-4 font-semibold">FP32 Baseline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {layers.map((l) => (
                <tr key={l.layer_id} className="hover:bg-surface-raised/60 transition-colors">
                  <td className="py-3 px-4 text-text-primary font-bold">{l.layer_id}</td>
                  <td className="py-3 px-4 text-text-secondary">{l.op_type}</td>
                  <td className="py-3 px-4 text-accent font-semibold">INT{l.bitwidth}</td>
                  <td className="py-3 px-4 text-text-primary font-mono">{l.scale_factor.toFixed(6)}</td>
                  <td className="py-3 px-4 text-cyan-400">0</td>
                  <td className="py-3 px-4 text-text-primary">{l.flash_bytes} B</td>
                  <td className="py-3 px-4 text-text-muted">{l.flash_bytes * 4} B</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};
