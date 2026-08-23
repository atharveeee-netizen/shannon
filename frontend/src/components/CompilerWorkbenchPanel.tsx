import React, { useState } from 'react';
import { LayerBentoRow, AgentLogEntry, HardwareProfile } from '../types';
import { Terminal, RefreshCw, Cpu, Layers } from 'lucide-react';

interface CompilerWorkbenchPanelProps {
  layers: LayerBentoRow[];
  agentLogs: AgentLogEntry[];
  targetHw: HardwareProfile;
  isAgentRunning: boolean;
  onRerunLoop: () => void;
  mixedPrecision: boolean;
  onToggleMixedPrecision: (enabled: boolean) => void;
}

export const CompilerWorkbenchPanel: React.FC<CompilerWorkbenchPanelProps> = ({
  layers,
  agentLogs,
  targetHw: _targetHw,
  isAgentRunning,
  onRerunLoop,
  mixedPrecision,
  onToggleMixedPrecision,
}) => {
  const [selectedLayerId, setSelectedLayerId] = useState<string>(layers[0]?.layer_id || '');

  const totalMacs = layers.reduce((acc, l) => acc + l.macs, 0);
  const totalFlash = layers.reduce((acc, l) => acc + l.flash_bytes, 0);
  const peakSram = Math.max(...layers.map((l) => l.sram_bytes), 1024);

  return (
    <div className="space-y-4">
      {/* Top Agentic Loop Status Bar */}
      <div className="bg-palantir-card border border-palantir-border rounded-[3px] p-4">
        <div className="flex items-center justify-between border-b border-palantir-border pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-palantir-cobalt" />
            <h3 className="text-xs font-semibold text-palantir-textPrimary font-mono uppercase">
              KARPATHY & DEEPSEEK AUTONOMOUS 5-AGENT COMPILER PIPELINE
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-mono text-palantir-textSecondary cursor-pointer">
              <input
                type="checkbox"
                checked={mixedPrecision}
                onChange={(e) => onToggleMixedPrecision(e.target.checked)}
                className="accent-palantir-action rounded-[2px]"
              />
              <span>Enable Mixed INT8/INT4 (HAWQ)</span>
            </label>

            <button
              onClick={onRerunLoop}
              disabled={isAgentRunning}
              className="px-3 py-1 bg-palantir-action hover:bg-palantir-actionHover text-palantir-textPrimary text-xs font-mono font-semibold rounded-[3px] flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAgentRunning ? 'animate-spin' : ''}`} />
              <span>Optimize & Color Arena</span>
            </button>
          </div>
        </div>

        {/* 5-Step Agent Flow Visualizer */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs font-mono">
          {[
            { step: '01. PLANNER', agent: 'AST Ingest & Limits', state: 'PASSED' },
            { step: '02. QUANTIZER', agent: 'INT8/INT4 PTQ Engine', state: 'PASSED' },
            { step: '03. MEMORY MAPPER', agent: 'Zero-Malloc Colorer', state: 'PASSED' },
            { step: '04. CODEGEN', agent: 'Bare-Metal C++ Emitter', state: 'PASSED' },
            { step: '05. CRITIC', agent: 'Boundary & Test Suite', state: 'PASSED' },
          ].map((s, idx) => (
            <div key={idx} className="bg-palantir-canvas p-2.5 border border-palantir-border rounded-[2px] flex items-center justify-between">
              <div>
                <span className="text-[9px] text-palantir-textMuted block">{s.step}</span>
                <span className="font-bold text-palantir-textPrimary text-[11px] block">{s.agent}</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 bg-palantir-passLight text-palantir-pass border border-palantir-pass/40 rounded-[2px] font-bold">
                {s.state}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Bento Layer Table (8 cols) + Agent Execution Log (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Bento Layer Table */}
        <div className="lg:col-span-8 bg-palantir-card border border-palantir-border rounded-[3px] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-palantir-border pb-2.5 mb-3">
              <span className="text-xs font-mono font-semibold text-palantir-textPrimary uppercase flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-palantir-cobalt" />
                LAYER-BY-LAYER MEMORY & QUANTIZATION BENTO TABLE
              </span>
              <span className="text-[10px] font-mono text-palantir-textMuted">
                {layers.length} Layers • Total MACs: {totalMacs.toLocaleString()}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-palantir-border text-[10px] text-palantir-textMuted uppercase bg-palantir-nav">
                    <th className="p-2">Layer ID</th>
                    <th className="p-2">Op Type</th>
                    <th className="p-2">In/Out Shape</th>
                    <th className="p-2">MACs</th>
                    <th className="p-2">Flash Bytes</th>
                    <th className="p-2">SRAM Offset</th>
                    <th className="p-2">Scale (S)</th>
                    <th className="p-2">Precision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-palantir-border/60">
                  {layers.map((layer) => {
                    const isSelected = selectedLayerId === layer.layer_id;
                    return (
                      <tr
                        key={layer.layer_id}
                        onClick={() => setSelectedLayerId(layer.layer_id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-palantir-action/20 text-palantir-textPrimary' : 'hover:bg-palantir-nav/60 text-palantir-textSecondary'
                        }`}
                      >
                        <td className="p-2 font-bold text-palantir-textPrimary">{layer.layer_id}</td>
                        <td className="p-2">{layer.op_type}</td>
                        <td className="p-2 text-palantir-textMuted">{layer.out_shape}</td>
                        <td className="p-2 text-palantir-cobalt">{layer.macs.toLocaleString()}</td>
                        <td className="p-2">{layer.flash_bytes} B</td>
                        <td className="p-2 text-palantir-pass font-semibold">{layer.sram_offset_hex}</td>
                        <td className="p-2 text-palantir-textMuted">{layer.scale_factor.toFixed(5)}</td>
                        <td className="p-2">
                          <span className={`px-1.5 py-0.5 rounded-[2px] text-[9px] font-bold ${
                            layer.bitwidth === 4 ? 'bg-palantir-warnLight text-palantir-warn border border-palantir-warn/40' : 'bg-palantir-passLight text-palantir-pass border border-palantir-pass/40'
                          }`}>
                            INT{layer.bitwidth}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-palantir-border/80 flex items-center justify-between text-xs font-mono text-palantir-textMuted">
            <span>SRAM Allocation Alignment: <strong>4-Byte Word</strong></span>
            <span>Static Flash: <strong>{(totalFlash / 1024).toFixed(1)} KB</strong></span>
            <span>Peak Tensor Arena: <strong>{(peakSram / 1024).toFixed(1)} KB</strong></span>
          </div>
        </div>

        {/* Monospace DeepSeek Agent Execution Stream */}
        <div className="lg:col-span-4 bg-palantir-card border border-palantir-border rounded-[3px] p-4 flex flex-col h-[480px]">
          <div className="flex items-center justify-between border-b border-palantir-border pb-2.5 mb-2">
            <span className="text-xs font-mono font-semibold text-palantir-textPrimary uppercase flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-palantir-pass" />
              DEEPSEEK HARNESS EXECUTION STREAM
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 bg-palantir-passLight text-palantir-pass rounded-[2px]">
              ONLINE
            </span>
          </div>

          <div className="flex-1 overflow-y-auto font-mono text-[10px] leading-relaxed space-y-2 select-text pr-1">
            {agentLogs.map((log) => (
              <div key={log.id} className="p-2 bg-palantir-canvas border border-palantir-border rounded-[2px]">
                <div className="flex items-center justify-between text-palantir-textMuted mb-0.5">
                  <span className="text-palantir-cobalt font-bold">[{log.agent}]</span>
                  <span>{log.timestamp}</span>
                </div>
                <p className="text-palantir-textPrimary">{log.message}</p>
                {log.metric && (
                  <span className="text-[9px] text-palantir-pass font-semibold block mt-1">
                    ↳ {log.metric}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};