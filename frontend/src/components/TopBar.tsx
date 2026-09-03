import React, { useRef } from 'react';
import {
  Play,
  Download,
  Sun,
  Moon,
  ChevronDown,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  XCircle,
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
      {/* Left: Product & Workspace Context */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm tracking-tight text-text-primary">
            Shannon
          </span>
          <span className="text-xs text-text-muted hidden md:inline">
            Silicon Compiler
          </span>
        </div>

        <span className="text-border select-none">/</span>

        {/* Model Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-text-muted hidden sm:inline">Model:</span>
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
              className="appearance-none bg-surface-raised hover:bg-surface-hover text-text-primary font-sans text-xs py-1.5 pl-2.5 pr-7 rounded-[6px] border border-border cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="" disabled>
                Select model
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
              title="Unload model"
              className="p-1 hover:text-danger text-text-muted rounded transition-colors cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Center: Target Hardware & Precision */}
      <div className="hidden lg:flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-text-muted">Target:</span>
          <div className="relative">
            <select
              value={selectedHw.id}
              onChange={(e) => setHardware(e.target.value)}
              className="appearance-none bg-surface-raised hover:bg-surface-hover text-text-primary font-sans text-xs py-1.5 pl-2.5 pr-7 rounded-[6px] border border-border cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
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

        <span className="text-xs font-mono px-2 py-0.5 rounded-[4px] bg-surface-raised border border-border text-text-secondary">
          INT8
        </span>

        {/* Status */}
        {isTargetInvalidated ? (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-warning/10 border border-warning/30 text-warning text-xs">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Target modified</span>
          </div>
        ) : compilationResult ? (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-success/10 border border-success/30 text-success text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Compiled</span>
          </div>
        ) : null}
      </div>

      {/* Right: Actions with Strict Visual Hierarchy */}
      <div className="flex items-center gap-2">
        {/* DOMINANT ACTION: Compile */}
        <button
          onClick={() => triggerCompile()}
          disabled={isCompiling}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-[6px] text-sm font-medium text-white transition-colors cursor-pointer ${
            isCompiling
              ? 'bg-primary/60 cursor-wait'
              : 'bg-primary hover:bg-[#0043CE] active:bg-[#002D9C]'
          }`}
          title="Run compiler pipeline"
        >
          {isCompiling ? (
            <>
              <RotateCcw className="w-3.5 h-3.5 animate-spin text-white" />
              <span>Compiling...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Compile</span>
            </>
          )}
        </button>

        {/* SUBTLE SECONDARY ACTION: Export .h */}
        <button
          onClick={() => {
            if (compilationResult) {
              downloadHeader();
            } else {
              triggerCompile();
            }
          }}
          disabled={isCompiling}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-border bg-surface-raised hover:bg-surface-hover text-text-primary text-xs font-medium transition-colors cursor-pointer"
          title={compilationResult ? 'Export C Header' : 'Compile & Export'}
        >
          <Download className="w-3.5 h-3.5 text-text-secondary" />
          <span className="hidden sm:inline">Export C</span>
        </button>

        {/* TERTIARY / UTILITY: Theme Switcher */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-1.5 rounded-[6px] bg-surface-raised hover:bg-surface-hover border border-border text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          title={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>
      </div>
    </header>
  );
};
