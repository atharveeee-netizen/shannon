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
  Zap,
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
          label: 'Create impulse',
          icon: GitMerge,
          badge: 'Graph',
        },
        {
          id: 'dsp' as TabType,
          label: 'Spectral features',
          icon: Waves,
          badge: 'DSP',
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
      title: 'MODEL TESTING',
      items: [
        {
          id: 'live' as TabType,
          label: 'Live classification',
          icon: Radio,
          badge: 'Real-time',
        },
        {
          id: 'arena' as TabType,
          label: 'SRAM Memory arena',
          icon: Cpu,
          badge: '0-Malloc',
        },
      ],
    },
    {
      title: 'DEPLOYMENT',
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
    <aside className="w-64 bg-[#1B2431] border-r border-[#253041] flex flex-col flex-shrink-0 select-none h-screen sticky top-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-[#253041] gap-3 bg-[#151B26]">
        <div className="w-8 h-8 rounded-lg bg-[#20E28B]/15 border border-[#20E28B]/30 flex items-center justify-center text-[#20E28B] font-bold text-lg shadow-sm shadow-[#20E28B]/20">
          <Zap className="w-5 h-5 fill-[#20E28B]" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-white tracking-tight text-sm">SHANNON</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#20E28B]/20 text-[#20E28B] font-mono font-bold border border-[#20E28B]/30">
              STUDIO
            </span>
          </div>
          <span className="text-[11px] text-[#94A3B8]">Autonomous TinyML</span>
        </div>
      </div>

      {/* Active Project Card */}
      <div className="p-3 border-b border-[#253041] bg-[#121924]">
        <div className="p-2.5 rounded-lg bg-[#18212D] border border-[#2A3649]">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[#94A3B8] font-medium text-[11px]">Active Project</span>
            <span className="flex items-center gap-1 text-[10px] text-[#20E28B] font-mono font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#20E28B] animate-pulse" />
              Verified
            </span>
          </div>
          <div className="text-xs font-bold text-white truncate">
            {selectedModel ? selectedModel.name : 'Custom Model'}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-[#94A3B8] font-mono">
            <span className="px-1.5 py-0.5 rounded bg-[#253041] text-[#E2E8F0] border border-[#334155]">
              {selectedHw.name}
            </span>
            <span className="text-[#64748B]">@{selectedHw.clock_mhz}MHz</span>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-5 custom-scrollbar">
        {navSections.map((section) => (
          <div key={section.title}>
            <div className="text-[10px] font-bold text-[#64748B] tracking-wider px-3 mb-1.5">
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
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all duration-150 group relative ${
                      isActive
                        ? 'bg-[#20E28B]/10 text-[#20E28B] font-bold border-l-4 border-[#20E28B]'
                        : 'text-[#94A3B8] hover:text-white hover:bg-[#232E3E] border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? 'text-[#20E28B]'
                            : 'text-[#64748B] group-hover:text-[#94A3B8]'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          isActive
                            ? 'bg-[#20E28B]/20 text-[#20E28B]'
                            : 'bg-[#253041] text-[#64748B] group-hover:text-[#94A3B8]'
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

      {/* Silicon Copilot Trigger */}
      <div className="p-3 border-t border-[#253041] bg-[#121924]">
        <button
          onClick={() => setIsCopilotOpen(!isCopilotOpen)}
          className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs transition-all ${
            isCopilotOpen
              ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-sm shadow-cyan-500/10'
              : 'bg-[#18212D] border-[#2A3649] text-[#CBD5E1] hover:bg-[#232E3E] hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-xs">Silicon Copilot</span>
              <span className="text-[10px] text-[#94A3B8]">Gemini Hardware AI</span>
            </div>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
        </button>

        {/* Safety Badge */}
        <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[10px] text-[#64748B] font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-[#20E28B]" />
          <span>MISRA-C:2012 Rule 21.3</span>
        </div>
      </div>
    </aside>
  );
};
