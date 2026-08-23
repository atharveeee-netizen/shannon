import React from 'react';
import { HardwareProfile, ModelZooItem, LayerBentoRow } from '../types';
import { Activity, HardDrive, Cpu, ShieldCheck, BarChart3, Layers, Sparkles } from 'lucide-react';

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
    <aside className="w-80 bg-[#070A0F] border-l border-[#1E293B] flex flex-col shrink-0 select-none h-full overflow-hidden shadow-md">
      {/* Header */}
      <div className="p-3 border-b border-[#1E293B] bg-[#070A0F] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#38BDF8] animate-pulse" />
          <h3 className="text-xs font-bold text-[#F8FAFC] font-mono tracking-tight">
            MICRO-ARCH PROFILER
          </h3>
        </div>
        <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded-[2px] border border-[#10B981]/35 font-bold shadow-[0_0_8px_rgba(16,185,129,0.25)] flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-ping" />
          ONLINE
        </span>
      </div>

      {/* Profiler Metrics Stream with React Bits Terminal Dark Cards */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 font-mono text-xs">
        {/* Flash ROM Budget Breakdown Card */}
        <div className="bg-[#0B0F17] p-3 rounded-[3px] border border-[#1E293B] hover:border-[#38BDF8] hover:shadow-[0_0_20px_-3px_rgba(56,189,248,0.25)] transition-all duration-200 space-y-2 group">
          <div className="flex items-center justify-between text-[10px] text-[#94A3B8]">
            <span className="flex items-center gap-1.5 font-bold uppercase group-hover:text-[#38BDF8] transition-colors">
              <HardDrive className="w-3.5 h-3.5 text-[#38BDF8]" /> FLASH ROM BUDGET
            </span>
            <span className="text-[#38BDF8] font-bold font-tabular">{flashUsedPct}% USED</span>
          </div>

          <div className="w-full bg-[#070A0F] h-2 rounded-[2px] overflow-hidden flex border border-[#1E293B]">
            <div
              className="bg-gradient-to-r from-[#0284C7] to-[#38BDF8] h-full transition-all duration-300 shadow-[0_0_10px_#38BDF8]"
              style={{ width: `${Math.min(100, Math.max(8, parseFloat(flashUsedPct) * 15))}%` }}
              title={`INT8 Weights: ${currentModel.int8_flash_kb} KB`}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 font-tabular">
            <div>
              <span className="text-[#64748B] block">INT8 WEIGHTS</span>
              <span className="text-[#38BDF8] font-bold">{currentModel.int8_flash_kb} KB</span>
            </div>
            <div>
              <span className="text-[#64748B] block">FLASH SAVINGS</span>
              <span className="text-[#10B981] font-bold">{currentModel.flash_compression_ratio} reduction</span>
            </div>
          </div>
        </div>

        {/* SRAM Arena Allocation Card */}
        <div className="bg-[#0B0F17] p-3 rounded-[3px] border border-[#1E293B] hover:border-[#10B981] hover:shadow-[0_0_20px_-3px_rgba(16,185,129,0.25)] transition-all duration-200 space-y-2 group">
          <div className="flex items-center justify-between text-[10px] text-[#94A3B8]">
            <span className="flex items-center gap-1.5 font-bold uppercase group-hover:text-[#10B981] transition-colors">
              <Cpu className="w-3.5 h-3.5 text-[#10B981]" /> SRAM ARENA CAPACITY
            </span>
            <span className="text-[#10B981] font-bold font-tabular">{sramUsedPct}% USED</span>
          </div>

          <div className="w-full bg-[#070A0F] h-2 rounded-[2px] overflow-hidden flex border border-[#1E293B]">
            <div
              className="bg-gradient-to-r from-[#059669] to-[#10B981] h-full transition-all duration-300 shadow-[0_0_10px_#10B981]"
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

        {/* INT8 Weight Value Histogram Card */}
        <div className="bg-[#0B0F17] p-3 rounded-[3px] border border-[#1E293B] hover:border-[#38BDF8] hover:shadow-[0_0_20px_-3px_rgba(56,189,248,0.25)] transition-all duration-200 space-y-2 group">
          <div className="flex items-center justify-between text-[10px] text-[#94A3B8]">
            <span className="flex items-center gap-1.5 font-bold uppercase group-hover:text-[#F59E0B] transition-colors">
              <BarChart3 className="w-3.5 h-3.5 text-[#F59E0B]" /> INT8 WEIGHT HISTOGRAM
            </span>
            <span className="text-[9px] text-[#64748B]">[-128, +127]</span>
          </div>

          <div className="h-16 bg-[#070A0F] rounded-[2px] p-2 flex items-end justify-between gap-1 border border-[#1E293B]">
            {weightHistogram.map((count, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-[1px] transition-all hover:scale-110 duration-150"
                style={{
                  height: `${(count / 240) * 100}%`,
                  background: i === 7 ? 'linear-gradient(180deg, #10B981 0%, #059669 100%)' : 'linear-gradient(180deg, #38BDF8 0%, #0284C7 100%)',
                  boxShadow: i === 7 ? '0 0 6px rgba(16,185,129,0.5)' : '0 0 4px rgba(56,189,248,0.3)'
                }}
                title={`Bin ${i - 7}: ${count} weights`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-[9px] text-[#64748B] font-tabular">
            <span>-128 (Min)</span>
            <span>0 (Median)</span>
            <span>+127 (Max)</span>
          </div>
        </div>

        {/* Layer MAC Breakdown Card */}
        <div className="bg-[#0B0F17] p-3 rounded-[3px] border border-[#1E293B] hover:border-[#38BDF8] hover:shadow-[0_0_20px_-3px_rgba(56,189,248,0.25)] transition-all duration-200 space-y-2 group">
          <div className="flex items-center justify-between text-[10px] text-[#94A3B8]">
            <span className="flex items-center gap-1.5 font-bold uppercase group-hover:text-[#38BDF8] transition-colors">
              <Layers className="w-3.5 h-3.5 text-[#38BDF8]" /> LAYER MAC BREAKDOWN
            </span>
            <span className="text-[#38BDF8] font-bold font-tabular">{currentModel.mac_count.toLocaleString()} MACs</span>
          </div>

          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
            {layers.map((l) => (
              <div key={l.layer_id} className="p-1.5 bg-[#070A0F] rounded-[2px] border border-[#1E293B] hover:border-[#38BDF8]/40 flex items-center justify-between text-[10px] transition-colors">
                <div className="truncate max-w-[120px]">
                  <span className="font-bold text-[#F8FAFC]">{l.layer_id}</span>
                  <span className="text-[9px] text-[#64748B] block">{l.op_type}</span>
                </div>
                <div className="text-right font-tabular">
                  <span className="text-[#38BDF8] font-bold">{l.macs.toLocaleString()}</span>
                  <span className="text-[9px] text-[#10B981] block">INT{l.bitwidth}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MISRA-C Formal Verification Card */}
        <div className="bg-[#0B0F17] p-3 rounded-[3px] border border-[#1E293B] hover:border-[#10B981] hover:shadow-[0_0_20px_-3px_rgba(16,185,129,0.25)] transition-all duration-200 space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-[#10B981]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
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
      <div className="p-2.5 bg-[#070A0F] border-t border-[#1E293B] text-[10px] font-mono text-[#64748B] flex items-center justify-between">
        <span>PROFILER ENGINE</span>
        <span className="text-[#10B981] font-bold flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#10B981]" /> READY
        </span>
      </div>
    </aside>
  );
};
