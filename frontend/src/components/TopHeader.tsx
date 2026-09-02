import React from 'react';
import {
  Github,
  Sun,
  Moon,
  Terminal,
  Play,
  Loader2,
  HardDrive,
} from 'lucide-react';
import { HardwareProfile, PresetModel } from '../types';

interface TopHeaderProps {
  currentModel: PresetModel;
  currentHw: HardwareProfile;
  hardwareList: HardwareProfile[];
  onSelectHardware: (id: string) => void;
  isCompiling: boolean;
  onRunCompile: () => void;
  compilationStatus: 'READY' | 'COMPILING' | 'VERIFIED' | 'FAILED';
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenCommandPalette: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentModel,
  currentHw,
  hardwareList,
  onSelectHardware,
  isCompiling,
  onRunCompile,
  compilationStatus,
  isDarkMode,
  onToggleTheme,
  onOpenCommandPalette,
}) => {
  return (
    <header className="h-12 bg-surface border-b border-border px-4 flex items-center justify-between select-none z-10 font-sans text-xs">
      {/* Left: Project & Model Context */}
      <div className="flex items-center gap-2 font-mono">
        <span className="font-semibold text-text-primary">SHANNON</span>
        <span className="text-text-muted">/</span>
        <span className="text-text-secondary truncate max-w-[200px]" title={currentModel.name}>
          {currentModel.name.toUpperCase().replace(/\s+/g, '_')}
        </span>
      </div>

      {/* Center: Compilation Status Indicator */}
      <div className="hidden md:flex items-center gap-2 font-mono text-[11px]">
        <div
          className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded border font-semibold ${
            compilationStatus === 'VERIFIED'
              ? 'bg-success-subtle text-success border-success/30'
              : compilationStatus === 'COMPILING'
              ? 'bg-primary-subtle text-primary border-primary/30'
              : compilationStatus === 'FAILED'
              ? 'bg-danger-subtle text-danger border-danger/30'
              : 'bg-surface-raised text-text-secondary border-border'
          }`}
        >
          {compilationStatus === 'COMPILING' ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                compilationStatus === 'VERIFIED'
                  ? 'bg-success'
                  : compilationStatus === 'FAILED'
                  ? 'bg-danger'
                  : 'bg-text-muted'
              }`}
            />
          )}
          <span>{compilationStatus}</span>
        </div>

        <span className="text-text-muted">·</span>
        <span className="text-text-secondary">
          Target: <strong className="text-text-primary">{currentHw.name}</strong>
        </span>
      </div>

      {/* Right: Controls & Actions */}
      <div className="flex items-center gap-2 font-mono">
        {/* Hardware Target Select */}
        <div className="hidden sm:flex items-center gap-1 bg-surface-raised border border-border rounded px-2 py-1">
          <HardDrive className="w-3 h-3 text-text-muted" />
          <select
            value={currentHw.id}
            onChange={(e) => onSelectHardware(e.target.value)}
            className="bg-transparent text-text-primary text-[11px] focus:outline-none cursor-pointer pr-1"
          >
            {hardwareList.map((h) => (
              <option key={h.id} value={h.id} className="bg-surface text-text-primary">
                {h.name} ({h.clock_mhz}MHz)
              </option>
            ))}
          </select>
        </div>

        {/* Primary Action: Run Compile */}
        <button
          onClick={onRunCompile}
          disabled={isCompiling}
          className="px-3 py-1 bg-primary hover:bg-primary-hover text-white text-[11px] font-semibold rounded flex items-center gap-1.5 transition disabled:opacity-50"
        >
          {isCompiling ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Compiling...</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 fill-current" />
              <span>Run Compile</span>
            </>
          )}
        </button>

        {/* Command Palette */}
        <button
          onClick={onOpenCommandPalette}
          className="p-1 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded transition"
          title="Command Palette (Ctrl+K)"
        >
          <Terminal className="w-3.5 h-3.5" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-1 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded transition"
          title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* GitHub Link */}
        <a
          href="https://github.com/atharveeee-netizen/shannon"
          target="_blank"
          rel="noreferrer"
          className="p-1 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded transition"
          title="GitHub Repository"
        >
          <Github className="w-3.5 h-3.5" />
        </a>
      </div>
    </header>
  );
};
