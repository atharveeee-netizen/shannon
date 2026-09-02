import React from 'react';
import { Search } from 'lucide-react';
import { useCompiler } from '../../context/CompilerContext';
import { EmptyState } from '../ui/EmptyState';
import { Panel } from '../ui/Panel';

export const TensorInspectorView: React.FC = () => {
  const { loadedModel, compilationResult } = useCompiler();

  if (!loadedModel || !compilationResult) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <EmptyState
          title="Tensor Inspector Not Available"
          description="Compile a model to inspect intermediate activation tensors, buffer sizes, byte alignments, and memory addresses."
          allowCompile={true}
        />
      </div>
    );
  }

  const layers = compilationResult.layers || [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-accent">
            <Search className="w-4 h-4" />
            <span>INTERMEDIATE ACTIVATION TENSOR INSPECTION</span>
          </div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            Tensor Inspector: {compilationResult.model_name}
          </h1>
          <p className="text-xs text-text-secondary">
            Per-tensor byte dimensions, lifetime intervals, quantization scaling, and physical section alignments.
          </p>
        </div>
      </div>

      <Panel title="All Model Activation Tensors" subtitle="Inspecting intermediate execution state" noPadding={true}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-surface-raised/40 text-text-secondary text-xs">
                <th className="py-3 px-4 font-semibold">Producing Layer</th>
                <th className="py-3 px-4 font-semibold">Output Tensor ID</th>
                <th className="py-3 px-4 font-semibold">Shape</th>
                <th className="py-3 px-4 font-semibold">Datatype</th>
                <th className="py-3 px-4 font-semibold">Buffer Size</th>
                <th className="py-3 px-4 font-semibold">SRAM Section</th>
                <th className="py-3 px-4 font-semibold">Lifetime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {layers.map((l, idx) => (
                <tr key={idx} className="hover:bg-surface-raised/60 transition-colors">
                  <td className="py-3 px-4 text-text-primary font-bold">{l.layer_id}</td>
                  <td className="py-3 px-4 text-accent font-semibold">{l.outputs.join(', ')}</td>
                  <td className="py-3 px-4 text-text-primary">{l.out_shape}</td>
                  <td className="py-3 px-4 text-text-secondary">INT{l.bitwidth}</td>
                  <td className="py-3 px-4 text-text-primary">{l.sram_bytes} Bytes</td>
                  <td className="py-3 px-4 text-cyan-400 font-bold">{l.sram_offset_hex}</td>
                  <td className="py-3 px-4 text-text-secondary">[{l.lifetime[0]}, {l.lifetime[1]}]</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};
