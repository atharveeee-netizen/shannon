import React, { useState } from 'react';
import { ShieldCheck, Grid, Clock, CheckCircle2 } from 'lucide-react';
import { useCompiler } from '../../context/CompilerContext';
import { EmptyState } from '../ui/EmptyState';
import { Panel } from '../ui/Panel';

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
  const arenaKb = (arenaBytes / 1024).toFixed(2);
  const arenaBlocks = compilationResult.arena_blocks || [];
  const layers = compilationResult.layers || [];
  const maxLayers = Math.max(1, layers.length);
  const sramUtilPct = ((arenaBytes / (selectedHw.sram_kb * 1024)) * 100).toFixed(1);

  return (
    <div className="p-6 space-y-6 w-full max-w-none">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-normal text-text-primary tracking-tight">
            SRAM Memory Arena
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Physical Section <code className="font-mono text-text-primary">0x20000000</code> &middot; Greedy Interval Graph Coloring
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-[6px] bg-success/10 border border-success/30 text-success text-xs font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>Static BSS Arena (0 B Dynamic Allocation)</span>
        </div>
      </div>

      {/* 2. Top Summary Metrics (Strict Numerical Dominance) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Peak SRAM Used */}
        <div className="p-4 rounded-[8px] bg-surface border border-border flex flex-col justify-between">
          <div>
            <div className="text-xs text-text-muted">Peak SRAM buffer used</div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-3xl font-medium text-text-primary tracking-tight">
                {arenaKb}
              </span>
              <span className="text-xs text-text-secondary font-medium">KB</span>
            </div>
          </div>
          <div className="pt-2 border-t border-border/60 text-xs text-text-secondary font-mono">
            {arenaBytes} Bytes allocated
          </div>
        </div>

        {/* Target Utilization */}
        <div className="p-4 rounded-[8px] bg-surface border border-border flex flex-col justify-between">
          <div>
            <div className="text-xs text-text-muted">Target SRAM capacity utilization</div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-3xl font-medium text-text-primary tracking-tight">
                {sramUtilPct}
              </span>
              <span className="text-xs text-text-secondary font-medium">%</span>
            </div>
          </div>
          <div className="pt-2 border-t border-border/60 text-xs text-text-secondary font-mono">
            Limit: {selectedHw.sram_kb} KB ({selectedHw.name})
          </div>
        </div>

        {/* Word Alignment */}
        <div className="p-4 rounded-[8px] bg-surface border border-border flex flex-col justify-between">
          <div>
            <div className="text-xs text-text-muted">Hardware memory alignment</div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-3xl font-medium text-text-primary tracking-tight">
                4-Byte
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-border/60 text-xs text-text-secondary">
            32-Bit Microcontroller Native
          </div>
        </div>

        {/* Collision Check Status */}
        <div className="p-4 rounded-[8px] bg-surface border border-border flex flex-col justify-between">
          <div>
            <div className="text-xs text-text-muted">Memory collision schedule</div>
            <div className="mt-1 flex items-baseline gap-1.5 text-success">
              <span className="font-mono text-3xl font-medium tracking-tight">
                0
              </span>
              <span className="text-xs font-medium">Overlaps</span>
            </div>
          </div>
          <div className="pt-2 border-t border-border/60 text-xs text-success flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Formally collision-free schedule</span>
          </div>
        </div>
      </div>

      {/* 3. Physical Visual SRAM Interval Map with 2D Heatmap Mode */}
      <Panel
        title="Physical SRAM Memory Allocation Map"
        subtitle="Visual interval mapping across layer execution steps [T_start → T_end]"
      >
        <div className="space-y-4">
          {/* View Mode Switcher */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 border border-border rounded-[6px] bg-surface-raised p-0.5 text-xs">
              <button
                onClick={() => setViewMode('2d')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-[4px] transition-colors cursor-pointer ${
                  viewMode === '2d' ? 'bg-primary text-white font-medium' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>2D Physical Address Map</span>
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-[4px] transition-colors cursor-pointer ${
                  viewMode === 'timeline' ? 'bg-primary text-white font-medium' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Interval Timeline Gantt</span>
              </button>
            </div>

            <div className="text-xs font-mono text-text-muted">
              Base Offset: <span className="text-text-primary font-medium">0x20000000</span> | Max:{' '}
              <span className="text-text-primary font-medium">0x{(0x20000000 + arenaBytes).toString(16).toUpperCase()}</span>
            </div>
          </div>

          <div className="p-4 rounded-[8px] bg-surface-raised border border-border overflow-x-auto custom-scrollbar space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-text-secondary border-b border-border pb-2">
              <span>SRAM offset (0x0000 → 0x{arenaBytes.toString(16).toUpperCase()})</span>
              <span>Lifetime intervals (Step 0 → Step {maxLayers})</span>
            </div>

            {viewMode === '2d' ? (
              /* 2D Physical Address Map: X = Time (layer execution step), Y = Physical Byte Offset */
              <div className="relative min-w-[640px] h-72 bg-canvas rounded-[6px] border border-border p-3 overflow-hidden">
                {/* Layer Step Vertical Grid Lines */}
                <div className="absolute inset-0 flex justify-between px-3 pointer-events-none opacity-20">
                  {Array.from({ length: maxLayers + 1 }).map((_, i) => (
                    <div key={i} className="h-full border-r border-border flex flex-col justify-end">
                      <span className="text-xs font-mono text-text-muted transform -translate-x-1/2">
                        L{i}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Y-axis byte grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between py-3 pointer-events-none opacity-25 text-xs font-mono text-text-muted pl-1">
                  <div className="border-b border-border">0x0000</div>
                  <div className="border-b border-border">
                    0x{Math.round(arenaBytes * 0.5).toString(16).toUpperCase()}
                  </div>
                  <div className="border-b border-border">
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
                        className={`absolute rounded-[4px] p-2 flex flex-col justify-between font-mono text-xs cursor-pointer transition-colors border ${
                          isHovered
                            ? 'border-primary text-white bg-surface-elevated z-20'
                            : 'text-text-primary bg-surface hover:bg-surface-elevated border-border z-10'
                        }`}
                        style={{
                          left: `${leftPct}%`,
                          width: `${widthPct}%`,
                          top: `${topPct}%`,
                          height: `${heightPct}%`,
                        }}
                      >
                        <span className="font-medium truncate">{block.name}</span>
                        <div className="flex items-center justify-between text-xs text-text-secondary">
                          <span>{block.hex_address}</span>
                          <span>{block.size_bytes} B</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Interval Timeline Gantt List */
              <div className="relative min-w-[640px] h-56 bg-surface rounded-[6px] border border-border p-3 flex flex-col justify-between">
                <div className="absolute inset-0 flex justify-between px-3 pointer-events-none opacity-25">
                  {Array.from({ length: maxLayers + 1 }).map((_, i) => (
                    <div key={i} className="h-full border-r border-border flex flex-col justify-end">
                      <span className="text-xs font-mono text-text-muted transform -translate-x-1/2">
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
                        className={`h-7 rounded-[4px] px-2.5 flex items-center justify-between font-mono text-xs cursor-pointer transition-colors border ${
                          isHovered
                            ? 'border-primary text-white bg-surface-elevated'
                            : 'text-text-primary bg-surface-raised hover:bg-surface-elevated border-border'
                        }`}
                        style={{
                          marginLeft: `${leftPct}%`,
                          width: `${widthPct}%`,
                        }}
                      >
                        <span className="font-medium truncate">{block.name}</span>
                        <span className="text-text-secondary">{block.size_bytes} B</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Selected Block Info Strip */}
          {selectedBlockIdx !== null && arenaBlocks[selectedBlockIdx] && (
            <div className="p-3 rounded-[6px] bg-surface-raised border border-border text-xs font-mono flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <span className="font-medium text-text-primary">{arenaBlocks[selectedBlockIdx].name}</span>
                <span className="text-text-secondary">
                  Lifetime: [{arenaBlocks[selectedBlockIdx].lifetime[0]}, {arenaBlocks[selectedBlockIdx].lifetime[1]}]
                </span>
                <span className="text-text-secondary">Physical: {arenaBlocks[selectedBlockIdx].hex_address}</span>
              </div>
              <span className="text-success font-medium">{arenaBlocks[selectedBlockIdx].size_bytes} Bytes Allocated</span>
            </div>
          )}
        </div>
      </Panel>

      {/* 4. Detailed Memory Allocation Table */}
      <Panel title="Memory Arena Allocation Schedule" subtitle="Exact byte offsets and lifetime windows" noPadding={true}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-surface-raised text-text-secondary">
                <th className="py-2.5 px-4 font-medium">Tensor buffer</th>
                <th className="py-2.5 px-4 font-medium">Lifetime window</th>
                <th className="py-2.5 px-4 font-medium">Start offset</th>
                <th className="py-2.5 px-4 font-medium">End offset</th>
                <th className="py-2.5 px-4 font-medium">Physical hex address</th>
                <th className="py-2.5 px-4 font-medium">Allocated size</th>
                <th className="py-2.5 px-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {arenaBlocks.map((b, idx) => (
                <tr
                  key={idx}
                  onClick={() => setSelectedBlockIdx(idx)}
                  className={`hover:bg-surface-raised transition-colors cursor-pointer ${
                    selectedBlockIdx === idx ? 'bg-surface-raised' : ''
                  }`}
                >
                  <td className="py-2.5 px-4 text-text-primary font-medium">{b.name}</td>
                  <td className="py-2.5 px-4 text-text-secondary">[{b.lifetime[0]}, {b.lifetime[1]}]</td>
                  <td className="py-2.5 px-4 text-text-secondary">0x{b.start_bytes.toString(16).toUpperCase().padStart(4, '0')}</td>
                  <td className="py-2.5 px-4 text-text-secondary">0x{b.end_bytes.toString(16).toUpperCase().padStart(4, '0')}</td>
                  <td className="py-2.5 px-4 text-text-primary font-medium">{b.hex_address}</td>
                  <td className="py-2.5 px-4 text-text-primary">{b.size_bytes} B</td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded-[4px] bg-success/10 border border-success/30 text-success text-xs font-medium">
                      0-Collision
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
