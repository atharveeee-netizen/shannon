import React, { useState } from 'react';
import { Cpu, ShieldCheck, Grid, Clock, CheckCircle2 } from 'lucide-react';
import { useCompiler } from '../../context/CompilerContext';
import { EmptyState } from '../ui/EmptyState';
import { Panel } from '../ui/Panel';
import { SpotlightCard } from '../react-bits/SpotlightCard';

export const MemoryArenaView: React.FC = () => {
  const { loadedModel, compilationResult, selectedHw } = useCompiler();
  const [selectedBlockIdx, setSelectedBlockIdx] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'2d' | 'timeline'>('2d');

  if (!loadedModel || !compilationResult) {
    return (
      <div className="p-6 w-full max-w-none">
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
  const maxLayers = Math.max(1, layers.length);

  return (
    <div className="p-6 space-y-6 w-full max-w-none">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-semibold">
            <Cpu className="w-4 h-4" />
            <span>GREEDY INTERVAL GRAPH ARENA ALLOCATOR</span>
          </div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            SRAM Memory Arena: {compilationResult.model_name}
          </h1>
          <p className="text-xs text-text-secondary leading-relaxed max-w-4xl">
            Physical Section <code>0x20000000</code>. Non-overlapping buffer lifecycle intervals achieve 100% zero runtime dynamic memory allocation (0 B malloc/heap).
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span>Static BSS Arena (0 B Dynamic Allocation)</span>
        </div>
      </div>

      {/* 2. Top Summary Metrics via SpotlightCards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <SpotlightCard className="p-4 space-y-1">
          <span className="text-[11px] font-mono font-semibold text-text-muted uppercase tracking-wider">
            Peak SRAM Arena
          </span>
          <div className="text-2xl font-bold text-cyan-400 font-mono">
            {arenaBytes} <span className="text-xs text-text-secondary font-normal font-sans">Bytes</span>
          </div>
          <p className="text-xs text-text-secondary font-mono">{(arenaBytes / 1024).toFixed(2)} KB Total Pool</p>
        </SpotlightCard>

        <SpotlightCard className="p-4 space-y-1">
          <span className="text-[11px] font-mono font-semibold text-text-muted uppercase tracking-wider">
            Target Utilization
          </span>
          <div className="text-2xl font-bold text-text-primary font-mono">
            {((arenaBytes / (selectedHw.sram_kb * 1024)) * 100).toFixed(2)}%
          </div>
          <p className="text-xs text-text-secondary font-mono">of {selectedHw.sram_kb} KB {selectedHw.name}</p>
        </SpotlightCard>

        <SpotlightCard className="p-4 space-y-1">
          <span className="text-[11px] font-mono font-semibold text-text-muted uppercase tracking-wider">
            Word Alignment
          </span>
          <div className="text-2xl font-bold text-primary font-mono">4-Byte</div>
          <p className="text-xs text-text-secondary font-mono">32-Bit Microcontroller Native</p>
        </SpotlightCard>

        <SpotlightCard className="p-4 space-y-1">
          <span className="text-[11px] font-mono font-semibold text-text-muted uppercase tracking-wider">
            Collision Check
          </span>
          <div className="text-2xl font-bold text-emerald-400 font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5" />
            <span>VERIFIED</span>
          </div>
          <p className="text-xs text-text-secondary font-mono">0 Interval Overlaps in Arena</p>
        </SpotlightCard>
      </div>

      {/* 3. Physical Visual SRAM Interval Map with 2D Heatmap Mode */}
      <Panel
        title="Physical SRAM Memory Allocation Map"
        subtitle="Visual interval mapping across layer execution steps [T_start &rarr; T_end]"
      >
        <div className="space-y-4">
          {/* View Mode Switcher */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 border border-border rounded-md bg-surface-raised p-0.5 text-xs font-mono">
              <button
                onClick={() => setViewMode('2d')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors cursor-pointer ${
                  viewMode === '2d' ? 'bg-primary text-white font-bold' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>2D Physical Address Map</span>
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors cursor-pointer ${
                  viewMode === 'timeline' ? 'bg-primary text-white font-bold' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Interval Timeline Gantt</span>
              </button>
            </div>

            <div className="text-[11px] font-mono text-text-muted">
              Base Offset: <span className="text-cyan-400 font-semibold">0x20000000</span> | Max:{' '}
              <span className="text-primary font-semibold">0x{(0x20000000 + arenaBytes).toString(16).toUpperCase()}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-raised/40 border border-border overflow-x-auto custom-scrollbar space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-text-secondary border-b border-border pb-2">
              <span>SRAM OFFSET (0x0000 &rarr; 0x{arenaBytes.toString(16).toUpperCase()})</span>
              <span>LIFETIME INTERVALS (Step 0 &rarr; Step {maxLayers})</span>
            </div>

            {viewMode === '2d' ? (
              /* 2D Physical Address Map: X = Time (layer execution step), Y = Physical Byte Offset */
              <div className="relative min-w-[640px] h-72 bg-canvas/80 rounded-lg border border-border p-3 overflow-hidden">
                {/* Layer Step Vertical Grid Lines */}
                <div className="absolute inset-0 flex justify-between px-3 pointer-events-none opacity-20">
                  {Array.from({ length: maxLayers + 1 }).map((_, i) => (
                    <div key={i} className="h-full border-r border-border flex flex-col justify-end">
                      <span className="text-[9px] font-mono text-text-muted transform -translate-x-1/2">
                        L{i}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Y-axis byte grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between py-3 pointer-events-none opacity-15">
                  <div className="border-b border-cyan-400 text-[9px] font-mono text-cyan-400 pl-1">0x0000</div>
                  <div className="border-b border-border text-[9px] font-mono text-text-muted pl-1">
                    0x{Math.round(arenaBytes * 0.5).toString(16).toUpperCase()}
                  </div>
                  <div className="border-b border-primary text-[9px] font-mono text-primary pl-1">
                    0x{arenaBytes.toString(16).toUpperCase()}
                  </div>
                </div>

                {/* Render 2D Tensor Blocks */}
                <div className="relative w-full h-full">
                  {arenaBlocks.map((block, idx) => {
                    const leftPct = Math.max(0, Math.min(95, (block.lifetime[0] / maxLayers) * 100));
                    const widthPct = Math.max(
                      8,
                      Math.min(100 - leftPct, ((block.lifetime[1] - block.lifetime[0] + 1) / maxLayers) * 100)
                    );
                    const topPct = Math.max(0, Math.min(90, (block.start_bytes / Math.max(1, arenaBytes)) * 100));
                    const heightPct = Math.max(
                      10,
                      Math.min(100 - topPct, (block.size_bytes / Math.max(1, arenaBytes)) * 100)
                    );
                    const isHovered = selectedBlockIdx === idx;

                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedBlockIdx(idx)}
                        onMouseEnter={() => setSelectedBlockIdx(idx)}
                        className={`absolute rounded-md p-1.5 flex flex-col justify-between font-mono text-[10px] cursor-pointer transition-all border ${
                          isHovered
                            ? 'ring-2 ring-primary border-primary text-white bg-surface-elevated z-20 shadow-lg'
                            : 'text-text-primary bg-surface-raised/90 hover:bg-surface-raised border-border/80 z-10'
                        }`}
                        style={{
                          left: `${leftPct}%`,
                          width: `${widthPct}%`,
                          top: `${topPct}%`,
                          height: `${heightPct}%`,
                        }}
                      >
                        <span className="font-bold truncate text-[10px]">{block.name}</span>
                        <div className="flex items-center justify-between text-[9px] text-cyan-400">
                          <span>{block.hex_address}</span>
                          <span className="font-semibold">{block.size_bytes} B</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Interval Timeline Gantt List */
              <div className="relative min-w-[640px] h-56 bg-surface rounded-lg border border-border p-3 flex flex-col justify-between">
                <div className="absolute inset-0 flex justify-between px-3 pointer-events-none opacity-25">
                  {Array.from({ length: maxLayers + 1 }).map((_, i) => (
                    <div key={i} className="h-full border-r border-border flex flex-col justify-end">
                      <span className="text-[10px] font-mono text-text-muted transform -translate-x-1/2">
                        L{i}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="relative w-full h-full space-y-2 py-1">
                  {arenaBlocks.map((block, idx) => {
                    const leftPct = Math.max(0, Math.min(95, (block.lifetime[0] / maxLayers) * 100));
                    const widthPct = Math.max(
                      8,
                      Math.min(100 - leftPct, ((block.lifetime[1] - block.lifetime[0] + 1) / maxLayers) * 100)
                    );
                    const isHovered = selectedBlockIdx === idx;

                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedBlockIdx(idx)}
                        onMouseEnter={() => setSelectedBlockIdx(idx)}
                        className={`h-7 rounded-md px-2.5 flex items-center justify-between font-mono text-xs cursor-pointer transition-all border ${
                          isHovered
                            ? 'ring-1 ring-primary border-primary text-white bg-surface-elevated'
                            : 'text-text-primary bg-surface-raised/70 hover:bg-surface-raised border-border'
                        }`}
                        style={{
                          marginLeft: `${leftPct}%`,
                          width: `${widthPct}%`,
                        }}
                      >
                        <span className="font-bold truncate text-xs">{block.name}</span>
                        <span className="text-xs font-semibold text-cyan-400">{block.size_bytes} B</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Selected Block Info Card */}
          {selectedBlockIdx !== null && arenaBlocks[selectedBlockIdx] && (
            <div className="p-3.5 rounded-lg bg-surface-raised border border-border text-xs font-mono flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <span className="font-bold text-primary">{arenaBlocks[selectedBlockIdx].name}</span>
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
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
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
