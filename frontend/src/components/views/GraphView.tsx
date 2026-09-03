import React, { useState, useMemo } from 'react';
import {
  GitMerge,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';
import { useCompiler } from '../../context/CompilerContext';
import { EmptyState } from '../ui/EmptyState';
import { LayerData } from '../../types';
import { SpotlightCard } from '../react-bits/SpotlightCard';

export const GraphView: React.FC = () => {
  const { loadedModel, compilationResult, selectedNodeId, setSelectedNodeId } = useCompiler();

  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);

  const layers: LayerData[] = compilationResult?.layers || [];

  const selectedLayer = useMemo(() => {
    if (!selectedNodeId && layers.length > 0) return layers[0];
    return layers.find((l) => l.layer_id === selectedNodeId) || layers[0] || null;
  }, [layers, selectedNodeId]);

  if (!loadedModel || layers.length === 0) {
    return (
      <div className="p-6 w-full max-w-none">
        <EmptyState
          title="No Computation Graph Available"
          description="Import or compile a model to construct its verified Dataflow Computation Graph (DAG) with exact tensor shapes and memory offsets."
          allowCompile={true}
        />
      </div>
    );
  }

  const filteredLayers = layers.filter(
    (l) =>
      l.layer_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.op_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-4 w-full max-w-none h-full flex flex-col">
      {/* 1. Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4 flex-shrink-0">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-semibold">
            <GitMerge className="w-4 h-4" />
            <span>DAG COMPUTATION WORKSTATION</span>
          </div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            Computation Graph: {compilationResult?.model_name || loadedModel.name}
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Node Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search node or op..."
              className="bg-surface-raised text-text-primary text-xs pl-8 pr-3 py-1.5 rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-primary w-52 font-mono"
            />
          </div>

          {/* Zoom controls */}
          <div className="flex items-center border border-border rounded-md bg-surface-raised">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
              className="p-1.5 hover:text-text-primary text-text-muted transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-2 text-text-secondary">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
              className="p-1.5 hover:text-text-primary text-text-muted transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 hover:text-text-primary text-text-muted border-l border-border transition-colors cursor-pointer"
              title="Reset Zoom"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Workstation Body: Interactive Graph Flow + Node Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left 2 Cols: DAG Visual Flow */}
        <div className="lg:col-span-2 rounded-xl bg-surface border border-border p-6 overflow-y-auto custom-scrollbar relative flex flex-col space-y-4">
          <div className="flex items-center justify-between text-[11px] font-mono text-text-secondary pb-2 border-b border-border flex-shrink-0">
            <span>DATAFLOW DAG ({filteredLayers.length} NODES)</span>
            <span className="text-primary font-medium">Verified Sequential Execution Flow</span>
          </div>

          <div
            className="flex flex-col items-center space-y-3 transition-transform origin-top py-4"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* Input Buffer Node (Cyan) */}
            <div className="w-80 p-3.5 rounded-lg bg-primary/10 border border-primary/30 text-center font-mono text-xs space-y-1">
              <div className="text-[10px] uppercase text-primary font-bold">Input Tensor</div>
              <div className="font-bold text-text-primary">{layers[0]?.in_shape || loadedModel.input_shape}</div>
              <div className="text-[11px] text-cyan-400 font-medium">Physical Base: 0x20000000</div>
            </div>

            <div className="w-0.5 h-4 bg-border" />

            {/* Render Model Layer Nodes */}
            {filteredLayers.map((layer, idx) => {
              const isSelected = selectedLayer?.layer_id === layer.layer_id;
              const isConv = layer.op_type.includes('Conv') || layer.op_type.includes('Dense');
              const isPool = layer.op_type.includes('Pool');

              return (
                <React.Fragment key={layer.layer_id}>
                  <div
                    onClick={() => setSelectedNodeId(layer.layer_id)}
                    className={`w-84 rounded-lg p-3.5 border transition-all cursor-pointer select-none relative ${
                      isSelected
                        ? 'bg-surface-elevated border-primary ring-1 ring-primary shadow-md'
                        : isConv
                        ? 'bg-surface-raised/80 border-border hover:border-primary/50'
                        : isPool
                        ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/50'
                        : 'bg-surface-raised/60 border-border hover:border-border-strong'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-border text-xs">
                      <span className="font-bold text-text-primary">{layer.layer_id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isConv
                          ? 'bg-primary/15 text-primary border border-primary/30'
                          : isPool
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-surface-raised text-text-secondary border border-border'
                      }`}>
                        {layer.op_type}
                      </span>
                    </div>

                    <div className="pt-2 grid grid-cols-2 gap-2 text-xs font-mono text-text-secondary">
                      <div>
                        <span className="text-text-muted text-[10px] block">OUT SHAPE:</span>
                        <span className="text-text-primary font-medium">{layer.out_shape}</span>
                      </div>
                      <div>
                        <span className="text-text-muted text-[10px] block">COMPUTE:</span>
                        <span className="text-text-primary font-medium">{layer.macs.toLocaleString()} MACs</span>
                      </div>
                      <div>
                        <span className="text-text-muted text-[10px] block">SRAM OFFSET:</span>
                        <span className="text-cyan-400 font-medium">{layer.sram_offset_hex}</span>
                      </div>
                      <div>
                        <span className="text-text-muted text-[10px] block">FLASH:</span>
                        <span className="text-text-primary font-medium">{layer.flash_bytes} B</span>
                      </div>
                    </div>
                  </div>

                  {idx < filteredLayers.length - 1 && <div className="w-0.5 h-4 bg-border" />}
                </React.Fragment>
              );
            })}

            <div className="w-0.5 h-4 bg-border" />

            {/* Output Node (Amber) */}
            <div className="w-80 p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-center font-mono text-xs space-y-1">
              <div className="text-[10px] uppercase text-amber-400 font-bold">Output Prediction Buffer</div>
              <div className="font-bold text-text-primary">
                {layers[layers.length - 1]?.out_shape || '1x4'}
              </div>
              <div className="text-[11px] text-amber-400 font-medium">
                Output Offset: {layers[layers.length - 1]?.sram_offset_hex || '0x20000400'}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Synchronized Contextual Inspector */}
        <div className="space-y-4">
          <SpotlightCard className="p-4 space-y-4">
            <div className="border-b border-border pb-2">
              <span className="text-xs font-bold text-text-primary block">
                {selectedLayer ? `Node: ${selectedLayer.layer_id}` : 'Node Inspector'}
              </span>
              <span className="text-[11px] font-mono text-text-muted block">
                {selectedLayer ? `Operator Type: ${selectedLayer.op_type}` : 'Select a node in DAG'}
              </span>
            </div>

            {selectedLayer ? (
              <div className="space-y-4 text-xs font-mono">
                <div className="space-y-2 pb-3 border-b border-border">
                  <div className="flex justify-between py-1 text-text-secondary">
                    <span>Operator:</span>
                    <span className="text-primary font-bold">{selectedLayer.op_type}</span>
                  </div>
                  <div className="flex justify-between py-1 text-text-secondary">
                    <span>Input Shape:</span>
                    <span className="text-text-primary">{selectedLayer.in_shape}</span>
                  </div>
                  <div className="flex justify-between py-1 text-text-secondary">
                    <span>Output Shape:</span>
                    <span className="text-text-primary">{selectedLayer.out_shape}</span>
                  </div>
                  <div className="flex justify-between py-1 text-text-secondary">
                    <span>Computation:</span>
                    <span className="text-amber-400 font-bold">{selectedLayer.macs.toLocaleString()} MACs</span>
                  </div>
                </div>

                <div className="space-y-2 pb-3 border-b border-border">
                  <div className="text-xs font-bold text-text-primary">Memory & Quantization</div>
                  <div className="flex justify-between py-1 text-text-secondary">
                    <span>Flash Weights:</span>
                    <span className="text-text-primary">{selectedLayer.flash_bytes} Bytes</span>
                  </div>
                  <div className="flex justify-between py-1 text-text-secondary">
                    <span>Activation Buffer:</span>
                    <span className="text-text-primary">{selectedLayer.sram_bytes} Bytes</span>
                  </div>
                  <div className="flex justify-between py-1 text-text-secondary">
                    <span>SRAM Physical Section:</span>
                    <span className="text-cyan-400 font-bold">{selectedLayer.sram_offset_hex}</span>
                  </div>
                  <div className="flex justify-between py-1 text-text-secondary">
                    <span>Quantization Scale:</span>
                    <span className="text-text-primary">{selectedLayer.scale_factor.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-text-secondary">
                    <span>Precision:</span>
                    <span className="text-emerald-400 font-bold">INT{selectedLayer.bitwidth} Symmetric</span>
                  </div>
                </div>

                {/* Layer Parameters */}
                {Object.keys(selectedLayer.params || {}).length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-text-primary">Operator Configuration</div>
                    <pre className="p-3 rounded-lg bg-surface-raised border border-border text-xs text-text-secondary overflow-x-auto">
                      {JSON.stringify(selectedLayer.params, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-text-muted">Click any node in the graph to inspect.</div>
            )}
          </SpotlightCard>
        </div>
      </div>
    </div>
  );
};
