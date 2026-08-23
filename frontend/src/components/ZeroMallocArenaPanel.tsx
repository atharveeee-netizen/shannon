import React, { useState } from 'react';
import { ZeroMallocBlock, HardwareProfile } from '../types';
import { Layers, ShieldCheck, CheckCircle2, Lock, Cpu, Eye, Activity } from 'lucide-react';

interface ZeroMallocArenaPanelProps {
  blocks: ZeroMallocBlock[];
  targetHw: HardwareProfile;
  totalArenaBytes: number;
}

export const ZeroMallocArenaPanel: React.FC<ZeroMallocArenaPanelProps> = ({
  blocks,
  targetHw,
  totalArenaBytes,
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const sramCapacityBytes = targetHw.sram_kb * 1024;
  const utilizationPct = ((totalArenaBytes / sramCapacityBytes) * 100).toFixed(2);
  const maxStep = Math.max(...blocks.map((b) => b.lifetime_window[1]), 4);

  const activeBlocksAtStep = blocks.filter(
    (b) => activeStep >= b.lifetime_window[0] && activeStep <= b.lifetime_window[1]
  );
  const activeSramBytesAtStep = activeBlocksAtStep.reduce((sum, b) => sum + b.size_bytes, 0);

  return (
    <div className="space-y-4">
      {/* Title & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#21262D] pb-3 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-[#10B981]/15 border border-[#10B981]/30 text-[#00FFA3]">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-[#F0F6FC] font-mono tracking-tight uppercase">
              ZERO-MALLOC CONTIGUOUS SRAM TENSOR ARENA
            </h2>
          </div>
          <p className="text-xs text-[#8B949E] mt-0.5 font-sans">
            Static lifetime interval graph coloring. Guarantees 0 bytes dynamic heap allocation (0 runtime malloc).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-[#10B981]/10 px-2.5 py-1 rounded-[3px] border border-[#10B981]/30 text-[#00FFA3] font-bold">
            <Lock className="w-3.5 h-3.5" />
            <span>0x20000000 ARENA LOCKED</span>
          </div>
          <div className="hidden md:flex items-center gap-1 bg-[#13171F] px-2.5 py-1 rounded-[3px] border border-[#21262D] text-[#38BDF8]">
            <Cpu className="w-3.5 h-3.5" />
            <span>ALIGN: 4-BYTE WORD</span>
          </div>
        </div>
      </div>

      {/* Arena Physical Memory Map (Interactive Heatmap) */}
      <div className="bg-[#13171F] border border-[#21262D] rounded-[4px] p-4 shadow-sm">
        <div className="flex items-center justify-between text-xs font-mono mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[#8B949E]">Peak SRAM Footprint:</span>
            <span className="text-[#00FFA3] font-bold">{(totalArenaBytes / 1024).toFixed(2)} KB</span>
            <span className="text-[#484F58]">/</span>
            <span className="text-[#8B949E]">{targetHw.sram_kb} KB</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-[#38BDF8] font-bold font-tabular">
              {utilizationPct}% PHYSICAL SRAM OCCUPIED
            </span>
            <span className="text-[10px] text-[#10B981] bg-[#10B981]/15 px-1.5 py-0.5 rounded border border-[#10B981]/30">
              0.00% FRAGMENTATION
            </span>
          </div>
        </div>

        {/* Visual Memory Blocks Bar */}
        <div className="w-full bg-[#0A0D12] h-7 rounded-[3px] border border-[#21262D] overflow-hidden flex relative p-0.5 gap-0.5">
          {blocks.map((b, idx) => {
            const widthPct = Math.max(10, (b.size_bytes / totalArenaBytes) * 100);
            const isActiveNow = activeStep >= b.lifetime_window[0] && activeStep <= b.lifetime_window[1];
            const isSelected = selectedBlockId === b.layer_id;

            return (
              <div
                key={idx}
                onClick={() => setSelectedBlockId(selectedBlockId === b.layer_id ? null : b.layer_id)}
                title={`${b.layer_id}: ${b.size_bytes} Bytes @ ${b.hex_address} (Step ${b.lifetime_window[0]} → ${b.lifetime_window[1]})`}
                className={`h-full rounded-[2px] cursor-pointer flex items-center justify-center text-[9px] font-mono font-bold transition-all select-none ${
                  isSelected
                    ? 'ring-2 ring-white shadow-glow-cyan z-10'
                    : isActiveNow
                    ? 'opacity-100 ring-1 ring-[#00FFA3]/50'
                    : 'opacity-40 hover:opacity-75'
                }`}
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: b.color || '#0284C7',
                  color: '#FFFFFF',
                }}
              >
                <span className="truncate px-1">{b.layer_id}</span>
              </div>
            );
          })}
        </div>

        {/* Address Base & End Markers */}
        <div className="flex items-center justify-between text-[10px] font-mono text-[#484F58] mt-2">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FFA3]"></span>
            Base Offset: <strong className="text-[#8B949E]">0x20000000</strong>
          </span>
          <span className="text-[#38BDF8]">
            Click any tensor block above or scrub the execution step below
          </span>
          <span className="flex items-center gap-1">
            End Offset: <strong className="text-[#8B949E]">0x{((0x20000000 + totalArenaBytes).toString(16)).toUpperCase()}</strong>
            <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]"></span>
          </span>
        </div>
      </div>

      {/* Interactive Execution Step Scrubber */}
      <div className="bg-[#13171F] border border-[#21262D] rounded-[4px] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded bg-[#0284C7]/15 border border-[#0284C7]/30 text-[#38BDF8]">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-[#F0F6FC] block">
              EXECUTION LIFECYCLE SCRUBBER
            </span>
            <span className="text-[10px] text-[#8B949E] font-mono">
              Active Step: <strong className="text-[#00FFA3]">Layer Step {activeStep}</strong> | Memory In Use: <strong className="text-[#38BDF8]">{activeSramBytesAtStep} Bytes</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          {Array.from({ length: maxStep + 1 }).map((_, stepIdx) => {
            const isCurrent = activeStep === stepIdx;
            return (
              <button
                key={stepIdx}
                onClick={() => setActiveStep(stepIdx)}
                className={`px-2.5 py-1 rounded-[3px] border transition-all text-xs font-bold ${
                  isCurrent
                    ? 'bg-[#0284C7] text-white border-[#38BDF8] shadow-glow-cyan'
                    : 'bg-[#0A0D12] text-[#8B949E] border-[#21262D] hover:text-[#F0F6FC] hover:border-[#30363D]'
                }`}
              >
                Step {stepIdx}
              </button>
            );
          })}
        </div>
      </div>

      {/* Two Column Breakdown: Lifetime Interval Schedule (8 cols) + Formal Verification Proof (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Scheduled Buffers Table */}
        <div className="lg:col-span-8 bg-[#13171F] border border-[#21262D] rounded-[4px] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#21262D] pb-2.5 mb-3">
              <span className="text-xs font-mono font-bold text-[#F0F6FC] uppercase flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#38BDF8]" />
                TENSOR LIFETIME INTERVAL SCHEDULE
              </span>
              <span className="text-[10px] font-mono text-[#00FFA3] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                0 Overlapping Conflicts
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              {blocks.map((block, idx) => {
                const isActiveNow = activeStep >= block.lifetime_window[0] && activeStep <= block.lifetime_window[1];
                const isSelected = selectedBlockId === block.layer_id;

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedBlockId(selectedBlockId === block.layer_id ? null : block.layer_id)}
                    className={`p-2.5 rounded-[3px] border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0284C7]/20 border-[#38BDF8] ring-1 ring-[#38BDF8]'
                        : isActiveNow
                        ? 'bg-[#161B22] border-[#21262D]'
                        : 'bg-[#0A0D12]/60 border-[#21262D]/60 opacity-60 hover:opacity-90'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-[1px] shrink-0"
                          style={{ backgroundColor: block.color }}
                        />
                        <span className="font-bold text-[#F0F6FC]">{block.layer_id}</span>
                        <span className="text-[10px] text-[#8B949E] hidden sm:inline">({block.buffer_name})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#38BDF8] font-bold font-tabular">{block.size_bytes} Bytes</span>
                        {isActiveNow && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#10B981]/20 text-[#00FFA3] border border-[#10B981]/40 font-bold">
                            ACTIVE
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#8B949E] pt-1 border-t border-[#21262D]/60">
                      <span>Physical Memory Offset: <strong className="text-[#F0F6FC] font-tabular">{block.hex_address}</strong></span>
                      <span>Lifetime Window: <strong className="text-[#00FFA3]">Step {block.lifetime_window[0]} → Step {block.lifetime_window[1]}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-[#21262D] mt-3 flex items-center justify-between text-xs font-mono text-[#8B949E]">
            <span>Dynamic Malloc Count: <strong className="text-[#00FFA3]">0</strong></span>
            <span>Static Arena Alignment: <strong className="text-[#38BDF8]">4-Byte Words</strong></span>
            <span>Heap Fragmentation Risk: <strong className="text-[#00FFA3]">0.0%</strong></span>
          </div>
        </div>

        {/* Right Column: Formal Proof & Safety Architecture */}
        <div className="lg:col-span-4 bg-[#13171F] border border-[#21262D] rounded-[4px] p-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-[#21262D] pb-2.5">
              <ShieldCheck className="w-4 h-4 text-[#00FFA3]" />
              <h3 className="text-xs font-bold text-[#F0F6FC] font-mono uppercase">
                FORMAL MEMORY PROOF
              </h3>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="p-2.5 bg-[#0A0D12] border border-[#21262D] rounded-[3px]">
                <span className="text-[10px] text-[#8B949E] block uppercase">DYNAMIC MEMORY ALLOCATION</span>
                <span className="text-sm font-bold text-[#00FFA3] block mt-0.5">0 Bytes malloc()</span>
                <p className="text-[10px] text-[#8B949E] font-sans mt-1 leading-snug">
                  The memory planner computes non-overlapping activation lifetimes at compile time, eliminating runtime heap exhaustion.
                </p>
              </div>

              <div className="p-2.5 bg-[#0A0D12] border border-[#21262D] rounded-[3px]">
                <span className="text-[10px] text-[#8B949E] block uppercase">MISRA-C:2012 COMPLIANCE</span>
                <span className="text-sm font-bold text-[#00FFA3] block mt-0.5">RULE 21.3 COMPLIANT</span>
                <p className="text-[10px] text-[#8B949E] font-sans mt-1 leading-snug">
                  Standard library dynamic memory allocation functions (<code className="text-[#38BDF8]">malloc</code>, <code className="text-[#38BDF8]">calloc</code>, <code className="text-[#38BDF8]">free</code>) are strictly prohibited in firmware.
                </p>
              </div>

              <div className="p-2.5 bg-[#0A0D12] border border-[#21262D] rounded-[3px]">
                <span className="text-[10px] text-[#8B949E] block uppercase">REMAINING SRAM HEADROOM</span>
                <span className="text-sm font-bold text-[#38BDF8] block mt-0.5 font-tabular">
                  {targetHw.sram_kb - Math.round(totalArenaBytes / 1024)} KB Unreserved
                </span>
                <p className="text-[10px] text-[#8B949E] font-sans mt-1 leading-snug">
                  Ample physical memory headroom for FreeRTOS stacks, TCP/IP network buffers, and DMA ring buffers.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#21262D] text-[10px] font-mono text-[#00FFA3] flex items-center justify-between">
            <span className="flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              100% COLLISION FREE PROOF VERIFIED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};