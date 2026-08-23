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
    <header className="h-12 bg-[#070A0F] border-b border-[#1E293B] px-4 flex items-center justify-between select-none shrink-0 z-30 relative shadow-sm">
      {/* Ambient Top Glow Line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#38BDF8]/40 to-transparent" />

      {/* Left: Brand, Project breadcrumb, Target MCU */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-[3px] bg-[#0284C7]/20 border border-[#38BDF8]/50 flex items-center justify-center text-[#38BDF8] font-bold text-xs shadow-[0_0_12px_rgba(56,189,248,0.35)]">
            ⚡
          </div>
          <span className="font-bold text-xs tracking-tight text-[#F8FAFC] font-mono">
            SHANNON STUDIO
          </span>
          <span className="text-[10px] font-mono text-[#38BDF8] bg-[#0284C7]/15 px-1.5 py-0.5 rounded-[2px] border border-[#38BDF8]/30 font-bold">
            IDE v2.4
          </span>
        </div>

        <div className="h-3.5 w-px bg-[#1E293B] hidden sm:block" />

        {/* Active Model Breadcrumb */}
        <div className="hidden md:flex items-center gap-1.5 text-xs font-mono">
          <span className="text-[#64748B]">model /</span>
          <span className="text-[#F8FAFC] font-semibold">{currentModel.id}</span>
          <span className="text-[10px] text-[#10B981] bg-[#10B981]/15 px-1.5 py-0.2 rounded-[2px] border border-[#10B981]/35 font-bold shadow-[0_0_8px_rgba(16,185,129,0.2)]">
            {currentModel.domain}
          </span>
        </div>

        <div className="h-3.5 w-px bg-[#1E293B] hidden lg:block" />

        {/* Target MCU with Glowing Status Dot */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-mono bg-[#0B0F17] px-2.5 py-1 rounded-[3px] border border-[#1E293B] border-glow-hover">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
          </span>
          <span className="text-[#64748B]">target:</span>
          <span className="text-[#38BDF8] font-bold">{currentHw.name}</span>
          <span className="text-[#475569]">({currentHw.clock_mhz}MHz • {currentHw.sram_kb}KB SRAM)</span>
        </div>
      </div>

      {/* Right: Actions, Compliance Badge, Export, Compile Button */}
      <div className="flex items-center gap-2">
        {/* Command Search */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-1.5 bg-[#0E1420] hover:bg-[#141C2E] text-[#94A3B8] hover:text-[#F8FAFC] px-2.5 py-1 border border-[#1E293B] hover:border-[#38BDF8]/40 rounded-[3px] text-xs font-mono transition-all btn-tactile"
        >
          <Search className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span className="text-[11px]">Command</span>
          <kbd className="text-[9px] bg-[#070A0F] px-1 py-0.2 rounded-[2px] border border-[#1E293B] text-[#64748B]">
            ⌘K
          </kbd>
        </button>

        {/* MISRA-C Compliance Badge */}
        <div className="hidden xl:flex items-center gap-1.5 bg-[#10B981]/15 px-2.5 py-0.5 rounded-[3px] border border-[#10B981]/40 text-[#10B981] text-[10px] font-mono font-bold shadow-[0_0_10px_rgba(16,185,129,0.25)]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
          <span>MISRA-C:2012 {zeroMallocVerified ? 'VERIFIED' : 'PASS'}</span>
        </div>

        {/* Copilot Trigger */}
        <button
          onClick={onOpenCopilot}
          className="flex items-center gap-1 bg-[#0E1420] hover:bg-[#141C2E] text-[#38BDF8] hover:text-[#F8FAFC] px-2.5 py-1 border border-[#1E293B] hover:border-[#38BDF8]/40 rounded-[3px] text-xs font-mono transition-all btn-tactile shadow-[0_0_12px_rgba(56,189,248,0.15)]"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#38BDF8] animate-pulse" />
          <span className="hidden sm:inline text-[11px] font-bold">Copilot</span>
        </button>

        {/* Export Header */}
        <button
          onClick={onExportCode}
          className="hidden sm:flex items-center gap-1 bg-[#0E1420] hover:bg-[#141C2E] text-[#E2E8F0] px-2.5 py-1 border border-[#1E293B] hover:border-[#38BDF8]/40 rounded-[3px] text-xs font-mono transition-all btn-tactile"
        >
          <Download className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span className="text-[11px]">Export (.h)</span>
        </button>

        {/* GitHub Link */}
        <a
          href="https://github.com/atharveeee-netizen/shannon"
          target="_blank"
          rel="noreferrer"
          className="p-1.5 text-[#94A3B8] hover:text-[#F8FAFC] bg-[#0E1420] hover:bg-[#141C2E] border border-[#1E293B] hover:border-[#38BDF8]/40 rounded-[3px] transition-all btn-tactile"
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
              ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/50 animate-pulse'
              : ''
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
