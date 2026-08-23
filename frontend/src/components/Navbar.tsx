import React from 'react';
import { HardwareProfile } from '../types';
import { Cpu, Play, Square, Database, Layers, Terminal, Code, Activity, Search, Github, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  activeTab: 'zoo' | 'workbench' | 'arena' | 'simulator' | 'export';
  setActiveTab: (tab: 'zoo' | 'workbench' | 'arena' | 'simulator' | 'export') => void;
  hardwareList: HardwareProfile[];
  selectedHwId: string;
  onSelectHardware: (id: string) => void;
  isAgentRunning: boolean;
  onTriggerAgentLoop: () => void;
  onOpenCommandPalette: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  hardwareList,
  selectedHwId,
  onSelectHardware,
  isAgentRunning,
  onTriggerAgentLoop,
  onOpenCommandPalette,
}) => {
  const tabs: { id: 'zoo' | 'workbench' | 'arena' | 'simulator' | 'export'; label: string; icon: any }[] = [
    { id: 'zoo', label: 'Model Zoo', icon: Database },
    { id: 'workbench', label: 'Compiler Workbench', icon: Terminal },
    { id: 'arena', label: 'Zero-Malloc Arena', icon: Layers },
    { id: 'simulator', label: 'Silicon Simulator', icon: Activity },
    { id: 'export', label: 'C++ Export', icon: Code },
  ];

  return (
    <header className="h-14 bg-[#12151B] border-b border-[#232936] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 select-none">
      {/* Brand & Target MCU */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 bg-[#106BA3]/20 border border-[#106BA3] rounded-[3px] flex items-center justify-center text-[#2B95D6] font-bold text-sm">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-xs tracking-tight text-[#F5F8FA] font-mono uppercase">
                SHANNON AI
              </h1>
              <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#0D8050]/20 text-[#0D8050] border border-[#0D8050]/40 rounded-[2px] font-semibold">
                v2.4
              </span>
            </div>
            <span className="text-[10px] text-[#5C7080] font-mono block">
              Autonomous TinyML Compiler
            </span>
          </div>
        </div>

        <div className="h-4 w-px bg-[#232936] hidden md:block" />

        {/* Target Hardware Selector */}
        <div className="flex items-center gap-1.5 bg-[#1A1F28] px-2.5 py-1 border border-[#232936] rounded-[3px]">
          <Cpu className="w-3.5 h-3.5 text-[#2B95D6]" />
          <span className="text-[10px] text-[#5C7080] font-mono uppercase">MCU:</span>
          <select
            value={selectedHwId}
            onChange={(e) => onSelectHardware(e.target.value)}
            className="bg-transparent text-xs font-mono text-[#F5F8FA] font-medium focus:outline-none cursor-pointer"
          >
            {hardwareList.map((h) => (
              <option key={h.id} value={h.id} className="bg-[#1A1F28] text-[#F5F8FA]">
                {h.name} ({h.sram_kb}KB SRAM)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Center Tabs */}
      <nav className="hidden lg:flex items-center bg-[#0B0D11] p-1 rounded-[3px] border border-[#232936] gap-1">
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1 text-xs font-mono rounded-[2px] flex items-center gap-1.5 transition-colors ${
                isActive
                  ? 'bg-[#106BA3] text-[#F5F8FA] font-semibold shadow-sm'
                  : 'text-[#A7B6C2] hover:text-[#F5F8FA] hover:bg-[#1A1F28]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-2 bg-[#1A1F28] hover:bg-[#232936] text-[#A7B6C2] hover:text-[#F5F8FA] px-2.5 py-1 border border-[#232936] rounded-[3px] text-xs font-mono transition"
        >
          <Search className="w-3.5 h-3.5 text-[#2B95D6]" />
          <span className="text-[10px]">Command</span>
          <kbd className="text-[9px] bg-[#0B0D11] px-1.5 py-0.5 rounded-[2px] border border-[#232936] text-[#5C7080]">
            ⌘K
          </kbd>
        </button>

        {/* MISRA-C Badge */}
        <div className="hidden sm:flex items-center gap-1.5 bg-[#0D8050]/15 px-2 py-1 rounded-[2px] border border-[#0D8050]/40 text-[#0D8050] text-[10px] font-mono font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>MISRA-C:2012</span>
        </div>

        {/* GitHub Link */}
        <a
          href="https://github.com/atharveeee-netizen/shannon"
          target="_blank"
          rel="noreferrer"
          className="p-1.5 text-[#A7B6C2] hover:text-[#F5F8FA] bg-[#1A1F28] border border-[#232936] rounded-[3px] transition"
          title="GitHub Repository"
        >
          <Github className="w-4 h-4" />
        </a>

        {/* Optimize Loop Trigger */}
        <button
          onClick={onTriggerAgentLoop}
          disabled={isAgentRunning}
          className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-[3px] flex items-center gap-1.5 transition border ${
            isAgentRunning
              ? 'bg-[#D9822B]/20 text-[#D9822B] border-[#D9822B]/50 animate-pulse'
              : 'bg-[#106BA3] hover:bg-[#0E5A8A] text-[#F5F8FA] border-[#2B95D6]/50 shadow-sm'
          }`}
        >
          {isAgentRunning ? (
            <>
              <Square className="w-3 h-3 fill-current" /> OPTIMIZING...
            </>
          ) : (
            <>
              <Play className="w-3 h-3 fill-current" /> RUN COMPILER
            </>
          )}
        </button>
      </div>
    </header>
  );
};