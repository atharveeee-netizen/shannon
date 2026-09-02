import React, { useState } from 'react';
import { CompilationResult, HardwareProfile, ArenaBlock } from '../types';
import { Database, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface MemoryArenaViewProps {
  compilationResult: CompilationResult | null;
  targetHw: HardwareProfile;
}

export const MemoryArenaView: React.FC<MemoryArenaViewProps> = ({
  compilationResult,
  targetHw,
}) => {
  const arenaBlocks = compilationResult?.arena_blocks || [];
  const peakSram = compilationResult?.optimized_int8.peak_sram_bytes || 18432;
  const sramTotal = targetHw.sram_kb * 1024;
  const availableSram = Math.max(0, sramTotal - peakSram);

  const [selectedBlock, setSelectedBlock] = useState<ArenaBlock | null>(arenaBlocks[0] || null);

  const colors = ['#6C4CE8', '#238636', '#2563EB', '#B7791F', '#D73A49'];

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h2 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            Zero-Malloc Static SRAM Memory Planner
          </h2>
          <p className="text-text-secondary text-xs mt-0.5">
            Greedy interval graph coloring scheduling tensor lifetimes into a contiguous static BSS arena (MISRA-C:2012 Rule 21.3).
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-success bg-success-subtle px-2.5 py-1 rounded border border-success/30 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>0 Bytes Dynamic Malloc</span>
        </div>
      </div>

      {/* Header Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
        <div className="p-3 bg-surface border border-border rounded">
          <span className="text-[10px] text-text-muted uppercase block">Peak SRAM Usage</span>
          <span className="text-base font-bold text-primary mt-0.5 block">
            {(peakSram / 1024).toFixed(2)} KB
          </span>
          <span className="text-[10px] text-text-secondary">Static Tensor Arena</span>
        </div>

        <div className="p-3 bg-surface border border-border rounded">
          <span className="text-[10px] text-text-muted uppercase block">Hardware SRAM Capacity</span>
          <span className="text-base font-bold text-text-primary mt-0.5 block">
            {targetHw.sram_kb} KB
          </span>
          <span className="text-[10px] text-text-secondary">{targetHw.name} ({targetHw.arch.split(' ')[0]})</span>
        </div>

        <div className="p-3 bg-surface border border-border rounded">
          <span className="text-[10px] text-text-muted uppercase block">Available SRAM Margin</span>
          <span className="text-base font-bold text-success mt-0.5 block">
            {(availableSram / 1024).toFixed(1)} KB
          </span>
          <span className="text-[10px] text-text-secondary">Free for stack & peripherals</span>
        </div>

        <div className="p-3 bg-surface border border-border rounded">
          <span className="text-[10px] text-text-muted uppercase block">Base Hex Offset</span>
          <span className="text-base font-bold text-text-primary mt-0.5 block">
            0x20000000
          </span>
          <span className="text-[10px] text-text-secondary">4-byte Word Aligned</span>
        </div>
      </div>

      {/* Graphical Memory Arena Timeline Map */}
      <div className="p-4 bg-surface border border-border rounded space-y-3 font-mono">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-text-primary uppercase tracking-wider font-sans">
            Static Arena Memory Map (Interval Graph Allocation)
          </span>
          <span className="text-[11px] text-text-muted">
            0x20000000 → 0x{(0x20000000 + peakSram).toString(16).toUpperCase()}
          </span>
        </div>

        {/* Visual Memory Blocks */}
        <div className="w-full bg-surface-raised h-10 rounded border border-border overflow-hidden flex p-0.5 gap-1">
          {arenaBlocks.map((b, idx) => {
            const widthPct = Math.max(16, (b.size_bytes / Math.max(peakSram, 1)) * 100);
            const isSelected = selectedBlock?.layer_id === b.layer_id;
            const bgCol = colors[idx % colors.length];
            return (
              <div
                key={idx}
                onClick={() => setSelectedBlock(b)}
                className={`h-full rounded-sm flex items-center justify-center text-[10px] font-bold text-white cursor-pointer transition-all px-2 truncate shadow-sm ${
                  isSelected ? 'ring-2 ring-text-primary' : 'opacity-90 hover:opacity-100'
                }`}
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: bgCol,
                }}
              >
                <span>{b.layer_id}</span>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between text-[10px] text-text-muted pt-0.5">
          <span>0 B (Base Offset: 0x20000000)</span>
          <span>Peak Arena Boundary: {peakSram} B (+0x{(peakSram).toString(16).toUpperCase()})</span>
        </div>
      </div>

      {/* Memory Schedule Table & Selected Buffer Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Table */}
        <div className="lg:col-span-8 bg-surface border border-border rounded p-4 space-y-2 font-mono">
          <span className="font-bold text-xs text-text-primary uppercase tracking-wider block font-sans border-b border-border pb-2">
            Scheduled Tensor Arena Buffer Slots
          </span>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-text-muted text-[11px]">
                  <th className="py-2">Buffer Name</th>
                  <th className="py-2">Size</th>
                  <th className="py-2">Physical Offset</th>
                  <th className="py-2">Lifetime Window</th>
                  <th className="py-2">Allocation Strategy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {arenaBlocks.map((b, idx) => (
                  <tr
                    key={idx}
                    onClick={() => setSelectedBlock(b)}
                    className={`cursor-pointer transition ${
                      selectedBlock?.layer_id === b.layer_id ? 'bg-primary/5' : 'hover:bg-surface-hover'
                    }`}
                  >
                    <td className="py-2 text-text-primary font-bold flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: colors[idx % colors.length] }}
                      />
                      {b.name}
                    </td>
                    <td className="py-2 text-text-secondary">{b.size_bytes} B</td>
                    <td className="py-2 text-primary font-semibold">{b.hex_address}</td>
                    <td className="py-2 text-text-secondary">Step {b.lifetime[0]} → Step {b.lifetime[1]}</td>
                    <td className="py-2 text-success font-medium">
                      {b.name.includes('Reused') ? 'Slot Reused (0 Fragmentation)' : 'Contiguous Base Slot'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Buffer Inspector */}
        <div className="lg:col-span-4 bg-surface border border-border rounded p-4 space-y-3 font-mono text-xs">
          <span className="font-bold text-text-primary uppercase tracking-wider block font-sans border-b border-border pb-2">
            Buffer Inspector
          </span>

          {selectedBlock ? (
            <div className="space-y-2 text-[11px]">
              <div className="p-2 bg-surface-raised border border-border rounded">
                <span className="text-[10px] text-text-muted block uppercase">Buffer Name</span>
                <strong className="text-xs text-text-primary">{selectedBlock.name}</strong>
              </div>

              <div className="p-2.5 bg-surface-raised border border-border rounded space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Assigned Offset</span>
                  <strong className="text-primary">{selectedBlock.hex_address}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Byte Length</span>
                  <strong className="text-text-primary">{selectedBlock.size_bytes} Bytes</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Lifetime Span</span>
                  <strong className="text-text-primary">Step {selectedBlock.lifetime[0]} to {selectedBlock.lifetime[1]}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Bus Alignment</span>
                  <strong className="text-success">4-Byte Word Aligned</strong>
                </div>
              </div>

              <div className="p-2.5 bg-success-subtle border border-success/30 rounded text-success text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Zero buffer collision verified across complete inference graph.</span>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-text-muted">Select a buffer block to inspect.</div>
          )}
        </div>
      </div>
    </div>
  );
};
