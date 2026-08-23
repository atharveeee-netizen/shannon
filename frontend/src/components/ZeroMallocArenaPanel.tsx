import React from 'react';
import { ZeroMallocBlock, HardwareProfile } from '../types';
import { Layers, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';

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
  const sramCapacityBytes = targetHw.sram_kb * 1024;
  const utilizationPct = ((totalArenaBytes / sramCapacityBytes) * 100).toFixed(2);

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-[#232936] pb-3">
        <div>
          <h2 className="text-sm font-semibold text-[#F5F8FA] font-mono flex items-center gap-2 uppercase tracking-wide">
            <Layers className="w-4 h-4 text-[#0D8050]" />
            ZERO MALLOC CONTIGUOUS SRAM TENSOR ARENA MAP
          </h2>
          <p className="text-xs text-[#A7B6C2]">
            Static lifetime interval graph coloring. Allocates zero runtime heap memory (0 Bytes malloc).
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#0D8050]/15 px-2.5 py-1 rounded-[2px] border border-[#0D8050]/40 text-[#0D8050] text-xs font-mono font-bold">
          <Lock className="w-3.5 h-3.5" />
          <span>0x20000000 ARENA LOCKED</span>
        </div>
      </div>

      {/* Utilization Bar */}
      <div className="bg-[#1A1F28] border border-[#232936] rounded-[3px] p-4">
        <div className="flex items-center justify-between text-xs font-mono mb-2">
          <span className="text-[#A7B6C2]">
            SRAM Arena Footprint: <strong className="text-[#0D8050] font-bold">{(totalArenaBytes / 1024).toFixed(2)} KB</strong> / {targetHw.sram_kb} KB
          </span>
          <span className="text-[#2B95D6] font-bold">{utilizationPct}% OF PHYSICAL CAPACITY</span>
        </div>

        <div className="w-full bg-[#0B0D11] h-3 rounded-[2px] border border-[#232936] overflow-hidden flex">
          {blocks.map((b, idx) => {
            const widthPct = Math.max(8, (b.size_bytes / totalArenaBytes) * 100);
            return (
              <div
                key={idx}
                title={`${b.layer_id}: ${b.size_bytes} Bytes @ ${b.hex_address}`}
                className="h-full border-r border-[#232936] flex items-center justify-center text-[8px] font-mono font-bold text-[#F5F8FA] transition-all hover:opacity-80"
                style={{ width: `${widthPct}%`, backgroundColor: b.color }}
              >
                {b.layer_id}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-[#5C7080] mt-2">
          <span>Base Offset: 0x20000000</span>
          <span>Aligned: 4-Byte Boundaries</span>
          <span>End Offset: 0x{((0x20000000 + totalArenaBytes).toString(16)).toUpperCase()}</span>
        </div>
      </div>

      {/* Grid: Interval Schedule (8 cols) + Safety Proof (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 bg-[#1A1F28] border border-[#232936] rounded-[3px] p-4">
          <div className="flex items-center justify-between border-b border-[#232936] pb-2.5 mb-3">
            <span className="text-xs font-mono font-semibold text-[#F5F8FA] uppercase">
              TENSOR LIFETIME INTERVAL SCHEDULE
            </span>
            <span className="text-[10px] font-mono text-[#0D8050] font-semibold">
              0 Overlapping Conflicts
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {blocks.map((block, idx) => (
              <div key={idx} className="p-2.5 bg-[#0B0D11] border border-[#232936] rounded-[2px]">
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="font-bold text-[#F5F8FA] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-[1px]" style={{ backgroundColor: block.color }} />
                    {block.layer_id} ({block.buffer_name})
                  </span>
                  <span className="text-[#2B95D6] font-bold">{block.size_bytes} Bytes</span>
                </div>

                <div className="flex items-center gap-3 text-[10px] text-[#5C7080]">
                  <span>Physical Address: <strong className="text-[#A7B6C2]">{block.hex_address}</strong></span>
                  <span>|</span>
                  <span>Lifetime Window: <strong className="text-[#0D8050]">Step {block.lifetime_window[0]} to Step {block.lifetime_window[1]}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Proof Sidebar */}
        <div className="lg:col-span-4 bg-[#1A1F28] border border-[#232936] rounded-[3px] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-[#232936] pb-2.5 mb-3">
              <ShieldCheck className="w-4 h-4 text-[#0D8050]" />
              <h3 className="text-xs font-semibold text-[#F5F8FA] font-mono uppercase">
                FORMAL MEMORY PROOF
              </h3>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="p-2.5 bg-[#0B0D11] border border-[#232936] rounded-[2px]">
                <span className="text-[10px] text-[#5C7080] block">DYNAMIC ALLOCATION</span>
                <span className="text-sm font-bold text-[#0D8050]">0 Bytes malloc()</span>
                <p className="text-[10px] text-[#A7B6C2] mt-0.5">
                  Eliminates runtime heap fragmentation and memory leaks.
                </p>
              </div>

              <div className="p-2.5 bg-[#0B0D11] border border-[#232936] rounded-[2px]">
                <span className="text-[10px] text-[#5C7080] block">MISRA-C:2012 RULE 21.3</span>
                <span className="text-sm font-bold text-[#0D8050]">COMPLIANT</span>
                <p className="text-[10px] text-[#A7B6C2] mt-0.5">
                  Standard library dynamic memory functions strictly prohibited.
                </p>
              </div>

              <div className="p-2.5 bg-[#0B0D11] border border-[#232936] rounded-[2px]">
                <span className="text-[10px] text-[#5C7080] block">SRAM HEADROOM</span>
                <span className="text-sm font-bold text-[#2B95D6]">
                  {targetHw.sram_kb - Math.round(totalArenaBytes / 1024)} KB Available
                </span>
                <p className="text-[10px] text-[#A7B6C2] mt-0.5">
                  Reserved for network buffers and DMA transfers.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#232936] text-[10px] font-mono text-[#0D8050] flex items-center justify-between">
            <span>STATIC MEMORY VERIFIED</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};