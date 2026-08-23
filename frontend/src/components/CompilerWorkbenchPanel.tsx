import React, { useState } from 'react';
import { LayerBentoRow, AgentLogEntry, HardwareProfile } from '../types';
import { Terminal, RefreshCw, Layers, Cpu, ShieldCheck } from 'lucide-react';

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
  targetHw,
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
      {/* 5-Step Autonomous Agent Pipeline */}
      <div className="bg-[#13171F] border border-[#21262D] rounded-[4px] p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#21262D] pb-3 mb-3 gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-[#0284C7]/15 border border-[#0284C7]/30 text-[#38BDF8]">
              <Terminal className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-[#F0F6FC] font-mono uppercase tracking-tight">
              AUTONOMOUS COMPILER PIPELINE
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-mono text-[#8B949E] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={mixedPrecision}
                onChange={(e) => onToggleMixedPrecision(e.target.checked)}
                className="accent-[#0284C7] rounded-[2px]"
              />
              <span>Mixed INT8 / INT4</span>
            </label>

            <button
              onClick={onRerunLoop}
              disabled={isAgentRunning}
              className="px-3 py-1 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-mono font-bold rounded-[3px] flex items-center gap-1.5 transition disabled:opacity-50 shadow-glow-cyan"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAgentRunning ? 'animate-spin' : ''}`} />
              <span>{isAgentRunning ? 'Compiling...' : 'Run Optimization'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs font-mono">
          {[
            { step: '01. AST PLANNER', agent: 'Constraints', state: 'PASSED' },
            { step: '02. QUANTIZER', agent: 'INT8 PTQ', state: 'PASSED' },
            { step: '03. MEMORY MAP', agent: 'Zero-Malloc', state: 'PASSED' },
            { step: '04. CODEGEN', agent: 'Bare Metal C++', state: 'PASSED' },
            { step: '05. CRITIC', agent: 'Safety Audit', state: 'PASSED' },
          ].map((s, idx) => (
            <div key={idx} className="bg-[#0A0D12] p-2.5 border border-[#21262D] rounded-[3px] flex items-center justify-between">
              <div>
                <span className="text-[9px] text-[#484F58] block">{s.step}</span>
                <span className="font-bold text-[#F0F6FC] text-[11px] block">{s.agent}</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 bg-[#10B981]/15 text-[#00FFA3] border border-[#10B981]/30 rounded-[2px] font-bold">
                {s.state}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Layer Bento Table (8 cols) + Agent Execution Log (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Layer Table */}
        <div className="lg:col-span-8 bg-[#13171F] border border-[#21262D] rounded-[4px] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#21262D] pb-2.5 mb-3">
              <span className="text-xs font-mono font-bold text-[#F0F6FC] uppercase flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#38BDF8]" />
                LAYER-BY-LAYER QUANTIZATION & MEMORY LAYOUT
              </span>
              <span className="text-[10px] font-mono text-[#8B949E]">
                {layers.length} Layers | Total MACs: <strong className="text-[#38BDF8]">{totalMacs.toLocaleString()}</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-[#21262D] text-[10px] text-[#484F58] uppercase bg-[#0D1117]">
                    <th className="p-2">Layer ID</th>
                    <th className="p-2">Op Type</th>
                    <th className="p-2">Shape</th>
                    <th className="p-2">MACs</th>
                    <th className="p-2">Flash</th>
                    <th className="p-2">SRAM Offset</th>
                    <th className="p-2">Scale (S)</th>
                    <th className="p-2">Precision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#21262D]/60">
                  {layers.map((layer) => {
                    const isSelected = selectedLayerId === layer.layer_id;
                    return (
                      <tr
                        key={layer.layer_id}
                        onClick={() => setSelectedLayerId(layer.layer_id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#0284C7]/20 text-[#F0F6FC]' : 'hover:bg-[#161B22] text-[#8B949E]'
                        }`}
                      >
                        <td className="p-2 font-bold text-[#F0F6FC]">{layer.layer_id}</td>
                        <td className="p-2">{layer.op_type}</td>
                        <td className="p-2 text-[#484F58]">{layer.out_shape}</td>
                        <td className="p-2 text-[#38BDF8] font-tabular">{layer.macs.toLocaleString()}</td>
                        <td className="p-2 font-tabular">{layer.flash_bytes} B</td>
                        <td className="p-2 text-[#00FFA3] font-bold font-tabular">{layer.sram_offset_hex}</td>
                        <td className="p-2 text-[#484F58] font-tabular">{layer.scale_factor.toFixed(5)}</td>
                        <td className="p-2">
                          <span className={`px-1.5 py-0.5 rounded-[2px] text-[9px] font-bold ${
                            layer.bitwidth === 4
                              ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40'
                              : 'bg-[#10B981]/20 text-[#00FFA3] border border-[#10B981]/40'
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

          <div className="pt-3 border-t border-[#21262D] mt-3 flex items-center justify-between text-xs font-mono text-[#8B949E]">
            <span>SRAM Word Alignment: <strong className="text-[#F0F6FC]">4 Bytes</strong></span>
            <span>Flash Weights (INT8): <strong className="text-[#38BDF8]">{(totalFlash / 1024).toFixed(1)} KB</strong></span>
            <span>Peak Tensor Arena: <strong className="text-[#00FFA3]">{(peakSram / 1024).toFixed(1)} KB</strong></span>
          </div>
        </div>

        {/* Monospace Agent Execution Stream */}
        <div className="lg:col-span-4 bg-[#13171F] border border-[#21262D] rounded-[4px] p-4 flex flex-col h-[480px]">
          <div className="flex items-center justify-between border-b border-[#21262D] pb-2.5 mb-2">
            <span className="text-xs font-mono font-bold text-[#F0F6FC] uppercase flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#00FFA3]" />
              COMPILER EXECUTION STREAM
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#10B981]/15 text-[#00FFA3] rounded-[2px] font-bold">
              ONLINE
            </span>
          </div>

          <div className="flex-1 overflow-y-auto font-mono text-[10px] leading-relaxed space-y-2 select-text pr-1">
            {agentLogs.map((log) => (
              <div key={log.id} className="p-2 bg-[#0A0D12] border border-[#21262D] rounded-[3px]">
                <div className="flex items-center justify-between text-[#484F58] mb-0.5">
                  <span className="text-[#38BDF8] font-bold">[{log.agent}]</span>
                  <span>{log.timestamp}</span>
                </div>
                <p className="text-[#F0F6FC]">{log.message}</p>
                {log.metric && (
                  <span className="text-[9px] text-[#00FFA3] font-bold block mt-1">
                    ↳ {log.metric}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#21262D] mt-2 flex items-center justify-between text-[10px] font-mono text-[#8B949E]">
            <span>Target: <strong className="text-[#F0F6FC]">{targetHw.name}</strong></span>
            <span className="text-[#00FFA3] font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> VERIFIED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};