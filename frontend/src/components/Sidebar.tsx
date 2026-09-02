import React from 'react';
import {
  LayoutDashboard,
  GitMerge,
  Waves,
  BrainCircuit,
  Radio,
  Cpu,
  Download,
  Bot,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { HardwareProfile, PresetModel } from '../types';

export type TabType =
  | 'dashboard'
  | 'impulse'
  | 'dsp'
  | 'classifier'
  | 'live'
  | 'arena'
  | 'deployment'
  | 'copilot';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  selectedModel: PresetModel | null;
  selectedHw: HardwareProfile;
  isCopilotOpen: boolean;
  setIsCopilotOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  selectedModel,
  selectedHw,
  isCopilotOpen,
  setIsCopilotOpen,
}) => {
  const navSections = [
    {
      title: 'PROJECT',
      items: [
        {
          id: 'dashboard' as TabType,
          label: 'Dashboard',
          icon: LayoutDashboard,
          badge: 'Overview',
        },
      ],
    },
    {
      title: 'IMPULSE DESIGN',
      items: [
        {
          id: 'impulse' as TabType,
          label: 'Create Impulse',
          icon: GitMerge,
          badge: 'Graph',
        },
        {
          id: 'dsp' as TabType,
          label: 'DSP Preprocessing',
          icon: Waves,
          badge: 'MFCC/FFT',
        },
        {
          id: 'classifier' as TabType,
          label: 'NN Classifier',
          icon: BrainCircuit,
          badge: 'INT8',
        },
      ],
    },
    {
      title: 'VALIDATION',
      items: [
        {
          id: 'live' as TabType,
          label: 'Live Classification',
          icon: Radio,
          badge: 'Real-time',
        },
        {
          id: 'arena' as TabType,
          label: 'SRAM Memory Arena',
          icon: Cpu,
          badge: '0-Malloc',
        },
      ],
    },
    {
      title: 'TARGET SILICON',
      items: [
        {
          id: 'deployment' as TabType,
          label: 'Deployment & C Headers',
          icon: Download,
          badge: '.h Export',
        },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 select-none h-screen sticky top-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-slate-800 gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg shadow-sm shadow-emerald-500/20">
          ⚡
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white tracking-tight text-sm">SHANNON</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-semibold border border-emerald-500/30">
              STUDIO
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Autonomous TinyML Studio</span>
        </div>
      </div>

      {/* Active Project Card */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400 font-medium">Active Project</span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Verified
            </span>
          </div>
          <div className="text-xs font-semibold text-white truncate">
            {selectedModel ? selectedModel.name : 'Custom ONNX/JSON Model'}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-400 font-mono">
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {selectedHw.name}
            </span>
            <span className="text-slate-500">@{selectedHw.clock_mhz}MHz</span>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 custom-scrollbar">
        {navSections.map((section) => (
          <div key={section.title}>
            <div className="text-[10px] font-bold text-slate-400 tracking-wider px-2 mb-1.5">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 group ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? 'text-emerald-400'
                            : 'text-slate-400 group-hover:text-slate-300'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          isActive
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-slate-800 text-slate-400 group-hover:text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Silicon Copilot Quick Trigger */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <button
          onClick={() => setIsCopilotOpen(!isCopilotOpen)}
          className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs transition-all ${
            isCopilotOpen
              ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-sm shadow-cyan-500/10'
              : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-semibold text-xs">Silicon Copilot</span>
              <span className="text-[10px] text-slate-400">Gemini Hardware AI</span>
            </div>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
        </button>

        {/* Safety Badge */}
        <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>MISRA-C:2012 Rule 21.3</span>
        </div>
      </div>
    </aside>
  );
};
