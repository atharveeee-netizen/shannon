import React, { useState } from 'react';
import { LayerBentoRow, AgentLogEntry, HardwareProfile } from '../types';
import { Terminal, RefreshCw, Layers, Cpu } from 'lucide-react';

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
      {/* 5-Step Agent Loop */}
      <div className="bg-[#1A1F28] border border-[#232936] rounded-[3px] p-4">
        <div className="flex items-center justify-between border-b border-[#232936] pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#2B95D6]" />
            <h3 className="text-xs font-semibold text-[#F5F8FA] font-mono uppercase">
              AUTONOMOUS COMPILER PIPELINE
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-mono text-[#A7B6C2] cursor-pointer">
              <input
                type="checkbox"
                checked={mixedPrecision}
                onChange={(e) => onToggleMixedPrecision(e.target.checked)}
                className="accent-[#106BA3] rounded-[2px]"
              />
              <span>Enable Mixed INT8 / INT4</span>
            </label>

            <button
              onClick={onRerunLoop}
              disabled={isAgentRunning}
              className="px-3 py-1 bg-[#106BA3] hover:bg-[#0E5A8A] text-[#F5F8FA] text-xs font-mono font-semibold rounded-[3px] flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAgentRunning ? 'animate-spin' : ''}`} />
              <span>Optimize Graph</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs font-mono">
          {[
            { step: '01. PLANNER', agent: 'AST Limits', state: 'PASSED' },
            { step: '02. QUANTIZER', agent: 'INT8 PTQ', state: 'PASSED' },
            { step: '03. MEMORY MAP', agent: 'Zero-Malloc', state: 'PASSED' },
            { step: '04. CODEGEN', agent: 'Bare Metal C++', state: 'PASSED' },
            { step: '05. CRITIC', agent: 'Boundary Check', state: 'PASSED' },
          ].map((s, idx) => (
            <div key={idx} className="bg-[#0B0D11] p-2.5 border border-[#232936] rounded-[2px] flex items-center justify-between">
              <div>
                <span className="text-[9px] text-[#5C7080] block">{s.step}</span>
                <span className="font-bold text-[#F5F8FA] text-[11px] block">{s.agent}</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 bg-[#0D8050]/20 text-[#0D8050] border border-[#0D8050]/40 rounded-[2px] font-bold">
                {s.state}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Layer Bento Table (8 cols) + Agent Execution Log (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 bg-[#1A1F28] border border-[#232936] rounded-[3px] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#232936] pb-2.5 mb-3">
              <span className="text-xs font-mono font-semibold text-[#F5F8FA] uppercase flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#2B95D6]" />
                LAYER-BY-LAYER MEMORY AND QUANTIZATION TABLE
              </span>
              <span className="text-[10px] font-mono text-[#5C7080]">
                {layers.length} Layers | Total MACs: {totalMacs.toLocaleString()}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-[#232936] text-[10px] text-[#5C7080] uppercase bg-[#12151B]">
                    <th className="p-2">Layer ID</th>
                    <th className="p-2">Op Type</th>
                    <th className="p-2">Output Shape</th>
                    <th className="p-2">MACs</th>
                    <th className="p-2">Flash Bytes</th>
                    <th className="p-2">SRAM Offset</th>
                    <th className="p-2">Scale (S)</th>
                    <th className="p-2">Precision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#232936]/60">
                  {layers.map((layer) => {
                    const isSelected = selectedLayerId === layer.layer_id;
                    return (
                      <tr
                        key={layer.layer_id}
                        onClick={() => setSelectedLayerId(layer.layer_id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#106BA3]/20 text-[#F5F8FA]' : 'hover:bg-[#12151B]/60 text-[#A7B6C2]'
                        }`}
                      >
                        <td className="p-2 font-bold text-[#F5F8FA]">{layer.layer_id}</td>
                        <td className="p-2">{layer.op_type}</td>
                        <td className="p-2 text-[#5C7080]">{layer.out_shape}</td>
                        <td className="p-2 text-[#2B95D6]">{layer.macs.toLocaleString()}</td>
                        <td className="p-2">{layer.flash_bytes} B</td>
                        <td className="p-2 text-[#0D8050] font-semibold">{layer.sram_offset_hex}</td>
                        <td className="p-2 text-[#5C7080]">{layer.scale_factor.toFixed(5)}</td>
                        <td className="p-2">
                          <span className={`px-1.5 py-0.5 rounded-[2px] text-[9px] font-bold ${
                            layer.bitwidth === 4 ? 'bg-[#D9822B]/20 text-[#D9822B] border border-[#D9822B]/40' : 'bg-[#0D8050]/20 text-[#0D8050] border border-[#0D8050]/40'
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

          <div className="pt-3 border-t border-[#232936] flex items-center justify-between text-xs font-mono text-[#5C7080]">
            <span>SRAM Alignment: <strong>4-Byte Word</strong></span>
            <span>Static Flash: <strong>{(totalFlash / 1024).toFixed(1)} KB</strong></span>
            <span>Peak Tensor Arena: <strong>{(peakSram / 1024).toFixed(1)} KB</strong></span>
          </div>
        </div>

        {/* Monospace Agent Execution Stream */}
        <div className="lg:col-span-4 bg-[#1A1F28] border border-[#232936] rounded-[3px] p-4 flex flex-col h-[480px]">
          <div className="flex items-center justify-between border-b border-[#232936] pb-2.5 mb-2">
            <span className="text-xs font-mono font-semibold text-[#F5F8FA] uppercase flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#0D8050]" />
              COMPILER EXECUTION STREAM
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#0D8050]/20 text-[#0D8050] rounded-[2px]">
              ONLINE
            </span>
          </div>

          <div className="flex-1 overflow-y-auto font-mono text-[10px] leading-relaxed space-y-2 select-text pr-1">
            {agentLogs.map((log) => (
              <div key={log.id} className="p-2 bg-[#0B0D11] border border-[#232936] rounded-[2px]">
                <div className="flex items-center justify-between text-[#5C7080] mb-0.5">
                  <span className="text-[#2B95D6] font-bold">[{log.agent}]</span>
                  <span>{log.timestamp}</span>
                </div>
                <p className="text-[#F5F8FA]">{log.message}</p>
                {log.metric && (
                  <span className="text-[9px] text-[#0D8050] font-semibold block mt-1">
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