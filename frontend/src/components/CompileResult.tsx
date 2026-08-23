import React from 'react';
import { CompilationResult, HardwareProfile } from '../types';

interface CompileResultProps {
  result: CompilationResult;
  targetHw: HardwareProfile;
}

export const CompileResult: React.FC<CompileResultProps> = ({
  result,
  targetHw,
}) => {
  const int8FlashKb = (result.optimized_int8.flash_bytes / 1024).toFixed(1);
  const int8SramKb = (result.optimized_int8.peak_sram_bytes / 1024).toFixed(1);
  const fitsHardware = result.fits_hardware;

  return (
    <div className="space-y-4">
      {/* Verdict & Message */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2.5">
          <span
            className={`text-xs font-mono font-bold px-2 py-0.5 rounded-[2px] ${
              fitsHardware
                ? 'bg-success/15 text-success border border-success/30'
                : 'bg-danger/15 text-danger border border-danger/30'
            }`}
          >
            {fitsHardware ? 'PASS' : 'FAIL'}
          </span>
          <span className="text-sm font-semibold text-text-primary">
            {fitsHardware
              ? `${result.model_name} fits ${targetHw.name}`
              : `${result.model_name} exceeds ${targetHw.name} memory budget`}
          </span>
        </div>

        <span className="text-xs text-text-secondary">
          Target: {targetHw.name} · {targetHw.sram_kb} KB SRAM · {targetHw.flash_mb} MB Flash
        </span>
      </div>

      {/* Primary Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
        <div>
          <span className="text-xs text-text-secondary block">Flash Storage</span>
          <span className="text-lg font-mono font-semibold text-text-primary mt-0.5 block">
            {int8FlashKb} KB
          </span>
          <span className="text-[11px] text-text-muted">Quantized INT8</span>
        </div>

        <div>
          <span className="text-xs text-text-secondary block">Peak SRAM</span>
          <span className="text-lg font-mono font-semibold text-text-primary mt-0.5 block">
            {int8SramKb} KB
          </span>
          <span className="text-[11px] text-text-muted">Static Tensor Arena</span>
        </div>

        <div>
          <span className="text-xs text-text-secondary block">Total Compute</span>
          <span className="text-lg font-mono font-semibold text-text-primary mt-0.5 block">
            {result.optimized_int8.total_macs.toLocaleString()}
          </span>
          <span className="text-[11px] text-text-muted">MAC operations</span>
        </div>

        <div>
          <span className="text-xs text-text-secondary block">Estimated Latency</span>
          <span className="text-lg font-mono font-semibold text-text-primary mt-0.5 block">
            {result.optimized_int8.estimated_latency_ms} ms
          </span>
          <span className="text-[11px] text-text-muted">@ {targetHw.clock_mhz} MHz ({targetHw.simd})</span>
        </div>
      </div>
    </div>
  );
};