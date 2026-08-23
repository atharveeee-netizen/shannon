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
    <header className="h-12 bg-[#0D1117] border-b border-[#21262D] px-4 flex items-center justify-between select-none z-30 shrink-0">
      {/* Left: Brand, Project breadcrumb, Hardware Pill */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-[#0284C7]/20 border border-[#0284C7]/40 flex items-center justify-center text-[#38BDF8] font-bold text-xs">
            ⚡
          </div>
          <span className="font-bold text-xs tracking-tight text-[#F0F6FC] font-mono uppercase">
            SHANNON STUDIO
          </span>
          <span className="text-[9px] font-mono px-1.5 py-0.2 bg-[#21262D] text-[#8B949E] rounded">
            IDE v2.4
          </span>
        </div>

        <div className="h-3.5 w-px bg-[#21262D] hidden sm:block" />

        {/* Active Model Breadcrumb */}
        <div className="hidden md:flex items-center gap-1.5 text-xs font-mono">
          <span className="text-[#8B949E]">model /</span>
          <span className="text-[#F0F6FC] font-semibold">{currentModel.id}</span>
          <span className="text-[10px] text-[#00FFA3] bg-[#10B981]/15 px-1 rounded">
            {currentModel.domain}
          </span>
        </div>

        <div className="h-3.5 w-px bg-[#21262D] hidden lg:block" />

        {/* Target MCU Pill */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono bg-[#13171F] px-2 py-0.5 rounded border border-[#21262D]">
          <span className="text-[#8B949E]">target:</span>
          <span className="text-[#38BDF8] font-bold">{currentHw.name}</span>
          <span className="text-[#484F58]">({currentHw.clock_mhz}MHz • {currentHw.sram_kb}KB SRAM)</span>
        </div>
      </div>

      {/* Right: Actions, Compliance Badge, Export, Compile Button */}
      <div className="flex items-center gap-2">
        {/* Quick Search */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-1.5 bg-[#13171F] hover:bg-[#161B22] text-[#8B949E] hover:text-[#F0F6FC] px-2 py-1 border border-[#21262D] rounded text-xs font-mono transition"
        >
          <Search className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span className="text-[10px]">Search</span>
          <kbd className="text-[9px] bg-[#0A0D12] px-1 py-0.2 rounded border border-[#21262D] text-[#484F58]">
            ⌘K
          </kbd>
        </button>

        {/* MISRA-C Compliance Badge */}
        <div className="hidden xl:flex items-center gap-1.5 bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/30 text-[#00FFA3] text-[10px] font-mono font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>MISRA-C:2012 {zeroMallocVerified ? 'VERIFIED' : 'PASS'}</span>
        </div>

        {/* Copilot Reasoner Trigger */}
        <button
          onClick={onOpenCopilot}
          className="flex items-center gap-1 bg-[#13171F] hover:bg-[#161B22] text-[#38BDF8] hover:text-[#F0F6FC] px-2.5 py-1 border border-[#21262D] rounded text-xs font-mono transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px] font-semibold">Copilot</span>
        </button>

        {/* Export Header */}
        <button
          onClick={onExportCode}
          className="hidden sm:flex items-center gap-1 bg-[#13171F] hover:bg-[#161B22] text-[#F0F6FC] px-2.5 py-1 border border-[#21262D] rounded text-xs font-mono transition"
        >
          <Download className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span className="text-[11px]">Export (.h)</span>
        </button>

        {/* GitHub */}
        <a
          href="https://github.com/atharveeee-netizen/shannon"
          target="_blank"
          rel="noreferrer"
          className="p-1.5 text-[#8B949E] hover:text-[#F0F6FC] bg-[#13171F] border border-[#21262D] rounded transition"
          title="GitHub Repo"
        >
          <Github className="w-3.5 h-3.5" />
        </a>

        {/* Build & Compile Primary Button */}
        <button
          onClick={onTriggerCompile}
          disabled={isCompiling}
          className={`px-3 py-1 text-xs font-mono font-bold rounded flex items-center gap-1.5 transition border ${
            isCompiling
              ? 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/50 animate-pulse'
              : 'bg-[#0284C7] hover:bg-[#0369A1] text-white border-[#38BDF8]/40 shadow-sm hover:shadow-md'
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
