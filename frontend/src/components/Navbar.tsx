import React from 'react';
import { HardwareProfile } from '../types';
import { Cpu, ShieldCheck, Play, Square, Activity, Database, Layers, Terminal, Code } from 'lucide-react';

interface NavbarProps {
  activeTab: 'zoo' | 'workbench' | 'arena' | 'simulator' | 'export';
  setActiveTab: (tab: 'zoo' | 'workbench' | 'arena' | 'simulator' | 'export') => void;
  hardwareList: HardwareProfile[];
  selectedHwId: string;
  onSelectHardware: (id: string) => void;
  isAgentRunning: boolean;
  onTriggerAgentLoop: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  hardwareList,
  selectedHwId,
  onSelectHardware,
  isAgentRunning,
  onTriggerAgentLoop,
}) => {
  const tabs: { id: 'zoo' | 'workbench' | 'arena' | 'simulator' | 'export'; label: string; num: string; icon: any }[] = [
    { id: 'zoo', label: 'Model Zoo', num: '01', icon: Database },
    { id: 'workbench', label: 'Compiler Workbench', num: '02', icon: Terminal },
    { id: 'arena', label: 'Zero-Malloc Arena', num: '03', icon: Layers },
    { id: 'simulator', label: 'Live Simulator', num: '04', icon: Activity },
    { id: 'export', label: 'C++ Export', num: '05', icon: Code },
  ];

  return (
    <header className="h-14 bg-palantir-nav border-b border-palantir-border px-5 flex items-center justify-between sticky top-0 z-50 select-none">
      {/* Left: Brand Crest & Metadata */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 bg-palantir-action/20 border border-palantir-action rounded-[3px] flex items-center justify-center text-palantir-cobalt font-bold text-sm shadow-sm">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-sm tracking-tight text-palantir-textPrimary font-mono">
                SHANNON AI
              </h1>
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-palantir-passLight text-palantir-pass border border-palantir-pass/40 rounded-[2px] font-bold">
                TINYML STUDIO v2.4
              </span>
            </div>
            <span className="text-[10px] text-palantir-textMuted font-mono block">
              Autonomous Compiler & Hardware Optimization Engine
            </span>
          </div>
        </div>

        <div className="h-5 w-px bg-palantir-border hidden md:block" />

        {/* Target Hardware Selector */}
        <div className="flex items-center gap-1.5 bg-palantir-card px-2.5 py-1 border border-palantir-border rounded-[3px]">
          <Cpu className="w-3.5 h-3.5 text-palantir-cobalt" />
          <span className="text-[10px] text-palantir-textMuted font-mono uppercase">TARGET:</span>
          <select
            value={selectedHwId}
            onChange={(e) => onSelectHardware(e.target.value)}
            className="bg-transparent text-xs font-mono text-palantir-textPrimary font-medium focus:outline-none cursor-pointer"
          >
            {hardwareList.map((h) => (
              <option key={h.id} value={h.id} className="bg-palantir-card text-palantir-textPrimary">
                {h.name} ({h.sram_kb}KB SRAM / {h.flash_mb}MB Flash)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Center: 21st.dev Pill Tabs */}
      <nav className="hidden lg:flex items-center bg-palantir-canvas p-1 rounded-[3px] border border-palantir-border gap-1">
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1 text-xs font-mono rounded-[2px] flex items-center gap-1.5 transition-colors ${
                isActive
                  ? 'bg-palantir-action text-palantir-textPrimary font-semibold shadow-sm'
                  : 'text-palantir-textSecondary hover:text-palantir-textPrimary hover:bg-palantir-card'
              }`}
            >
              <span className={`text-[10px] opacity-60`}>{t.num}</span>
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right: Security Seal & Agentic Run Button */}
      <div className="flex items-center gap-3">
        {/* Strix Security Seal */}
        <div className="hidden sm:flex items-center gap-1.5 bg-palantir-passLight px-2 py-1 rounded-[2px] border border-palantir-pass/40">
          <ShieldCheck className="w-3.5 h-3.5 text-palantir-pass" />
          <span className="text-[10px] font-mono font-bold text-palantir-pass tracking-wide">
            MISRA-C:2012 PASSED
          </span>
        </div>

        {/* Karpathy/DeepSeek Agent Loop Button */}
        <button
          onClick={onTriggerAgentLoop}
          disabled={isAgentRunning}
          className={`px-3.5 py-1.5 text-xs font-mono font-semibold rounded-[3px] flex items-center gap-1.5 transition border ${
            isAgentRunning
              ? 'bg-palantir-warnLight text-palantir-warn border-palantir-warn/50 animate-pulse'
              : 'bg-palantir-action hover:bg-palantir-actionHover text-palantir-textPrimary border-palantir-cobalt/50 shadow-sm'
          }`}
        >
          {isAgentRunning ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" /> AGENT REASONING...
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" /> RUN AGENTIC LOOP
            </>
          )}
        </button>
      </div>
    </header>
  );
};