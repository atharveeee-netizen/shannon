import React from 'react';
import {
  Cpu,
  RefreshCw,
  Download,
  Bot,
  Sun,
  Moon,
  ChevronDown,
  ArrowLeft,
} from 'lucide-react';
import { HardwareProfile, PresetModel } from '../types';

interface TopBarProps {
  selectedModel: PresetModel | null;
  models: PresetModel[];
  onSelectModel: (id: string) => void;
  hardwareList: HardwareProfile[];
  selectedHw: HardwareProfile;
  onSelectHw: (id: string) => void;
  onUploadCustom: (file: File) => void;
  isCompiling: boolean;
  onRecompile: () => void;
  onDownloadHeader: () => void;
  isCopilotOpen: boolean;
  setIsCopilotOpen: (open: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  apiConnected: boolean;
  onBackToHome?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  selectedModel,
  models,
  onSelectModel,
  hardwareList,
  selectedHw,
  onSelectHw,
  onUploadCustom,
  isCompiling,
  onRecompile,
  onDownloadHeader,
  isCopilotOpen,
  setIsCopilotOpen,
  isDarkMode,
  setIsDarkMode,
  apiConnected,
  onBackToHome,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadCustom(e.target.files[0]);
    }
  };

  return (
    <header className="h-16 bg-[#151B26] border-b border-[#2A3649] px-6 flex items-center justify-between sticky top-0 z-30 flex-shrink-0">
      {/* Breadcrumb & Project Selector */}
      <div className="flex items-center gap-3">
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1 text-xs font-mono text-[#94A3B8] hover:text-white px-2 py-1 rounded bg-[#1B2431] border border-[#2A3649] transition-colors mr-1"
            title="Return to Home & CLI page"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
        )}

        <div className="flex items-center gap-2 text-xs font-mono text-[#94A3B8]">
          <span className="text-[#64748B]">studio</span>
          <span>/</span>
          <div className="relative group">
            <select
              value={selectedModel ? selectedModel.id : 'custom'}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  fileInputRef.current?.click();
                } else {
                  onSelectModel(e.target.value);
                }
              }}
              className="appearance-none bg-[#1B2431] hover:bg-[#232E3E] text-white font-sans font-semibold text-xs py-1.5 pl-3 pr-7 rounded-md border border-[#2A3649] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#20E28B]"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id} className="bg-[#151B26] text-white">
                  {m.name} ({m.domain})
                </option>
              ))}
              <option value="custom" className="bg-[#151B26] text-[#20E28B]">
                + Upload Custom ONNX/JSON...
              </option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-2 top-2.5 pointer-events-none" />
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,.onnx"
            className="hidden"
          />
        </div>

        {/* API Health Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1B2431] border border-[#2A3649] text-[11px] font-mono text-[#94A3B8]">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              apiConnected ? 'bg-[#20E28B] animate-pulse' : 'bg-[#20E28B]'
            }`}
          />
          <span className="text-[#CBD5E1]">Ready</span>
        </div>
      </div>

      {/* Target Microcontroller & Actions */}
      <div className="flex items-center gap-3">
        {/* Target MCU Selector */}
        <div className="flex items-center gap-2 bg-[#1B2431] border border-[#2A3649] rounded-md p-1">
          <div className="flex items-center gap-1.5 px-2 text-xs font-mono text-[#94A3B8]">
            <Cpu className="w-3.5 h-3.5 text-[#20E28B]" />
            <span className="text-[#64748B]">Target:</span>
          </div>
          <select
            value={selectedHw.name}
            onChange={(e) => onSelectHw(e.target.value)}
            className="bg-[#121924] text-white font-mono text-xs py-1 px-2.5 rounded border border-[#253041] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#20E28B]"
          >
            {hardwareList.map((hw) => (
              <option key={hw.name} value={hw.name} className="bg-[#151B26] text-white">
                {hw.name} ({hw.clock_mhz}MHz, {hw.sram_kb}KB SRAM)
              </option>
            ))}
          </select>
        </div>

        {/* Re-Compile Button */}
        <button
          onClick={onRecompile}
          disabled={isCompiling}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1B2431] hover:bg-[#232E3E] text-[#E2E8F0] border border-[#2A3649] text-xs font-medium transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isCompiling ? 'animate-spin text-[#20E28B]' : 'text-[#94A3B8]'}`} />
          <span>{isCompiling ? 'Compiling...' : 'Recompile'}</span>
        </button>

        {/* Export C Header Button (Edge Impulse Signature Green CTA) */}
        <button
          onClick={onDownloadHeader}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#20E28B] hover:bg-[#1BC97B] text-[#0E131F] text-xs font-bold shadow-sm shadow-[#20E28B]/20 transition-all active:scale-95"
        >
          <Download className="w-3.5 h-3.5 text-[#0E131F] stroke-[2.5]" />
          <span>Export .h Header</span>
        </button>

        {/* Copilot Toggle */}
        <button
          onClick={() => setIsCopilotOpen(!isCopilotOpen)}
          className={`p-2 rounded-md border text-xs transition-all ${
            isCopilotOpen
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
              : 'bg-[#1B2431] border-[#2A3649] text-[#94A3B8] hover:text-white hover:bg-[#232E3E]'
          }`}
          title="Toggle Gemini Silicon Copilot"
        >
          <Bot className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-md bg-[#1B2431] border border-[#2A3649] text-[#94A3B8] hover:text-white hover:bg-[#232E3E] transition-all"
          title="Toggle theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
