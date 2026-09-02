import React, { useState } from 'react';
import {
  LayoutDashboard,
  Box,
  Sliders,
  Upload,
  GitMerge,
  Binary,
  Cpu,
  Zap,
  Code2,
  Workflow,
  Search,
  Activity,
  GitCompare,
  Layers,
  FlaskConical,
  Scale,
  BarChart3,
  HardDrive,
  Download,
  Terminal,
  Settings,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Bot,
  Sparkles,
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

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const sections: SidebarSection[] = [
    {
      title: 'PROJECT',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'models', label: 'Model Zoo', icon: Box },
        { id: 'inputs', label: 'Sensor Inputs', icon: Sliders },
        { id: 'import', label: 'Import Model', icon: Upload, badge: 'ONNX/JSON' },
      ],
    },
    {
      title: 'COMPILER',
      items: [
        { id: 'graph', label: 'Computation Graph', icon: GitMerge, badge: 'DAG' },
        { id: 'quantization', label: 'Quantization', icon: Binary, badge: 'INT8' },
        { id: 'memory', label: 'SRAM Memory Arena', icon: Cpu, badge: '0-Malloc' },
        { id: 'optimization', label: 'MCU Optimization', icon: Zap },
        { id: 'codegen', label: 'Code Generation', icon: Code2, badge: '.h' },
      ],
    },
    {
      title: 'SIMULATION',
      items: [
        { id: 'signalflow', label: 'Signal Flow', icon: Workflow },
        { id: 'tensor', label: 'Tensor Inspector', icon: Search },
        { id: 'waveforms', label: 'Waveforms & FFT', icon: Activity },
        { id: 'fp32vsint8', label: 'FP32 vs INT8', icon: GitCompare },
        { id: 'compare', label: 'Compare Targets', icon: Layers },
      ],
    },
    {
      title: 'VALIDATION',
      items: [
        { id: 'testbench', label: 'Testbench', icon: FlaskConical },
        { id: 'parity', label: 'Numerical Parity', icon: Scale },
        { id: 'benchmarks', label: 'Multi-MCU Matrix', icon: BarChart3 },
      ],
    },
    {
      title: 'HARDWARE',
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
  ];

  return (
    <aside className="w-64 bg-surface border-r border-border flex flex-col flex-shrink-0 select-none h-screen sticky top-0">
      {/* Brand Header */}
      <div className="h-14 flex items-center px-4 border-b border-border gap-2.5 bg-surface-raised/40">
        <div className="w-7 h-7 rounded bg-accent-subtle border border-accent/30 flex items-center justify-center text-accent font-bold text-sm">
          <Zap className="w-4 h-4 fill-accent text-accent" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-text-primary tracking-tight text-xs">SHANNON</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-raised text-text-muted font-mono font-medium border border-border">
              EDA
            </span>
          </div>
          <span className="text-[11px] text-text-secondary">TinyML Silicon Compiler</span>
        </div>
      </div>

      {/* Active Target & Model Context Header */}
      <div className="p-3 border-b border-border bg-surface-raised/20 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-text-muted">STATUS</span>
          <span
            className={`flex items-center gap-1 font-semibold ${
              modelStatus === 'SUCCESS'
                ? 'text-emerald-400'
                : modelStatus === 'COMPILING'
                ? 'text-cyan-400 animate-pulse'
                : modelStatus === 'READY'
                ? 'text-amber-400'
                : 'text-text-muted'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                modelStatus === 'SUCCESS'
                  ? 'bg-emerald-400'
                  : modelStatus === 'COMPILING'
                  ? 'bg-cyan-400'
                  : modelStatus === 'READY'
                  ? 'bg-amber-400'
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
          <span className="text-text-muted">({selectedHw.clock_mhz}MHz)</span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-3 custom-scrollbar text-xs">
        {sections.map((sec) => {
          const isCollapsed = collapsedSections[sec.title];
          return (
            <div key={sec.title}>
              <button
                onClick={() => toggleSection(sec.title)}
                className="w-full flex items-center justify-between text-[11px] font-mono font-semibold text-text-muted tracking-wider px-2 py-1 hover:text-text-primary transition-colors"
              >
                <span>{sec.title}</span>
                {isCollapsed ? <ChevronRight className="w-3 h-3 text-text-muted" /> : <ChevronDown className="w-3 h-3 text-text-muted" />}
              </button>

              {!isCollapsed && (
                <div className="space-y-0.5 mt-0.5">
                  {sec.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-all group ${
                          isActive
                            ? 'bg-surface-raised text-text-primary font-semibold border-l-2 border-accent shadow-sm'
                            : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover/60 border-l-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon
                            className={`w-3.5 h-3.5 ${
                              isActive ? 'text-accent' : 'text-text-muted group-hover:text-text-secondary'
                            }`}
                          />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                              isActive
                                ? 'bg-accent/15 text-accent font-medium'
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
      <div className="p-3 border-t border-border bg-surface-raised/20 space-y-2">
        <button
          onClick={() => setIsCopilotOpen(!isCopilotOpen)}
          className={`w-full flex items-center justify-between p-2 rounded border text-xs transition-all ${
            isCopilotOpen
              ? 'bg-surface-raised border-accent/40 text-text-primary'
              : 'bg-surface border-border text-text-primary hover:bg-surface-hover'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-surface-raised border border-border flex items-center justify-center text-accent">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-semibold text-xs">Silicon Copilot</span>
              <span className="text-[10px] text-text-muted">Hardware Auditor</span>
            </div>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-accent" />
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-text-muted font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-accent" />
          <span>MISRA-C:2012 Rule 21.3</span>
        </div>
      </div>
    </aside>
  );
};
