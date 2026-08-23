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
        else setQuery('');
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
      category: 'NAVIGATION',
      items: [
        { id: 'nav_zoo', label: 'Open Model Zoo and Benchmarks', icon: Database, action: () => { onSelectTab('zoo'); onClose(); } },
        { id: 'nav_wb', label: 'Open Compiler Workbench', icon: Terminal, action: () => { onSelectTab('workbench'); onClose(); } },
        { id: 'nav_arena', label: 'Open Zero Malloc SRAM Arena Map', icon: Zap, action: () => { onSelectTab('arena'); onClose(); } },
        { id: 'nav_sim', label: 'Open Silicon Simulator', icon: Cpu, action: () => { onSelectTab('simulator'); onClose(); } },
        { id: 'nav_export', label: 'Open C++ Header Exporter', icon: Download, action: () => { onSelectTab('export'); onClose(); } },
      ]
    },
    {
      category: 'ACTIONS',
      items: [
        { id: 'act_agent', label: 'Run 5-Agent Compiler Pipeline', icon: Terminal, action: () => { onTriggerAgentLoop(); onClose(); } },
        { id: 'act_audit', label: 'Run MISRA-C:2012 Static Memory Audit', icon: ShieldCheck, action: () => { onSelectTab('arena'); onClose(); } },
      ]
    },
    {
      category: 'TARGET SILICON',
      items: hardwareList.map((hw) => ({
        id: `hw_${hw.id}`,
        label: `Switch Target MCU to ${hw.name} (${hw.sram_kb}KB SRAM / ${hw.flash_mb}MB Flash)`,
        icon: Cpu,
        action: () => { onSelectHardware(hw.id); onClose(); }
      }))
    },
    {
      category: 'MODELS',
      items: models.map((m) => ({
        id: `mod_${m.id}`,
        label: `Load Model: ${m.name} (${m.domain} / ${m.accuracy_score} Acc)`,
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
        className="w-full max-w-2xl bg-[#1A1F28] border border-[#232936] rounded-[3px] shadow-2xl overflow-hidden flex flex-col font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-[#232936] bg-[#12151B]">
          <Search className="w-4 h-4 text-[#2B95D6] mr-3" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search models..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-xs text-[#F5F8FA] focus:outline-none placeholder-[#5C7080]"
          />
          <div className="flex items-center gap-2">
            <span className="text-[9px] bg-[#0B0D11] border border-[#232936] text-[#5C7080] px-1.5 py-0.5 rounded-[2px]">
              ESC
            </span>
            <button onClick={onClose} className="text-[#5C7080] hover:text-[#F5F8FA]">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {filtered.map((grp, idx) => (
            <div key={idx}>
              <span className="text-[9px] text-[#5C7080] font-bold uppercase tracking-wider px-2 block mb-1">
                {grp.category}
              </span>
              <div className="space-y-0.5">
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      className="w-full text-left px-2.5 py-2 rounded-[2px] text-xs text-[#F5F8FA] hover:bg-[#106BA3]/20 hover:text-[#2B95D6] flex items-center justify-between transition group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-3.5 h-3.5 text-[#A7B6C2] group-hover:text-[#2B95D6]" />
                        <span>{item.label}</span>
                      </div>
                      <span className="text-[10px] text-[#5C7080] font-sans opacity-0 group-hover:opacity-100">
                        Select
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="p-8 text-center text-xs text-[#5C7080]">
              No matching commands or models found for "{query}".
            </div>
          )}
        </div>

        <div className="px-4 py-2 bg-[#12151B] border-t border-[#232936] flex items-center justify-between text-[10px] text-[#5C7080]">
          <div className="flex items-center gap-3">
            <span>Navigate with arrows</span>
            <span>Press Enter to select</span>
          </div>
          <span className="text-[#0D8050] font-semibold">SHANNON AI v2.4</span>
        </div>
      </div>
    </div>
  );
};