import React from 'react';
import { HardwareProfile, ModelZooItem } from '../types';
import { Play, Square, Download, ShieldCheck, Search, Github, Sparkles } from 'lucide-react';
import { CardNav } from './CardNav';

interface IdeHeaderProps {
  currentHw: HardwareProfile;
  currentModel: ModelZooItem;
  isCompiling: boolean;
  onTriggerCompile: () => void;
  onOpenCommandPalette: () => void;
  onOpenCopilot: () => void;
  onExportCode: () => void;
  zeroMallocVerified: boolean;
  models: ModelZooItem[];
  hardwareList: HardwareProfile[];
  onSelectModel: (id: string) => void;
  onSelectHardware: (id: string) => void;
  quantBits: number;
  onChangeQuantBits: (bits: number) => void;
}

export const IdeHeader: React.FC<IdeHeaderProps> = ({
  currentHw: _currentHw,
  currentModel: _currentModel,
  isCompiling,
  onTriggerCompile,
  onOpenCommandPalette,
  onOpenCopilot,
  onExportCode,
  zeroMallocVerified,
  models,
  hardwareList,
  onSelectModel,
  onSelectHardware,
  quantBits,
  onChangeQuantBits,
}) => {
  return (
    <header className="h-11 bg-[#05050A] border-b border-[#1A2138] px-3 flex items-center justify-between select-none shrink-0 z-30 relative shadow-sm">
      {/* Ambient Top Glow Line with Cyber-Cyan to Sakura-Pink Gradient */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#5CF2E7]/50 to-[#FF7AC6]/50 pointer-events-none" />

      {/* Left: Brand & React Bits CardNav (Models, Silicon, Compiler) */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-[3px] bg-gradient-to-br from-[#0E3B43] to-[#4B1886] border border-[#5CF2E7]/60 flex items-center justify-center text-[#5CF2E7] font-bold text-xs shadow-[0_0_12px_rgba(92,242,231,0.4)]">
            ⚡
          </div>
          <span className="font-bold text-xs tracking-tight text-[#E6FFFF] font-mono">
            SHANNON
          </span>
          <span className="text-[10px] font-mono text-[#5CF2E7] bg-[#0E3B43]/40 px-1.5 py-0.2 rounded border border-[#5CF2E7]/40 font-bold shadow-[0_0_8px_rgba(92,242,231,0.2)]">
            IDE v2.4
          </span>
        </div>

        <div className="h-3.5 w-px bg-[#1A2138]" />

        {/* React Bits CardNav Interactive Expandable Navigation */}
        <CardNav
          models={models}
          selectedModelId={_currentModel.id}
          onSelectModel={onSelectModel}
          hardwareList={hardwareList}
          selectedHwId={_currentHw.id}
          onSelectHardware={onSelectHardware}
          quantBits={quantBits}
          onChangeQuantBits={onChangeQuantBits}
        />
      </div>

      {/* Right: Actions, Compliance Badge, Export, Compile Button */}
      <div className="flex items-center gap-1.5 text-xs font-mono">
        {/* Command Search */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-1 bg-[#080914] hover:bg-[#0D1122] text-[#E6FFFF]/70 hover:text-[#E6FFFF] px-2 py-1 border border-[#1A2138] hover:border-[#5CF2E7]/50 rounded-[3px] transition-all btn-tactile"
        >
          <Search className="w-3 h-3 text-[#5CF2E7]" />
          <kbd className="text-[9px] bg-[#05050A] px-1 py-0.2 rounded border border-[#1A2138] text-[#5CF2E7]/60">
            ⌘K
          </kbd>
        </button>

        {/* MISRA-C Compliance Badge */}
        <div className="hidden xl:flex items-center gap-1 bg-[#0E3B43]/30 px-2 py-0.5 rounded-[3px] border border-[#5CF2E7]/40 text-[#5CF2E7] text-[10px] font-mono font-bold shadow-[0_0_10px_rgba(92,242,231,0.25)]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#5CF2E7]" />
          <span>MISRA-C:2012 {zeroMallocVerified ? 'VERIFIED' : 'PASS'}</span>
        </div>

        {/* Copilot Trigger */}
        <button
          onClick={onOpenCopilot}
          className="flex items-center gap-1 bg-[#080914] hover:bg-[#0D1122] text-[#FF7AC6] hover:text-[#E6FFFF] px-2.5 py-1 border border-[#1A2138] hover:border-[#FF7AC6]/50 rounded-[3px] transition-all btn-tactile shadow-[0_0_12px_rgba(255,122,198,0.2)]"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#FF7AC6] animate-pulse" />
          <span className="hidden sm:inline font-bold">Copilot</span>
        </button>

        {/* Export Header */}
        <button
          onClick={onExportCode}
          className="flex items-center gap-1 bg-[#080914] hover:bg-[#0D1122] text-[#E6FFFF] px-2.5 py-1 border border-[#1A2138] hover:border-[#5CF2E7]/50 rounded-[3px] transition-all btn-tactile"
        >
          <Download className="w-3.5 h-3.5 text-[#5CF2E7]" />
          <span>Export (.h)</span>
        </button>

        {/* GitHub Link */}
        <a
          href="https://github.com/atharveeee-netizen/shannon"
          target="_blank"
          rel="noreferrer"
          className="p-1.5 text-[#E6FFFF]/70 hover:text-[#E6FFFF] bg-[#080914] hover:bg-[#0D1122] border border-[#1A2138] hover:border-[#5CF2E7]/50 rounded-[3px] transition-all btn-tactile"
          title="GitHub Repo"
        >
          <Github className="w-3.5 h-3.5" />
        </a>

        {/* Primary Tactile Build & Compile Button */}
        <button
          onClick={onTriggerCompile}
          disabled={isCompiling}
          className={`px-3 py-1 text-xs font-mono font-bold rounded-[3px] flex items-center gap-1.5 transition-all btn-tactile-primary ${
            isCompiling
              ? 'bg-[#FF7AC6]/20 text-[#FF7AC6] border border-[#FF7AC6]/50 animate-pulse'
              : ''
          }`}
        >
          {isCompiling ? (
            <>
              <Square className="w-3 h-3 fill-current" /> OPTIMIZING...
            </>
          ) : (
            <>
              <Play className="w-3 h-3 fill-current" /> COMPILE (⌘B)
            </>
          )}
        </button>
      </div>
    </header>
  );
};
