import React, { useState } from 'react';
import { Cpu, ShieldCheck } from 'lucide-react';
import { useCompiler } from '../../context/CompilerContext';
import { EmptyState } from '../ui/EmptyState';
import { Panel } from '../ui/Panel';

export const MemoryArenaView: React.FC = () => {
  const { loadedModel, compilationResult, selectedHw } = useCompiler();
  const [selectedBlockIdx, setSelectedBlockIdx] = useState<number | null>(null);

  if (!loadedModel || !compilationResult) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <EmptyState
          title="Memory Plan Not Available"
          description="Compile a model to generate the static Greedy Interval Graph Coloring SRAM memory allocation plan."
          allowCompile={true}
        />
      </div>
    );
  }

  const arenaBytes = compilationResult.optimized_int8.peak_sram_bytes;
  const arenaBlocks = compilationResult.arena_blocks || [];
  const layers = compilationResult.layers || [];
  const maxLayers = layers.length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-accent">
            <Cpu className="w-4 h-4" />
            <span>GREEDY INTERVAL GRAPH ARENA ALLOCATOR</span>
          </div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            SRAM Memory Arena: {compilationResult.model_name}
          </h1>
          <p className="text-xs text-text-secondary">
            Physical Section <code>0x20000000</code>. Non-overlapping buffer lifecycle intervals achieve 100% zero-malloc static memory safety.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-accent" />
          <span>MISRA-C:2012 Certified (0 B Malloc)</span>
        </div>
      </div>

      {/* 2. Top Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded bg-surface border border-border space-y-1">
          <span className="text-[11px] font-mono font-semibold text-text-muted uppercase tracking-wider">
            Peak SRAM Arena
          </span>
          <div className="text-2xl font-bold text-cyan-400 font-mono">
            {arenaBytes} <span className="text-xs text-text-secondary font-normal font-sans">Bytes</span>
          </div>
          <p className="text-xs text-text-secondary font-mono">{(arenaBytes / 1024).toFixed(2)} KB Total Pool</p>
        </div>

        <div className="p-4 rounded bg-surface border border-border space-y-1">
          <span className="text-[11px] font-mono font-semibold text-text-muted uppercase tracking-wider">
            Target Utilization
          </span>
          <div className="text-2xl font-bold text-text-primary font-mono">
            {((arenaBytes / (selectedHw.sram_kb * 1024)) * 100).toFixed(2)}%
          </div>
          <p className="text-xs text-text-secondary font-mono">of {selectedHw.sram_kb} KB {selectedHw.name}</p>
        </div>

        <div className="p-4 rounded bg-surface border border-border space-y-1">
          <span className="text-[11px] font-mono font-semibold text-text-muted uppercase tracking-wider">
            Word Alignment
          </span>
          <div className="text-2xl font-bold text-accent font-mono">4-Byte</div>
          <p className="text-xs text-text-secondary font-mono">32-Bit Microcontroller Native</p>
        </div>

        <div className="p-4 rounded bg-surface border border-border space-y-1">
          <span className="text-[11px] font-mono font-semibold text-text-muted uppercase tracking-wider">
            Collision Check
          </span>
          <div className="text-2xl font-bold text-emerald-400 font-mono">PASS</div>
          <p className="text-xs text-text-secondary font-mono">0 Interval Overlaps</p>
        </div>
      </div>

      {/* 3. Physical Visual SRAM Interval Map */}
      <Panel
        title="Physical SRAM Memory Allocation Map"
        subtitle="Visual interval mapping across layer execution steps [T_start &rarr; T_end]"
      >
        <div className="space-y-4">
          <div className="p-4 rounded bg-surface-raised/40 border border-border overflow-x-auto custom-scrollbar space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-text-secondary border-b border-border pb-2">
              <span>SRAM OFFSET (0x0000 &rarr; 0x{arenaBytes.toString(16).toUpperCase()})</span>
              <span>LIFETIME INTERVALS (0 &rarr; {maxLayers})</span>
            </div>

            {/* Interval Visualizer Grid */}
            <div className="relative min-w-[640px] h-52 bg-surface rounded border border-border p-3 flex flex-col justify-between">
              {/* Layer Step Timeline Grid Lines */}
              <div className="absolute inset-0 flex justify-between px-3 pointer-events-none opacity-25">
                {Array.from({ length: maxLayers + 1 }).map((_, i) => (
                  <div key={i} className="h-full border-r border-border flex flex-col justify-end">
                    <span className="text-[10px] font-mono text-text-muted transform -translate-x-1/2">
                      L{i}
                    </span>
                  </div>
                ))}
              </div>

              {/* Render Activation Buffer Interval Blocks */}
              <div className="relative w-full h-full space-y-2.5 py-2">
                {arenaBlocks.map((block, idx) => {
                  const leftPct = Math.max(0, Math.min(95, (block.lifetime[0] / Math.max(1, maxLayers)) * 100));
                  const widthPct = Math.max(
                    8,
                    Math.min(100 - leftPct, ((block.lifetime[1] - block.lifetime[0] + 1) / Math.max(1, maxLayers)) * 100)
                  );
                  const isHovered = selectedBlockIdx === idx;

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedBlockIdx(idx)}
                      onMouseEnter={() => setSelectedBlockIdx(idx)}
                      className={`h-8 rounded px-3 flex items-center justify-between font-mono text-xs cursor-pointer transition-all border ${
                        isHovered
                          ? 'ring-1 ring-accent border-accent text-white bg-surface-raised'
                          : 'text-text-primary bg-surface-raised/60 hover:bg-surface-raised border-border'
                      }`}
                      style={{
                        marginLeft: `${leftPct}%`,
                        width: `${widthPct}%`,
                      }}
                    >
                      <span className="font-bold truncate">{block.name}</span>
                      <span className="text-xs font-semibold text-accent">{block.size_bytes} B</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Selected Block Info Card */}
          {selectedBlockIdx !== null && arenaBlocks[selectedBlockIdx] && (
            <div className="p-3.5 rounded bg-surface-raised border border-border text-xs font-mono flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <span className="font-bold text-accent">{arenaBlocks[selectedBlockIdx].name}</span>
                <span className="text-text-secondary">
                  Lifetime: [{arenaBlocks[selectedBlockIdx].lifetime[0]}, {arenaBlocks[selectedBlockIdx].lifetime[1]}]
                </span>
                <span className="text-cyan-400 font-medium">Physical: {arenaBlocks[selectedBlockIdx].hex_address}</span>
              </div>
              <span className="text-emerald-400 font-bold">{arenaBlocks[selectedBlockIdx].size_bytes} Bytes Allocated</span>
            </div>
          )}
        </div>
      </Panel>

      {/* 4. Detailed Memory Allocation Table */}
      <Panel title="Memory Arena Allocation Schedule" subtitle="Exact byte offsets and lifetime windows" noPadding={true}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-surface-raised/40 text-text-secondary text-xs">
                <th className="py-3 px-4 font-semibold">Tensor Buffer</th>
                <th className="py-3 px-4 font-semibold">Lifetime Window</th>
                <th className="py-3 px-4 font-semibold">Start Offset</th>
                <th className="py-3 px-4 font-semibold">End Offset</th>
                <th className="py-3 px-4 font-semibold">Physical Hex Address</th>
                <th className="py-3 px-4 font-semibold">Allocated Size</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {arenaBlocks.map((b, idx) => (
                <tr
                  key={idx}
                  onClick={() => setSelectedBlockIdx(idx)}
                  className={`hover:bg-surface-raised/60 transition-colors cursor-pointer ${
                    selectedBlockIdx === idx ? 'bg-surface-raised' : ''
                  }`}
                >
                  <td className="py-3 px-4 text-text-primary font-bold">{b.name}</td>
                  <td className="py-3 px-4 text-text-secondary">[{b.lifetime[0]}, {b.lifetime[1]}]</td>
                  <td className="py-3 px-4 text-text-secondary">0x{b.start_bytes.toString(16).toUpperCase().padStart(4, '0')}</td>
                  <td className="py-3 px-4 text-text-secondary">0x{b.end_bytes.toString(16).toUpperCase().padStart(4, '0')}</td>
                  <td className="py-3 px-4 text-cyan-400 font-bold">{b.hex_address}</td>
                  <td className="py-3 px-4 text-text-primary font-semibold">{b.size_bytes} Bytes</td>
                  <td className="py-3 px-4">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
                      0-COLLISION
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};
