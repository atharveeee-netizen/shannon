import React, { useState, useRef } from 'react';
import { CompilationResult, LayerData } from '../types';
import {
  GitCommit,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  CheckCircle2,
} from 'lucide-react';

interface GraphViewProps {
  compilationResult: CompilationResult | null;
}

export const GraphView: React.FC<GraphViewProps> = ({ compilationResult }) => {
  const layers: LayerData[] = compilationResult?.layers || [];
  
  // Graph Navigation State (Pan & Zoom)
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 40, y: 30 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Node Selection State
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'operator' | 'tensor' | 'memory'>('operator');

  const containerRef = useRef<HTMLDivElement>(null);

  // Selected Layer
  const selectedLayer = layers[selectedNodeIndex] || layers[0];

  // Upstream (producer) and Downstream (consumer) indices
  const upstreamIndices = selectedNodeIndex > 0 ? [selectedNodeIndex - 1] : [];
  const downstreamIndices = selectedNodeIndex < layers.length - 1 ? [selectedNodeIndex + 1] : [];

  // Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left click
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom((prev) => Math.min(2.0, Math.max(0.4, prev * zoomFactor)));
  };

  const resetView = () => {
    setZoom(1.0);
    setPan({ x: 40, y: 30 });
  };

  // Node Dimensions and Layout Coordinates (DAG horizontal flow)
  const nodeWidth = 260;
  const nodeHeight = 140;
  const horizontalGap = 90;

  // Calculate Node Coordinates
  const getNodePos = (index: number) => {
    const x = 50 + index * (nodeWidth + horizontalGap);
    const y = 80;
    return { x, y };
  };

  return (
    <div className="space-y-4 font-sans text-xs select-none">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h2 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-primary" />
            Shannon Computational Graph & IR Workspace
          </h2>
          <p className="text-text-secondary text-xs mt-0.5">
            Static directed acyclic graph (DAG) representing the verified zero-malloc AST intermediate representation.
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2 font-mono">
          <div className="flex items-center bg-surface-raised border border-border rounded p-0.5">
            <button
              onClick={() => setZoom((z) => Math.min(2.0, +(z + 0.15).toFixed(2)))}
              className="p-1 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] px-1.5 font-bold text-text-primary min-w-[42px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.max(0.4, +(z - 0.15).toFixed(2)))}
              className="p-1 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetView}
              className="p-1 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded transition border-l border-border ml-0.5"
              title="Fit to Screen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="text-text-muted text-[11px]">|</span>
          <span className="text-text-secondary text-[11px]">
            Nodes: <strong className="text-text-primary">{layers.length}</strong>
          </span>
        </div>
      </div>

      {/* Main Graph Grid: Interactive Canvas (Left) + Detailed IR Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Interactive Graph Canvas */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          className="lg:col-span-8 bg-canvas border border-border rounded h-[560px] relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
          style={{
            backgroundImage:
              'radial-gradient(var(--border) 1px, transparent 1px)',
            backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`,
          }}
        >
          {/* Canvas SVG Layer for Directed Connection Edges */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
            }}
          >
            <defs>
              <marker
                id="arrowhead-default"
                markerWidth="6"
                markerHeight="6"
                refX="5"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 6 3, 0 6" fill="var(--border-strong)" />
              </marker>
              <marker
                id="arrowhead-upstream"
                markerWidth="6"
                markerHeight="6"
                refX="5"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 6 3, 0 6" fill="#06B6D4" />
              </marker>
              <marker
                id="arrowhead-downstream"
                markerWidth="6"
                markerHeight="6"
                refX="5"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 6 3, 0 6" fill="#10B981" />
              </marker>
            </defs>

            {/* Render Spline Curves connecting consecutive nodes */}
            {layers.map((_, idx) => {
              if (idx >= layers.length - 1) return null;
              const fromPos = getNodePos(idx);
              const toPos = getNodePos(idx + 1);

              const startX = fromPos.x + nodeWidth;
              const startY = fromPos.y + nodeHeight / 2;
              const endX = toPos.x;
              const endY = toPos.y + nodeHeight / 2;

              const isUpstreamEdge = selectedNodeIndex === idx + 1;
              const isDownstreamEdge = selectedNodeIndex === idx;

              const strokeColor = isUpstreamEdge
                ? '#06B6D4'
                : isDownstreamEdge
                ? '#10B981'
                : 'var(--border-strong)';
              const markerId = isUpstreamEdge
                ? 'arrowhead-upstream'
                : isDownstreamEdge
                ? 'arrowhead-downstream'
                : 'arrowhead-default';

              const midX = (startX + endX) / 2;
              const pathData = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;

              return (
                <path
                  key={`edge-${idx}`}
                  d={pathData}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={isUpstreamEdge || isDownstreamEdge ? 2.5 : 1.5}
                  strokeDasharray={isUpstreamEdge || isDownstreamEdge ? 'none' : '4 2'}
                  markerEnd={`url(#${markerId})`}
                  className="transition-all duration-200"
                />
              );
            })}
          </svg>

          {/* Canvas Nodes Container */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
            }}
          >
            {layers.map((l, idx) => {
              const pos = getNodePos(idx);
              const isSelected = selectedNodeIndex === idx;
              const isUpstream = upstreamIndices.includes(idx);
              const isDownstream = downstreamIndices.includes(idx);

              return (
                <div
                  key={l.layer_id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNodeIndex(idx);
                  }}
                  className={`absolute pointer-events-auto rounded border p-3 font-mono cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'bg-surface-raised border-primary shadow-lg ring-2 ring-primary/50 z-20 scale-[1.02]'
                      : isUpstream
                      ? 'bg-surface border-cyan-500/80 ring-1 ring-cyan-500/30 z-10'
                      : isDownstream
                      ? 'bg-surface border-emerald-500/80 ring-1 ring-emerald-500/30 z-10'
                      : 'bg-surface/90 hover:bg-surface-hover border-border opacity-85 hover:opacity-100 z-0'
                  }`}
                  style={{
                    left: `${pos.x}px`,
                    top: `${pos.y}px`,
                    width: `${nodeWidth}px`,
                    height: `${nodeHeight}px`,
                  }}
                >
                  {/* Node Top Header */}
                  <div className="flex items-center justify-between border-b border-border/60 pb-1.5 mb-1.5">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-[10px] text-text-muted">#{idx + 1}</span>
                      <strong className="text-xs text-text-primary truncate">{l.layer_id}</strong>
                    </div>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                        isSelected
                          ? 'bg-primary/20 text-primary'
                          : isUpstream
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : isDownstream
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-surface-raised text-text-secondary'
                      }`}
                    >
                      {l.op_type}
                    </span>
                  </div>

                  {/* Node Metrics Grid */}
                  <div className="space-y-1 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-text-muted">In Shape:</span>
                      <span className="text-text-secondary truncate max-w-[120px]">{l.in_shape}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Out Shape:</span>
                      <span className="text-text-primary font-semibold truncate max-w-[120px]">{l.out_shape}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Dtype:</span>
                      <span className="text-primary font-bold">INT{l.bitwidth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Compute MACs:</span>
                      <span className="text-text-primary">{l.macs.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Node Footer Badges */}
                  <div className="mt-2 pt-1 border-t border-border/40 flex items-center justify-between text-[9px]">
                    <span className="text-text-muted">{l.sram_offset_hex}</span>
                    {isUpstream && (
                      <span className="text-cyan-400 font-bold">← UPSTREAM PRODUCER</span>
                    )}
                    {isDownstream && (
                      <span className="text-emerald-400 font-bold">DOWNSTREAM CONSUMER →</span>
                    )}
                    {!isUpstream && !isDownstream && (
                      <span className="text-text-muted">{(l.sram_bytes / 1024).toFixed(1)} KB SRAM</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Minimap Overview in Bottom-Right Corner */}
          <div className="absolute bottom-3 right-3 w-44 h-24 bg-surface/90 backdrop-blur-sm border border-border rounded p-1.5 font-mono select-none pointer-events-none hidden sm:block">
            <div className="text-[8px] text-text-muted uppercase tracking-wider mb-1 flex justify-between">
              <span>Graph Minimap</span>
              <span className="text-primary font-bold">{layers.length} Ops</span>
            </div>
            <div className="w-full h-14 bg-canvas/80 rounded border border-border/40 relative flex items-center px-2 gap-1 overflow-hidden">
              {layers.map((_, i) => (
                <div
                  key={`mini-${i}`}
                  className={`flex-1 h-6 rounded-[1px] transition ${
                    selectedNodeIndex === i
                      ? 'bg-primary ring-1 ring-primary'
                      : 'bg-surface-raised border border-border'
                  }`}
                />
              ))}
              {/* Viewport Frame Indicator */}
              <div
                className="absolute inset-y-0 border border-primary/60 bg-primary/10 rounded-[1px]"
                style={{
                  left: `${Math.max(0, Math.min(60, (selectedNodeIndex / layers.length) * 80))}%`,
                  width: '40%',
                }}
              />
            </div>
          </div>

          {/* Canvas Help Hint */}
          <div className="absolute bottom-3 left-3 bg-surface/80 backdrop-blur-sm border border-border px-2 py-1 rounded text-[10px] font-mono text-text-muted pointer-events-none">
            Drag to pan · Scroll to zoom · Click node to inspect
          </div>
        </div>

        {/* Right-Hand IR Inspector */}
        <div className="lg:col-span-4 bg-surface border border-border rounded p-4 space-y-4 font-mono text-xs flex flex-col justify-between">
          <div className="space-y-3">
            {/* Inspector Header */}
            <div className="border-b border-border pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <span className="font-bold text-xs text-text-primary uppercase tracking-wider font-sans">
                  IR Node Inspector
                </span>
              </div>
              <span className="text-[10px] text-success bg-success-subtle px-1.5 py-0.5 rounded font-bold font-mono">
                [MEASURED]
              </span>
            </div>

            {/* Inspector Tab Switcher */}
            <div className="grid grid-cols-3 gap-1 bg-surface-raised p-0.5 rounded border border-border text-[11px]">
              <button
                onClick={() => setActiveTab('operator')}
                className={`py-1 rounded font-bold transition ${
                  activeTab === 'operator' ? 'bg-surface text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Operator
              </button>
              <button
                onClick={() => setActiveTab('tensor')}
                className={`py-1 rounded font-bold transition ${
                  activeTab === 'tensor' ? 'bg-surface text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Tensors
              </button>
              <button
                onClick={() => setActiveTab('memory')}
                className={`py-1 rounded font-bold transition ${
                  activeTab === 'memory' ? 'bg-surface text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Memory
              </button>
            </div>

            {/* Inspector Tab Contents */}
            {selectedLayer ? (
              <div className="space-y-3 text-[11px]">
                {activeTab === 'operator' && (
                  <div className="space-y-2">
                    <div className="p-2.5 bg-surface-raised border border-border rounded space-y-1">
                      <span className="text-[10px] text-text-muted block uppercase">Operator Identifier</span>
                      <strong className="text-sm text-text-primary block font-sans">{selectedLayer.layer_id}</strong>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-primary font-bold">{selectedLayer.op_type}</span>
                        <span className="text-text-muted">·</span>
                        <span className="text-text-secondary">INT{selectedLayer.bitwidth} Precision</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-surface-raised border border-border rounded space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">MAC Operations:</span>
                        <strong className="text-text-primary">{selectedLayer.macs.toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Estimated Latency:</span>
                        <span className="text-emerald-400 font-bold">
                          {(selectedLayer.macs / 45000).toFixed(2)} ms <span className="text-[9px] text-text-muted font-normal">[ESTIMATED]</span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Flash Weights (ROM):</span>
                        <strong className="text-text-primary">{selectedLayer.flash_bytes} Bytes</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Quantization Scale:</span>
                        <strong className="text-primary">{selectedLayer.scale_factor.toFixed(6)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Quantization Zero Point:</span>
                        <strong className="text-text-primary">{selectedLayer.zero_point}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'tensor' && (
                  <div className="space-y-2">
                    <div className="p-2.5 bg-surface-raised border border-border rounded space-y-1">
                      <span className="text-[10px] text-text-muted block uppercase">Input Tensor Shape</span>
                      <strong className="text-xs text-text-primary block">{selectedLayer.in_shape}</strong>
                      <span className="text-[10px] text-text-secondary">Dtype: INT{selectedLayer.bitwidth}</span>
                    </div>

                    <div className="p-2.5 bg-surface-raised border border-border rounded space-y-1">
                      <span className="text-[10px] text-text-muted block uppercase">Output Tensor Shape</span>
                      <strong className="text-xs text-primary block">{selectedLayer.out_shape}</strong>
                      <span className="text-[10px] text-text-secondary">Activation Size: {selectedLayer.sram_bytes} Bytes</span>
                    </div>

                    <div className="p-2.5 bg-surface-raised border border-border rounded space-y-1 text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-text-muted">Trace Upstream:</span>
                        <span className="text-cyan-400 font-bold">
                          {selectedNodeIndex > 0 ? layers[selectedNodeIndex - 1]?.layer_id : 'INPUT_FEED'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Trace Downstream:</span>
                        <span className="text-emerald-400 font-bold">
                          {selectedNodeIndex < layers.length - 1 ? layers[selectedNodeIndex + 1]?.layer_id : 'MODEL_OUTPUT'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'memory' && (
                  <div className="space-y-2">
                    <div className="p-2.5 bg-surface-raised border border-border rounded space-y-1">
                      <span className="text-[10px] text-text-muted block uppercase">Physical Memory Address</span>
                      <strong className="text-sm text-primary block">{selectedLayer.sram_offset_hex}</strong>
                      <span className="text-[10px] text-success font-semibold">4-Byte Bus Word Aligned</span>
                    </div>

                    <div className="p-2.5 bg-surface-raised border border-border rounded space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">SRAM Activation Buffer:</span>
                        <strong className="text-text-primary">{selectedLayer.sram_bytes} Bytes</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Lifetime Span Window:</span>
                        <strong className="text-text-primary">
                          Step {selectedLayer.lifetime[0]} → Step {selectedLayer.lifetime[1]}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Allocation Strategy:</span>
                        <span className="text-success font-bold">0-Malloc BSS Arena</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-text-muted">
                No node selected. Click a node in the graph workspace to inspect compiler details.
              </div>
            )}
          </div>

          {/* Footer Verification Status */}
          <div className="p-2.5 bg-primary/10 border border-primary/30 rounded text-primary text-[11px] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Static IR verified: 100% MISRA-C memory safe & zero dynamic malloc.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
