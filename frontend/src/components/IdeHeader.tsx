import React from 'react';
import { HardwareProfile, ModelZooItem } from '../types';
import { Play, Square, Download, ShieldCheck, Search, Github, Sparkles } from 'lucide-react';

interface IdeHeaderProps {
  currentHw: HardwareProfile;
  currentModel: ModelZooItem;
  isCompiling: boolean;
  onTriggerCompile: () => void;
  onOpenCommandPalette: () => void;
  onOpenCopilot: () => void;
  onExportCode: () => void;
  zeroMallocVerified: boolean;
}

export const IdeHeader: React.FC<IdeHeaderProps> = ({
  currentHw,
  currentModel,
  isCompiling,
  onTriggerCompile,
  onOpenCommandPalette,
  onOpenCopilot,
  onExportCode,
  zeroMallocVerified,
}) => {
  return (
    <header className="h-12 bg-[#0B0E14] border-b border-[#1E293B] px-4 flex items-center justify-between select-none shrink-0 z-30">
      {/* Left: Brand, Project breadcrumb, Target MCU */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-[3px] bg-[#2563EB]/15 border border-[#3B82F6]/40 flex items-center justify-center text-[#3B82F6] font-bold text-xs">
            ⚡
          </div>
          <span className="font-bold text-xs tracking-tight text-[#F8FAFC] font-mono">
            SHANNON STUDIO
          </span>
          <span className="text-[10px] font-mono text-[#64748B] bg-[#151B28] px-1.5 py-0.5 rounded-[2px] border border-[#1E293B]">
            v2.4
          </span>
        </div>

        <div className="h-3.5 w-px bg-[#1E293B] hidden sm:block" />

        {/* Active Model Breadcrumb */}
        <div className="hidden md:flex items-center gap-1.5 text-xs font-mono">
          <span className="text-[#64748B]">model /</span>
          <span className="text-[#F8FAFC] font-semibold">{currentModel.id}</span>
          <span className="text-[10px] text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.2 rounded-[2px] border border-[#10B981]/25">
            {currentModel.domain}
          </span>
        </div>

        <div className="h-3.5 w-px bg-[#1E293B] hidden lg:block" />

        {/* Target MCU */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono bg-[#111622] px-2 py-0.5 rounded-[3px] border border-[#1E293B]">
          <span className="text-[#64748B]">target:</span>
          <span className="text-[#3B82F6] font-bold">{currentHw.name}</span>
          <span className="text-[#475569]">({currentHw.clock_mhz}MHz • {currentHw.sram_kb}KB SRAM)</span>
        </div>
      </div>

      {/* Right: Actions, Compliance Badge, Export, Compile Button */}
      <div className="flex items-center gap-2">
        {/* Command Search */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-1.5 bg-[#151B28] hover:bg-[#1A2234] text-[#94A3B8] hover:text-[#F8FAFC] px-2.5 py-1 border border-[#1E293B] hover:border-[#26344A] rounded-[3px] text-xs font-mono transition-all active:scale-[0.98]"
        >
          <Search className="w-3.5 h-3.5 text-[#3B82F6]" />
          <span className="text-[11px]">Command</span>
          <kbd className="text-[9px] bg-[#0B0E14] px-1 py-0.2 rounded-[2px] border border-[#1E293B] text-[#64748B]">
            ⌘K
          </kbd>
        </button>

        {/* MISRA-C Compliance Badge */}
        <div className="hidden xl:flex items-center gap-1.5 bg-[#10B981]/10 px-2 py-0.5 rounded-[3px] border border-[#10B981]/25 text-[#10B981] text-[10px] font-mono font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>MISRA-C:2012 {zeroMallocVerified ? 'VERIFIED' : 'PASS'}</span>
        </div>

        {/* Copilot Trigger */}
        <button
          onClick={onOpenCopilot}
          className="flex items-center gap-1 bg-[#151B28] hover:bg-[#1A2234] text-[#3B82F6] hover:text-[#F8FAFC] px-2.5 py-1 border border-[#1E293B] hover:border-[#26344A] rounded-[3px] text-xs font-mono transition-all active:scale-[0.98]"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px] font-semibold">Copilot</span>
        </button>

        {/* Export Header */}
        <button
          onClick={onExportCode}
          className="hidden sm:flex items-center gap-1 bg-[#151B28] hover:bg-[#1A2234] text-[#E2E8F0] px-2.5 py-1 border border-[#1E293B] hover:border-[#26344A] rounded-[3px] text-xs font-mono transition-all active:scale-[0.98]"
        >
          <Download className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span className="text-[11px]">Export (.h)</span>
        </button>

        {/* GitHub Link */}
        <a
          href="https://github.com/atharveeee-netizen/shannon"
          target="_blank"
          rel="noreferrer"
          className="p-1.5 text-[#94A3B8] hover:text-[#F8FAFC] bg-[#151B28] hover:bg-[#1A2234] border border-[#1E293B] hover:border-[#26344A] rounded-[3px] transition-all active:scale-[0.98]"
          title="GitHub Repo"
        >
          <Github className="w-3.5 h-3.5" />
        </a>

        {/* Primary Tactile Build & Compile Button */}
        <button
          onClick={onTriggerCompile}
          disabled={isCompiling}
          className={`px-3 py-1 text-xs font-mono font-bold rounded-[3px] flex items-center gap-1.5 transition-all ${
            isCompiling
              ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/50 animate-pulse'
              : 'btn-tactile-primary text-white'
          }`}
        >
          {isCompiling ? (
            <>
              <Square className="w-3 h-3 fill-current" /> OPTIMIZING...
            </>
          ) : (
            <>
              <Play className="w-3 h-3 fill-current" /> BUILD & COMPILE
            </>
          )}
        </button>
      </div>
    </header>
  );
};
