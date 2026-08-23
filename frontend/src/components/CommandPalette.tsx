import React, { useState, useEffect } from 'react';
import { Search, Cpu, Database, Download, X } from 'lucide-react';
import { HardwareProfile, PresetModel } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectHardware: (id: string) => void;
  onSelectModel: (id: string) => void;
  onTriggerCompile: () => void;
  hardwareList: HardwareProfile[];
  models: PresetModel[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectHardware,
  onSelectModel,
  onTriggerCompile,
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
      category: 'ACTIONS',
      items: [
        { id: 'act_compile', label: 'Recompile and optimize current model', icon: Download, action: () => { onTriggerCompile(); onClose(); } },
      ],
    },
    {
      category: 'SELECT TARGET HARDWARE',
      items: hardwareList.map((hw) => ({
        id: `hw_${hw.id}`,
        label: `Switch target to ${hw.name} (${hw.sram_kb}KB SRAM / ${hw.flash_mb}MB Flash)`,
        icon: Cpu,
        action: () => { onSelectHardware(hw.id); onClose(); },
      })),
    },
    {
      category: 'SELECT PRESET MODEL',
      items: models.map((m) => ({
        id: `mod_${m.id}`,
        label: `Load ${m.name} (${m.domain})`,
        icon: Database,
        action: () => { onSelectModel(m.id); onClose(); },
      })),
    },
  ];

  const filtered = actions
    .map((grp) => ({
      ...grp,
      items: grp.items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())),
    }))
    .filter((grp) => grp.items.length > 0);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-20 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#141414] border border-[#292929] rounded-[3px] shadow-2xl overflow-hidden flex flex-col font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-[#292929] bg-[#111111]">
          <Search className="w-4 h-4 text-[#8A8A84] mr-3" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command, model, or hardware..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-xs text-[#F3F3EF] focus:outline-none placeholder-[#8A8A84]"
          />
          <div className="flex items-center gap-2">
            <span className="text-[9px] bg-[#1A1A1A] border border-[#292929] text-[#8A8A84] px-1.5 py-0.5 rounded-[2px]">
              ESC
            </span>
            <button onClick={onClose} className="text-[#8A8A84] hover:text-[#F3F3EF]">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-3">
          {filtered.map((grp, idx) => (
            <div key={idx}>
              <span className="text-[9px] text-[#8A8A84] font-bold uppercase tracking-wider px-2 block mb-1">
                {grp.category}
              </span>
              <div className="space-y-0.5">
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      className="w-full text-left px-2.5 py-2 rounded-[2px] text-xs text-[#F3F3EF] hover:bg-[#222222] flex items-center justify-between transition group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-3.5 h-3.5 text-[#8A8A84] group-hover:text-[#F3F3EF]" />
                        <span>{item.label}</span>
                      </div>
                      <span className="text-[10px] text-[#8A8A84] opacity-0 group-hover:opacity-100">
                        Select
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="p-6 text-center text-xs text-[#8A8A84]">
              No matching commands found for "{query}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};