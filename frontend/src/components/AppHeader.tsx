import React from 'react';
import { HardwareProfile } from '../types';
import { Cpu, Github, Search, ShieldCheck, Sun, Moon } from 'lucide-react';
import { Badge } from './ui/Badge';

interface AppHeaderProps {
  hardwareList: HardwareProfile[];
  selectedHwId: string;
  onSelectHardware: (id: string) => void;
  onOpenCommandPalette: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  hardwareList,
  selectedHwId,
  onSelectHardware,
  onOpenCommandPalette,
  isDarkMode,
  onToggleTheme,
}) => {
  return (
    <header className="h-13 bg-surface border-b border-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 select-none">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-sm text-text-primary tracking-wider">
            SHANNON
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-surface-raised text-text-secondary rounded-[2px] border border-border">
            v2.4
          </span>
        </div>
        <span className="text-xs text-text-secondary hidden md:inline">
          TinyML Model Compiler & Memory Arena Engine
        </span>
      </div>

      {/* Target MCU Dropdown + Actions */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 bg-surface-raised px-2.5 py-1 border border-border rounded-[3px]">
          <Cpu className="w-3.5 h-3.5 text-text-secondary" />
          <span className="text-[11px] text-text-secondary font-mono">Target:</span>
          <select
            value={selectedHwId}
            onChange={(e) => onSelectHardware(e.target.value)}
            className="bg-transparent text-xs font-mono text-text-primary font-medium focus:outline-none cursor-pointer"
            aria-label="Select Target Hardware MCU"
          >
            {hardwareList.map((h) => (
              <option key={h.id} value={h.id} className="bg-surface text-text-primary">
                {h.name} ({h.sram_kb}KB SRAM)
              </option>
            ))}
          </select>
        </div>

        {/* MISRA-C Compliance Badge */}
        <Badge variant="success" className="hidden sm:inline-flex">
          <ShieldCheck className="w-3 h-3" />
          <span>0 MALLOC</span>
        </Badge>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 text-text-secondary hover:text-text-primary bg-surface-raised hover:bg-surface-hover border border-border rounded-[3px] transition"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-2 bg-surface-raised hover:bg-surface-hover text-text-secondary hover:text-text-primary px-2 py-1 border border-border rounded-[3px] text-xs font-mono transition"
          aria-label="Open Command Palette"
        >
          <Search className="w-3.5 h-3.5" />
          <kbd className="text-[9px] bg-canvas px-1 py-0.5 rounded-[2px] border border-border">
            ⌘K
          </kbd>
        </button>

        {/* GitHub Link */}
        <a
          href="https://github.com/atharveeee-netizen/shannon"
          target="_blank"
          rel="noreferrer"
          className="p-1.5 text-text-secondary hover:text-text-primary bg-surface-raised hover:bg-surface-hover border border-border rounded-[3px] transition"
          title="GitHub Repository"
          aria-label="GitHub Repository"
        >
          <Github className="w-3.5 h-3.5" />
        </a>
      </div>
    </header>
  );
};