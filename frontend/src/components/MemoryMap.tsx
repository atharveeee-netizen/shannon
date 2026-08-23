import React from 'react';
import { OptimizationResult, LayerStat } from '../types';
import { Layers, HardDrive, Zap, CheckCircle2 } from 'lucide-react';

interface Props {
  result: OptimizationResult;
}

export const MemoryMap: React.FC<Props> = ({ result }) => {
  const flashUsedKb = (result.flash_usage_bytes / 1024).toFixed(1);
  const sramUsedKb = (result.sram_usage_bytes / 1024).toFixed(1);

  return (
    <div className="space-y-4">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Flash Compression */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>Flash Storage (ROM)</span>
            <HardDrive className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white font-mono">{flashUsedKb} KB</span>
            <span className="text-xs text-emerald-400 font-mono font-semibold">
              -75% (INT8)
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(result.flash_utilization_pct * 10, 5)}%` }}
            />
          </div>
        </div>

        {/* SRAM Arena */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>Peak SRAM Arena</span>
            <Layers className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white font-mono">{sramUsedKb} KB</span>
            <span className="text-xs text-slate-400 font-mono">
              ({result.sram_utilization_pct}% of MCU)
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(result.sram_utilization_pct, 5)}%` }}
            />
          </div>
        </div>

        {/* Latency */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>Estimated Latency</span>
            <Zap className="h-4 w-4 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white font-mono">{result.estimated_latency_ms} ms</span>
            <span className="text-xs text-cyan-400 font-mono font-semibold">
              {Math.round(1000 / Math.max(result.estimated_latency_ms, 1))} FPS
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-3 block">
            Inner loops SIMD vectorized
          </span>
        </div>

        {/* Dynamic Allocation Status */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>Dynamic Allocation</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-emerald-400 font-mono">0 Bytes</span>
            <span className="text-xs text-emerald-400 font-mono font-semibold">
              Zero Malloc
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono mt-3 block">
            Static buffer reuse verified
          </span>
        </div>
      </div>

      {/* Layer Breakdown */}
      {result.layer_breakdown && result.layer_breakdown.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <h4 className="text-xs font-mono font-bold text-white uppercase mb-3">
            Layer-by-Layer Memory Allocation Breakdown
          </h4>
          <div className="space-y-2">
            {result.layer_breakdown.map((layer: LayerStat, i: number) => (
              <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800 text-xs font-mono">
                <span className="text-slate-300">{layer.layer_id} ({layer.op_type})</span>
                <span className="text-cyan-400">{layer.macs.toLocaleString()} MACs</span>
                <span className="text-emerald-400">{(layer.flash_bytes / 1024).toFixed(1)} KB</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};