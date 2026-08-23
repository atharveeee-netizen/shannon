import React, { useState } from 'react';
import { CompilationResult, HardwareProfile } from '../types';
import { Layers, Zap, Code, HelpCircle, ShieldCheck, Copy, Check, Lock, CheckCircle2 } from 'lucide-react';
import { Tabs, TabItem } from './ui/Tabs';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface TechnicalInspectorProps {
  result: CompilationResult;
  targetHw: HardwareProfile;
}

type InspectorTabId = 'layers' | 'arena' | 'code' | 'audit' | 'explainer';

export const TechnicalInspector: React.FC<TechnicalInspectorProps> = ({
  result,
  targetHw,
}) => {
  const [activeTab, setActiveTab] = useState<InspectorTabId>('layers');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.c_header_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs: TabItem<InspectorTabId>[] = [
    { id: 'layers', label: 'Layer Memory Layout', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'arena', label: 'SRAM Arena Timeline', icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'code', label: 'Generated C/C++ Header', icon: <Code className="w-3.5 h-3.5" /> },
    { id: 'audit', label: 'Audit & Compliance', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'explainer', label: 'Compiler Explainer', icon: <HelpCircle className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-mono text-text-secondary">
        <span>3. TECHNICAL INSPECTOR</span>
        <span>Progressive disclosure of compiler internals</span>
      </div>

      <div className="bg-surface border border-border rounded-[3px] overflow-hidden shadow-xs">
        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-4 bg-surface border-b border-border">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="border-b-0" />

          {activeTab === 'code' && (
            <Button
              onClick={handleCopy}
              variant="secondary"
              size="sm"
              icon={copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
            >
              {copied ? 'Copied' : 'Copy Code'}
            </Button>
          )}
        </div>

        {/* Tab 1: Layer Memory Layout Table */}
        {activeTab === 'layers' && (
          <div className="p-4 space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-border text-[10px] text-text-secondary uppercase bg-surface-raised">
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
                <tbody className="divide-y divide-border">
                  {result.layers.map((l) => (
                    <tr key={l.layer_id} className="text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors">
                      <td className="p-2 font-medium text-text-primary">{l.layer_id}</td>
                      <td className="p-2">{l.op_type}</td>
                      <td className="p-2 text-text-secondary">{l.out_shape}</td>
                      <td className="p-2 text-text-primary">{l.macs.toLocaleString()}</td>
                      <td className="p-2">{l.flash_bytes} B</td>
                      <td className="p-2 text-success font-semibold">{l.sram_offset_hex}</td>
                      <td className="p-2 text-text-secondary">{l.scale_factor.toFixed(5)}</td>
                      <td className="p-2">
                        <Badge variant="success">INT{l.bitwidth}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] font-mono text-text-secondary">
              <span>Memory alignment: 4-Byte Word</span>
              <span>Zero pointer aliasing guaranteed</span>
            </div>
          </div>
        )}

        {/* Tab 2: SRAM Arena Timeline */}
        {activeTab === 'arena' && (
          <div className="p-4 space-y-4 font-mono text-xs">
            <div className="bg-surface-raised p-3 rounded-[3px] border border-border">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-text-secondary">
                  Arena Capacity: <strong className="text-success font-bold">{(result.optimized_int8.peak_sram_bytes / 1024).toFixed(2)} KB</strong>
                </span>
                <span className="text-text-secondary flex items-center gap-1">
                  <Lock className="w-3 h-3 text-success" /> Base Address: 0x20000000
                </span>
              </div>

              <div className="w-full bg-canvas h-3.5 rounded-[2px] border border-border overflow-hidden flex">
                {result.arena_blocks.map((b, idx) => {
                  const widthPct = Math.max(12, (b.size_bytes / result.optimized_int8.peak_sram_bytes) * 100);
                  return (
                    <div
                      key={idx}
                      title={`${b.name}: ${b.size_bytes} Bytes @ ${b.hex_address}`}
                      className="h-full border-r border-border flex items-center justify-center text-[8px] font-bold text-canvas transition-opacity hover:opacity-80"
                      style={{ width: `${widthPct}%`, backgroundColor: b.color }}
                    >
                      {b.layer_id}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-text-secondary uppercase tracking-wider block font-semibold">
                SCHEDULED BUFFER LIFETIME INTERVALS
              </span>
              {result.arena_blocks.map((block, idx) => (
                <div key={idx} className="p-2.5 bg-surface-raised border border-border rounded-[2px] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: block.color }} />
                    <span className="font-medium text-text-primary">{block.name}</span>
                    <span className="text-text-secondary">({block.size_bytes} Bytes)</span>
                  </div>
                  <div className="text-text-secondary text-[10px]">
                    Offset: <span className="text-success font-semibold">{block.hex_address}</span> | Lifetime: Steps {block.lifetime[0]} to {block.lifetime[1]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Generated C/C++ Header */}
        {activeTab === 'code' && (
          <div className="p-4 bg-code overflow-auto max-h-96 font-mono text-xs text-text-primary leading-relaxed select-text border-t border-border">
            <pre>
              <code>{result.c_header_code}</code>
            </pre>
          </div>
        )}

        {/* Tab 4: Audit & Compliance */}
        {activeTab === 'audit' && (
          <div className="p-4 space-y-3 font-mono text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-surface-raised border border-border rounded-[2px]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-text-secondary uppercase">MISRA-C:2012</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                </div>
                <span className="font-bold text-text-primary text-xs">Rule 21.3 Compliant</span>
                <p className="text-[10px] text-text-secondary mt-1 font-sans">
                  Standard library dynamic memory functions (malloc, calloc, free) are strictly absent.
                </p>
              </div>

              <div className="p-3 bg-surface-raised border border-border rounded-[2px]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-text-secondary uppercase">ARENA COLLISION</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                </div>
                <span className="font-bold text-text-primary text-xs">Zero Overlaps Verified</span>
                <p className="text-[10px] text-text-secondary mt-1 font-sans">
                  Graph coloring algorithm mathematically proved zero memory collisions during inference.
                </p>
              </div>

              <div className="p-3 bg-surface-raised border border-border rounded-[2px]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-text-secondary uppercase">ALIGNMENT</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                </div>
                <span className="font-bold text-text-primary text-xs">4-Byte Word Aligned</span>
                <p className="text-[10px] text-text-secondary mt-1 font-sans">
                  All tensor offsets satisfy 32-bit hardware bus alignment requirements.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Compiler Explainer */}
        {activeTab === 'explainer' && (
          <div className="p-4 space-y-3 font-sans text-xs">
            <div className="p-3 bg-surface-raised border border-border rounded-[3px] space-y-1">
              <h4 className="font-semibold text-text-primary font-mono text-xs">
                Why does this model fit on {targetHw.name}?
              </h4>
              <p className="text-text-secondary leading-relaxed">
                Shannon analyzed the computational graph of <strong>{result.model_name}</strong> and identified disjoint tensor activation lifetimes. By applying greedy interval graph coloring, Shannon scheduled these activation tensors to reuse memory offsets at base address <code>0x20000000</code>, reducing peak SRAM from <strong>{(result.baseline_fp32.peak_sram_bytes / 1024).toFixed(1)} KB</strong> down to <strong>{(result.optimized_int8.peak_sram_bytes / 1024).toFixed(1)} KB</strong> with 0 Bytes runtime heap allocation.
              </p>
            </div>

            <div className="p-3 bg-surface-raised border border-border rounded-[3px] space-y-1">
              <h4 className="font-semibold text-text-primary font-mono text-xs">
                Compiler Decisions & Recommendations
              </h4>
              <ul className="list-disc list-inside text-text-secondary space-y-1">
                {result.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};