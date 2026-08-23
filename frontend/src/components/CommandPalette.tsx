import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { HardwareProfile, PresetModel } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectHardware: (id: string) => void;
  onSelectModel: (id: string) => void;
  onTriggerCompile: () => void;
  onDownloadHeader: () => void;
  onToggleTheme: () => void;
  isDarkMode: boolean;
  hardwareList: HardwareProfile[];
  models: PresetModel[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectHardware,
  onSelectModel,
  onTriggerCompile,
  onDownloadHeader,
  onToggleTheme,
  isDarkMode,
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
      category: 'Actions',
      items: [
        {
          id: 'act_compile',
          label: 'Compile model',
          action: () => {
            onTriggerCompile();
            onClose();
          },
        },
        {
          id: 'act_download',
          label: 'Download shannon_model.h',
          action: () => {
            onDownloadHeader();
            onClose();
          },
        },
        {
          id: 'act_theme',
          label: isDarkMode ? 'Toggle theme (Light)' : 'Toggle theme (Dark)',
          action: () => {
            onToggleTheme();
            onClose();
          },
        },
      ],
    },
    {
      category: 'Target Hardware',
      items: hardwareList.map((hw) => ({
        id: `hw_${hw.id}`,
        label: `Target: ${hw.name} (${hw.sram_kb} KB SRAM, ${hw.flash_mb} MB Flash)`,
        action: () => {
          onSelectHardware(hw.id);
          onClose();
        },
      })),
    },
    {
      category: 'Preset Models',
      items: models.map((m) => ({
        id: `mod_${m.id}`,
        label: `Model: ${m.name} (${m.input_shape})`,
        action: () => {
          onSelectModel(m.id);
          onClose();
        },
      })),
    },
  ];

  const filtered = actions
    .map((grp) => ({
      ...grp,
      items: grp.items.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      ),
    }))
    .filter((grp) => grp.items.length > 0);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-20 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-surface border border-border rounded-[3px] shadow-lg overflow-hidden flex flex-col font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-border bg-surface-raised">
          <Search className="w-4 h-4 text-text-secondary mr-3" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-xs text-text-primary focus:outline-none placeholder-text-muted"
          />
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary p-1"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto p-2 space-y-3 text-xs">
          {filtered.map((grp, idx) => (
            <div key={idx}>
              <span className="text-[11px] text-text-muted font-medium px-2 block mb-1">
                {grp.category}
              </span>
              <div className="space-y-0.5">
                {grp.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className="w-full text-left px-2.5 py-1.5 rounded-[2px] text-text-primary hover:bg-surface-hover flex items-center justify-between transition"
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="p-6 text-center text-text-muted">
              No matching commands.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};