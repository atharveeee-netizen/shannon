import React, { useState, useRef } from 'react';
import { GraphNode, GraphEdge } from '../types';
import { Plus, Trash2, ArrowRight, Layers } from 'lucide-react';

interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  activeNodeId: string;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onUpdateNode: (node: GraphNode) => void;
  onDeleteNode: (nodeId: string) => void;
  onAddNode: (type?: GraphNode['type']) => void;
  onAddEdge: (sourceId: string, targetId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  nodes,
  edges,
  activeNodeId,
  selectedNodeId,
  onSelectNode,
  onUpdateNode,
  onDeleteNode,
  onAddNode,
  onAddEdge,
  onDeleteEdge,
}) => {
  const canvasRef = useRef<SVGSVGElement | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);

  const handleMouseDownNode = (e: React.MouseEvent, node: GraphNode) => {
    e.stopPropagation();
    onSelectNode(node.id);
    setDraggingNodeId(node.id);
    setDragOffset({
      x: e.clientX - node.x,
      y: e.clientY - node.y,
    });
  };

  const handleMouseMoveCanvas = (e: React.MouseEvent) => {
    if (!draggingNodeId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(20, Math.min(rect.width - 240, e.clientX - dragOffset.x));
    const newY = Math.max(20, Math.min(rect.height - 110, e.clientY - dragOffset.y));

    const targetNode = nodes.find((n) => n.id === draggingNodeId);
    if (targetNode) {
      onUpdateNode({ ...targetNode, x: newX, y: newY });
    }
  };

  const handleMouseUpCanvas = () => {
    setDraggingNodeId(null);
  };

  const handleNodeClickConnect = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (!connectingSourceId) {
      setConnectingSourceId(nodeId);
    } else {
      if (connectingSourceId !== nodeId) {
        onAddEdge(connectingSourceId, nodeId);
      }
      setConnectingSourceId(null);
    }
  };

  const getNodeCenter = (nodeId: string) => {
    const n = nodes.find((x) => x.id === nodeId);
    if (!n) return { x: 0, y: 0 };
    return { x: n.x + 110, y: n.y + 45 };
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div
      className="relative w-full h-[580px] bg-slate-950/80 rounded-xl border border-slate-800 backdrop-blur-md overflow-hidden flex flex-col shadow-2xl"
      onMouseMove={handleMouseMoveCanvas}
      onMouseUp={handleMouseUpCanvas}
      onClick={() => {
        onSelectNode(null);
        setConnectingSourceId(null);
      }}
    >
      <div className="h-12 border-b border-slate-800 px-4 flex items-center justify-between bg-slate-900/90 z-10">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-mono uppercase tracking-wider">NEURAL NETWORK COMPUTATIONAL GRAPH (DAG)</span>
          <span className="text-slate-400 font-mono text-[11px]">
            ({nodes.length} Layers, {edges.length} Tensor Pipes)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {connectingSourceId && (
            <span className="text-xs text-amber-300 bg-amber-500/20 px-3 py-1 rounded border border-amber-500/40 animate-pulse">
              Click destination layer to route tensor...
            </span>
          )}

          <button
            onClick={() => onAddNode('Conv2D')}
            className="px-2.5 py-1 text-xs font-medium bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 rounded flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add Layer
          </button>
        </div>
      </div>

      <div className="relative flex-1 w-full h-full overflow-hidden">
        <svg ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <linearGradient id="tensorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
            </linearGradient>
            <marker id="arrow" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
            </marker>
          </defs>

          {edges.map((edge) => {
            const start = getNodeCenter(edge.sourceNodeId);
            const end = getNodeCenter(edge.targetNodeId);
            const dx = end.x - start.x;
            const curve = Math.abs(dx) * 0.4;
            const path = `M ${start.x} ${start.y} C ${start.x + curve} ${start.y}, ${end.x - curve} ${end.y}, ${end.x} ${end.y}`;

            return (
              <g key={edge.id} className="pointer-events-auto group cursor-pointer" onClick={(e) => { e.stopPropagation(); onDeleteEdge(edge.id); }}>
                <path d={path} fill="none" stroke="url(#tensorGradient)" strokeWidth="2.5" markerEnd="url(#arrow)" />
                <circle cx={(start.x + end.x) / 2} cy={(start.y + end.y) / 2} r="12" fill="#0f172a" stroke="#334155" />
                <text x={(start.x + end.x) / 2} y={(start.y + end.y) / 2 + 3} textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                  {edge.tensorShape || 'INT8'}
                </text>
              </g>
            );
          })}
        </svg>

        {nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const isActive = activeNodeId === node.id;

          let badgeColor = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
          if (node.type === 'Conv2D' || node.type === 'DepthwiseConv2D') badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
          if (node.type === 'Dense') badgeColor = 'bg-purple-500/20 text-purple-300 border-purple-500/40';
          if (node.type === 'Input' || node.type === 'Output') badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';

          return (
            <div
              key={node.id}
              style={{ left: `${node.x}px`, top: `${node.y}px` }}
              onMouseDown={(e) => handleMouseDownNode(e, node)}
              className={`absolute w-56 rounded-xl border p-3 cursor-grab select-none backdrop-blur-lg transition-all duration-150 z-10 ${
                isActive
                  ? 'bg-emerald-950/90 border-emerald-400 shadow-xl shadow-emerald-500/20 ring-2 ring-emerald-400 scale-[1.03]'
                  : isSelected
                  ? 'bg-slate-900/90 border-cyan-400 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${badgeColor}`}>
                  {node.type}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => handleNodeClickConnect(e, node.id)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-[10px] font-mono flex items-center gap-0.5"
                    title="Connect Tensor Pipe"
                  >
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteNode(node.id); }}
                    className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                    title="Delete Layer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <h4 className="font-bold text-xs text-white font-mono truncate">{node.name}</h4>
              <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>{node.shape}</span>
                <span className="text-emerald-400 font-semibold">{Math.round(node.sram_bytes / 1024)} KB SRAM</span>
              </div>
            </div>
          );
        })}

        {selectedNode && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-4 right-4 w-72 bg-slate-900/95 border border-slate-800 rounded-xl p-4 shadow-2xl backdrop-blur-xl z-20"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" /> Layer Parameters
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                INT8 Quantized
              </span>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">LAYER IDENTIFIER</label>
                <input
                  type="text"
                  value={selectedNode.name}
                  onChange={(e) => onUpdateNode({ ...selectedNode, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-[9px] text-slate-500 block">TENSOR SHAPE</span>
                  <span className="text-white font-bold text-xs">{selectedNode.shape}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-[9px] text-slate-500 block">TOTAL MACs</span>
                  <span className="text-cyan-400 font-bold text-xs">{selectedNode.macs.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-[9px] text-slate-500 block">SRAM BUFFER</span>
                  <span className="text-emerald-400 font-bold text-xs">{(selectedNode.sram_bytes / 1024).toFixed(1)} KB</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-[9px] text-slate-500 block">FLASH WEIGHTS</span>
                  <span className="text-purple-400 font-bold text-xs">{(selectedNode.flash_bytes / 1024).toFixed(1)} KB</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};