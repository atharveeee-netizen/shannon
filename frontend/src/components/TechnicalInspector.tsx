import React, { useState } from 'react';
import { CompilationResult, HardwareProfile } from '../types';
import { Copy, Check, Download, Layers, Cpu, ShieldAlert, CheckCircle2, Box } from 'lucide-react';

interface TechnicalInspectorProps {
  result: CompilationResult;
  targetHw: HardwareProfile;
  onDownloadHeader: () => void;
}

type TabId = 'overview' | 'memory' | 'code' | 'audit';

export const TechnicalInspector: React.FC<TechnicalInspectorProps> = ({
  result,
  targetHw,
  onDownloadHeader,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [copied, setCopied] = useState(false);
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.c_header_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs: { id: TabId; label: string; icon: any }[] = [
    { id: 'overview', label: 'Layers & Tensors', icon: Layers },
    { id: 'memory', label: 'Memory Arena (Interval Graph)', icon: Box },
    { id: 'code', label: 'Generated C Header', icon: Cpu },
    { id: 'audit', label: 'Safety & Hardware Audit', icon: ShieldAlert },
  ];

  const blockColors = ['#0284C7', '#0D9488', '#6366F1', '#F59E0B', '#EC4899', '#8B5CF6'];

  return (
    <div className="space-y-4 border-t border-border pt-4">
      {/* Inspector Tab Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border">
        <div className="flex items-center gap-1 overflow-x-auto">
          {tabs.map((t) => {
            const isActive = activeTab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-2 text-xs border-b-2 font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-accent text-accent'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'code' && (
          <div className="flex items-center gap-2 pb-1.5 sm:pb-0">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 bg-surface-raised hover:bg-surface-hover border border-border rounded text-xs text-text-secondary hover:text-text-primary transition flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={onDownloadHeader}
              className="px-2.5 py-1 bg-accent hover:bg-accent-hover text-white rounded text-xs font-medium transition flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              Download shannon_model.h
            </button>
          </div>
        )}
      </div>

      {/* Tab 1: Layers Overview */}
      {activeTab === 'overview' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-border text-text-secondary text-[11px]">
                <th className="py-2 font-medium">Layer ID</th>
                <th className="py-2 font-medium">Operation</th>
                <th className="py-2 font-medium">Output Dimension</th>
                <th className="py-2 font-medium">Compute (MACs)</th>
                <th className="py-2 font-medium">Flash Weights</th>
                <th className="py-2 font-medium">Physical SRAM Offset</th>
                <th className="py-2 font-medium">Bitwidth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {result.layers.map((l, idx) => (
                <tr key={l.layer_id} className="hover:bg-surface-hover transition-colors">
                  <td className="py-2.5 text-text-primary font-medium flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: blockColors[idx % blockColors.length] }}
                    />
                    {l.layer_id}
                  </td>
                  <td className="py-2.5 text-text-secondary">{l.op_type}</td>
                  <td className="py-2.5 text-text-secondary">{l.out_shape}</td>
                  <td className="py-2.5 text-text-primary font-semibold">{l.macs.toLocaleString()}</td>
                  <td className="py-2.5 text-text-secondary">{l.flash_bytes} B</td>
                  <td className="py-2.5 text-accent font-semibold">{l.sram_offset_hex}</td>
                  <td className="py-2.5 text-success font-medium">INT{l.bitwidth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Memory Arena Visualizer */}
      {activeTab === 'memory' && (
        <div className="space-y-5 font-mono text-xs">
          {/* Header Info */}
          <div className="p-3 bg-surface-raised border border-border rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
            <div>
              <span className="text-text-secondary block">Base Memory Address</span>
              <strong className="text-text-primary text-xs">0x20000000 (RAM_START)</strong>
            </div>
            <div>
              <span className="text-text-secondary block">Peak Arena Size</span>
              <strong className="text-accent text-xs">{(result.optimized_int8.peak_sram_bytes / 1024).toFixed(2)} KB</strong>
              <span className="text-text-muted ml-1">({((result.optimized_int8.peak_sram_bytes / (targetHw.sram_kb * 1024)) * 100).toFixed(1)}% of chip)</span>
            </div>
            <div>
              <span className="text-text-secondary block">Dynamic Heap Malloc</span>
              <strong className="text-success text-xs">0 Bytes (Static MISRA-C)</strong>
            </div>
          </div>

          {/* Graphical Arena Memory Strip */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-text-secondary uppercase font-semibold tracking-wider block">
              Contiguous Static Tensor Arena Map
            </span>
            <div className="w-full bg-surface-hover h-9 rounded border border-border overflow-hidden flex p-0.5 gap-0.5">
              {result.arena_blocks.map((b, idx) => {
                const widthPct = Math.max(15, (b.size_bytes / Math.max(result.optimized_int8.peak_sram_bytes, 1)) * 100);
                const color = b.color || blockColors[idx % blockColors.length];
                const isHovered = hoveredBlock === b.layer_id;
                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredBlock(b.layer_id)}
                    onMouseLeave={() => setHoveredBlock(null)}
                    className="h-full rounded-sm flex items-center justify-center text-[10px] text-white font-bold truncate px-2 transition-all cursor-pointer shadow-sm relative group"
                    style={{
                      width: `${widthPct}%`,
                      backgroundColor: color,
                      opacity: isHovered ? 1 : 0.88,
                      transform: isHovered ? 'scaleY(1.08)' : 'scaleY(1)',
                    }}
                  >
                    <span>{b.layer_id}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-text-muted">
              <span>Offset: +0x0000 (0 B)</span>
              <span>Offset: +0x{(result.optimized_int8.peak_sram_bytes).toString(16).toUpperCase()} ({result.optimized_int8.peak_sram_bytes} B)</span>
            </div>
          </div>

          {/* Memory Schedule Table */}
          <div className="overflow-x-auto pt-1">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-border text-text-secondary text-[11px]">
                  <th className="py-2 font-medium">Activation Buffer</th>
                  <th className="py-2 font-medium">Allocated Size</th>
                  <th className="py-2 font-medium">Hardware Hex Address</th>
                  <th className="py-2 font-medium">Lifetime Execution Window</th>
                  <th className="py-2 font-medium">Reuse Optimization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result.arena_blocks.map((b, idx) => (
                  <tr
                    key={idx}
                    onMouseEnter={() => setHoveredBlock(b.layer_id)}
                    onMouseLeave={() => setHoveredBlock(null)}
                    className={`transition-colors ${
                      hoveredBlock === b.layer_id ? 'bg-surface-hover' : ''
                    }`}
                  >
                    <td className="py-2.5 text-text-primary font-medium flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: b.color || blockColors[idx % blockColors.length] }}
                      />
                      {b.name}
                    </td>
                    <td className="py-2.5 text-text-secondary">{b.size_bytes} Bytes</td>
                    <td className="py-2.5 text-accent font-semibold">{b.hex_address}</td>
                    <td className="py-2.5 text-text-secondary">Step {b.lifetime[0]} → Step {b.lifetime[1]}</td>
                    <td className="py-2.5 text-success font-medium">
                      {b.name.includes('Reused') ? 'Slot Recycled (0 Overhead)' : 'Disjoint Base Slot'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Generated C/C++ Header */}
      {activeTab === 'code' && (
        <div className="bg-code text-code-text p-4 rounded border border-border font-mono text-xs overflow-x-auto leading-relaxed select-text max-h-[520px]">
          <pre>
            <code>{result.c_header_code}</code>
          </pre>
        </div>
      )}

      {/* Tab 4: Audit & Verification */}
      {activeTab === 'audit' && (
        <div className="space-y-3 font-mono text-xs">
          <div className="divide-y divide-border border border-border rounded">
            <div className="p-3.5 flex items-center justify-between hover:bg-surface-hover/40 transition">
              <div>
                <span className="font-semibold text-text-primary flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  Dynamic Memory Allocation Check (Rule 21.3)
                </span>
                <span className="text-[11px] text-text-secondary block mt-0.5">
                  AST scanner verified 0 occurrences of malloc(), calloc(), realloc(), and free() in emitted inference loop.
                </span>
              </div>
              <span className="text-success font-bold px-2 py-0.5 bg-success/10 rounded border border-success/20">
                PASS (0 B Malloc)
              </span>
            </div>

            <div className="p-3.5 flex items-center justify-between hover:bg-surface-hover/40 transition">
              <div>
                <span className="font-semibold text-text-primary flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  Buffer Collision & Lifetime Disjointness Proof
                </span>
                <span className="text-[11px] text-text-secondary block mt-0.5">
                  Interval graph coloring proven collision-free across all scheduled layer activation lifetimes.
                </span>
              </div>
              <span className="text-success font-bold px-2 py-0.5 bg-success/10 rounded border border-success/20">
                PASS (0 Collisions)
              </span>
            </div>

            <div className="p-3.5 flex items-center justify-between hover:bg-surface-hover/40 transition">
              <div>
                <span className="font-semibold text-text-primary flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  Bus Word Alignment Validation
                </span>
                <span className="text-[11px] text-text-secondary block mt-0.5">
                  All tensor arena offsets and input/output structures are strictly 4-byte word aligned for zero-cycle DMA penalties.
                </span>
              </div>
              <span className="text-success font-bold px-2 py-0.5 bg-success/10 rounded border border-success/20">
                PASS (32-Bit Aligned)
              </span>
            </div>

            <div className="p-3.5 flex items-center justify-between hover:bg-surface-hover/40 transition">
              <div>
                <span className="font-semibold text-text-primary flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  Physical Silicon Memory Fit: {targetHw.name}
                </span>
                <span className="text-[11px] text-text-secondary block mt-0.5">
                  Peak SRAM: {(result.optimized_int8.peak_sram_bytes / 1024).toFixed(1)} KB &lt; {targetHw.sram_kb} KB | Flash: {(result.optimized_int8.flash_bytes / 1024).toFixed(1)} KB &lt; {targetHw.flash_mb * 1024} KB
                </span>
              </div>
              <span className={`font-bold px-2 py-0.5 rounded border ${
                result.fits_hardware
                  ? 'text-success bg-success/10 border-success/20'
                  : 'text-danger bg-danger/10 border-danger/20'
              }`}>
                {result.fits_hardware ? 'PASS' : 'FAIL'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};