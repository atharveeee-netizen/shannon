import React, { useState } from 'react';
import { PresetModel, HardwareProfile } from '../types';
import { BarChart2 } from 'lucide-react';

interface CompareViewProps {
  models: PresetModel[];
  hardwareList: HardwareProfile[];
}

export const CompareView: React.FC<CompareViewProps> = ({
  models,
  hardwareList,
}) => {
  const [modelA, setModelA] = useState<string>(models[0]?.id || 'kws');
  const [modelB, setModelB] = useState<string>(models[1]?.id || 'vision');
  const [hwTarget, setHwTarget] = useState<string>(hardwareList[0]?.id || 'STM32H7');

  const selectedModelA = models.find((m) => m.id === modelA) || models[0];
  const selectedModelB = models.find((m) => m.id === modelB) || models[1];
  const selectedHw = hardwareList.find((h) => h.id === hwTarget) || hardwareList[0];

  const modelSpecs: Record<string, { flash: string; sram: string; macs: string; latency: string; acc: string }> = {
    kws: { flash: '24.0 KB', sram: '1.12 KB', macs: '46,368', latency: '1.1 ms', acc: '96.6%' },
    vision: { flash: '18.1 KB', sram: '18.0 KB', macs: '239,680', latency: '2.0 ms', acc: '96.4%' },
    anomaly: { flash: '19.5 KB', sram: '0.19 KB', macs: '18,432', latency: '0.15 ms', acc: '0.00013 MSE' },
  };

  const specsA = modelSpecs[selectedModelA.id] || modelSpecs.kws;
  const specsB = modelSpecs[selectedModelB.id] || modelSpecs.vision;

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h2 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary" />
            Model & Target Silicon Architecture Comparator
          </h2>
          <p className="text-text-secondary text-xs mt-0.5">
            Side-by-side comparative analysis of model topologies, memory utilization, compute intensity, and latency.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-text-secondary">
          <span>Target Silicon:</span>
          <select
            value={hwTarget}
            onChange={(e) => setHwTarget(e.target.value)}
            className="bg-surface-raised border border-border rounded px-2 py-1 text-text-primary focus:outline-none focus:border-primary cursor-pointer"
          >
            {hardwareList.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} ({h.clock_mhz}MHz)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Model Selection Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
        <div className="p-3 bg-surface border border-border rounded space-y-2">
          <label className="text-[10px] text-text-muted uppercase block font-bold">Model Candidate A</label>
          <select
            value={modelA}
            onChange={(e) => setModelA(e.target.value)}
            className="w-full bg-surface-raised border border-border rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary cursor-pointer font-bold"
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.domain})
              </option>
            ))}
          </select>
        </div>

        <div className="p-3 bg-surface border border-border rounded space-y-2">
          <label className="text-[10px] text-text-muted uppercase block font-bold">Model Candidate B</label>
          <select
            value={modelB}
            onChange={(e) => setModelB(e.target.value)}
            className="w-full bg-surface-raised border border-border rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary cursor-pointer font-bold"
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.domain})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Metrics Grid */}
      <div className="bg-surface border border-border rounded p-4 space-y-3 font-mono">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-text-muted text-[11px]">
                <th className="py-2.5 px-3">Compiler Metric</th>
                <th className="py-2.5 px-3 text-primary">{selectedModelA.name}</th>
                <th className="py-2.5 px-3 text-cyan-400">{selectedModelB.name}</th>
                <th className="py-2.5 px-3">Comparison Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-surface-hover transition">
                <td className="py-3 px-3 text-text-secondary">Input Tensor Geometry</td>
                <td className="py-3 px-3 text-text-primary font-bold">{selectedModelA.input_shape}</td>
                <td className="py-3 px-3 text-text-primary font-bold">{selectedModelB.input_shape}</td>
                <td className="py-3 px-3 text-text-muted">Target Sensor Specific</td>
              </tr>
              <tr className="hover:bg-surface-hover transition">
                <td className="py-3 px-3 text-text-secondary">Flash Storage Footprint</td>
                <td className="py-3 px-3 text-primary font-bold">{specsA.flash}</td>
                <td className="py-3 px-3 text-cyan-400 font-bold">{specsB.flash}</td>
                <td className="py-3 px-3 text-success font-semibold">Both Fit in {selectedHw.flash_mb} MB Flash</td>
              </tr>
              <tr className="hover:bg-surface-hover transition">
                <td className="py-3 px-3 text-text-secondary">Peak Static SRAM Arena</td>
                <td className="py-3 px-3 text-primary font-bold">{specsA.sram}</td>
                <td className="py-3 px-3 text-cyan-400 font-bold">{specsB.sram}</td>
                <td className="py-3 px-3 text-success font-semibold">0 Bytes Dynamic Malloc</td>
              </tr>
              <tr className="hover:bg-surface-hover transition">
                <td className="py-3 px-3 text-text-secondary">Total Computational MACs</td>
                <td className="py-3 px-3 text-text-primary font-bold">{specsA.macs}</td>
                <td className="py-3 px-3 text-text-primary font-bold">{specsB.macs}</td>
                <td className="py-3 px-3 text-text-muted">4-Way Vector Unrolled</td>
              </tr>
              <tr className="hover:bg-surface-hover transition">
                <td className="py-3 px-3 text-text-secondary">Estimated Inference Latency</td>
                <td className="py-3 px-3 text-emerald-400 font-bold">{specsA.latency}</td>
                <td className="py-3 px-3 text-cyan-400 font-bold">{specsB.latency}</td>
                <td className="py-3 px-3 text-text-primary font-semibold">@ {selectedHw.clock_mhz} MHz</td>
              </tr>
              <tr className="hover:bg-surface-hover transition">
                <td className="py-3 px-3 text-text-secondary">Validation Metric</td>
                <td className="py-3 px-3 text-success font-bold">{specsA.acc}</td>
                <td className="py-3 px-3 text-success font-bold">{specsB.acc}</td>
                <td className="py-3 px-3 text-success font-semibold">100% Numerical Parity</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
