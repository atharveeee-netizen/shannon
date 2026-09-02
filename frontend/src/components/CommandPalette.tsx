import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Zap,
  HardDrive,
  GitMerge,
  Cpu,
  Download,
  Terminal,
  Sun,
  Moon,
  Box,
  Layers,
  FileCode,
} from 'lucide-react';
import { useCompiler } from '../context/CompilerContext';
import { PRESET_MODELS } from '../services/api';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const {
    loadedModel,
    hardwareList,
    setHardware,
    loadPreset,
    triggerCompile,
    downloadHeader,
    setActiveTab,
    isDarkMode,
    setIsDarkMode,
  } = useCompiler();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Global Ctrl+K / Cmd+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    // Core Actions
    {
      id: 'compile',
      title: 'Run Silicon Compilation Pipeline',
      category: 'Compiler',
      icon: Zap,
      action: () => {
        triggerCompile();
        onClose();
      },
    },
    {
      id: 'export_header',
      title: 'Export Standalone C Header (shannon_model.h)',
      category: 'Export',
      icon: Download,
      action: () => {
        downloadHeader();
        onClose();
      },
    },
    // Navigation
    {
      id: 'nav_dashboard',
      title: 'Go to Dashboard',
      category: 'Navigation',
      icon: Layers,
      action: () => {
        setActiveTab('dashboard');
        onClose();
      },
    },
    {
      id: 'nav_graph',
      title: 'Go to Computation Graph (DAG)',
      category: 'Navigation',
      icon: GitMerge,
      action: () => {
        setActiveTab('graph');
        onClose();
      },
    },
    {
      id: 'nav_memory',
      title: 'Go to SRAM Memory Arena Visualizer',
      category: 'Navigation',
      icon: Cpu,
      action: () => {
        setActiveTab('memory');
        onClose();
      },
    },
    {
      id: 'nav_codegen',
      title: 'Go to Generated C/C++ Header',
      category: 'Navigation',
      icon: FileCode,
      action: () => {
        setActiveTab('codegen');
        onClose();
      },
    },
    {
      id: 'nav_logs',
      title: 'Go to Compiler Logs',
      category: 'Navigation',
      icon: Terminal,
      action: () => {
        setActiveTab('logs');
        onClose();
      },
    },
    // Model Presets
    ...PRESET_MODELS.map((m) => ({
      id: `model_${m.id}`,
      title: `Load Model: ${m.name} (${m.domain})`,
      category: 'Models',
      icon: Box,
      action: () => {
        loadPreset(m.id, true);
        onClose();
      },
    })),
    // Hardware Targets
    ...hardwareList.map((hw) => ({
      id: `hw_${hw.id}`,
      title: `Set Target Silicon: ${hw.name} (${hw.clock_mhz}MHz, ${hw.sram_kb}KB SRAM)`,
      category: 'Hardware',
      icon: HardDrive,
      action: () => {
        setHardware(hw.id);
        onClose();
      },
    })),
    // Theme
    {
      id: 'toggle_theme',
      title: `Switch to ${isDarkMode ? 'Light' : 'Dark'} Theme`,
      category: 'Settings',
      icon: isDarkMode ? Sun : Moon,
      action: () => {
        setIsDarkMode(!isDarkMode);
        onClose();
      },
    },
  ];

  const filteredCommands = commands.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDownList = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-xl rounded-lg bg-surface border border-border shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-border gap-3 bg-surface-raised/40">
          <Search className="w-4 h-4 text-text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownList}
            placeholder="Type a command or search models, hardware, views..."
            className="w-full bg-transparent text-text-primary text-xs font-medium focus:outline-none placeholder-text-muted"
          />
          <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-[10px] font-mono text-text-muted">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-xs text-text-muted">No commands found matching "{query}"</div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => cmd.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 rounded text-xs cursor-pointer transition-colors ${
                    isSelected ? 'bg-accent/15 text-accent' : 'text-text-primary hover:bg-surface-hover'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-accent' : 'text-text-muted'}`} />
                    <span className="font-medium">{cmd.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
                    {cmd.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-border bg-surface-raised/30 flex items-center justify-between text-[10px] font-mono text-text-muted">
          <div className="flex items-center gap-2">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span>Active: {loadedModel?.name || 'None'}</span>
        </div>
      </div>
    </div>
  );
};