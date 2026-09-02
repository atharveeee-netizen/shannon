import React from 'react';
import { BarChart3 } from 'lucide-react';
import { useCompiler } from '../../context/CompilerContext';
import { EmptyState } from '../ui/EmptyState';
import { evaluateMultiTargetBenchmarks } from '../../compiler/benchmarks';
import { getPresetGraphById } from '../../compiler/presets';

export const BenchmarksView: React.FC = () => {
  const { loadedModel, compilationResult } = useCompiler();

  if (!loadedModel || !compilationResult) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <EmptyState
          title="Benchmark Telemetry Not Available"
          description="Compile a model to generate cycle-accurate execution latency models and multi-MCU benchmark telemetry."
          allowCompile={true}
        />
      </div>
    );
  }

  const graph = loadedModel.rawGraph || getPresetGraphById(loadedModel.id);
  const benchmarks = evaluateMultiTargetBenchmarks(graph);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-accent">
            <BarChart3 className="w-4 h-4" />
            <span>SILICON BENCHMARK TELEMETRY & PROVENANCE</span>
          </div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            Cross-Microcontroller Benchmark: {compilationResult.model_name}
          </h1>
          <p className="text-xs text-text-secondary">
            Deterministic static cycle modeling and hardware execution benchmarks with explicit source provenance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {benchmarks.map((bm) => (
          <div key={bm.hardware_id} className="p-4 rounded bg-surface border border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-text-primary">{bm.hardware_name}</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface-raised border border-border text-accent font-medium">
                {bm.clock_mhz} MHz
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between text-text-secondary">
                <span>Architecture:</span>
                <span className="text-text-primary font-medium">{bm.arch}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Estimated Latency:</span>
                <span className="text-amber-400 font-bold">{bm.estimated_latency_ms} ms</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Flash Util:</span>
                <span className="text-text-primary">{bm.flash_utilization_pct}% ({bm.flash_total_kb} KB max)</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>SRAM Util:</span>
                <span className="text-cyan-400">{bm.sram_utilization_pct}% ({bm.sram_total_kb} KB max)</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] font-mono text-text-muted">
              <span>Provenance:</span>
              <span className="text-text-secondary font-medium">{bm.provenance}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
