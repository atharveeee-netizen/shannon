import React, { useRef } from 'react';
import {
  Play,
  Download,
  Sun,
  Moon,
  ChevronDown,
  AlertTriangle,
  RotateCcw,
  Command,
  HardDrive,
  XCircle,
} from 'lucide-react';
import { useCompiler } from '../context/CompilerContext';
import { PRESET_MODELS } from '../services/api';

interface TopBarProps {
  onOpenCommandPalette: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenCommandPalette }) => {
  const {
    loadedModel,
    selectedHw,
    hardwareList,
    setHardware,
    loadPreset,
    uploadCustomModel,
    triggerCompile,
    isCompiling,
    isTargetInvalidated,
    compilationResult,
    downloadHeader,
    clearModel,
    isDarkMode,
    setIsDarkMode,
  } = useCompiler();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadCustomModel(e.target.files[0], true);
    }
  };

  return (
    <header className="h-14 bg-surface border-b border-border px-4 flex items-center justify-between sticky top-0 z-30 flex-shrink-0">
      {/* Left: Model & Target Silicon Selectors */}
      <div className="flex items-center gap-2.5">
        {/* Model Selector */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className="text-text-muted">model:</span>
          <div className="relative">
            <select
              value={loadedModel ? loadedModel.id : ''}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  fileInputRef.current?.click();
                } else if (e.target.value) {
                  loadPreset(e.target.value, true);
                }
              }}
              className="appearance-none bg-surface-raised hover:bg-surface-hover text-text-primary font-sans font-semibold text-xs py-1 pl-2.5 pr-6 rounded border border-border cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="" disabled>
                -- Select Model --
              </option>
              {PRESET_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.domain})
                </option>
              ))}
              {loadedModel?.isCustom && <option value="custom">{loadedModel.name} (Custom)</option>}
              <option value="custom">+ Upload ONNX/JSON...</option>
            </select>
            <ChevronDown className="w-3 h-3 text-text-muted absolute right-1.5 top-2 pointer-events-none" />
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,.onnx"
            className="hidden"
          />

          {loadedModel && (
            <button
              onClick={clearModel}
              title="Unload current model"
              className="p-1 hover:text-rose-400 text-text-muted rounded transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <span className="text-border">|</span>

        {/* Target Silicon Hardware Selector */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <HardDrive className="w-3.5 h-3.5 text-text-muted" />
          <span className="text-text-muted">target:</span>
          <div className="relative">
            <select
              value={selectedHw.id}
              onChange={(e) => setHardware(e.target.value)}
              className="appearance-none bg-surface-raised hover:bg-surface-hover text-text-primary font-sans font-semibold text-xs py-1 pl-2.5 pr-6 rounded border border-border cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent"
            >
              {hardwareList.map((hw) => (
                <option key={hw.id} value={hw.id}>
                  {hw.name} ({hw.clock_mhz}MHz, {hw.sram_kb}KB SRAM)
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-text-muted absolute right-1.5 top-2 pointer-events-none" />
          </div>
        </div>

        {/* Target Invalidation Warning Banner */}
        {isTargetInvalidated && (
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-mono">
            <AlertTriangle className="w-3 h-3" />
            <span>Target Changed - Recompile Required</span>
          </div>
        )}
      </div>

      {/* Right: Actions & Tools */}
      <div className="flex items-center gap-2">
        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-surface-raised hover:bg-surface-hover border border-border text-text-muted hover:text-text-primary text-xs font-mono transition-colors"
          title="Open Command Palette (Ctrl+K)"
        >
          <Command className="w-3 h-3" />
          <span>Cmd+K</span>
        </button>

        {/* Master Compile Action Button */}
        <button
          onClick={() => triggerCompile()}
          disabled={!loadedModel || isCompiling}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold shadow-sm transition-all ${
            !loadedModel
              ? 'bg-surface-raised text-text-muted border border-border cursor-not-allowed opacity-50'
              : isCompiling
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 cursor-wait'
              : 'bg-accent hover:bg-accent-hover text-black active:scale-95'
          }`}
        >
          {isCompiling ? (
            <>
              <RotateCcw className="w-3.5 h-3.5 animate-spin" />
              <span>Compiling...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>Compile</span>
            </>
          )}
        </button>

        {/* Download Standalone Header (.h) */}
        <button
          onClick={downloadHeader}
          disabled={!compilationResult}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-xs font-medium transition-colors ${
            compilationResult
              ? 'bg-surface-raised hover:bg-surface-hover border-border text-text-primary'
              : 'bg-surface border-border/40 text-text-muted/40 cursor-not-allowed'
          }`}
          title="Download MISRA-C Standalone Header"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Export .h</span>
        </button>

        {/* Dark / Light Theme Switcher */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-1.5 rounded bg-surface-raised hover:bg-surface-hover border border-border text-text-muted hover:text-text-primary transition-colors"
          title="Toggle Dark/Light Mode"
        >
          {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>
      </div>
    </header>
  );
};
