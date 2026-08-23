import React from 'react';
import { HardwareProfile } from '../types';
import { Cpu, Github, Search, ShieldCheck } from 'lucide-react';

interface AppHeaderProps {
  hardwareList: HardwareProfile[];
  selectedHwId: string;
  onSelectHardware: (id: string) => void;
  onOpenCommandPalette: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  hardwareList,
  selectedHwId,
  onSelectHardware,
  onOpenCommandPalette,
}) => {
  return (
    <header className="h-13 bg-[#111111] border-b border-[#292929] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 select-none">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-sm text-[#F3F3EF] tracking-wider">
            SHANNON
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#292929] text-[#8A8A84] rounded-[2px]">
            v2.4
          </span>
        </div>
        <span className="text-xs text-[#8A8A84] hidden md:inline">
          TinyML Model Compiler & Memory Arena Engine
        </span>
      </div>

      {/* Target MCU Dropdown + Actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-[#1A1A1A] px-2.5 py-1 border border-[#292929] rounded-[3px]">
          <Cpu className="w-3.5 h-3.5 text-[#8A8A84]" />
          <span className="text-[11px] text-[#8A8A84] font-mono">Target:</span>
          <select
            value={selectedHwId}
            onChange={(e) => onSelectHardware(e.target.value)}
            className="bg-transparent text-xs font-mono text-[#F3F3EF] font-medium focus:outline-none cursor-pointer"
          >
            {hardwareList.map((h) => (
              <option key={h.id} value={h.id} className="bg-[#1A1A1A] text-[#F3F3EF]">
                {h.name} ({h.sram_kb}KB SRAM)
              </option>
            ))}
          </select>
        </div>

        {/* MISRA-C Compliance Badge */}
        <div className="hidden sm:flex items-center gap-1 bg-[#0D8050]/15 text-[#0D8050] border border-[#0D8050]/30 px-2 py-1 rounded-[2px] text-[10px] font-mono font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>0 MALLOC</span>
        </div>

        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#222222] text-[#8A8A84] hover:text-[#F3F3EF] px-2.5 py-1 border border-[#292929] rounded-[3px] text-xs font-mono transition"
        >
          <Search className="w-3.5 h-3.5" />
          <kbd className="text-[9px] bg-[#0B0B0B] px-1.5 py-0.5 rounded-[2px] border border-[#292929]">
            ⌘K
          </kbd>
        </button>

        {/* GitHub Link */}
        <a
          href="https://github.com/atharveeee-netizen/shannon"
          target="_blank"
          rel="noreferrer"
          className="p-1.5 text-[#8A8A84] hover:text-[#F3F3EF] bg-[#1A1A1A] hover:bg-[#222222] border border-[#292929] rounded-[3px] transition"
          title="GitHub Repository"
        >
          <Github className="w-4 h-4" />
        </a>
      </div>
    </header>
  );
};