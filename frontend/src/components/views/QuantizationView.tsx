import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useCompiler } from '../../context/CompilerContext';
import { EmptyState } from '../ui/EmptyState';
import { Panel } from '../ui/Panel';

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-normal text-text-primary tracking-tight">
            Quantization Matrix
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {compilationResult.model_name} &middot; Post-Training Symmetric INT8 Calibration
          </p>
        </div>

        <button
          onClick={() => setActiveTab('codegen')}
          className="flex items-center gap-2 px-4 py-2 rounded-[6px] bg-primary hover:bg-[#0043CE] text-white text-sm font-medium transition-colors cursor-pointer"
        >
          <span>View generated C</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* FP32 -> INT8 Before & After Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* FP32 Baseline */}
        <div className="p-4 rounded-[8px] bg-surface border border-border space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="text-sm font-semibold text-text-muted">FP32 Baseline (Floating-Point)</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-[4px] bg-surface-raised border border-border text-text-muted">
              32-Bit Float
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-1">
            <div>
              <div className="text-xs text-text-muted">Flash ROM</div>
              <div className="font-mono text-2xl font-medium text-text-primary mt-1">
                {(fp32Flash / 1024).toFixed(1)} <span className="text-xs text-text-secondary font-normal">KB</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-text-muted">SRAM buffer</div>
              <div className="font-mono text-2xl font-medium text-text-primary mt-1">
                {(compilationResult.baseline_fp32.peak_sram_bytes / 1024).toFixed(1)} <span className="text-xs text-text-secondary font-normal">KB</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-text-muted">MAC operations</div>
              <div className="font-mono text-2xl font-medium text-text-primary mt-1">
                {(compilationResult.baseline_fp32.total_macs / 1000).toFixed(0)} <span className="text-xs text-text-secondary font-normal">kMAC</span>
              </div>
            </div>
          </div>
        </div>

        {/* INT8 Optimized */}
        <div className="p-4 rounded-[8px] bg-surface border border-border space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="text-sm font-semibold text-primary">INT8 Quantized (Shannon Silicon)</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-[4px] bg-primary/10 border border-primary/30 text-primary font-medium">
              4x Compression
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-1">
            <div>
              <div className="text-xs text-text-muted">Flash ROM</div>
              <div className="font-mono text-2xl font-medium text-text-primary mt-1">
                {(int8Flash / 1024).toFixed(1)} <span className="text-xs text-text-secondary font-normal">KB</span>
              </div>
              <div className="text-xs text-success mt-0.5">-{compilationResult.optimized_int8.flash_reduction_pct}% ROM</div>
            </div>
            <div>
              <div className="text-xs text-text-muted">SRAM buffer</div>
              <div className="font-mono text-2xl font-medium text-text-primary mt-1">
                {(compilationResult.optimized_int8.peak_sram_bytes / 1024).toFixed(1)} <span className="text-xs text-text-secondary font-normal">KB</span>
              </div>
              <div className="text-xs text-success mt-0.5">Static arena</div>
            </div>
            <div>
              <div className="text-xs text-text-muted">Latency</div>
              <div className="font-mono text-2xl font-medium text-text-primary mt-1">
                {compilationResult.optimized_int8.estimated_latency_ms.toFixed(2)} <span className="text-xs text-text-secondary font-normal">ms</span>
              </div>
              <div className="text-xs text-text-secondary mt-0.5">Integer arithmetic</div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-[8px] bg-surface border border-border">
          <div className="text-xs text-text-muted">Compression ratio</div>
          <div className="font-mono text-3xl font-medium text-text-primary mt-1">
            {compilationResult.optimized_int8.compression_ratio}x
          </div>
          <div className="text-xs text-text-secondary mt-1">
            {(fp32Flash - int8Flash).toLocaleString()} Bytes saved
          </div>
        </div>

        <div className="p-4 rounded-[8px] bg-surface border border-border">
          <div className="text-xs text-text-muted">Flash ROM reduction</div>
          <div className="font-mono text-3xl font-medium text-text-primary mt-1">
            {compilationResult.optimized_int8.flash_reduction_pct}%
          </div>
          <div className="text-xs text-text-secondary mt-1">
            Parameters reduced from 32-bit to 8-bit
          </div>
        </div>

        <div className="p-4 rounded-[8px] bg-surface border border-border">
          <div className="text-xs text-text-muted">Quantized layer count</div>
          <div className="font-mono text-3xl font-medium text-text-primary mt-1">
            {quantLayers} / {totalLayers}
          </div>
          <div className="text-xs text-text-secondary mt-1">
            Calibrated weight and bias tensors
          </div>
        </div>

        <div className="p-4 rounded-[8px] bg-surface border border-border">
          <div className="text-xs text-text-muted">Zero-point offset</div>
          <div className="font-mono text-3xl font-medium text-text-primary mt-1 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span>Z = 0</span>
          </div>
          <div className="text-xs text-text-secondary mt-1">
            Exact symmetric dynamic range [-128, 127]
          </div>
        </div>
      </div>

      {/* Detailed Quantization Table */}
      <Panel title="Per-Layer Quantization Calibration Table" subtitle="Calibrated scale factors, dynamic range, and parameter reduction" noPadding={true}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-surface-raised text-text-secondary">
                <th className="py-2.5 px-4 font-medium">Layer ID</th>
                <th className="py-2.5 px-4 font-medium">Operator</th>
                <th className="py-2.5 px-4 font-medium">Precision</th>
                <th className="py-2.5 px-4 font-medium">Weight scale (S)</th>
                <th className="py-2.5 px-4 font-medium">Zero point (Z)</th>
                <th className="py-2.5 px-4 font-medium">Dynamic range</th>
                <th className="py-2.5 px-4 font-medium">INT8 Flash</th>
                <th className="py-2.5 px-4 font-medium">FP32 Baseline</th>
                <th className="py-2.5 px-4 font-medium">ROM Savings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {layers.map((l) => {
                const fp32Bytes = l.flash_bytes * 4;
                const savingsPct = l.flash_bytes > 0 ? 75 : 0;

                return (
                  <tr key={l.layer_id} className="hover:bg-surface-raised transition-colors">
                    <td className="py-2.5 px-4 text-text-primary font-medium">{l.layer_id}</td>
                    <td className="py-2.5 px-4 text-text-secondary">{l.op_type}</td>
                    <td className="py-2.5 px-4 text-text-primary font-medium">INT{l.bitwidth}</td>
                    <td className="py-2.5 px-4 text-text-primary">{l.scale_factor.toFixed(6)}</td>
                    <td className="py-2.5 px-4 text-text-secondary">0</td>
                    <td className="py-2.5 px-4 text-text-muted">[-128, 127]</td>
                    <td className="py-2.5 px-4 text-text-primary font-medium">{l.flash_bytes} B</td>
                    <td className="py-2.5 px-4 text-text-muted">{fp32Bytes} B</td>
                    <td className="py-2.5 px-4 text-success font-medium">{savingsPct > 0 ? `-${savingsPct}%` : '—'}</td>
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
