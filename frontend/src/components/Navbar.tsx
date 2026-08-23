import React from 'react';
import { HardwareProfile } from '../types';
import { Cpu, Play, Square, Database, Layers, Terminal, Code, Activity, Search, Github, ShieldCheck, Sparkles, FileText } from 'lucide-react';

interface NavbarProps {
  activeTab: 'zoo' | 'workbench' | 'arena' | 'simulator' | 'export';
  setActiveTab: (tab: 'zoo' | 'workbench' | 'arena' | 'simulator' | 'export') => void;
  hardwareList: HardwareProfile[];
  selectedHwId: string;
  onSelectHardware: (id: string) => void;
  isAgentRunning: boolean;
  onTriggerAgentLoop: () => void;
  onOpenCommandPalette: () => void;
  onOpenCopilot: () => void;
  onOpenAudit: () => void;
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
  onOpenCopilot,
  onOpenAudit,
}) => {
  const tabs: { id: 'zoo' | 'workbench' | 'arena' | 'simulator' | 'export'; label: string; icon: any }[] = [
    { id: 'zoo', label: 'Model Zoo', icon: Database },
    { id: 'workbench', label: 'Compiler Workbench', icon: Terminal },
    { id: 'arena', label: 'Zero-Malloc Arena', icon: Layers },
    { id: 'simulator', label: 'Silicon Simulator', icon: Activity },
    { id: 'export', label: 'C++ Firmware', icon: Code },
  ];

  return (
    <header className="h-14 bg-[#0D1117] border-b border-[#21262D] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 select-none shadow-sm">
      {/* Left: Brand & Target MCU */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 bg-[#0284C7]/20 border border-[#0284C7] rounded-[4px] flex items-center justify-center text-[#38BDF8] font-bold text-sm shadow-glow-cyan">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-xs tracking-tight text-[#F0F6FC] font-mono uppercase">
                SHANNON AI STUDIO
              </h1>
              <span className="text-[9px] font-mono px-1.5 py-0.2 bg-[#10B981]/15 text-[#00FFA3] border border-[#10B981]/30 rounded-[2px] font-bold">
                v2.4 DEV
              </span>
            </div>
            <span className="text-[10px] text-[#8B949E] font-mono block">
              Autonomous TinyML Compiler
            </span>
          </div>
        </div>

        <div className="h-4 w-px bg-[#21262D] hidden md:block" />

        {/* Target Hardware Selector */}
        <div className="flex items-center gap-1.5 bg-[#13171F] px-2.5 py-1 border border-[#21262D] rounded-[3px]">
          <Cpu className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span className="text-[10px] text-[#8B949E] font-mono uppercase">MCU:</span>
          <select
            value={selectedHwId}
            onChange={(e) => onSelectHardware(e.target.value)}
            className="bg-transparent text-xs font-mono text-[#F0F6FC] font-medium focus:outline-none cursor-pointer"
          >
            {hardwareList.map((h) => (
              <option key={h.id} value={h.id} className="bg-[#13171F] text-[#F0F6FC]">
                {h.name} ({h.sram_kb}KB SRAM)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Center: Navigation Tabs */}
      <nav className="hidden lg:flex items-center bg-[#0A0D12] p-1 rounded-[4px] border border-[#21262D] gap-1">
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1 text-xs font-mono rounded-[3px] flex items-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-[#0284C7] text-white font-bold shadow-glow-cyan'
                  : 'text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#13171F]'
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
          className="hidden md:flex items-center gap-2 bg-[#13171F] hover:bg-[#161B22] text-[#8B949E] hover:text-[#F0F6FC] px-2.5 py-1 border border-[#21262D] rounded-[3px] text-xs font-mono transition"
        >
          <Search className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span className="text-[10px]">Cmd</span>
          <kbd className="text-[9px] bg-[#0A0D12] px-1.5 py-0.5 rounded-[2px] border border-[#21262D] text-[#484F58]">
            ⌘K
          </kbd>
        </button>

        {/* Shannon Copilot Drawer Trigger */}
        <button
          onClick={onOpenCopilot}
          className="flex items-center gap-1.5 bg-[#13171F] hover:bg-[#161B22] text-[#38BDF8] px-2.5 py-1 border border-[#21262D] rounded-[3px] text-xs font-mono transition"
          title="Shannon Copilot"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span className="hidden sm:inline text-[11px] font-bold">Copilot</span>
        </button>

        {/* Screenpipe Audit Trigger */}
        <button
          onClick={onOpenAudit}
          className="hidden sm:flex items-center gap-1.5 bg-[#13171F] hover:bg-[#161B22] text-[#8B949E] hover:text-[#F0F6FC] px-2.5 py-1 border border-[#21262D] rounded-[3px] text-xs font-mono transition"
          title="Continuous Audit Feed"
        >
          <FileText className="w-3.5 h-3.5 text-[#00FFA3]" />
          <span className="text-[10px] font-bold">Audit</span>
        </button>

        {/* MISRA-C Badge */}
        <div className="hidden xl:flex items-center gap-1.5 bg-[#10B981]/10 px-2 py-1 rounded-[3px] border border-[#10B981]/30 text-[#00FFA3] text-[10px] font-mono font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>MISRA-C:2012</span>
        </div>

        {/* GitHub Link */}
        <a
          href="https://github.com/atharveeee-netizen/shannon"
          target="_blank"
          rel="noreferrer"
          className="p-1.5 text-[#8B949E] hover:text-[#F0F6FC] bg-[#13171F] border border-[#21262D] rounded-[3px] transition"
          title="GitHub Repository"
        >
          <Github className="w-4 h-4" />
        </a>

        {/* Run Compiler Optimization Trigger */}
        <button
          onClick={onTriggerAgentLoop}
          disabled={isAgentRunning}
          className={`px-3 py-1.5 text-xs font-mono font-bold rounded-[3px] flex items-center gap-1.5 transition border ${
            isAgentRunning
              ? 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/50 animate-pulse'
              : 'bg-[#0284C7] hover:bg-[#0369A1] text-white border-[#38BDF8]/40 shadow-glow-cyan'
          }`}
        >
          {isAgentRunning ? (
            <>
              <Square className="w-3 h-3 fill-current" /> OPTIMIZING...
            </>
          ) : (
            <>
              <Play className="w-3 h-3 fill-current" /> COMPILE
            </>
          )}
        </button>
      </div>
    </header>
  );
};