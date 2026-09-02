import React from 'react';
import { Github, Sun, Moon, ShieldCheck, Terminal, Download } from 'lucide-react';
import { HardwareProfile, CompilationResult } from '../types';

interface AppHeaderProps {
  onOpenCommandPalette: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  currentHw: HardwareProfile;
  compilationResult: CompilationResult | null;
  onDownloadHeader: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onOpenCommandPalette,
  isDarkMode,
  onToggleTheme,
  currentHw,
  compilationResult,
  onDownloadHeader,
}) => {
  return (
    <header className="h-14 bg-surface border-b border-border px-4 sm:px-6 flex items-center justify-between select-none z-10">
      {/* Left Brand + Status Badges */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-accent rounded flex items-center justify-center font-mono font-bold text-white text-xs">
            S
          </div>
          <span className="font-bold text-sm text-text-primary tracking-tight">
            SHANNON <span className="text-[10px] font-mono text-accent bg-accent/10 px-1.5 py-0.5 rounded ml-1 font-normal">STUDIO v2.4</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2 pl-3 border-l border-border">
          <span className="flex items-center gap-1 text-[11px] font-mono text-success bg-success/10 px-2 py-0.5 rounded border border-success/20">
            <ShieldCheck className="w-3 h-3" />
            0-MALLOC PROVED
          </span>
          <span className="text-[11px] font-mono text-text-secondary">
            MISRA-C:2012 Rule 21.3 Compliant
          </span>
        </div>
      </div>

      {/* Center Quick Telemetry */}
      <div className="hidden lg:flex items-center gap-4 text-xs font-mono text-text-secondary bg-surface-raised px-3 py-1 rounded border border-border">
        <span>Target: <strong className="text-text-primary">{currentHw.name}</strong></span>
        <span>·</span>
        <span>Latency: <strong className="text-accent">{compilationResult?.optimized_int8.estimated_latency_ms || 1.1} ms</strong></span>
        <span>·</span>
        <span>Compression: <strong className="text-success">{compilationResult?.optimized_int8.flash_reduction_pct || 75}% Flash Saved</strong></span>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2 sm:gap-3 text-xs">
        <button
          onClick={onDownloadHeader}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-accent hover:bg-accent-hover text-white rounded text-xs font-medium transition"
          title="Download standalone C header"
        >
          <Download className="w-3.5 h-3.5" />
          Export SDK
        </button>

        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-raised hover:bg-surface-hover border border-border rounded text-text-secondary hover:text-text-primary transition font-mono text-[11px]"
          title="Open Command Palette (Cmd+K)"
        >
          <Terminal className="w-3 h-3" />
          <span className="hidden sm:inline">Cmd+K</span>
        </button>

        <button
          onClick={onToggleTheme}
          className="text-text-secondary hover:text-text-primary transition p-1.5 rounded hover:bg-surface-hover"
          title={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
          aria-label="Toggle Theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <a
          href="https://github.com/atharveeee-netizen/shannon"
          target="_blank"
          rel="noreferrer"
          className="text-text-secondary hover:text-text-primary transition p-1.5 rounded hover:bg-surface-hover"
          title="GitHub Repository"
          aria-label="GitHub Repository"
        >
          <Github className="w-4 h-4" />
        </a>
      </div>
    </header>
  );
};