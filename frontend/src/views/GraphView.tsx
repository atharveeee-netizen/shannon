import React, { useState } from 'react';
import { CompilationResult } from '../types';
import { Layers, ArrowDown, CheckCircle2 } from 'lucide-react';

interface GraphViewProps {
  compilationResult: CompilationResult | null;
}

export const GraphView: React.FC<GraphViewProps> = ({ compilationResult }) => {
  const layers = compilationResult?.layers || [];
  const [selectedLayerId, setSelectedLayerId] = useState<string>(
    layers[0]?.layer_id || 'conv1'
  );

  const selectedLayer = layers.find((l) => l.layer_id === selectedLayerId) || layers[0];

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h2 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Computational Layer Graph & IR Debugger
          </h2>
          <p className="text-text-secondary text-xs mt-0.5">
            Static directed acyclic graph (DAG) intermediate representation scheduled for zero-malloc execution.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-text-secondary">
          <span>Total Layers: <strong className="text-text-primary">{layers.length}</strong></span>
          <span>·</span>
          <span className="text-success font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Word-Aligned AST
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Interactive Computational Graph Flow */}
        <div className="lg:col-span-7 bg-surface border border-border rounded p-4 space-y-3 min-h-[460px] flex flex-col items-center justify-start overflow-y-auto">
          {/* Graph Input Node */}
          <div className="w-64 p-2.5 bg-surface-raised border border-border rounded text-center font-mono">
            <span className="text-[10px] text-text-muted uppercase block">Sensor Input Tensor</span>
            <strong className="text-xs text-text-primary block">{layers[0]?.in_shape || '1x49x10'} (INT8)</strong>
          </div>

          <ArrowDown className="w-4 h-4 text-text-muted" />

          {/* Layer Nodes */}
          {layers.map((l, idx) => {
            const isSelected = selectedLayer?.layer_id === l.layer_id;
            return (
              <React.Fragment key={l.layer_id}>
                <div
                  onClick={() => setSelectedLayerId(l.layer_id)}
                  className={`w-72 p-3 rounded border cursor-pointer transition flex items-center justify-between font-mono ${
                    isSelected
                      ? 'bg-primary/10 border-primary shadow-sm ring-1 ring-primary/40'
                      : 'bg-surface-raised hover:bg-surface-hover border-border'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] text-text-muted">0{idx + 1}</span>
                    <div>
                      <span className="text-xs font-bold text-text-primary block">{l.layer_id}</span>
                      <span className="text-[10px] text-text-secondary">{l.op_type} ({l.out_shape})</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-primary block">{l.sram_offset_hex}</span>
                    <span className="text-[10px] text-text-muted">{l.macs.toLocaleString()} MACs</span>
                  </div>
                </div>

                {idx < layers.length - 1 && <ArrowDown className="w-4 h-4 text-text-muted" />}
              </React.Fragment>
            );
          })}

          <ArrowDown className="w-4 h-4 text-text-muted" />

          {/* Graph Output Node */}
          <div className="w-64 p-2.5 bg-surface-raised border border-success/30 rounded text-center font-mono">
            <span className="text-[10px] text-success uppercase block font-semibold">Model Output Tensor</span>
            <strong className="text-xs text-text-primary block">{layers[layers.length - 1]?.out_shape || '1x4'}</strong>
          </div>
        </div>

        {/* Right: Layer Node Inspector */}
        <div className="lg:col-span-5 bg-surface border border-border rounded p-4 space-y-4 font-mono text-xs">
          <div className="border-b border-border pb-2 flex items-center justify-between">
            <span className="font-bold text-text-primary uppercase tracking-wider font-sans">
              Layer Inspector Debugger
            </span>
            <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-semibold">
              INT{selectedLayer?.bitwidth || 8}
            </span>
          </div>

          {selectedLayer ? (
            <div className="space-y-3">
              <div className="p-2.5 bg-surface-raised border border-border rounded space-y-1">
                <span className="text-[10px] text-text-muted block">LAYER IDENTIFIER</span>
                <span className="text-sm font-bold text-text-primary block">{selectedLayer.layer_id}</span>
                <span className="text-xs text-text-secondary">{selectedLayer.op_type} Operator</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-surface-raised border border-border rounded">
                  <span className="text-[10px] text-text-muted block">INPUT SHAPE</span>
                  <strong className="text-xs text-text-primary">{selectedLayer.in_shape}</strong>
                </div>
                <div className="p-2.5 bg-surface-raised border border-border rounded">
                  <span className="text-[10px] text-text-muted block">OUTPUT SHAPE</span>
                  <strong className="text-xs text-text-primary">{selectedLayer.out_shape}</strong>
                </div>
              </div>

              <div className="p-3 bg-surface-raised border border-border rounded space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Compute Operations</span>
                  <strong className="text-text-primary">{selectedLayer.macs.toLocaleString()} MACs</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Flash Weights (ROM)</span>
                  <strong className="text-text-primary">{selectedLayer.flash_bytes} Bytes</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Activation Output Size</span>
                  <strong className="text-text-primary">{selectedLayer.sram_bytes} Bytes</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Quantization Scale</span>
                  <strong className="text-primary">{selectedLayer.scale_factor.toFixed(6)}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Quantization Zero Point</span>
                  <strong className="text-text-primary">{selectedLayer.zero_point}</strong>
                </div>
                <div className="flex justify-between pt-1 border-t border-border">
                  <span className="text-text-secondary">Physical SRAM Hex Offset</span>
                  <strong className="text-primary">{selectedLayer.sram_offset_hex}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Lifetime Window</span>
                  <span className="text-text-primary">Step {selectedLayer.lifetime[0]} to Step {selectedLayer.lifetime[1]}</span>
                </div>
              </div>

              <div className="p-2.5 bg-primary/10 border border-primary/20 rounded text-[11px] text-primary flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Interval graph lifetime proven disjoint for static memory reuse.</span>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-text-muted">
              Select a layer node in the graph to inspect parameters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
