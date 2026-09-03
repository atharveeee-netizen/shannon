import React from 'react';
import { Layers } from 'lucide-react';
import { useCompiler } from '../../context/CompilerContext';
import { EmptyState } from '../ui/EmptyState';
import { Panel } from '../ui/Panel';
import { evaluateMultiTargetBenchmarks } from '../../compiler/benchmarks';
import { getPresetGraphById } from '../../compiler/presets';

export const CompareView: React.FC = () => {
  const { loadedModel, compilationResult, selectedHw, setHardware } = useCompiler();

  if (!loadedModel || !compilationResult) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <EmptyState
          title="Comparison Matrix Not Available"
          description="Compile a model to evaluate and compare silicon fit, latency, and SRAM footprint across all 5 supported microcontrollers."
          allowCompile={true}
        />
      </div>
    );
  }

  const graph = loadedModel.rawGraph || getPresetGraphById(loadedModel.id);
  const benchmarkMatrix = evaluateMultiTargetBenchmarks(graph);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-accent">
            <Layers className="w-4 h-4" />
            <span>CROSS-SILICON COMPARISON MATRIX</span>
          </div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            Multi-Target Evaluation: {compilationResult.model_name}
          </h1>
          <p className="text-xs text-text-secondary">
            Comparative Flash ROM, static SRAM arena utilization, and SIMD latency projection across 5 MCU silicon architectures.
          </p>
        </div>
      </div>

      <Panel title="Silicon Target Comparison" subtitle="Derived from model MACs and target MCU hardware limits" noPadding={true}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-surface-raised/40 text-text-secondary text-xs">
                <th className="py-3 px-4 font-semibold">Silicon Target</th>
                <th className="py-3 px-4 font-semibold">Architecture</th>
                <th className="py-3 px-4 font-semibold">Clock</th>
                <th className="py-3 px-4 font-semibold">Flash Util (%)</th>
                <th className="py-3 px-4 font-semibold">SRAM Util (%)</th>
                <th className="py-3 px-4 font-semibold">Est. Latency</th>
                <th className="py-3 px-4 font-semibold">Silicon Fit</th>
                <th className="py-3 px-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {benchmarkMatrix.map((item) => {
                const isCurrent = item.hardware_id === selectedHw.id;
                return (
                  <tr key={item.hardware_id} className={`hover:bg-surface-raised/60 transition-colors ${isCurrent ? 'bg-surface-raised' : ''}`}>
                    <td className="py-3 px-4 text-text-primary font-bold">
                      <div className="flex items-center gap-2">
                        <span>{item.hardware_name}</span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.2 rounded bg-accent/20 text-accent text-[10px] font-bold">
                            CURRENT
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-text-secondary">{item.arch}</td>
                    <td className="py-3 px-4 text-text-primary">{item.clock_mhz} MHz</td>
                    <td className="py-3 px-4 text-text-primary">{item.flash_utilization_pct}%</td>
                    <td className="py-3 px-4 text-cyan-400">{item.sram_utilization_pct}%</td>
                    <td className="py-3 px-4 text-amber-400 font-bold">{item.estimated_latency_ms} ms</td>
                    <td className="py-3 px-4">
                      {item.fits ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
                          FITS MCU
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-medium">
                          EXCEEDS MCU
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {!isCurrent && (
                        <button
                          onClick={() => setHardware(item.hardware_id)}
                          className="px-2.5 py-1 rounded bg-surface border border-border hover:border-accent text-text-primary text-xs"
                        >
                          Select
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};
