import React from 'react';
import { BarChart3, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useCompiler } from '../../context/CompilerContext';
import { EmptyState } from '../ui/EmptyState';
import { Panel } from '../ui/Panel';
import { CanvasBarChart } from '../ui/CanvasChart';
import { evaluateMultiTargetBenchmarks } from '../../compiler/benchmarks';
import { getPresetGraphById } from '../../compiler/presets';

export const BenchmarksView: React.FC = () => {
  const { loadedModel, compilationResult, selectedHw, setHardware } = useCompiler();

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

  // Data for latency comparison bar chart
  const latencyBarItems = benchmarks.map((bm) => ({
    label: bm.hardware_name,
    value: bm.estimated_latency_ms,
    formattedValue: `${bm.estimated_latency_ms} ms`,
    color: bm.hardware_id === selectedHw.id ? '#10B981' : '#F59E0B',
  }));

  // Data for SRAM utilization bar chart
  const sramBarItems = benchmarks.map((bm) => ({
    label: bm.hardware_name,
    value: bm.sram_utilization_pct,
    maxValue: 100,
    formattedValue: `${bm.sram_utilization_pct}%`,
    color: bm.sram_utilization_pct > 90 ? '#F43F5E' : bm.sram_utilization_pct > 75 ? '#F59E0B' : '#06B6D4',
  }));

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

      {/* Visual Benchmark Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel
          title="Inference Latency Projection (ms)"
          subtitle="Cycle-accurate estimation accounting for core clock MHz and vector SIMD capabilities"
        >
          <CanvasBarChart items={latencyBarItems} height={170} unit=" ms" />
        </Panel>

        <Panel
          title="Static SRAM Arena Utilization (%)"
          subtitle="Percentage of target MCU physical SRAM allocated to the zero-malloc tensor arena"
        >
          <CanvasBarChart items={sramBarItems} height={170} unit="%" />
        </Panel>
      </div>

      {/* Microcontroller Benchmark Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {benchmarks.map((bm) => {
          const isSelected = bm.hardware_id === selectedHw.id;
          return (
            <div
              key={bm.hardware_id}
              className={`p-4 rounded bg-surface border transition-all space-y-3 ${
                isSelected ? 'border-accent ring-1 ring-accent bg-surface-raised/40' : 'border-border hover:border-border-strong'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-text-primary">{bm.hardware_name}</span>
                  {isSelected && (
                    <span className="px-1.5 py-0.2 rounded bg-accent/20 text-accent text-[10px] font-mono font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>
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
                <div className="flex justify-between text-text-secondary pt-1 border-t border-border">
                  <span>Silicon Fit:</span>
                  {bm.fits ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> FITS MCU
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> EXCEEDS LIMITS
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] font-mono">
                <span className="text-text-muted">{bm.provenance}</span>
                {!isSelected && (
                  <button
                    onClick={() => setHardware(bm.hardware_id)}
                    className="px-2 py-1 rounded bg-surface-raised hover:bg-surface-hover border border-border text-text-primary text-[11px]"
                  >
                    Select Target
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
