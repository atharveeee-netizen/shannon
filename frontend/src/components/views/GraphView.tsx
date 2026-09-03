import React, { useState, useMemo } from 'react';
import {
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';
import { useCompiler } from '../../context/CompilerContext';
import { EmptyState } from '../ui/EmptyState';
import { LayerData } from '../../types';

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
        <div>
          <h1 className="text-2xl font-normal text-text-primary tracking-tight">
            Computation Graph
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {compilationResult?.model_name || loadedModel.name} &middot; Dataflow DAG ({layers.length} Nodes)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Node Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search node or operator..."
              className="bg-surface text-text-primary text-xs pl-8 pr-3 py-1.5 rounded-[6px] border border-border focus:outline-none focus:ring-1 focus:ring-primary w-56 font-sans"
            />
          </div>

          {/* Zoom controls */}
          <div className="flex items-center border border-border rounded-[6px] bg-surface">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
              className="p-1.5 hover:text-text-primary text-text-muted transition-colors cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono px-2 text-text-secondary">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
              className="p-1.5 hover:text-text-primary text-text-muted transition-colors cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 hover:text-text-primary text-text-muted border-l border-border transition-colors cursor-pointer"
              title="Reset zoom"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Workstation Body: Large Expansive Graph Canvas */}
      <div className="rounded-[8px] bg-surface border border-border p-6 overflow-y-auto custom-scrollbar relative flex-1 min-h-[500px]">
        <div className="flex items-center justify-between text-xs font-mono text-text-muted pb-3 border-b border-border">
          <span>Sequential execution pipeline</span>
          <span className="text-text-secondary">Click any node to inspect in the right panel</span>
        </div>

        <div
          className="flex flex-col items-center space-y-3 transition-transform origin-top py-6"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Input Tensor Node */}
          <div className="w-88 p-3.5 rounded-[6px] bg-surface-raised border border-border text-center text-xs space-y-1">
            <div className="text-xs text-text-muted uppercase tracking-wider font-medium">Input tensor</div>
            <div className="font-mono text-sm font-semibold text-text-primary">
              {layers[0]?.in_shape || loadedModel.input_shape}
            </div>
            <div className="text-xs font-mono text-text-secondary">Base: 0x20000000</div>
          </div>

          <div className="w-0.5 h-5 bg-border" />

          {/* Model Layer Nodes */}
          {filteredLayers.map((layer, idx) => {
            const isSelected = selectedLayer?.layer_id === layer.layer_id;

            return (
              <React.Fragment key={layer.layer_id}>
                <div
                  onClick={() => setSelectedNodeId(layer.layer_id)}
                  className={`w-88 rounded-[6px] p-3.5 border transition-all cursor-pointer select-none relative ${
                    isSelected
                      ? 'bg-surface-elevated border-primary ring-1 ring-primary'
                      : 'bg-surface-raised hover:bg-surface-elevated border-border'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-border text-xs">
                    <span className="font-semibold text-text-primary">{layer.layer_id}</span>
                    <span className="px-2 py-0.5 rounded-[4px] text-xs font-mono bg-surface border border-border text-text-secondary">
                      {layer.op_type}
                    </span>
                  </div>

                  <div className="pt-2 grid grid-cols-2 gap-2 text-xs font-mono">
                    <div>
                      <span className="text-text-muted block text-xs">Output shape:</span>
                      <span className="text-text-primary font-medium">{layer.out_shape}</span>
                    </div>
                    <div>
                      <span className="text-text-muted block text-xs">Compute:</span>
                      <span className="text-text-primary font-medium">{layer.macs.toLocaleString()} MACs</span>
                    </div>
                    <div>
                      <span className="text-text-muted block text-xs">SRAM offset:</span>
                      <span className="text-text-primary font-medium">{layer.sram_offset_hex}</span>
                    </div>
                    <div>
                      <span className="text-text-muted block text-xs">Flash weights:</span>
                      <span className="text-text-primary font-medium">{layer.flash_bytes} B</span>
                    </div>
                  </div>
                </div>

                {idx < filteredLayers.length - 1 && <div className="w-0.5 h-5 bg-border" />}
              </React.Fragment>
            );
          })}

          <div className="w-0.5 h-5 bg-border" />

          {/* Output Prediction Node */}
          <div className="w-88 p-3.5 rounded-[6px] bg-surface-raised border border-border text-center text-xs space-y-1">
            <div className="text-xs text-text-muted uppercase tracking-wider font-medium">Output prediction buffer</div>
            <div className="font-mono text-sm font-semibold text-text-primary">
              {layers[layers.length - 1]?.out_shape || '1x4'}
            </div>
            <div className="text-xs font-mono text-text-secondary">
              Offset: {layers[layers.length - 1]?.sram_offset_hex || '0x20000400'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
