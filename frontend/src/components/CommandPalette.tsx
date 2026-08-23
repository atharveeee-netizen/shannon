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
      category: 'STUDIO COMMANDS',
      items: [
        { id: 'act_agent', label: 'Run 5-Agent Compiler Optimization Loop', icon: Terminal, action: () => { onTriggerAgentLoop(); onClose(); } },
        { id: 'act_audit', label: 'Run MISRA-C:2012 Static Memory Audit', icon: ShieldCheck, action: () => { onSelectTab('arena'); onClose(); } },
        { id: 'nav_export', label: 'Export Standalone C/C++ Header (.h)', icon: Download, action: () => { onSelectTab('export'); onClose(); } },
        { id: 'nav_arena', label: 'Inspect SRAM Zero-Malloc Arena', icon: Zap, action: () => { onSelectTab('arena'); onClose(); } },
      ]
    },
    {
      category: 'TARGET SILICON (MCU)',
      items: hardwareList.map((hw) => ({
        id: `hw_${hw.id}`,
        label: `Switch Target to ${hw.name} (${hw.sram_kb}KB SRAM / ${hw.flash_mb}MB Flash)`,
        icon: Cpu,
        action: () => { onSelectHardware(hw.id); onClose(); }
      }))
    },
    {
      category: 'TINYML BENCHMARK MODELS',
      items: models.map((m) => ({
        id: `mod_${m.id}`,
        label: `Load Model: ${m.name} (${m.domain} • ${m.accuracy_score})`,
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
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-24 p-4 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#111622] border border-[#1E293B] rounded-[3px] shadow-2xl overflow-hidden flex flex-col font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-[#1E293B] bg-[#0B0E14]">
          <Search className="w-4 h-4 text-[#3B82F6] mr-3" />
          <input
            type="text"
            autoFocus
            placeholder="Search commands, hardware profiles, models..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-xs text-[#F8FAFC] focus:outline-none placeholder-[#64748B]"
          />
          <div className="flex items-center gap-2">
            <span className="text-[9px] bg-[#151B28] border border-[#1E293B] text-[#64748B] px-1.5 py-0.5 rounded-[2px]">
              ESC
            </span>
            <button onClick={onClose} className="text-[#64748B] hover:text-[#F8FAFC]">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {filtered.map((grp, idx) => (
            <div key={idx}>
              <span className="text-[9px] text-[#64748B] font-bold uppercase tracking-wider px-2 block mb-1">
                {grp.category}
              </span>
              <div className="space-y-0.5">
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      className="w-full text-left px-2.5 py-2 rounded-[2px] text-xs text-[#F8FAFC] hover:bg-[#151B28] hover:text-[#3B82F6] flex items-center justify-between transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#3B82F6]" />
                        <span>{item.label}</span>
                      </div>
                      <span className="text-[10px] text-[#64748B] font-sans opacity-0 group-hover:opacity-100">
                        Select
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="p-8 text-center text-xs text-[#64748B]">
              No matching commands or models found for "{query}".
            </div>
          )}
        </div>

        <div className="px-4 py-2 bg-[#0B0E14] border-t border-[#1E293B] flex items-center justify-between text-[10px] text-[#64748B]">
          <div className="flex items-center gap-3">
            <span>Use ↑↓ to navigate</span>
            <span>↵ to select</span>
          </div>
          <span className="text-[#10B981] font-bold">SHANNON STUDIO v2.4</span>
        </div>
      </div>
    </div>
  );
};