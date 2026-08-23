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
    <aside className="w-80 bg-[#0D1117] border-l border-[#21262D] flex flex-col shrink-0 select-none h-full overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-[#21262D] bg-[#0A0D12] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#38BDF8]" />
          <h3 className="text-xs font-bold text-[#F0F6FC] font-mono uppercase tracking-tight">
            MICRO-ARCH PROFILER
          </h3>
        </div>
        <span className="text-[10px] font-mono text-[#00FFA3] bg-[#10B981]/15 px-1.5 py-0.2 rounded font-bold">
          ONLINE
        </span>
      </div>

      {/* Profiler Metrics Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 font-mono text-xs">
        {/* Flash ROM Budget Breakdown */}
        <div className="bg-[#13171F] p-3 rounded border border-[#21262D] space-y-2">
          <div className="flex items-center justify-between text-[10px] text-[#8B949E]">
            <span className="flex items-center gap-1.5 font-bold uppercase">
              <HardDrive className="w-3.5 h-3.5 text-[#38BDF8]" /> FLASH ROM BUDGET
            </span>
            <span className="text-[#38BDF8] font-bold font-tabular">{flashUsedPct}% USED</span>
          </div>

          <div className="w-full bg-[#0A0D12] h-2.5 rounded overflow-hidden flex border border-[#21262D]">
            <div
              className="bg-[#0284C7] h-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(8, parseFloat(flashUsedPct) * 15))}%` }}
              title={`INT8 Weights: ${currentModel.int8_flash_kb} KB`}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
            <div>
              <span className="text-[#484F58] block">INT8 WEIGHTS</span>
              <span className="text-[#38BDF8] font-bold font-tabular">{currentModel.int8_flash_kb} KB</span>
            </div>
            <div>
              <span className="text-[#484F58] block">FLASH SAVINGS</span>
              <span className="text-[#00FFA3] font-bold font-tabular">{currentModel.flash_compression_ratio} reduction</span>
            </div>
          </div>
        </div>

        {/* SRAM Arena Allocation */}
        <div className="bg-[#13171F] p-3 rounded border border-[#21262D] space-y-2">
          <div className="flex items-center justify-between text-[10px] text-[#8B949E]">
            <span className="flex items-center gap-1.5 font-bold uppercase">
              <Cpu className="w-3.5 h-3.5 text-[#00FFA3]" /> SRAM ARENA CAPACITY
            </span>
            <span className="text-[#00FFA3] font-bold font-tabular">{sramUsedPct}% USED</span>
          </div>

          <div className="w-full bg-[#0A0D12] h-2.5 rounded overflow-hidden flex border border-[#21262D]">
            <div
              className="bg-[#10B981] h-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(6, parseFloat(sramUsedPct) * 10))}%` }}
              title={`Peak Arena: ${currentModel.peak_sram_kb} KB`}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
            <div>
              <span className="text-[#484F58] block">PEAK ARENA</span>
              <span className="text-[#00FFA3] font-bold font-tabular">{currentModel.peak_sram_kb} KB</span>
            </div>
            <div>
              <span className="text-[#484F58] block">UNRESERVED SRAM</span>
              <span className="text-[#F0F6FC] font-bold font-tabular">{sramCapacityKb - Math.round(currentModel.peak_sram_kb)} KB</span>
            </div>
          </div>
        </div>

        {/* INT8 Weight Value Histogram */}
        <div className="bg-[#13171F] p-3 rounded border border-[#21262D] space-y-2">
          <div className="flex items-center justify-between text-[10px] text-[#8B949E]">
            <span className="flex items-center gap-1.5 font-bold uppercase">
              <BarChart3 className="w-3.5 h-3.5 text-[#F59E0B]" /> INT8 WEIGHT HISTOGRAM
            </span>
            <span className="text-[9px] text-[#484F58]">[-128, +127]</span>
          </div>

          <div className="h-16 bg-[#0A0D12] rounded p-2 flex items-end justify-between gap-1 border border-[#21262D]">
            {weightHistogram.map((count, i) => (
              <div
                key={i}
                className="flex-1 bg-[#38BDF8] rounded-t-[1px] opacity-85 hover:opacity-100 transition"
                style={{ height: `${(count / 240) * 100}%`, backgroundColor: i === 7 ? '#00FFA3' : '#0284C7' }}
                title={`Bin ${i - 7}: ${count} weights`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-[9px] text-[#484F58]">
            <span>-128 (Min)</span>
            <span>0 (Median)</span>
            <span>+127 (Max)</span>
          </div>
        </div>

        {/* Layer MAC Breakdown List */}
        <div className="bg-[#13171F] p-3 rounded border border-[#21262D] space-y-2">
          <div className="flex items-center justify-between text-[10px] text-[#8B949E]">
            <span className="flex items-center gap-1.5 font-bold uppercase">
              <Layers className="w-3.5 h-3.5 text-[#38BDF8]" /> LAYER MAC BREAKDOWN
            </span>
            <span className="text-[#38BDF8] font-bold font-tabular">{currentModel.mac_count.toLocaleString()} MACs</span>
          </div>

          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
            {layers.map((l) => (
              <div key={l.layer_id} className="p-1.5 bg-[#0A0D12] rounded border border-[#21262D] flex items-center justify-between text-[10px]">
                <div className="truncate max-w-[120px]">
                  <span className="font-bold text-[#F0F6FC]">{l.layer_id}</span>
                  <span className="text-[9px] text-[#484F58] block">{l.op_type}</span>
                </div>
                <div className="text-right font-tabular">
                  <span className="text-[#38BDF8] font-bold">{l.macs.toLocaleString()}</span>
                  <span className="text-[9px] text-[#00FFA3] block">INT{l.bitwidth}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MISRA-C Formal Safety Proof Summary */}
        <div className="bg-[#13171F] p-3 rounded border border-[#21262D] space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-[#00FFA3]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>FORMAL SAFETY VERIFICATION</span>
          </div>

          <div className="text-[10px] text-[#8B949E] space-y-1 font-sans">
            <div className="flex items-center justify-between font-mono">
              <span>Dynamic Heap (malloc):</span>
              <strong className="text-[#00FFA3]">0 Bytes</strong>
            </div>
            <div className="flex items-center justify-between font-mono">
              <span>MISRA-C Rule 21.3:</span>
              <strong className="text-[#00FFA3]">COMPLIANT</strong>
            </div>
            <div className="flex items-center justify-between font-mono">
              <span>Memory Bounds Faults:</span>
              <strong className="text-[#00FFA3]">0 Errors</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-[#0A0D12] border-t border-[#21262D] text-[10px] font-mono text-[#8B949E] flex items-center justify-between">
        <span>PROFILER ENGINE</span>
        <span className="text-[#00FFA3] font-bold">READY</span>
      </div>
    </aside>
  );
};
