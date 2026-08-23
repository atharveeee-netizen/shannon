import React, { useState } from 'react';
import { CompilationResult, HardwareProfile } from '../types';
import { Layers, Zap, Code, HelpCircle, Copy, Check, Lock } from 'lucide-react';

interface TechnicalInspectorProps {
  result: CompilationResult;
  targetHw: HardwareProfile;
}

export const TechnicalInspector: React.FC<TechnicalInspectorProps> = ({
  result,
  targetHw,
}) => {
  const [activeTab, setActiveTab] = useState<'layers' | 'arena' | 'code' | 'explainer'>('layers');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.c_header_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs: { id: 'layers' | 'arena' | 'code' | 'explainer'; label: string; icon: any }[] = [
    { id: 'layers', label: 'Layer Memory Layout', icon: Layers },
    { id: 'arena', label: 'SRAM Arena Timeline', icon: Zap },
    { id: 'code', label: 'Generated C/C++ Header', icon: Code },
    { id: 'explainer', label: 'Compiler Explainer', icon: HelpCircle },
  ];

  return (
    <div className="bg-[#111111] border border-[#292929] rounded-[3px] overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between border-b border-[#292929] px-4 bg-[#141414] select-none">
        <div className="flex items-center gap-1">
          {tabs.map((t) => {
            const isActive = activeTab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-2.5 text-xs font-mono flex items-center gap-1.5 border-b-2 transition-colors ${
                  isActive
                    ? 'border-[#F3F3EF] text-[#F3F3EF] font-medium'
                    : 'border-transparent text-[#8A8A84] hover:text-[#F3F3EF]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {activeTab === 'code' && (
          <button
            onClick={handleCopy}
            className="px-2 py-1 text-xs font-mono text-[#8A8A84] hover:text-[#F3F3EF] bg-[#1A1A1A] border border-[#292929] rounded-[2px] flex items-center gap-1 transition"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-[#0D8050]" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" /> Copy Code
              </>
            )}
          </button>
        )}
      </div>

      {/* Tab 1: Layer Bento & Memory Layout */}
      {activeTab === 'layers' && (
        <div className="p-4 space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[#292929] text-[10px] text-[#8A8A84] uppercase bg-[#141414]">
                  <th className="p-2">Layer ID</th>
                  <th className="p-2">Op Type</th>
                  <th className="p-2">Output Tensor</th>
                  <th className="p-2">MACs</th>
                  <th className="p-2">Flash Bytes</th>
                  <th className="p-2">SRAM Offset</th>
                  <th className="p-2">Scale (S)</th>
                  <th className="p-2">Precision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#292929]/60">
                {result.layers.map((l) => (
                  <tr key={l.layer_id} className="text-[#8A8A84] hover:bg-[#161616] hover:text-[#F3F3EF]">
                    <td className="p-2 font-medium text-[#F3F3EF]">{l.layer_id}</td>
                    <td className="p-2">{l.op_type}</td>
                    <td className="p-2 text-[#8A8A84]">{l.out_shape}</td>
                    <td className="p-2 text-[#F3F3EF]">{l.macs.toLocaleString()}</td>
                    <td className="p-2">{l.flash_bytes} B</td>
                    <td className="p-2 text-[#0D8050] font-semibold">{l.sram_offset_hex}</td>
                    <td className="p-2 text-[#8A8A84]">{l.scale_factor.toFixed(5)}</td>
                    <td className="p-2">
                      <span className="px-1.5 py-0.2 rounded-[2px] text-[9px] font-bold bg-[#0D8050]/15 text-[#0D8050] border border-[#0D8050]/30">
                        INT{l.bitwidth}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 border-t border-[#292929] flex items-center justify-between text-[11px] font-mono text-[#8A8A84]">
            <span>Memory alignment: 4-Byte Word</span>
            <span>Zero pointer aliasing guaranteed</span>
          </div>
        </div>
      )}

      {/* Tab 2: SRAM Arena Timeline */}
      {activeTab === 'arena' && (
        <div className="p-4 space-y-4 font-mono text-xs">
          <div className="bg-[#1A1A1A] p-3 rounded-[3px] border border-[#292929]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[#8A8A84]">
                Arena Capacity: <strong className="text-[#0D8050]">{(result.optimized_int8.peak_sram_bytes / 1024).toFixed(2)} KB</strong>
              </span>
              <span className="text-[#8A8A84] flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#0D8050]" /> Base: 0x20000000
              </span>
            </div>

            <div className="w-full bg-[#0B0B0B] h-3 rounded-[2px] border border-[#292929] overflow-hidden flex">
              {result.arena_blocks.map((b, idx) => {
                const widthPct = Math.max(10, (b.size_bytes / result.optimized_int8.peak_sram_bytes) * 100);
                return (
                  <div
                    key={idx}
                    title={`${b.name}: ${b.size_bytes} Bytes @ ${b.hex_address}`}
                    className="h-full border-r border-[#292929] flex items-center justify-center text-[8px] font-bold text-[#F3F3EF] opacity-90"
                    style={{ width: `${widthPct}%`, backgroundColor: b.color }}
                  >
                    {b.layer_id}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] text-[#8A8A84] uppercase tracking-wider block">
              SCHEDULED BUFFER LIFETIME INTERVALS
            </span>
            {result.arena_blocks.map((block, idx) => (
              <div key={idx} className="p-2.5 bg-[#161616] border border-[#292929] rounded-[2px] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: block.color }} />
                  <span className="font-medium text-[#F3F3EF]">{block.name}</span>
                  <span className="text-[#8A8A84]">({block.size_bytes} Bytes)</span>
                </div>
                <div className="text-[#8A8A84] text-[10px]">
                  Offset: <span className="text-[#0D8050] font-semibold">{block.hex_address}</span> | Lifetime: Steps {block.lifetime[0]} to {block.lifetime[1]}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Generated C/C++ Header */}
      {activeTab === 'code' && (
        <div className="p-4 bg-[#0B0B0B] overflow-auto max-h-96 font-mono text-xs text-[#F3F3EF] leading-relaxed select-text">
          <pre>
            <code>{result.c_header_code}</code>
          </pre>
        </div>
      )}

      {/* Tab 4: Compiler Explainer */}
      {activeTab === 'explainer' && (
        <div className="p-4 space-y-3 font-sans text-xs">
          <div className="p-3 bg-[#1A1A1A] border border-[#292929] rounded-[3px] space-y-1">
            <h4 className="font-semibold text-[#F3F3EF] font-mono text-xs">
              Why does this model fit on {targetHw.name}?
            </h4>
            <p className="text-[#8A8A84] leading-relaxed">
              Shannon analyzed the computational graph of <strong>{result.model_name}</strong> and determined that activation tensor buffers have disjoint operational lifetimes. By executing greedy interval graph coloring, Shannon scheduled these buffers to share overlapping memory offsets, eliminating <strong>{((result.baseline_fp32.peak_sram_bytes - result.optimized_int8.peak_sram_bytes) / 1024).toFixed(1)} KB</strong> of redundant SRAM footprint.
            </p>
          </div>

          <div className="p-3 bg-[#1A1A1A] border border-[#292929] rounded-[3px] space-y-1">
            <h4 className="font-semibold text-[#F3F3EF] font-mono text-xs">
              Optimization Summary
            </h4>
            <ul className="list-disc list-inside text-[#8A8A84] space-y-1">
              {result.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};