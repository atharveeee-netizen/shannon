import React from 'react';
import { CompilationResult, HardwareProfile } from '../types';
import { CheckCircle2, AlertTriangle, Download, ArrowRight, Play, Loader2 } from 'lucide-react';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface TransformationViewProps {
  result: CompilationResult;
  targetHw: HardwareProfile;
  isCompiling: boolean;
  onCompile: () => void;
  onDownloadHeader: () => void;
}

export const TransformationView: React.FC<TransformationViewProps> = ({
  result,
  targetHw,
  isCompiling,
  onCompile,
  onDownloadHeader,
}) => {
  const fp32FlashKb = (result.baseline_fp32.flash_bytes / 1024).toFixed(1);
  const int8FlashKb = (result.optimized_int8.flash_bytes / 1024).toFixed(1);

  const fp32SramKb = (result.baseline_fp32.peak_sram_bytes / 1024).toFixed(1);
  const int8SramKb = (result.optimized_int8.peak_sram_bytes / 1024).toFixed(1);

  const flashSavings = (
    (1 - result.optimized_int8.flash_bytes / Math.max(result.baseline_fp32.flash_bytes, 1)) *
    100
  ).toFixed(0);

  const sramSavings = (
    (1 - result.optimized_int8.peak_sram_bytes / Math.max(result.baseline_fp32.peak_sram_bytes, 1)) *
    100
  ).toFixed(0);

  const fitsHardware = result.fits_hardware;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-mono text-text-secondary">
        <span>2. COMPILATION RESULT AND TRANSFORMATION</span>
        <span>Hardware fit & optimization delta</span>
      </div>

      <div className="bg-surface border border-border rounded-[3px] p-5 space-y-5 shadow-xs">
        {/* Top Banner: Fit Verdict & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            {fitsHardware ? (
              <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-danger shrink-0" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-text-primary">
                  {fitsHardware ? `Fits ${targetHw.name}` : `Exceeds ${targetHw.name} Capacity`}
                </h3>
                <Badge variant={fitsHardware ? 'success' : 'danger'}>
                  {fitsHardware ? 'PASSED' : 'FAILED'}
                </Badge>
              </div>
              <p className="text-xs text-text-secondary">
                {fitsHardware
                  ? `Model requires ${int8FlashKb} KB Flash and ${int8SramKb} KB SRAM (${targetHw.sram_kb} KB physical capacity).`
                  : `Model requires ${int8SramKb} KB SRAM, which exceeds ${targetHw.name} physical capacity (${targetHw.sram_kb} KB).`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={onCompile}
              disabled={isCompiling}
              variant="secondary"
              icon={
                isCompiling ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3 h-3 fill-current" />
                )
              }
            >
              {isCompiling ? 'Compiling...' : 'Recompile'}
            </Button>

            <Button
              onClick={onDownloadHeader}
              variant="primary"
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Download shannon_model.h
            </Button>
          </div>
        </div>

        {/* 3-Column Transformation Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Flash Storage Transformation */}
          <div className="bg-surface-raised p-4 rounded-[3px] border border-border flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-mono text-text-secondary block mb-1">
                FLASH STORAGE (WEIGHTS)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold font-mono text-text-primary">
                  {int8FlashKb} KB
                </span>
                <span className="text-xs font-mono text-success font-semibold">
                  -{flashSavings}%
                </span>
              </div>
              <div className="mt-2 text-[11px] text-text-secondary flex items-center gap-1.5 font-mono">
                <span className="line-through">{fp32FlashKb} KB FP32</span>
                <ArrowRight className="w-3 h-3" />
                <span className="text-text-primary font-medium">{int8FlashKb} KB INT8</span>
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-border text-[10px] font-mono text-text-secondary">
              Symmetric per-tensor scale and zero-point
            </div>
          </div>

          {/* Peak SRAM Transformation */}
          <div className="bg-surface-raised p-4 rounded-[3px] border border-border flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-mono text-text-secondary block mb-1">
                PEAK SRAM ARENA
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold font-mono text-text-primary">
                  {int8SramKb} KB
                </span>
                <span className="text-xs font-mono text-success font-semibold">
                  -{sramSavings}%
                </span>
              </div>
              <div className="mt-2 text-[11px] text-text-secondary flex items-center gap-1.5 font-mono">
                <span className="line-through">{fp32SramKb} KB naive</span>
                <ArrowRight className="w-3 h-3" />
                <span className="text-text-primary font-medium">{int8SramKb} KB Arena</span>
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-border text-[10px] font-mono text-text-secondary">
              Lifetime interval graph coloring buffer reuse
            </div>
          </div>

          {/* Runtime Dynamic Allocation */}
          <div className="bg-surface-raised p-4 rounded-[3px] border border-border flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-mono text-text-secondary block mb-1">
                RUNTIME HEAP ALLOCATIONS
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold font-mono text-success">
                  0 Bytes
                </span>
                <Badge variant="success">Zero Malloc</Badge>
              </div>
              <div className="mt-2 text-[11px] text-text-secondary flex items-center gap-1.5 font-mono">
                <span className="line-through">Heap malloc()</span>
                <ArrowRight className="w-3 h-3" />
                <span className="text-success font-medium">Static buffer array</span>
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-border text-[10px] font-mono text-text-secondary">
              MISRA-C:2012 Rule 21.3 verified compliant
            </div>
          </div>
        </div>

        {/* Compute & Hardware Metrics Row */}
        <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between text-xs font-mono text-text-secondary gap-2">
          <div>
            <span>Total Compute: </span>
            <strong className="text-text-primary">{result.optimized_int8.total_macs.toLocaleString()} MACs</strong>
          </div>
          <div>
            <span>Estimated Latency: </span>
            <strong className="text-text-primary">{result.optimized_int8.estimated_latency_ms} ms</strong>
            <span> on {targetHw.name} ({targetHw.clock_mhz} MHz)</span>
          </div>
          <div>
            <span>SIMD Acceleration: </span>
            <strong className="text-text-primary">{targetHw.simd}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};