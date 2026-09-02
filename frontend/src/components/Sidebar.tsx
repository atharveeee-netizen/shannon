import React from 'react';
import {
  LayoutDashboard,
  Box,
  Radio,
  UploadCloud,
  GitCommit,
  Sliders,
  Database,
  Cpu,
  FileCode,
  Activity,
  CheckCircle2,
  BarChart2,
  HardDrive,
  Rocket,
  Terminal,
  Settings,
} from 'lucide-react';
import { HardwareProfile } from '../types';

export type ViewId =
  | 'dashboard'
  | 'models'
  | 'inputs'
  | 'import'
  | 'graph'
  | 'quantization'
  | 'arena'
  | 'optimization'
  | 'codegen'
  | 'testbench'
  | 'parity'
  | 'benchmarks'
  | 'targets'
  | 'deployment'
  | 'logs'
  | 'settings';

interface SidebarProps {
  activeView: ViewId;
  onSelectView: (view: ViewId) => void;
  targetHw: HardwareProfile;
  compilationStatus: 'READY' | 'COMPILING' | 'VERIFIED' | 'FAILED';
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  targetHw,
  compilationStatus,
}) => {
  const navSections = [
    {
      category: 'PROJECT',
      items: [
        { id: 'dashboard' as ViewId, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'models' as ViewId, label: 'Models', icon: Box },
        { id: 'inputs' as ViewId, label: 'Data / Inputs', icon: Radio },
      ],
    },
    {
      category: 'COMPILER',
      items: [
        { id: 'import' as ViewId, label: 'Import Model', icon: UploadCloud },
        { id: 'graph' as ViewId, label: 'Graph', icon: GitCommit },
        { id: 'quantization' as ViewId, label: 'Quantization', icon: Sliders },
        { id: 'arena' as ViewId, label: 'Memory Arena', icon: Database, badge: '0B' },
        { id: 'optimization' as ViewId, label: 'Optimization', icon: Cpu },
        { id: 'codegen' as ViewId, label: 'Code Generation', icon: FileCode },
      ],
    },
    {
      category: 'VALIDATION',
      items: [
        { id: 'testbench' as ViewId, label: 'Testbench', icon: Activity },
        { id: 'parity' as ViewId, label: 'Numerical Parity', icon: CheckCircle2, badge: 'PASS' },
        { id: 'benchmarks' as ViewId, label: 'Benchmarks', icon: BarChart2 },
      ],
    },
    {
      category: 'HARDWARE',
      items: [
        { id: 'targets' as ViewId, label: 'Targets', icon: HardDrive },
        { id: 'deployment' as ViewId, label: 'Deployment', icon: Rocket },
      ],
    },
    {
      category: 'SYSTEM',
      items: [
        { id: 'logs' as ViewId, label: 'Logs', icon: Terminal },
        { id: 'settings' as ViewId, label: 'Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-60 flex-shrink-0 bg-surface border-r border-border flex flex-col h-auto lg:h-[calc(100vh-3rem)] overflow-y-auto text-xs font-sans select-none">
      {/* Brand Header */}
      <div className="h-12 px-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-primary rounded flex items-center justify-center font-mono font-bold text-white text-[11px]">
            S
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs text-text-primary tracking-tight">SHANNON</span>
            <span className="text-[9px] font-mono text-text-muted leading-none">TinyML Compiler Studio</span>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="p-2 space-y-4 flex-1">
        {navSections.map((sec) => (
          <div key={sec.category} className="space-y-0.5">
            <span className="text-[10px] font-semibold text-text-muted px-2.5 py-1 block tracking-wider">
              {sec.category}
            </span>
            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectView(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition font-medium ${
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold border border-primary/20'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-primary' : 'text-text-muted'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono px-1 rounded font-bold ${
                        item.badge === 'PASS'
                          ? 'bg-success-subtle text-success'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Target Status Footer */}
      <div className="p-3 border-t border-border bg-surface-raised/40 font-mono text-[11px] space-y-1.5">
        <div className="flex items-center justify-between text-text-muted text-[10px]">
          <span>TARGET SILICON</span>
          <span className="text-primary font-semibold">{targetHw.name}</span>
        </div>
        <div className="flex items-center justify-between text-text-secondary">
          <span className="truncate">{targetHw.arch.split(' ')[0]}</span>
          <span className="flex items-center gap-1 text-[10px] text-success">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            {compilationStatus}
          </span>
        </div>
      </div>
    </aside>
  );
};
