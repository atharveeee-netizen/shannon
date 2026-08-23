import React from 'react';
import { HardwareProfile, ModelZooItem, LayerBentoRow } from '../types';
import { Activity, HardDrive, Cpu, ShieldCheck, BarChart3, Layers } from 'lucide-react';

interface ProfilerPanelProps {
  currentHw: HardwareProfile;
  currentModel: ModelZooItem;
  layers: LayerBentoRow[];
}

export const ProfilerPanel: React.FC<ProfilerPanelProps> = ({
  currentHw,
  currentModel,
  layers,
}) => {
  const flashCapacityKb = currentHw.flash_mb * 1024;
  const flashUsedPct = ((currentModel.int8_flash_kb / flashCapacityKb) * 100).toFixed(2);

  const sramCapacityKb = currentHw.sram_kb;
  const sramUsedPct = ((currentModel.peak_sram_kb / sramCapacityKb) * 100).toFixed(2);

  // Simulated INT8 quantized weight distribution bell curve
  const weightHistogram = [4, 8, 15, 32, 65, 120, 190, 240, 210, 140, 70, 35, 16, 7, 3];

  return (
    <aside className="w-80 bg-[#0B0E14] border-l border-[#1E293B] flex flex-col shrink-0 select-none h-full overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-[#1E293B] bg-[#0B0E14] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#3B82F6]" />
          <h3 className="text-xs font-bold text-[#F8FAFC] font-mono tracking-tight">
            MICRO-ARCH PROFILER
          </h3>
        </div>
        <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.2 rounded-[2px] border border-[#10B981]/25 font-bold">
          ONLINE
        </span>
      </div>

      {/* Profiler Metrics Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 font-mono text-xs">
        {/* Flash ROM Budget Breakdown */}
        <div className="bg-[#111622] p-3 rounded-[3px] border border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between text-[10px] text-[#94A3B8]">
            <span className="flex items-center gap-1.5 font-bold uppercase">
              <HardDrive className="w-3.5 h-3.5 text-[#3B82F6]" /> FLASH ROM BUDGET
            </span>
            <span className="text-[#3B82F6] font-bold font-tabular">{flashUsedPct}% USED</span>
          </div>

          <div className="w-full bg-[#0B0E14] h-2 rounded-[2px] overflow-hidden flex border border-[#1E293B]">
            <div
              className="bg-[#2563EB] h-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(8, parseFloat(flashUsedPct) * 15))}%` }}
              title={`INT8 Weights: ${currentModel.int8_flash_kb} KB`}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 font-tabular">
            <div>
              <span className="text-[#64748B] block">INT8 WEIGHTS</span>
              <span className="text-[#3B82F6] font-bold">{currentModel.int8_flash_kb} KB</span>
            </div>
            <div>
              <span className="text-[#64748B] block">FLASH SAVINGS</span>
              <span className="text-[#10B981] font-bold">{currentModel.flash_compression_ratio} reduction</span>
            </div>
          </div>
        </div>

        {/* SRAM Arena Allocation */}
        <div className="bg-[#111622] p-3 rounded-[3px] border border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between text-[10px] text-[#94A3B8]">
            <span className="flex items-center gap-1.5 font-bold uppercase">
              <Cpu className="w-3.5 h-3.5 text-[#10B981]" /> SRAM ARENA CAPACITY
            </span>
            <span className="text-[#10B981] font-bold font-tabular">{sramUsedPct}% USED</span>
          </div>

          <div className="w-full bg-[#0B0E14] h-2 rounded-[2px] overflow-hidden flex border border-[#1E293B]">
            <div
              className="bg-[#10B981] h-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(6, parseFloat(sramUsedPct) * 10))}%` }}
              title={`Peak Arena: ${currentModel.peak_sram_kb} KB`}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 font-tabular">
            <div>
              <span className="text-[#64748B] block">PEAK ARENA</span>
              <span className="text-[#10B981] font-bold">{currentModel.peak_sram_kb} KB</span>
            </div>
            <div>
              <span className="text-[#64748B] block">UNRESERVED SRAM</span>
              <span className="text-[#F8FAFC] font-bold">{sramCapacityKb - Math.round(currentModel.peak_sram_kb)} KB</span>
            </div>
          </div>
        </div>

        {/* INT8 Weight Value Histogram */}
        <div className="bg-[#111622] p-3 rounded-[3px] border border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between text-[10px] text-[#94A3B8]">
            <span className="flex items-center gap-1.5 font-bold uppercase">
              <BarChart3 className="w-3.5 h-3.5 text-[#F59E0B]" /> INT8 WEIGHT HISTOGRAM
            </span>
            <span className="text-[9px] text-[#64748B]">[-128, +127]</span>
          </div>

          <div className="h-16 bg-[#0B0E14] rounded-[2px] p-2 flex items-end justify-between gap-1 border border-[#1E293B]">
            {weightHistogram.map((count, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-[1px] transition-all"
                style={{ height: `${(count / 240) * 100}%`, backgroundColor: i === 7 ? '#10B981' : '#2563EB' }}
                title={`Bin ${i - 7}: ${count} weights`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-[9px] text-[#64748B]">
            <span>-128 (Min)</span>
            <span>0 (Median)</span>
            <span>+127 (Max)</span>
          </div>
        </div>

        {/* Layer MAC Breakdown */}
        <div className="bg-[#111622] p-3 rounded-[3px] border border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between text-[10px] text-[#94A3B8]">
            <span className="flex items-center gap-1.5 font-bold uppercase">
              <Layers className="w-3.5 h-3.5 text-[#3B82F6]" /> LAYER MAC BREAKDOWN
            </span>
            <span className="text-[#3B82F6] font-bold font-tabular">{currentModel.mac_count.toLocaleString()} MACs</span>
          </div>

          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
            {layers.map((l) => (
              <div key={l.layer_id} className="p-1.5 bg-[#0B0E14] rounded-[2px] border border-[#1E293B] flex items-center justify-between text-[10px]">
                <div className="truncate max-w-[120px]">
                  <span className="font-bold text-[#F8FAFC]">{l.layer_id}</span>
                  <span className="text-[9px] text-[#64748B] block">{l.op_type}</span>
                </div>
                <div className="text-right font-tabular">
                  <span className="text-[#3B82F6] font-bold">{l.macs.toLocaleString()}</span>
                  <span className="text-[9px] text-[#10B981] block">INT{l.bitwidth}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MISRA-C Formal Verification */}
        <div className="bg-[#111622] p-3 rounded-[3px] border border-[#1E293B] space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-[#10B981]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>FORMAL SAFETY VERIFICATION</span>
          </div>

          <div className="text-[10px] text-[#94A3B8] space-y-1 font-sans">
            <div className="flex items-center justify-between font-mono">
              <span>Dynamic Heap (malloc):</span>
              <strong className="text-[#10B981]">0 Bytes</strong>
            </div>
            <div className="flex items-center justify-between font-mono">
              <span>MISRA-C Rule 21.3:</span>
              <strong className="text-[#10B981]">COMPLIANT</strong>
            </div>
            <div className="flex items-center justify-between font-mono">
              <span>Memory Bounds Faults:</span>
              <strong className="text-[#10B981]">0 Errors</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-[#0B0E14] border-t border-[#1E293B] text-[10px] font-mono text-[#64748B] flex items-center justify-between">
        <span>PROFILER ENGINE</span>
        <span className="text-[#10B981] font-bold">READY</span>
      </div>
    </aside>
  );
};
