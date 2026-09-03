import React, { useRef } from 'react';
import {
  Play,
  Download,
  Sun,
  Moon,
  ChevronDown,
  RotateCcw,
  HardDrive,
  XCircle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useCompiler } from '../context/CompilerContext';
import { PRESET_MODELS } from '../services/api';

export const TopBar: React.FC = () => {
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
      {/* Left: Branding & Compiler Engine Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm tracking-tight text-text-primary">SHANNON</span>
          <span className="text-[11px] font-mono text-text-muted hidden md:inline">
            TinyML Compiler
          </span>
        </div>

        <span className="text-border">|</span>

        <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-surface-raised border border-border text-text-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>CANONICAL ENGINE</span>
        </span>
      </div>

      {/* Center: Model, Target, Precision */}
      <div className="flex items-center gap-2.5">
        {/* Model Selector */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className="text-text-muted hidden sm:inline">model:</span>
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
              className="appearance-none bg-surface-raised hover:bg-surface-hover text-text-primary font-sans font-medium text-xs py-1.5 pl-2.5 pr-7 rounded-md border border-border cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="" disabled>
                -- Select Model --
              </option>
              {PRESET_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
              {loadedModel?.isCustom && <option value="custom">{loadedModel.name} (Custom)</option>}
              <option value="custom">+ Import ONNX / JSON...</option>
            </select>
            <ChevronDown className="w-3 h-3 text-text-muted absolute right-2 top-2.5 pointer-events-none" />
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
              className="p-1 hover:text-rose-400 text-text-muted rounded transition-colors cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <span className="text-border">|</span>

        {/* Target Silicon Hardware Selector */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <HardDrive className="w-3.5 h-3.5 text-text-muted hidden sm:inline" />
          <span className="text-text-muted hidden sm:inline">target:</span>
          <div className="relative">
            <select
              value={selectedHw.id}
              onChange={(e) => setHardware(e.target.value)}
              className="appearance-none bg-surface-raised hover:bg-surface-hover text-text-primary font-sans font-medium text-xs py-1.5 pl-2.5 pr-7 rounded-md border border-border cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {hardwareList.map((hw) => (
                <option key={hw.id} value={hw.id}>
                  {hw.name} ({hw.clock_mhz} MHz)
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-text-muted absolute right-2 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Precision Pill */}
        <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-primary/10 border border-primary/30 text-primary">
          INT8
        </span>
      </div>

      {/* Right: Status, Compile Action & Export */}
      <div className="flex items-center gap-2.5">
        {/* Status Badge */}
        {isTargetInvalidated ? (
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-mono">
            <AlertCircle className="w-3 h-3" />
            <span>Target Changed</span>
          </div>
        ) : compilationResult ? (
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono">
            <CheckCircle2 className="w-3 h-3" />
            <span>Compiled</span>
          </div>
        ) : null}

        {/* Master Compile Action Button */}
        <button
          onClick={() => triggerCompile()}
          disabled={isCompiling}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold shadow-sm transition-all cursor-pointer ${
            isCompiling
              ? 'bg-primary/60 text-white cursor-wait'
              : 'bg-primary hover:bg-primary-hover text-white active:scale-98'
          }`}
          title="Run compiler pipeline on current model"
        >
          {isCompiling ? (
            <>
              <RotateCcw className="w-3.5 h-3.5 animate-spin text-white" />
              <span>Compiling...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white text-white" />
              <span>Compile</span>
            </>
          )}
        </button>

        {/* Download Standalone Header (.h) */}
        <button
          onClick={() => {
            if (compilationResult) {
              downloadHeader();
            } else {
              triggerCompile();
            }
          }}
          disabled={isCompiling}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-surface-raised hover:bg-surface-hover text-text-primary text-xs font-medium transition-colors cursor-pointer"
          title={compilationResult ? 'Export Standalone C Header (.h)' : 'Compile & Export .h'}
        >
          <Download className="w-3.5 h-3.5 text-primary" />
          <span className="hidden md:inline">Export .h</span>
        </button>

        {/* Dark / Light Theme Switcher */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-1.5 rounded-md bg-surface-raised hover:bg-surface-hover border border-border text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          title="Toggle Dark/Light Mode"
        >
          {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>
      </div>
    </header>
  );
};
