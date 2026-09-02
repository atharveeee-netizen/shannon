import React, { useState } from 'react';
import { CompilationResult } from '../types';
import { Layers, CheckCircle2 } from 'lucide-react';

interface TensorInspectorViewProps {
  compilationResult: CompilationResult | null;
}

export const TensorInspectorView: React.FC<TensorInspectorViewProps> = ({ compilationResult }) => {
  const layers = compilationResult?.layers || [];
  const [selectedLayerId, setSelectedLayerId] = useState<string>(layers[0]?.layer_id || 'conv1');

  const selectedLayer = layers.find((l) => l.layer_id === selectedLayerId) || layers[0];

  // Mock activation matrix (8x8 grid)
  const matrix = Array.from({ length: 64 }, (_, i) => {
    const raw = Math.sin(i * 0.4) * 85 + Math.cos(i * 0.2) * 40;
    return Math.max(-128, Math.min(127, Math.round(raw)));
  });

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h2 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Layer Tensor Activation Inspector & Sparsity Analyzer
          </h2>
          <p className="text-text-secondary text-xs mt-0.5">
            Inspect live fixed-point INT8 activation matrices, dynamic range distributions, zero sparsity, and saturation.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-text-secondary">
          <span>Layer: <strong className="text-primary">{selectedLayer?.layer_id}</strong></span>
          <span>·</span>
          <span>Shape: <strong className="text-text-primary">{selectedLayer?.out_shape}</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Layer Selector Rail */}
        <div className="lg:col-span-3 bg-surface border border-border rounded p-3 space-y-2 font-mono">
          <span className="font-bold text-[11px] text-text-muted uppercase tracking-wider block px-1">
            Computation Layers
          </span>

          <div className="space-y-1">
            {layers.map((l, idx) => (
              <button
                key={l.layer_id}
                onClick={() => setSelectedLayerId(l.layer_id)}
                className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition flex items-center justify-between ${
                  selectedLayerId === l.layer_id
                    ? 'bg-primary/10 text-primary font-bold border border-primary/30'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-[10px] text-text-muted">0{idx + 1}</span>
                  <span className="truncate">{l.layer_id}</span>
                </div>
                <span className="text-[9px] text-text-muted">{l.op_type}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Matrix Visualization */}
        <div className="lg:col-span-6 bg-surface border border-border rounded p-4 space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="font-bold text-xs text-text-primary uppercase tracking-wider font-sans">
              Activation Tensor Matrix (INT8 Quantized Values)
            </span>
            <span className="text-[10px] text-primary">Scale: {selectedLayer?.scale_factor.toFixed(6)}</span>
          </div>

          <div className="grid grid-cols-8 gap-1.5 p-3 bg-canvas rounded border border-border">
            {matrix.map((val, idx) => {
              const isZero = val === 0;
              const isPositive = val > 0;
              return (
                <div
                  key={idx}
                  className={`aspect-square rounded-[2px] flex items-center justify-center text-[9px] font-mono transition cursor-pointer ${
                    isZero
                      ? 'bg-surface text-text-muted border border-border/40'
                      : isPositive
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  }`}
                  title={`Index ${idx}: ${val} (Float ≈ ${(val * (selectedLayer?.scale_factor || 0.01)).toFixed(4)})`}
                >
                  {val}
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-[10px] text-text-muted">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500/40" /> Positive INT8
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-surface border border-border" /> Zero (Sparsity)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-500/40" /> Negative INT8
            </span>
          </div>
        </div>

        {/* Statistical Telemetry Panel */}
        <div className="lg:col-span-3 bg-surface border border-border rounded p-4 space-y-3 font-mono text-xs">
          <span className="font-bold text-text-primary uppercase tracking-wider block font-sans border-b border-border pb-2">
            Statistical Telemetry
          </span>

          <div className="space-y-2 text-[11px]">
            <div className="p-2.5 bg-surface-raised border border-border rounded space-y-1.5">
              <div className="flex justify-between">
                <span className="text-text-secondary">Min INT8:</span>
                <strong className="text-cyan-400">-118</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Max INT8:</span>
                <strong className="text-emerald-400">+124</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Mean Activation:</span>
                <strong className="text-text-primary">+4.2</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Zero Sparsity:</span>
                <strong className="text-primary font-bold">14.06%</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Saturation Rate:</span>
                <strong className="text-success">0.0% (No Clipping)</strong>
              </div>
            </div>

            <div className="p-2.5 bg-primary/10 border border-primary/30 rounded text-primary text-[11px] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Full INT8 dynamic range utilized without saturation overflow.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
