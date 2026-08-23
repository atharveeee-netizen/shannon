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
      category: 'STUDIO NAVIGATION',
      items: [
        { id: 'nav_zoo', label: 'Open Model Zoo & Benchmarks', icon: Database, action: () => { onSelectTab('zoo'); onClose(); } },
        { id: 'nav_wb', label: 'Open Compiler Workbench & Pipeline', icon: Terminal, action: () => { onSelectTab('workbench'); onClose(); } },
        { id: 'nav_arena', label: 'Open Zero-Malloc SRAM Arena Map', icon: Zap, action: () => { onSelectTab('arena'); onClose(); } },
        { id: 'nav_sim', label: 'Open Silicon Hardware Simulator', icon: Cpu, action: () => { onSelectTab('simulator'); onClose(); } },
        { id: 'nav_export', label: 'Open C/C++ Firmware Exporter', icon: Download, action: () => { onSelectTab('export'); onClose(); } },
      ]
    },
    {
      category: 'AUTONOMOUS COMPILER ACTIONS',
      items: [
        { id: 'act_agent', label: 'Run 5-Agent Hardware Optimization Loop', icon: Terminal, action: () => { onTriggerAgentLoop(); onClose(); } },
        { id: 'act_audit', label: 'Run MISRA-C:2012 Static Memory Proof', icon: ShieldCheck, action: () => { onSelectTab('arena'); onClose(); } },
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
      category: 'TINYML MODELS',
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
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-24 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#13171F] border border-[#21262D] rounded-[4px] shadow-2xl overflow-hidden flex flex-col font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-[#21262D] bg-[#0D1117]">
          <Search className="w-4 h-4 text-[#38BDF8] mr-3" />
          <input
            type="text"
            autoFocus
            placeholder="Search commands, hardware profiles, models..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-xs text-[#F0F6FC] focus:outline-none placeholder-[#484F58]"
          />
          <div className="flex items-center gap-2">
            <span className="text-[9px] bg-[#0A0D12] border border-[#21262D] text-[#484F58] px-1.5 py-0.5 rounded-[2px]">
              ESC
            </span>
            <button onClick={onClose} className="text-[#484F58] hover:text-[#F0F6FC]">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {filtered.map((grp, idx) => (
            <div key={idx}>
              <span className="text-[9px] text-[#484F58] font-bold uppercase tracking-wider px-2 block mb-1">
                {grp.category}
              </span>
              <div className="space-y-0.5">
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      className="w-full text-left px-2.5 py-2 rounded-[3px] text-xs text-[#F0F6FC] hover:bg-[#0284C7]/20 hover:text-[#38BDF8] flex items-center justify-between transition group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-3.5 h-3.5 text-[#8B949E] group-hover:text-[#38BDF8]" />
                        <span>{item.label}</span>
                      </div>
                      <span className="text-[10px] text-[#484F58] font-sans opacity-0 group-hover:opacity-100">
                        Select
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="p-8 text-center text-xs text-[#484F58]">
              No matching commands or models found for "{query}".
            </div>
          )}
        </div>

        <div className="px-4 py-2 bg-[#0D1117] border-t border-[#21262D] flex items-center justify-between text-[10px] text-[#484F58]">
          <div className="flex items-center gap-3">
            <span>Use ↑↓ to navigate</span>
            <span>↵ to select</span>
          </div>
          <span className="text-[#00FFA3] font-bold">SHANNON STUDIO v2.4</span>
        </div>
      </div>
    </div>
  );
};