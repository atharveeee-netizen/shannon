import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Box,
  Upload,
  GitMerge,
  Binary,
  Cpu,
  Zap,
  Code2,
  Workflow,
  Search,
  Activity,
  Scale,
  BarChart3,
  FlaskConical,
  HardDrive,
  Download,
  Terminal,
  Settings,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Bot,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  FlaskRound,
} from 'lucide-react';
import { useCompiler } from '../context/CompilerContext';

interface SidebarSection {
  title: string;
  items: {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    loadedModel,
    selectedHw,
    modelStatus,
    isCopilotOpen,
    setIsCopilotOpen,
  } = useCompiler();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('shannon_sidebar_collapsed') === 'true';
  });

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    EXPERIMENTAL: true, // Default collapsed per submission requirements
  });

  useEffect(() => {
    localStorage.setItem('shannon_sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const sections: SidebarSection[] = [
    {
      title: 'WORKSPACE',
      items: [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'graph', label: 'Computation Graph', icon: GitMerge, badge: 'DAG' },
        { id: 'models', label: 'Reference Models', icon: Box },
        { id: 'import', label: 'Import Model', icon: Upload, badge: 'ONNX/JSON' },
      ],
    },
    {
      title: 'COMPILE',
      items: [
        { id: 'quantization', label: 'INT8 Quantization', icon: Binary, badge: 'INT8' },
        { id: 'memory', label: 'SRAM Memory Arena', icon: Cpu, badge: '0-Malloc' },
        { id: 'optimization', label: 'MCU Optimization', icon: Zap },
        { id: 'codegen', label: 'Code Generation', icon: Code2, badge: '.h' },
      ],
    },
    {
      title: 'VALIDATE',
      items: [
        { id: 'parity', label: 'Numerical Parity', icon: Scale },
        { id: 'benchmarks', label: 'Multi-MCU Matrix', icon: BarChart3 },
        { id: 'testbench', label: 'Execution Verification', icon: FlaskConical },
      ],
    },
    {
      title: 'TARGET',
      items: [
        { id: 'targets', label: 'Silicon Targets', icon: HardDrive },
        { id: 'deployment', label: 'Deployment & Firmware', icon: Download },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'logs', label: 'Compiler Logs', icon: Terminal },
        { id: 'settings', label: 'Settings', icon: Settings },
      ],
    },
    {
      title: 'EXPERIMENTAL',
      items: [
        { id: 'waveforms', label: 'Waveforms & FFT', icon: Activity, badge: 'Simulation' },
        { id: 'signalflow', label: 'Execution Architecture', icon: Workflow, badge: 'Diagram' },
        { id: 'tensor', label: 'Tensor Inspector', icon: Search },
      ],
    },
  ];

  return (
    <aside
      className={`bg-surface border-r border-border flex flex-col flex-shrink-0 select-none h-screen sticky top-0 transition-all duration-150 rounded-none ${
        isCollapsed ? 'w-14' : 'w-60'
      }`}
    >
      {/* Brand Header */}
      <div className="h-12 flex items-center justify-between px-3 border-b border-border bg-surface-raised/50 rounded-none">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-6 h-6 bg-primary text-white flex items-center justify-center font-bold text-xs flex-shrink-0 rounded-none">
            S
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-text-primary tracking-tight text-xs font-mono">SHANNON</span>
                <span className="text-[10px] px-1 py-0.2 bg-surface-raised text-text-muted font-mono border border-border rounded-none">
                  EDA
                </span>
              </div>
              <span className="text-[10px] text-text-secondary">TinyML Silicon Compiler</span>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors rounded-none"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <PanelLeftOpen className="w-3.5 h-3.5" /> : <PanelLeftClose className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Active Target & Model Context Header */}
      {!isCollapsed && (
        <div className="p-2.5 border-b border-border bg-surface-raised/20 space-y-1 rounded-none text-xs">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-text-muted">STATUS</span>
            <span
              className={`flex items-center gap-1 font-semibold ${
                modelStatus === 'SUCCESS'
                  ? 'text-emerald-500'
                  : modelStatus === 'COMPILING'
                  ? 'text-primary animate-pulse'
                  : modelStatus === 'READY'
                  ? 'text-amber-500'
                  : 'text-text-muted'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-none ${
                  modelStatus === 'SUCCESS'
                    ? 'bg-emerald-500'
                    : modelStatus === 'COMPILING'
                    ? 'bg-primary'
                    : modelStatus === 'READY'
                    ? 'bg-amber-500'
                    : 'bg-text-muted'
                }`}
              />
              {modelStatus}
            </span>
          </div>
          <div className="text-xs font-semibold text-text-primary truncate">
            {loadedModel ? loadedModel.name : 'No model loaded'}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-text-secondary font-mono">
            <span className="text-text-primary font-medium">{selectedHw.name}</span>
            <span className="text-text-muted">({selectedHw.clock_mhz} MHz)</span>
          </div>
        </div>
      )}

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-1.5 py-2 space-y-2.5 custom-scrollbar text-xs">
        {sections.map((sec) => {
          const isSecCollapsed = collapsedSections[sec.title];
          return (
            <div key={sec.title}>
              {!isCollapsed && (
                <button
                  onClick={() => toggleSection(sec.title)}
                  className="w-full flex items-center justify-between text-[10px] font-mono font-semibold text-text-muted tracking-wider px-2 py-0.5 hover:text-text-primary transition-colors rounded-none"
                >
                  <span className="flex items-center gap-1">
                    {sec.title === 'EXPERIMENTAL' && <FlaskRound className="w-3 h-3 text-amber-500" />}
                    <span>{sec.title}</span>
                  </span>
                  {isSecCollapsed ? <ChevronRight className="w-3 h-3 text-text-muted" /> : <ChevronDown className="w-3 h-3 text-text-muted" />}
                </button>
              )}

              {(!isSecCollapsed || isCollapsed) && (
                <div className="space-y-0.5 mt-0.5">
                  {sec.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        title={isCollapsed ? item.label : undefined}
                        className={`w-full flex items-center ${
                          isCollapsed ? 'justify-center px-1' : 'justify-between px-2'
                        } py-1.5 text-xs transition-all group rounded-none ${
                          isActive
                            ? 'bg-surface-raised text-text-primary font-semibold border-l-2 border-primary'
                            : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover/60 border-l-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Icon
                            className={`w-3.5 h-3.5 flex-shrink-0 ${
                              isActive ? 'text-primary' : 'text-text-muted group-hover:text-text-secondary'
                            }`}
                          />
                          {!isCollapsed && <span className="truncate">{item.label}</span>}
                        </div>
                        {!isCollapsed && item.badge && (
                          <span
                            className={`text-[9px] px-1 py-0.2 font-mono rounded-none flex-shrink-0 ${
                              isActive
                                ? 'bg-primary/15 text-primary font-medium'
                                : 'bg-surface-raised text-text-muted border border-border'
                            }`}
                          >
                            {item.badge}
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

      {/* Silicon Copilot AI Auditor Drawer Trigger */}
      <div className="p-2 border-t border-border bg-surface-raised/20 space-y-1.5 rounded-none">
        <button
          onClick={() => setIsCopilotOpen(!isCopilotOpen)}
          title={isCollapsed ? 'Silicon Copilot Auditor' : undefined}
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center p-1.5' : 'justify-between p-1.5'
          } border text-xs transition-all rounded-none ${
            isCopilotOpen
              ? 'bg-surface-raised border-primary/50 text-text-primary'
              : 'bg-surface border-border text-text-primary hover:bg-surface-hover'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-surface-raised border border-border flex items-center justify-center text-primary flex-shrink-0 rounded-none">
              <Bot className="w-3.5 h-3.5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col text-left">
                <span className="font-semibold text-xs leading-tight">Silicon Copilot</span>
                <span className="text-[9px] text-text-muted">Hardware Auditor</span>
              </div>
            )}
          </div>
          {!isCollapsed && <Sparkles className="w-3 h-3 text-primary flex-shrink-0" />}
        </button>

        {!isCollapsed && (
          <div className="flex items-center justify-center gap-1 text-[10px] text-text-muted font-mono">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>0 B Malloc Verification</span>
          </div>
        )}
      </div>
    </aside>
  );
};
