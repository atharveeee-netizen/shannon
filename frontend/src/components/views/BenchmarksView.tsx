import React, { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { useCompiler } from '../../context/CompilerContext';
import { EmptyState } from '../ui/EmptyState';
import { Panel } from '../ui/Panel';
import { CanvasBarChart } from '../ui/CanvasChart';
import { evaluateMultiTargetBenchmarks, HARDWARE_PROFILES } from '../../compiler/benchmarks';
import { getPresetGraphById } from '../../compiler/presets';
import { SpotlightCard } from '../react-bits/SpotlightCard';

interface MatrixCellDetail {
  modelName: string;
  hardwareName: string;
  hardwareId: string;
  sramBytes: number;
  sramKbMax: number;
  sramPct: number;
  flashBytes: number;
  flashMbMax: number;
  flashPct: number;
  macs: number;
  latencyMs: number;
  fits: boolean;
  arch: string;
  simd: string;
}

export const BenchmarksView: React.FC = () => {
  const { loadedModel, compilationResult, selectedHw, setHardware } = useCompiler();
  const [selectedCell, setSelectedCell] = useState<MatrixCellDetail | null>(null);

  if (!loadedModel || !compilationResult) {
    return (
      <div className="p-6 w-full max-w-none">
        <EmptyState
          title="Benchmark Telemetry Not Available"
          description="Compile a model to generate cross-microcontroller benchmark matrix telemetry and hardware fit verification."
          allowCompile={true}
        />
      </div>
    );
  }

  const graph = loadedModel.rawGraph || getPresetGraphById(loadedModel.id);
  const benchmarks = evaluateMultiTargetBenchmarks(graph);

  // Define reference model benchmark specs
  const matrixModels = [
    {
      id: 'kws',
      name: 'Audio Keyword Spotter',
      domain: 'Audio KWS',
      sramBytes: 1120,
      flashBytes: 6144,
      macs: 46368,
    },
    {
      id: 'anomaly',
      name: 'Vibration Anomaly Autoencoder',
      domain: 'Industrial IoT',
      sramBytes: 512,
      flashBytes: 17408,
      macs: 17408,
    },
    {
      id: 'vision',
      name: 'MicroVision Person Detector',
      domain: 'Edge Vision',
      sramBytes: 18432,
      flashBytes: 7488,
      macs: 147456,
    },
  ];

  // Data for latency comparison bar chart
  const latencyBarItems = benchmarks.map((bm) => ({
    label: bm.hardware_name,
    value: bm.estimated_latency_ms,
    formattedValue: `${bm.estimated_latency_ms} ms`,
    color: bm.hardware_id === selectedHw.id ? '#0ea5e9' : '#f59e0b',
  }));

  // Data for SRAM utilization bar chart
  const sramBarItems = benchmarks.map((bm) => ({
    label: bm.hardware_name,
    value: bm.sram_utilization_pct,
    maxValue: 100,
    formattedValue: `${bm.sram_utilization_pct}%`,
    color: bm.sram_utilization_pct > 90 ? '#f43f5e' : bm.sram_utilization_pct > 75 ? '#f59e0b' : '#0ea5e9',
  }));

  return (
    <div className="p-6 space-y-6 w-full max-w-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-semibold">
            <BarChart3 className="w-4 h-4" />
            <span>CROSS-TARGET HARDWARE COMPARISON MATRIX</span>
          </div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            Multi-Model &times; Multi-MCU Silicon Matrix
          </h1>
          <p className="text-xs text-text-secondary max-w-4xl">
            Exhaustive static compilation pass across target architectures. Click any cell to inspect exact hardware fit reasons, memory headroom, and estimated cycle timings.
          </p>
        </div>
      </div>

      {/* 1. Core Hardware Matrix: Models (Rows) x Microcontrollers (Columns) */}
      <Panel
        title="Multi-Target Deployment Matrix"
        subtitle="Click any cell to inspect memory breakdown and latency projection"
        noPadding={true}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-surface-raised/60 text-text-secondary">
                <th className="py-3 px-4 font-semibold">Reference Model</th>
                <th className="py-3 px-4 font-semibold">Domain</th>
                {HARDWARE_PROFILES.map((hw) => (
                  <th key={hw.id} className="py-3 px-4 font-semibold text-center">
                    <div>{hw.name}</div>
                    <div className="text-[10px] text-text-muted font-normal">{hw.clock_mhz} MHz</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {matrixModels.map((m) => (
                <tr key={m.id} className="hover:bg-surface-raised/30 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-text-primary">
                    <div>{m.name}</div>
                    <div className="text-[10px] text-text-muted font-normal">
                      {(m.flashBytes / 1024).toFixed(1)} KB Flash | {(m.sramBytes / 1024).toFixed(2)} KB Arena
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-text-secondary">{m.domain}</td>

                  {HARDWARE_PROFILES.map((hw) => {
                    const fitsSram = m.sramBytes <= hw.sram_kb * 1024;
                    const fitsFlash = m.flashBytes <= hw.flash_mb * 1024 * 1024;
                    const fits = fitsSram && fitsFlash;
                    const sramPct = Number(((m.sramBytes / (hw.sram_kb * 1024)) * 100).toFixed(2));
                    const flashPct = Number(((m.flashBytes / (hw.flash_mb * 1024 * 1024)) * 100).toFixed(2));
                    const estLatency = Number(
                      ((m.macs / (hw.clock_mhz * 1e6 * (hw.simd.includes('SIMD') ? 0.35 : 0.18))) * 1000).toFixed(2)
                    );

                    const isCellActive =
                      selectedCell &&
                      selectedCell.modelName === m.name &&
                      selectedCell.hardwareId === hw.id;

                    return (
                      <td key={hw.id} className="py-3 px-4 text-center">
                        <button
                          onClick={() =>
                            setSelectedCell({
                              modelName: m.name,
                              hardwareName: hw.name,
                              hardwareId: hw.id,
                              sramBytes: m.sramBytes,
                              sramKbMax: hw.sram_kb,
                              sramPct,
                              flashBytes: m.flashBytes,
                              flashMbMax: hw.flash_mb,
                              flashPct,
                              macs: m.macs,
                              latencyMs: estLatency,
                              fits,
                              arch: hw.arch,
                              simd: hw.simd,
                            })
                          }
                          className={`px-3 py-1.5 rounded-md border text-[11px] font-bold transition-all cursor-pointer w-24 flex flex-col items-center ${
                            isCellActive
                              ? 'ring-2 ring-primary border-primary bg-primary/20 text-text-primary shadow-sm'
                              : fits
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                          }`}
                        >
                          <span>{fits ? 'PASS' : 'FAIL'}</span>
                          <span className="text-[9px] font-normal text-text-muted">{estLatency} ms*</span>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* 2. Interactive Matrix Cell Inspector */}
      {selectedCell && (
        <SpotlightCard className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-semibold block">
                CELL TELEMETRY INSPECTOR
              </span>
              <h3 className="text-base font-bold text-text-primary">
                {selectedCell.modelName} &rarr; {selectedCell.hardwareName}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono ${
                  selectedCell.fits
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                }`}
              >
                {selectedCell.fits ? 'VERIFIED HARDWARE FIT' : 'HARDWARE BUDGET OVERFLOW'}
              </span>

              {selectedHw.id !== selectedCell.hardwareId && (
                <button
                  onClick={() => setHardware(selectedCell.hardwareId)}
                  className="px-3 py-1 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
                >
                  Set as Active Target
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-3 rounded-lg bg-surface-raised border border-border space-y-1">
              <span className="text-text-muted text-[11px] block">SRAM Arena Budget</span>
              <span className="text-cyan-400 font-bold block">
                {selectedCell.sramBytes} B ({selectedCell.sramPct}%)
              </span>
              <span className="text-text-secondary text-[10px] block">Limit: {selectedCell.sramKbMax} KB</span>
            </div>

            <div className="p-3 rounded-lg bg-surface-raised border border-border space-y-1">
              <span className="text-text-muted text-[11px] block">Flash ROM Footprint</span>
              <span className="text-text-primary font-bold block">
                {(selectedCell.flashBytes / 1024).toFixed(1)} KB ({selectedCell.flashPct}%)
              </span>
              <span className="text-text-secondary text-[10px] block">Limit: {selectedCell.flashMbMax} MB</span>
            </div>

            <div className="p-3 rounded-lg bg-surface-raised border border-border space-y-1">
              <span className="text-text-muted text-[11px] block">Multiply-Accumulates</span>
              <span className="text-text-primary font-bold block">{selectedCell.macs.toLocaleString()} MACs</span>
              <span className="text-text-secondary text-[10px] block">INT8 Dot-Products</span>
            </div>

            <div className="p-3 rounded-lg bg-surface-raised border border-border space-y-1">
              <span className="text-text-muted text-[11px] block">Projected Latency</span>
              <span className="text-amber-400 font-bold block">{selectedCell.latencyMs} ms*</span>
              <span className="text-text-secondary text-[10px] block">Static Cycle Estimate</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-surface-raised/60 border border-border text-xs font-mono space-y-1 text-text-secondary">
            <div><strong>Microcontroller Architecture:</strong> {selectedCell.arch}</div>
            <div><strong>Hardware Acceleration / SIMD:</strong> {selectedCell.simd}</div>
          </div>
        </SpotlightCard>
      )}

      {/* 3. Visual Projected Charts for Currently Loaded Model */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel
          title="Inference Latency Projection (ms)"
          subtitle={`Static cycle estimation for ${loadedModel.name} across MCUs`}
        >
          <CanvasBarChart items={latencyBarItems} height={170} unit=" ms" />
        </Panel>

        <Panel
          title="Static SRAM Arena Utilization (%)"
          subtitle={`Percentage of physical SRAM allocated to zero-malloc tensor arena`}
        >
          <CanvasBarChart items={sramBarItems} height={170} unit="%" />
        </Panel>
      </div>

      <div className="text-[10px] font-mono text-text-muted text-center pt-2">
        * Latency represents static cycle estimation based on target core clock frequency and instruction issue pipeline. Not measured on live physical silicon.
      </div>
    </div>
  );
};
