import React, { useState } from 'react';
import { useCompiler } from '../../context/CompilerContext';
import { EmptyState } from '../ui/EmptyState';
import { Panel } from '../ui/Panel';
import { evaluateMultiTargetBenchmarks, HARDWARE_PROFILES } from '../../compiler/benchmarks';
import { getPresetGraphById } from '../../compiler/presets';

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
          title="Hardware Matrix Not Available"
          description="Compile a model to generate the multi-target static compatibility and latency evaluation matrix."
          allowCompile={true}
        />
      </div>
    );
  }

  // Pre-evaluate reference benchmark models
  const referenceModels = [
    { id: 'keyword_spotter', name: 'KeywordSpotter_Reference', domain: 'Audio DSP' },
    { id: 'motor_vibration', name: 'MotorVibration_Reference', domain: 'Vibration FFT' },
    { id: 'micro_vision', name: 'MicroVision_Reference', domain: 'Vision Conv2D' },
  ];

  const matrixModels = referenceModels.map((ref) => {
    const graph = getPresetGraphById(ref.id);
    const benchmark = evaluateMultiTargetBenchmarks(graph);
    return {
      ...ref,
      benchmark,
      flashBytes: graph.flash_bytes,
      sramBytes: graph.peak_sram_bytes,
      macs: graph.total_macs,
    };
  });

  return (
    <div className="p-6 space-y-6 w-full max-w-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-normal text-text-primary tracking-tight">
            Hardware Fit Matrix
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Static compatibility analysis across reference models and target microcontrollers
          </p>
        </div>
      </div>

      {/* 1. Core Hardware Matrix: Models (Rows) x Microcontrollers (Columns) */}
      <Panel
        title="Multi-Target Deployment Matrix"
        subtitle="Click any cell to inspect memory headroom and latency estimation"
        noPadding={true}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-surface-raised text-text-secondary">
                <th className="py-2.5 px-4 font-medium">Reference model</th>
                <th className="py-2.5 px-4 font-medium">Domain</th>
                {HARDWARE_PROFILES.map((hw) => (
                  <th key={hw.id} className="py-2.5 px-4 font-medium text-center">
                    <div>{hw.name}</div>
                    <div className="text-xs text-text-muted font-normal">{hw.clock_mhz} MHz</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {matrixModels.map((m) => (
                <tr key={m.id} className="hover:bg-surface-raised transition-colors">
                  <td className="py-3 px-4 font-medium text-text-primary">
                    <div>{m.name}</div>
                    <div className="text-xs text-text-muted font-normal">
                      {(m.flashBytes / 1024).toFixed(1)} KB Flash | {(m.sramBytes / 1024).toFixed(2)} KB Arena
                    </div>
                  </td>
                  <td className="py-3 px-4 text-text-secondary font-sans">{m.domain}</td>

                  {HARDWARE_PROFILES.map((hw) => {
                    const fitsSram = m.sramBytes <= hw.sram_kb * 1024;
                    const fitsFlash = m.flashBytes <= hw.flash_mb * 1024 * 1024;
                    const fits = fitsSram && fitsFlash;
                    const sramPct = Number(((m.sramBytes / (hw.sram_kb * 1024)) * 100).toFixed(1));
                    const flashPct = Number(((m.flashBytes / (hw.flash_mb * 1024 * 1024)) * 100).toFixed(1));
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
                          className={`px-3 py-1.5 rounded-[6px] border text-xs font-medium transition-colors cursor-pointer w-24 flex flex-col items-center mx-auto ${
                            isCellActive
                              ? 'border-primary bg-primary text-white'
                              : fits
                              ? 'bg-success/10 border-success/30 text-success hover:bg-success/20'
                              : 'bg-danger/10 border-danger/30 text-danger hover:bg-danger/20'
                          }`}
                        >
                          <span>{fits ? 'PASS' : 'FAIL'}</span>
                          <span className={`text-xs ${isCellActive ? 'text-white/80' : 'text-text-muted'}`}>
                            {estLatency} ms
                          </span>
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
        <div className="p-4 rounded-[8px] bg-surface border border-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <div className="text-xs text-text-muted">Target evaluation inspection</div>
              <h3 className="text-base font-semibold text-text-primary mt-0.5">
                {selectedCell.modelName} &rarr; {selectedCell.hardwareName}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-[4px] text-xs font-medium font-mono ${
                  selectedCell.fits
                    ? 'bg-success/10 text-success border border-success/30'
                    : 'bg-danger/10 text-danger border border-danger/30'
                }`}
              >
                {selectedCell.fits ? 'Verified hardware fit' : 'Hardware budget exceeded'}
              </span>

              {selectedHw.id !== selectedCell.hardwareId && (
                <button
                  onClick={() => setHardware(selectedCell.hardwareId)}
                  className="px-3 py-1 bg-primary hover:bg-[#0043CE] text-white text-xs font-medium rounded-[6px] transition-colors cursor-pointer"
                >
                  Set as active target
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-3 rounded-[6px] bg-surface-raised border border-border space-y-1">
              <span className="text-text-muted block text-xs">SRAM arena budget</span>
              <span className="text-text-primary font-medium text-sm block">
                {selectedCell.sramBytes} B ({selectedCell.sramPct}%)
              </span>
              <span className="text-text-secondary block text-xs">Capacity: {selectedCell.sramKbMax} KB</span>
            </div>

            <div className="p-3 rounded-[6px] bg-surface-raised border border-border space-y-1">
              <span className="text-text-muted block text-xs">Flash ROM footprint</span>
              <span className="text-text-primary font-medium text-sm block">
                {(selectedCell.flashBytes / 1024).toFixed(1)} KB ({selectedCell.flashPct}%)
              </span>
              <span className="text-text-secondary block text-xs">Capacity: {selectedCell.flashMbMax} MB</span>
            </div>

            <div className="p-3 rounded-[6px] bg-surface-raised border border-border space-y-1">
              <span className="text-text-muted block text-xs">Integer compute</span>
              <span className="text-text-primary font-medium text-sm block">
                {selectedCell.macs.toLocaleString()} MACs
              </span>
              <span className="text-text-secondary block text-xs">SIMD: {selectedCell.simd}</span>
            </div>

            <div className="p-3 rounded-[6px] bg-surface-raised border border-border space-y-1">
              <span className="text-text-muted block text-xs">Estimated latency</span>
              <span className="text-text-primary font-medium text-sm block">
                {selectedCell.latencyMs} ms
              </span>
              <span className="text-text-secondary block text-xs">Architecture: {selectedCell.arch}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
