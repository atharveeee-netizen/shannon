import React from 'react';
import { HardwareProfile } from '../types';
import { Cpu, Play, Square, Database, Layers, Terminal, Code, Activity, Search, FileText } from 'lucide-react';

interface NavbarProps {
  activeTab: 'zoo' | 'workbench' | 'arena' | 'simulator' | 'export';
  setActiveTab: (tab: 'zoo' | 'workbench' | 'arena' | 'simulator' | 'export') => void;
  hardwareList: HardwareProfile[];
  selectedHwId: string;
  onSelectHardware: (id: string) => void;
  isAgentRunning: boolean;
  onTriggerAgentLoop: () => void;
  onOpenCommandPalette: () => void;
  onOpenAuditDrawer: () => void;
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
  onOpenAuditDrawer,
}) => {
  const tabs: { id: 'zoo' | 'workbench' | 'arena' | 'simulator' | 'export'; label: string; num: string; icon: any }[] = [
    { id: 'zoo', label: 'Model Zoo', num: '01', icon: Database },
    { id: 'workbench', label: 'Compiler Workbench', num: '02', icon: Terminal },
    { id: 'arena', label: 'Zero-Malloc Arena', num: '03', icon: Layers },
    { id: 'simulator', label: 'Live Simulator', num: '04', icon: Activity },
    { id: 'export', label: 'C++ Export', num: '05', icon: Code },
  ];

  return (
    <header className="h-14 bg-palantir-nav border-b border-palantir-border px-5 flex items-center justify-between sticky top-0 z-40 select-none">
      {/* Brand & MCU Selector */}
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
              <span className="text-[10px] opacity-60">{t.num}</span>
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right: Search (Cmd+K), Screenpipe Audit & Agent Loop */}
      <div className="flex items-center gap-2.5">
        {/* Command Palette Button */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-2 bg-palantir-card hover:bg-palantir-border/60 text-palantir-textSecondary hover:text-palantir-textPrimary px-2.5 py-1 border border-palantir-border rounded-[3px] text-xs font-mono transition"
        >
          <Search className="w-3.5 h-3.5 text-palantir-cobalt" />
          <span className="text-[11px]">Command</span>
          <kbd className="text-[9px] bg-palantir-canvas px-1.5 py-0.5 rounded-[2px] border border-palantir-border text-palantir-textMuted">
            ⌘K
          </kbd>
        </button>

        {/* Screenpipe Continuous Audit Trigger */}
        <button
          onClick={onOpenAuditDrawer}
          className="hidden sm:flex items-center gap-1.5 bg-palantir-passLight hover:bg-palantir-pass/30 px-2 py-1 rounded-[2px] border border-palantir-pass/40 text-palantir-pass transition text-[10px] font-mono font-bold"
          title="Open Screenpipe Audit Feed"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>AUDIT FEED</span>
        </button>

        {/* Karpathy/DeepSeek Agent Loop Button */}
        <button
          onClick={onTriggerAgentLoop}
          disabled={isAgentRunning}
          className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-[3px] flex items-center gap-1.5 transition border ${
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
              <Play className="w-3.5 h-3.5 fill-current" /> RUN AGENT LOOP
            </>
          )}
        </button>
      </div>
    </header>
  );
};