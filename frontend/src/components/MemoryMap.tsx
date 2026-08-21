import React from 'react';
import { OptimizationResult } from '../types';
import { Layers, HardDrive, Zap, CheckCircle2 } from 'lucide-react';

interface Props {
  result: OptimizationResult;
}

export const MemoryMap: React.FC<Props> = ({ result }) => {
  const { baseline_fp32, optimized_int8, agent_report, memory_timeline } = result;

  const sramUsedKb = (optimized_int8.peak_sram_bytes / 1024).toFixed(1);
  const flashUsedKb = (optimized_int8.flash_bytes / 1024).toFixed(1);
  const fp32FlashKb = (baseline_fp32.flash_bytes / 1024).toFixed(1);

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
              -{Math.round((1 - optimized_int8.flash_bytes / baseline_fp32.flash_bytes) * 100)}% (was {fp32FlashKb}KB)
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(agent_report.flash_utilization_pct * 10, 2)}%` }}
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
              ({agent_report.sram_utilization_pct}% of MCU)
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(agent_report.sram_utilization_pct, 4)}%` }}
            />
          </div>
        </div>

        {/* Latency */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>Est. Latency / Frame</span>
            <Zap className="h-4 w-4 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white font-mono">{optimized_int8.estimated_latency_ms} ms</span>
            <span className="text-xs text-emerald-400 font-mono">~{Math.round(1000 / Math.max(optimized_int8.estimated_latency_ms, 0.1))} FPS</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">{optimized_int8.total_macs.toLocaleString()} MAC operations</p>
        </div>

        {/* Hardware Fit Verdict */}
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-mono mb-1">
            <span>Hardware Audit</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <span className="text-lg font-bold text-emerald-300 font-mono">
              {agent_report.agent_verdict === 'READY_FOR_DEPLOYMENT' ? 'PASSED (Zero Overflow)' : 'NEEDS PRUNING'}
            </span>
            <p className="text-[11px] text-emerald-400/80 font-mono mt-1">100% Static SRAM Arena</p>
          </div>
        </div>
      </div>

      {/* Layer Memory Timeline */}
      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono mb-3 flex items-center space-x-2">
          <span>Tensor Arena Buffer Lifecycle (Greedy Reuse)</span>
        </h4>
        <div className="space-y-2">
          {memory_timeline.map((layer) => (
            <div key={layer.layer_idx} className="flex items-center space-x-3 text-xs font-mono">
              <span className="w-24 text-slate-400 truncate">{layer.layer_id}</span>
              <span className="w-28 text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-center">
                {layer.op_type}
              </span>
              <div className="flex-1 bg-slate-800/80 h-3 rounded-full overflow-hidden flex items-center">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.max(10, (layer.active_sram_bytes / optimized_int8.peak_sram_bytes) * 100))}%`
                  }}
                />
              </div>
              <span className="w-16 text-right text-slate-300">{layer.active_sram_bytes} B</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};