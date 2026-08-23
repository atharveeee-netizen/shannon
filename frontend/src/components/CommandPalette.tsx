import React, { useState, useEffect } from 'react';
import { Search, Terminal, Cpu, Database, ShieldCheck, Download, Zap, X } from 'lucide-react';
import { HardwareProfile, ModelZooItem } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: 'zoo' | 'workbench' | 'arena' | 'simulator' | 'export') => void;
  onSelectHardware: (id: string) => void;
  onSelectModel: (id: string) => void;
  onTriggerAgentLoop: () => void;
  hardwareList: HardwareProfile[];
  models: ModelZooItem[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onSelectHardware,
  onSelectModel,
  onTriggerAgentLoop,
  hardwareList,
  models,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery('');
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      category: 'NAVIGATION & PANELS',
      items: [
        { id: 'nav_zoo', label: 'Open 01. Model Zoo & Compression Benchmark Matrix', icon: Database, action: () => { onSelectTab('zoo'); onClose(); } },
        { id: 'nav_wb', label: 'Open 02. Autonomous Compiler Workbench & Bento Table', icon: Terminal, action: () => { onSelectTab('workbench'); onClose(); } },
        { id: 'nav_arena', label: 'Open 03. Zero-Malloc Contiguous SRAM Arena Map', icon: Zap, action: () => { onSelectTab('arena'); onClose(); } },
        { id: 'nav_sim', label: 'Open 04. In-Browser WebAssembly Silicon Simulator', icon: Cpu, action: () => { onSelectTab('simulator'); onClose(); } },
        { id: 'nav_export', label: 'Open 05. Standalone Zero-Dependency C/C++ Exporter', icon: Download, action: () => { onSelectTab('export'); onClose(); } },
      ]
    },
    {
      category: 'AUTONOMOUS AGENT ACTIONS',
      items: [
        { id: 'act_agent', label: 'Trigger Karpathy & DeepSeek 5-Agent Compiler Optimization', icon: Terminal, action: () => { onTriggerAgentLoop(); onClose(); } },
        { id: 'act_audit', label: 'Run Strix Security MISRA-C:2012 Static Memory Audit', icon: ShieldCheck, action: () => { onSelectTab('arena'); onClose(); } },
      ]
    },
    {
      category: 'TARGET SILICON SELECTION',
      items: hardwareList.map((hw) => ({
        id: `hw_${hw.id}`,
        label: `Switch Target MCU to ${hw.name} (${hw.sram_kb}KB SRAM / ${hw.flash_mb}MB Flash)`,
        icon: Cpu,
        action: () => { onSelectHardware(hw.id); onClose(); }
      }))
    },
    {
      category: 'MODEL SELECTION',
      items: models.map((m) => ({
        id: `mod_${m.id}`,
        label: `Load Model: ${m.name} (${m.domain} • ${m.accuracy_score} Acc)`,
        icon: Database,
        action: () => { onSelectModel(m.id); onClose(); }
      }))
    }
  ];

  const filtered = actions
    .map((grp) => ({
      ...grp,
      items: grp.items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())),
    }))
    .filter((grp) => grp.items.length > 0);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-24 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-palantir-card border border-palantir-border rounded-[3px] shadow-2xl overflow-hidden flex flex-col font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-palantir-border bg-palantir-nav">
          <Search className="w-4 h-4 text-palantir-cobalt mr-3" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command, search models, switch MCU, or run audit..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-xs text-palantir-textPrimary focus:outline-none placeholder-palantir-textMuted"
          />
          <div className="flex items-center gap-2">
            <span className="text-[9px] bg-palantir-canvas border border-palantir-border text-palantir-textMuted px-1.5 py-0.5 rounded-[2px]">
              ESC
            </span>
            <button onClick={onClose} className="text-palantir-textMuted hover:text-palantir-textPrimary">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {filtered.map((grp, idx) => (
            <div key={idx}>
              <span className="text-[9px] text-palantir-textMuted font-bold uppercase tracking-wider px-2 block mb-1">
                {grp.category}
              </span>
              <div className="space-y-0.5">
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      className="w-full text-left px-2.5 py-2 rounded-[2px] text-xs text-palantir-textPrimary hover:bg-palantir-action/20 hover:text-palantir-cobalt flex items-center justify-between transition group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-3.5 h-3.5 text-palantir-textSecondary group-hover:text-palantir-cobalt" />
                        <span>{item.label}</span>
                      </div>
                      <span className="text-[10px] text-palantir-textMuted font-sans opacity-0 group-hover:opacity-100">
                        ↵ Select
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="p-8 text-center text-xs text-palantir-textMuted">
              No matching commands or models found for "{query}".
            </div>
          )}
        </div>

        {/* Command Palette Footer */}
        <div className="px-4 py-2 bg-palantir-nav border-t border-palantir-border flex items-center justify-between text-[10px] text-palantir-textMuted">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-palantir-pass font-semibold">STRIX AUDITED • SHANNON AI v2.4</span>
        </div>
      </div>
    </div>
  );
};