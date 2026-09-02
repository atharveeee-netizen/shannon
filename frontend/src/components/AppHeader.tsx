import React from 'react';
import { Github, Sun, Moon, ShieldCheck, Terminal, Download, Zap } from 'lucide-react';
import { HardwareProfile, CompilationResult, PresetModel } from '../types';

interface AppHeaderProps {
  onOpenCommandPalette: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  currentHw: HardwareProfile;
  currentModel: PresetModel;
  compilationResult: CompilationResult | null;
  onDownloadHeader: () => void;
  isQuantized: boolean;
  onToggleQuantization: (quantized: boolean) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onOpenCommandPalette,
  isDarkMode,
  onToggleTheme,
  currentHw,
  currentModel,
  compilationResult,
  onDownloadHeader,
  isQuantized,
  onToggleQuantization,
}) => {
  return (
    <header className="h-14 bg-surface border-b border-border px-4 sm:px-6 flex items-center justify-between select-none z-10 font-sans shadow-sm">
      {/* Left: Brand + Edge Impulse Style Breadcrumbs */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-tr from-accent to-emerald-400 rounded-md flex items-center justify-center font-mono font-black text-white text-xs shadow-sm">
            ⚡
          </div>
          <span className="font-extrabold text-sm text-text-primary tracking-tight">
            SHANNON <span className="text-[10px] font-mono text-accent bg-accent/10 px-1.5 py-0.5 rounded font-bold">STUDIO</span>
          </span>
        </div>

        {/* Studio Breadcrumbs */}
        <div className="hidden md:flex items-center gap-1.5 pl-3 border-l border-border text-xs font-mono text-text-secondary">
          <span className="hover:text-text-primary cursor-pointer">Projects</span>
          <span>/</span>
          <span className="text-text-primary font-semibold">{currentModel.name}</span>
          <span>/</span>
          <span className="text-accent bg-accent/10 px-1.5 py-0.2 rounded font-medium text-[10px]">
            #1103752
          </span>
        </div>
      </div>

      {/* Center: Precision Switcher & Speedup Badge */}
      <div className="hidden lg:flex items-center gap-3 text-xs font-mono">
        {/* Quantized (INT8) vs Float32 Precision Toggle */}
        <div className="flex items-center p-0.5 bg-surface-raised border border-border rounded-md">
          <button
            onClick={() => onToggleQuantization(true)}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition flex items-center gap-1 ${
              isQuantized
                ? 'bg-accent text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Zap className="w-3 h-3" />
            Quantized (INT8)
          </button>
          <button
            onClick={() => onToggleQuantization(false)}
            className={`px-2.5 py-1 rounded text-xs font-medium transition ${
              !isQuantized
                ? 'bg-surface text-text-primary border border-border shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Unoptimized (FP32)
          </button>
        </div>

        <span className="text-text-muted">|</span>
        <span className="text-text-secondary">
          Target: <strong className="text-text-primary">{currentHw.name}</strong> ({compilationResult?.optimized_int8.estimated_latency_ms || 1.1} ms)
        </span>

        <div className="flex items-center gap-1 text-[11px] text-success bg-success/10 px-2.5 py-1 rounded border border-success/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>0-Malloc Proved</span>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2 sm:gap-3 text-xs">
        <button
          onClick={onDownloadHeader}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent-hover text-white rounded-md text-xs font-bold shadow-sm transition"
          title="Download standalone C/C++ header"
        >
          <Download className="w-3.5 h-3.5" />
          Export Library
        </button>

        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-surface-raised hover:bg-surface-hover border border-border rounded-md text-text-secondary hover:text-text-primary transition font-mono text-[11px]"
          title="Open Command Palette (Cmd+K)"
        >
          <Terminal className="w-3 h-3" />
          <span className="hidden sm:inline">Cmd+K</span>
        </button>

        <button
          onClick={onToggleTheme}
          className="text-text-secondary hover:text-text-primary transition p-1.5 rounded-md hover:bg-surface-hover border border-transparent hover:border-border"
          title={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
          aria-label="Toggle Theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <a
          href="https://github.com/atharveeee-netizen/shannon"
          target="_blank"
          rel="noreferrer"
          className="text-text-secondary hover:text-text-primary transition p-1.5 rounded-md hover:bg-surface-hover border border-transparent hover:border-border"
          title="GitHub Repository"
          aria-label="GitHub Repository"
        >
          <Github className="w-4 h-4" />
        </a>
      </div>
    </header>
  );
};