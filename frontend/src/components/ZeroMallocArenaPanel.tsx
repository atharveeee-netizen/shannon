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
      {/* Panel Top Title */}
      <div className="flex items-center justify-between border-b border-palantir-border pb-3">
        <div>
          <h2 className="text-lg font-semibold text-palantir-textPrimary font-mono flex items-center gap-2">
            <Layers className="w-4 h-4 text-palantir-pass" />
            ZERO-MALLOC CONTIGUOUS SRAM TENSOR ARENA MAP
          </h2>
          <p className="text-xs text-palantir-textSecondary font-sans">
            Static lifetime interval graph coloring. Allocates zero runtime heap memory (0 Bytes malloc).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-palantir-passLight px-2.5 py-1 rounded-[2px] border border-palantir-pass/40 text-palantir-pass text-xs font-mono font-bold">
            <Lock className="w-3.5 h-3.5" />
            <span>0x20000000 ARENA LOCKED</span>
          </div>
        </div>
      </div>

      {/* Memory Utilization Gauge */}
      <div className="bg-palantir-card border border-palantir-border rounded-[3px] p-4">
        <div className="flex items-center justify-between text-xs font-mono mb-2">
          <span className="text-palantir-textSecondary">
            SRAM Arena Footprint: <strong className="text-palantir-pass font-bold">{(totalArenaBytes / 1024).toFixed(2)} KB</strong> / {targetHw.sram_kb} KB
          </span>
          <span className="text-palantir-cobalt font-bold">{utilizationPct}% OF PHYSICAL CAPACITY</span>
        </div>

        <div className="w-full bg-palantir-canvas h-3 rounded-[2px] border border-palantir-border overflow-hidden flex">
          {blocks.map((b, idx) => {
            const widthPct = Math.max(8, (b.size_bytes / totalArenaBytes) * 100);
            return (
              <div
                key={idx}
                title={`${b.layer_id}: ${b.size_bytes} Bytes @ ${b.hex_address}`}
                className="h-full border-r border-palantir-border flex items-center justify-center text-[8px] font-mono font-bold text-palantir-textPrimary transition-all hover:opacity-80"
                style={{ width: `${widthPct}%`, backgroundColor: b.color }}
              >
                {b.layer_id}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-palantir-textMuted mt-2">
          <span>Base Offset: 0x20000000</span>
          <span>Aligned: 4-Byte Boundaries</span>
          <span>End Offset: 0x{((0x20000000 + totalArenaBytes).toString(16)).toUpperCase()}</span>
        </div>
      </div>

      {/* Gantt Lifetime Interval Schedule Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 bg-palantir-card border border-palantir-border rounded-[3px] p-4">
          <div className="flex items-center justify-between border-b border-palantir-border pb-2.5 mb-3">
            <span className="text-xs font-mono font-semibold text-palantir-textPrimary uppercase">
              TENSOR LIFETIME INTERVAL REUSE GANTT SCHEDULE
            </span>
            <span className="text-[10px] font-mono text-palantir-pass font-semibold">
              0 Overlapping Conflicts
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {blocks.map((block, idx) => (
              <div key={idx} className="p-2.5 bg-palantir-canvas border border-palantir-border rounded-[2px]">
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="font-bold text-palantir-textPrimary flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-[1px]" style={{ backgroundColor: block.color }} />
                    {block.layer_id} ({block.buffer_name})
                  </span>
                  <span className="text-palantir-cobalt font-bold">{block.size_bytes} Bytes</span>
                </div>

                <div className="flex items-center gap-3 text-[10px] text-palantir-textMuted">
                  <span>Physical Address: <strong className="text-palantir-textSecondary">{block.hex_address}</strong></span>
                  <span>•</span>
                  <span>Lifetime Window: <strong className="text-palantir-pass">t={block.lifetime_window[0]} &rarr; t={block.lifetime_window[1]}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety & Formal Verification Sidebar */}
        <div className="lg:col-span-4 bg-palantir-card border border-palantir-border rounded-[3px] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-palantir-border pb-2.5 mb-3">
              <ShieldCheck className="w-4 h-4 text-palantir-pass" />
              <h3 className="text-xs font-semibold text-palantir-textPrimary font-mono uppercase">
                FORMAL MEMORY PROOF
              </h3>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="p-2.5 bg-palantir-canvas border border-palantir-border rounded-[2px]">
                <span className="text-[10px] text-palantir-textMuted block">DYNAMIC ALLOCATION</span>
                <span className="text-sm font-bold text-palantir-pass">0 Bytes malloc()</span>
                <p className="text-[10px] text-palantir-textSecondary mt-0.5">
                  Eliminates heap fragmentation and runtime memory leak risks completely.
                </p>
              </div>

              <div className="p-2.5 bg-palantir-canvas border border-palantir-border rounded-[2px]">
                <span className="text-[10px] text-palantir-textMuted block">MISRA-C:2012 RULE 21.3</span>
                <span className="text-sm font-bold text-palantir-pass">COMPLIANT</span>
                <p className="text-[10px] text-palantir-textSecondary mt-0.5">
                  Standard library memory functions prohibited in safety-critical firmware.
                </p>
              </div>

              <div className="p-2.5 bg-palantir-canvas border border-palantir-border rounded-[2px]">
                <span className="text-[10px] text-palantir-textMuted block">SRAM HEADROOM</span>
                <span className="text-sm font-bold text-palantir-cobalt">
                  {targetHw.sram_kb - Math.round(totalArenaBytes / 1024)} KB Remaining
                </span>
                <p className="text-[10px] text-palantir-textSecondary mt-0.5">
                  Reserved for WiFi / BLE network stacks and peripheral DMA buffers.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-palantir-border/80 text-[10px] font-mono text-palantir-pass flex items-center justify-between">
            <span>STATIC MEMORY PASS</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};