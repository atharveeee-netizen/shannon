import React, { useState, useEffect } from 'react';
import {
  GitMerge,
  Cpu,
  Code2,
  ChevronDown,
  ChevronRight,
  Bot,
  PanelLeftClose,
  PanelLeftOpen,
  LayoutDashboard,
  Binary,
  Scale,
  HardDrive,
  Terminal,
} from 'lucide-react';
import { useCompiler } from '../context/CompilerContext';

interface NavItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  tag?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedHw,
    isCopilotOpen,
    setIsCopilotOpen,
  } = useCompiler();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('shannon_sidebar_collapsed') === 'true';
  });

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    EXPERIMENTAL: true,
  });

  useEffect(() => {
    localStorage.setItem('shannon_sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const sections: NavSection[] = [
    {
      title: 'WORKSPACE',
      items: [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'graph', label: 'Computation Graph', icon: GitMerge, tag: 'DAG' },
        { id: 'models', label: 'Reference Models' },
        { id: 'import', label: 'Import Model' },
      ],
    },
    {
      title: 'COMPILE',
      items: [
        { id: 'quantization', label: 'INT8 Quantization', icon: Binary, tag: 'INT8' },
        { id: 'memory', label: 'SRAM Memory Arena', icon: Cpu, tag: '0-Malloc' },
        { id: 'optimization', label: 'MCU Optimization' },
        { id: 'codegen', label: 'Code Generation', icon: Code2, tag: '.h' },
      ],
    },
    {
      title: 'VALIDATE',
      items: [
        { id: 'parity', label: 'Numerical Parity', icon: Scale },
        { id: 'benchmarks', label: 'Multi-MCU Matrix' },
        { id: 'testbench', label: 'Execution Verification' },
      ],
    },
    {
      title: 'TARGET',
      items: [
        { id: 'targets', label: 'Hardware Targets', icon: HardDrive },
        { id: 'deployment', label: 'Deployment & Firmware' },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'logs', label: 'Compiler Logs', icon: Terminal },
        { id: 'settings', label: 'Settings' },
      ],
    },
    {
      title: 'EXPERIMENTAL',
      items: [
        { id: 'waveforms', label: 'Waveforms & FFT' },
        { id: 'signalflow', label: 'Execution Architecture' },
        { id: 'tensor', label: 'Tensor Inspector' },
      ],
    },
  ];

  return (
    <aside
      className={`h-screen bg-surface border-r border-border flex flex-col justify-between transition-all duration-200 select-none z-20 flex-shrink-0 ${
        isCollapsed ? 'w-14' : 'w-[248px]'
      }`}
    >
      {/* Top Branding & Collapse Trigger */}
      <div>
        <div className="h-14 px-3.5 border-b border-border flex items-center justify-between">
          {!isCollapsed ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
                <Cpu className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold tracking-tight text-text-primary uppercase flex items-center gap-1.5">
                  <span>Shannon</span>
                  <span className="text-[9px] font-mono font-medium px-1 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                    EDA
                  </span>
                </div>
                <div className="text-[10px] text-text-muted truncate font-mono">TinyML Compiler</div>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <Cpu className="w-4 h-4 text-primary" />
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-md hover:bg-surface-raised text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="p-2 space-y-3 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar">
          {sections.map((sec) => {
            const isSecCollapsed = collapsedSections[sec.title];

            return (
              <div key={sec.title} className="space-y-0.5">
                {!isCollapsed && (
                  <button
                    onClick={() => toggleSection(sec.title)}
                    className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-mono tracking-wider font-semibold text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                  >
                    <span>{sec.title}</span>
                    {isSecCollapsed ? (
                      <ChevronRight className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                )}

                {(!isSecCollapsed || isCollapsed) && (
                  <div className="space-y-0.5">
                    {sec.items.map((item) => {
                      const isActive = activeTab === item.id;
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          title={isCollapsed ? item.label : undefined}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors text-left cursor-pointer ${
                            isActive
                              ? 'bg-primary/10 text-primary border-l-2 border-primary font-semibold'
                              : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover border-l-2 border-transparent'
                          }`}
                        >
                          {Icon ? (
                            <Icon
                              className={`w-3.5 h-3.5 flex-shrink-0 ${
                                isActive ? 'text-primary' : 'text-text-muted'
                              }`}
                            />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-border-strong flex-shrink-0 ml-1 mr-1" />
                          )}

                          {!isCollapsed && (
                            <div className="flex items-center justify-between w-full min-w-0">
                              <span className="truncate">{item.label}</span>
                              {item.tag && (
                                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-surface-raised border border-border text-text-muted flex-shrink-0 ml-1">
                                  {item.tag}
                                </span>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom: Silicon Copilot Trigger & Active Target Telemetry */}
      <div className="p-2 border-t border-border bg-surface">
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className="px-2.5 py-1.5 rounded-lg bg-surface-raised border border-border flex items-center justify-between text-[11px] font-mono">
              <span className="text-text-muted truncate">{selectedHw.name}</span>
              <span className="text-primary font-semibold">{selectedHw.sram_kb}KB</span>
            </div>

            <button
              onClick={() => setIsCopilotOpen(!isCopilotOpen)}
              className={`w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                isCopilotOpen
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-surface-raised hover:bg-surface-hover border-border text-text-primary'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Silicon Copilot</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsCopilotOpen(!isCopilotOpen)}
            title="Toggle Silicon Copilot"
            className={`w-full p-2 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              isCopilotOpen ? 'bg-primary text-white' : 'hover:bg-surface-raised text-text-muted'
            }`}
          >
            <Bot className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
