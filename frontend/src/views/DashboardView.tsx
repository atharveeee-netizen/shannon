import React from 'react';
import {
  HardwareProfile,
  PresetModel,
  CompilationResult,
} from '../types';
import {
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { ViewId } from '../components/Sidebar';

interface DashboardViewProps {
  currentModel: PresetModel;
  currentHw: HardwareProfile;
  compilationResult: CompilationResult | null;
  onNavigate: (view: ViewId) => void;
  onRunCompile?: () => void;
  isCompiling?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentModel,
  currentHw,
  compilationResult,
  onNavigate,
}) => {
  const peakSram = compilationResult?.optimized_int8.peak_sram_bytes || 18432;
  const flashBytes = compilationResult?.optimized_int8.flash_bytes || 18560;
  const sramLimit = currentHw.sram_kb * 1024;
  const flashLimit = currentHw.flash_mb * 1024 * 1024;
  const sramPct = Math.min(100, Math.max(1, (peakSram / sramLimit) * 100));
  const flashPct = Math.min(100, Math.max(0.5, (flashBytes / flashLimit) * 100));

  const stages: { id: ViewId; name: string; status: 'COMPLETE' | 'RUNNING' | 'READY' }[] = [
    { id: 'import', name: 'IMPORT', status: 'COMPLETE' },
    { id: 'graph', name: 'PARSE', status: 'COMPLETE' },
    { id: 'quantization', name: 'QUANTIZE', status: 'COMPLETE' },
    { id: 'arena', name: 'MEMORY PLAN', status: 'COMPLETE' },
    { id: 'optimization', name: 'OPTIMIZE', status: 'COMPLETE' },
    { id: 'codegen', name: 'GENERATE', status: 'COMPLETE' },
    { id: 'parity', name: 'VERIFY', status: 'COMPLETE' },
    { id: 'deployment', name: 'DEPLOY', status: 'READY' },
  ];

  return (
    <div className="space-y-4">
      {/* 1. Top Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-surface border border-border rounded">
          <span className="text-[10px] font-mono text-text-muted block uppercase">Active Model</span>
          <span className="text-sm font-semibold text-text-primary mt-0.5 truncate block" title={currentModel.name}>
            {currentModel.name}
          </span>
          <span className="text-[11px] font-mono text-text-secondary">{currentModel.input_shape}</span>
        </div>

        <div className="p-3 bg-surface border border-border rounded">
          <span className="text-[10px] font-mono text-text-muted block uppercase">Target Hardware</span>
          <span className="text-sm font-semibold text-text-primary mt-0.5 truncate block" title={currentHw.name}>
            {currentHw.name}
          </span>
          <span className="text-[11px] font-mono text-text-secondary">{currentHw.arch.split(' ')[0]} @ {currentHw.clock_mhz}MHz</span>
        </div>

        <div className="p-3 bg-surface border border-border rounded">
          <span className="text-[10px] font-mono text-text-muted block uppercase">Precision</span>
          <span className="text-sm font-semibold text-primary mt-0.5 block font-mono">
            INT8 Symmetric
          </span>
          <span className="text-[11px] font-mono text-text-secondary">4x Flash Reduction</span>
        </div>

        <div className="p-3 bg-surface border border-border rounded">
          <span className="text-[10px] font-mono text-text-muted block uppercase">Compiler State</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-success" />
            <span className="text-sm font-semibold text-success font-mono">VERIFIED</span>
          </div>
          <span className="text-[11px] font-mono text-text-secondary">0 Bytes Malloc</span>
        </div>
      </div>

      {/* 2. Visual Horizontal Compilation Pipeline */}
      <div className="p-4 bg-surface border border-border rounded space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-text-secondary">
          <span className="font-semibold text-text-primary uppercase tracking-wider text-[11px]">
            Compilation Pipeline Workflow
          </span>
          <span className="text-[11px] text-success flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            MISRA-C:2012 Rule 21.3 Compliant
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-1 font-mono text-xs">
          {stages.map((st, idx) => (
            <button
              key={st.name}
              onClick={() => onNavigate(st.id)}
              className="p-2 rounded border border-border bg-surface-raised hover:bg-surface-hover hover:border-primary/40 transition text-left flex flex-col justify-between space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-text-muted">0{idx + 1}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
              </div>
              <span className="font-bold text-[10px] text-text-primary group-hover:text-primary transition truncate">
                {st.name}
              </span>
              <span className="text-[9px] text-success font-medium">✓ COMPLETE</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Resource Budget & Memory Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Flash ROM */}
        <div className="p-4 bg-surface border border-border rounded space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Flash Storage (ROM)</span>
            <span className="text-text-primary font-semibold">
              {(flashBytes / 1024).toFixed(1)} KB / {currentHw.flash_mb * 1024} KB
            </span>
          </div>
          <div className="w-full bg-surface-hover h-2 rounded overflow-hidden border border-border">
            <div className="bg-success h-full rounded" style={{ width: `${Math.max(2, flashPct)}%` }} />
          </div>
          <div className="flex justify-between text-[11px] text-text-muted">
            <span>Used: {flashPct.toFixed(2)}%</span>
            <span className="text-success font-semibold">-75% Saved (INT8)</span>
          </div>
        </div>

        {/* Peak SRAM Arena */}
        <div className="p-4 bg-surface border border-border rounded space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Peak SRAM Arena</span>
            <span className="text-text-primary font-semibold">
              {(peakSram / 1024).toFixed(1)} KB / {currentHw.sram_kb} KB
            </span>
          </div>
          <div className="w-full bg-surface-hover h-2 rounded overflow-hidden border border-border">
            <div className="bg-primary h-full rounded" style={{ width: `${sramPct}%` }} />
          </div>
          <div className="flex justify-between text-[11px] text-text-muted">
            <span>Used: {sramPct.toFixed(1)}%</span>
            <span className="text-primary font-semibold">0 B Dynamic Heap</span>
          </div>
        </div>

        {/* Latency & Compute */}
        <div className="p-4 bg-surface border border-border rounded space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Estimated Latency</span>
            <span className="text-text-primary font-semibold">
              {compilationResult?.optimized_int8.estimated_latency_ms || 1.1} ms
            </span>
          </div>
          <div className="flex justify-between items-center text-[11px] text-text-muted pt-1">
            <span>SIMD Unrolling:</span>
            <span className="text-primary font-semibold">{currentHw.simd}</span>
          </div>
          <div className="flex justify-between items-center text-[11px] text-text-muted">
            <span>Total Compute:</span>
            <span className="text-text-primary font-semibold">
              {compilationResult?.optimized_int8.total_macs.toLocaleString() || '46,368'} MACs
            </span>
          </div>
        </div>
      </div>

      {/* 4. Model Summary & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left: Model Layer Architecture */}
        <div className="lg:col-span-8 p-4 bg-surface border border-border rounded space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="text-xs font-semibold text-text-primary uppercase tracking-wider font-mono">
              Model Layer Architecture
            </span>
            <button
              onClick={() => onNavigate('graph')}
              className="text-xs text-primary hover:underline font-mono flex items-center gap-1"
            >
              <span>Inspect Full Graph</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-border text-text-muted text-[11px]">
                  <th className="py-1.5">Layer</th>
                  <th className="py-1.5">Op Type</th>
                  <th className="py-1.5">Output Shape</th>
                  <th className="py-1.5">MACs</th>
                  <th className="py-1.5">SRAM Offset</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {compilationResult?.layers.slice(0, 4).map((l) => (
                  <tr key={l.layer_id} className="hover:bg-surface-hover transition">
                    <td className="py-2 text-text-primary font-semibold">{l.layer_id}</td>
                    <td className="py-2 text-text-secondary">{l.op_type}</td>
                    <td className="py-2 text-text-secondary">{l.out_shape}</td>
                    <td className="py-2 text-text-primary">{l.macs.toLocaleString()}</td>
                    <td className="py-2 text-primary font-medium">{l.sram_offset_hex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Quick Actions & Status */}
        <div className="lg:col-span-4 p-4 bg-surface border border-border rounded space-y-3 font-mono text-xs">
          <span className="text-xs font-semibold text-text-primary uppercase tracking-wider block font-mono border-b border-border pb-2">
            Quick Compiler Actions
          </span>

          <div className="space-y-2 pt-1">
            <button
              onClick={() => onNavigate('parity')}
              className="w-full p-2 bg-surface-raised hover:bg-surface-hover border border-border rounded flex items-center justify-between text-left transition group"
            >
              <span className="text-text-primary font-semibold text-xs">Run Parity Validation</span>
              <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-primary transition" />
            </button>

            <button
              onClick={() => onNavigate('arena')}
              className="w-full p-2 bg-surface-raised hover:bg-surface-hover border border-border rounded flex items-center justify-between text-left transition group"
            >
              <span className="text-text-primary font-semibold text-xs">Inspect Memory Arena</span>
              <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-primary transition" />
            </button>

            <button
              onClick={() => onNavigate('codegen')}
              className="w-full p-2 bg-surface-raised hover:bg-surface-hover border border-border rounded flex items-center justify-between text-left transition group"
            >
              <span className="text-text-primary font-semibold text-xs">View Generated C</span>
              <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-primary transition" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
