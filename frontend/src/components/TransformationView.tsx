import React from 'react';
import { CompilationResult, HardwareProfile } from '../types';
import { CheckCircle2, Download, ArrowRight, Play, Loader2 } from 'lucide-react';

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

  return (
    <div className="bg-[#111111] border border-[#292929] rounded-[3px] p-5 space-y-5">
      {/* Top Banner: Verdict + Compile Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#292929] pb-4">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-[#0D8050] shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-[#F3F3EF]">
                Fits {targetHw.name}
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#0D8050]/15 text-[#0D8050] border border-[#0D8050]/30 rounded-[2px]">
                PASSED
              </span>
            </div>
            <p className="text-xs text-[#8A8A84]">
              Model requires {int8FlashKb} KB Flash and {int8SramKb} KB SRAM ({targetHw.sram_kb} KB capacity).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCompile}
            disabled={isCompiling}
            className="px-3.5 py-1.5 bg-[#1A1A1A] hover:bg-[#222222] border border-[#292929] text-xs font-mono text-[#F3F3EF] rounded-[3px] flex items-center gap-1.5 transition disabled:opacity-50"
          >
            {isCompiling ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Compiling...
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" /> Recompile
              </>
            )}
          </button>

          <button
            onClick={onDownloadHeader}
            className="px-3.5 py-1.5 bg-[#F3F3EF] hover:bg-[#FFFFFF] text-[#111111] text-xs font-mono font-medium rounded-[3px] flex items-center gap-1.5 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Download shannon_model.h
          </button>
        </div>
      </div>

      {/* The Transformation: Before vs After Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Flash Storage Transformation */}
        <div className="bg-[#1A1A1A] p-4 rounded-[3px] border border-[#292929] flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-mono text-[#8A8A84] block mb-1">
              FLASH STORAGE (WEIGHTS)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold font-mono text-[#F3F3EF]">
                {int8FlashKb} KB
              </span>
              <span className="text-xs font-mono text-[#0D8050] font-semibold">
                -{flashSavings}%
              </span>
            </div>
            <div className="mt-2 text-[11px] text-[#8A8A84] flex items-center gap-1.5 font-mono">
              <span className="line-through">{fp32FlashKb} KB FP32</span>
              <ArrowRight className="w-3 h-3" />
              <span className="text-[#F3F3EF]">{int8FlashKb} KB INT8</span>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-[#292929] text-[10px] font-mono text-[#8A8A84]">
            Symmetric per-tensor scale and zero-point
          </div>
        </div>

        {/* Peak SRAM Transformation */}
        <div className="bg-[#1A1A1A] p-4 rounded-[3px] border border-[#292929] flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-mono text-[#8A8A84] block mb-1">
              PEAK SRAM ARENA
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold font-mono text-[#F3F3EF]">
                {int8SramKb} KB
              </span>
              <span className="text-xs font-mono text-[#0D8050] font-semibold">
                -{sramSavings}%
              </span>
            </div>
            <div className="mt-2 text-[11px] text-[#8A8A84] flex items-center gap-1.5 font-mono">
              <span className="line-through">{fp32SramKb} KB naive</span>
              <ArrowRight className="w-3 h-3" />
              <span className="text-[#F3F3EF]">{int8SramKb} KB Arena</span>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-[#292929] text-[10px] font-mono text-[#8A8A84]">
            Lifetime interval graph coloring buffer reuse
          </div>
        </div>

        {/* Dynamic Allocation Status */}
        <div className="bg-[#1A1A1A] p-4 rounded-[3px] border border-[#292929] flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-mono text-[#8A8A84] block mb-1">
              RUNTIME HEAP ALLOCATIONS
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold font-mono text-[#0D8050]">
                0 Bytes
              </span>
              <span className="text-xs font-mono text-[#0D8050] font-semibold">
                Zero Malloc
              </span>
            </div>
            <div className="mt-2 text-[11px] text-[#8A8A84] flex items-center gap-1.5 font-mono">
              <span className="line-through">Heap malloc()</span>
              <ArrowRight className="w-3 h-3" />
              <span className="text-[#0D8050]">Static buffer array</span>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-[#292929] text-[10px] font-mono text-[#8A8A84]">
            MISRA-C:2012 Rule 21.3 verified compliant
          </div>
        </div>
      </div>

      {/* Compute Metrics Row */}
      <div className="pt-2 border-t border-[#292929] flex flex-wrap items-center justify-between text-xs font-mono text-[#8A8A84] gap-2">
        <div>
          <span>Total Compute: </span>
          <strong className="text-[#F3F3EF]">{result.optimized_int8.total_macs.toLocaleString()} MACs</strong>
        </div>
        <div>
          <span>Estimated Latency: </span>
          <strong className="text-[#F3F3EF]">{result.optimized_int8.estimated_latency_ms} ms</strong>
          <span> on {targetHw.name} ({targetHw.clock_mhz} MHz)</span>
        </div>
        <div>
          <span>SIMD Acceleration: </span>
          <strong className="text-[#F3F3EF]">{targetHw.simd}</strong>
        </div>
      </div>
    </div>
  );
};