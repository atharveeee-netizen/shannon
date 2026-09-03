import React, { useState, useEffect } from 'react';
import {
  PanelLeftClose,
  PanelLeftOpen,
  Bot,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { useCompiler } from '../context/CompilerContext';

interface NavItem {
  id: string;
  label: string;
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
    Experimental: true,
  });

  useEffect(() => {
    localStorage.setItem('shannon_sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const sections: NavSection[] = [
    {
      title: 'Workspace',
      items: [
        { id: 'dashboard', label: 'Overview' },
        { id: 'graph', label: 'Computation graph' },
        { id: 'models', label: 'Reference models' },
        { id: 'import', label: 'Import model' },
      ],
    },
    {
      title: 'Compile',
      items: [
        { id: 'quantization', label: 'Quantization', tag: 'INT8' },
        { id: 'memory', label: 'Memory arena', tag: '0 B' },
        { id: 'optimization', label: 'MCU optimization' },
        { id: 'codegen', label: 'Generated C', tag: '.h' },
      ],
    },
    {
      title: 'Validate',
      items: [
        { id: 'parity', label: 'Numerical parity' },
        { id: 'benchmarks', label: 'Hardware matrix' },
        { id: 'testbench', label: 'Verification testbench' },
      ],
    },
    {
      title: 'Target',
      items: [
        { id: 'targets', label: 'Hardware targets' },
        { id: 'deployment', label: 'Firmware & deployment' },
      ],
    },
    {
      title: 'System',
      items: [
        { id: 'logs', label: 'Compiler logs' },
        { id: 'settings', label: 'Settings' },
      ],
    },
    {
      title: 'Experimental',
      items: [
        { id: 'waveforms', label: 'Waveforms & FFT' },
        { id: 'signalflow', label: 'Signal flow architecture' },
        { id: 'tensor', label: 'Tensor inspector' },
      ],
    },
  ];

  return (
    <aside
      className={`h-screen bg-surface border-r border-border flex flex-col justify-between transition-all duration-150 select-none z-20 flex-shrink-0 ${
        isCollapsed ? 'w-14' : 'w-[248px]'
      }`}
    >
      {/* Top Header & Branding */}
      <div>
        <div className="h-14 px-4 border-b border-border flex items-center justify-between">
          {!isCollapsed ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded-[6px] bg-primary flex items-center justify-center flex-shrink-0 text-white font-mono font-bold text-xs">
                S
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold tracking-tight text-text-primary">
                  Shannon
                </div>
                <div className="text-xs text-text-muted truncate">
                  TinyML Silicon IDE
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-6 h-6 rounded-[6px] bg-primary flex items-center justify-center text-white font-mono font-bold text-xs">
                S
              </div>
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-[6px] hover:bg-surface-raised text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            aria-label="Toggle navigation"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="p-2 space-y-3 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar">
          {sections.map((sec) => {
            const isSecCollapsed = collapsedSections[sec.title];

            return (
              <div key={sec.title} className="space-y-0.5">
                {!isCollapsed && (
                  <button
                    onClick={() => toggleSection(sec.title)}
                    className="w-full flex items-center justify-between px-2.5 py-1 text-xs font-medium text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                  >
                    <span>{sec.title}</span>
                    {isSecCollapsed ? (
                      <ChevronRight className="w-3 h-3 text-text-muted" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-text-muted" />
                    )}
                  </button>
                )}

                {(!isSecCollapsed || isCollapsed) && (
                  <div className="space-y-0.5">
                    {sec.items.map((item) => {
                      const isActive = activeTab === item.id;

                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          title={isCollapsed ? item.label : undefined}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[6px] text-sm transition-colors text-left cursor-pointer ${
                            isActive
                              ? 'bg-surface-raised text-text-primary font-medium border-l-2 border-primary'
                              : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover border-l-2 border-transparent'
                          }`}
                        >
                          <span className="truncate">{item.label}</span>

                          {!isCollapsed && item.tag && (
                            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-[4px] bg-surface border border-border text-text-muted flex-shrink-0 ml-1.5">
                              {item.tag}
                            </span>
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

      {/* Bottom: Active Hardware & Silicon Copilot Drawer */}
      <div className="p-2 border-t border-border bg-surface space-y-2">
        {!isCollapsed ? (
          <>
            <div className="px-2.5 py-1.5 rounded-[6px] bg-surface-raised border border-border flex items-center justify-between text-xs">
              <span className="text-text-secondary truncate">{selectedHw.name}</span>
              <span className="font-mono text-text-primary font-medium">{selectedHw.sram_kb} KB</span>
            </div>

            <button
              onClick={() => setIsCopilotOpen(!isCopilotOpen)}
              className={`w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-[6px] text-xs font-medium border transition-colors cursor-pointer ${
                isCopilotOpen
                  ? 'bg-primary text-white border-primary'
                  : 'bg-surface-raised hover:bg-surface-hover border-border text-text-primary'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Silicon Copilot</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsCopilotOpen(!isCopilotOpen)}
            title="Toggle Silicon Copilot"
            className={`w-full p-2 rounded-[6px] flex items-center justify-center transition-colors cursor-pointer ${
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
