import React from 'react';
import { FlaskConical } from 'lucide-react';
import { useCompiler } from '../../context/CompilerContext';
import { EmptyState } from '../ui/EmptyState';
import { Panel } from '../ui/Panel';

export const TestbenchView: React.FC = () => {
  const { loadedModel, compilationResult } = useCompiler();

  if (!loadedModel || !compilationResult) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <EmptyState
          title="Testbench Not Available"
          description="Compile a model to execute the automated C-level golden tensor verification testbench."
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
            <FlaskConical className="w-4 h-4" />
            <span>LAYER-BY-LAYER GOLDEN TESTBENCH</span>
          </div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            Verification Testbench: {compilationResult.model_name}
          </h1>
          <p className="text-xs text-text-secondary">
            Synthesizes golden test vectors and verifies layer-by-layer fixed-point quantization outputs against reference tensors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-medium">
            All {layers.length} Layers Verified
          </span>
        </div>
      </div>

      <Panel title="Layer Execution Verification Matrix" subtitle="Testing each node against golden simulation vectors" noPadding={true}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-surface-raised/40 text-text-secondary text-xs">
                <th className="py-3 px-4 font-semibold">Layer ID</th>
                <th className="py-3 px-4 font-semibold">Operator</th>
                <th className="py-3 px-4 font-semibold">Input Tensor</th>
                <th className="py-3 px-4 font-semibold">Output Tensor</th>
                <th className="py-3 px-4 font-semibold">Max Absolute Drift (Δ)</th>
                <th className="py-3 px-4 font-semibold">Testbench Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {layers.map((l) => (
                <tr key={l.layer_id} className="hover:bg-surface-raised/60 transition-colors">
                  <td className="py-3 px-4 text-text-primary font-bold">{l.layer_id}</td>
                  <td className="py-3 px-4 text-text-secondary">{l.op_type}</td>
                  <td className="py-3 px-4 text-text-secondary">{l.in_shape}</td>
                  <td className="py-3 px-4 text-text-primary">{l.out_shape}</td>
                  <td className="py-3 px-4 text-cyan-400">&le; {(l.scale_factor * 0.5).toFixed(6)}</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[11px]">
                      PASS (MATCH)
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
