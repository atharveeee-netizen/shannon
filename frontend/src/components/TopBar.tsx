import React from 'react';
import {
  Cpu,
  RefreshCw,
  Download,
  Bot,
  Sun,
  Moon,
  ChevronDown,
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
}) => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadCustom(e.target.files[0]);
    }
  };

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 flex-shrink-0">
      {/* Breadcrumb & Project Selector */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="text-slate-500">studio</span>
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
              className="appearance-none bg-slate-800/80 hover:bg-slate-800 text-white font-sans font-semibold text-xs py-1.5 pl-3 pr-7 rounded-lg border border-slate-700/80 cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                  {m.name} ({m.domain})
                </option>
              ))}
              <option value="custom" className="bg-slate-900 text-emerald-400">
                + Upload Custom ONNX/JSON...
              </option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
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
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/60 text-[11px] font-mono text-slate-300">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              apiConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span>{apiConnected ? 'Compiler Online' : 'Local Fallback'}</span>
        </div>
      </div>

      {/* Target Microcontroller & Actions */}
      <div className="flex items-center gap-3">
        {/* Target MCU Selector */}
        <div className="flex items-center gap-2 bg-slate-800/40 border border-slate-700/60 rounded-lg p-1">
          <div className="flex items-center gap-1.5 px-2 text-xs font-mono text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">MCU:</span>
          </div>
          <select
            value={selectedHw.name}
            onChange={(e) => onSelectHw(e.target.value)}
            className="bg-slate-900/90 text-white font-mono text-xs py-1 px-2.5 rounded-md border border-slate-700/80 cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          >
            {hardwareList.map((hw) => (
              <option key={hw.name} value={hw.name} className="bg-slate-900 text-white">
                {hw.name} ({hw.clock_mhz}MHz, {hw.sram_kb}KB SRAM)
              </option>
            ))}
          </select>
        </div>

        {/* Re-Compile Button */}
        <button
          onClick={onRecompile}
          disabled={isCompiling}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isCompiling ? 'animate-spin text-emerald-400' : ''}`} />
          <span>{isCompiling ? 'Compiling...' : 'Recompile'}</span>
        </button>

        {/* Export C Header Button (Primary CTA) */}
        <button
          onClick={onDownloadHeader}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold shadow-sm shadow-emerald-500/20 transition-all active:scale-95"
        >
          <Download className="w-3.5 h-3.5 text-slate-950" />
          <span>Export .h Header</span>
        </button>

        {/* Copilot Toggle */}
        <button
          onClick={() => setIsCopilotOpen(!isCopilotOpen)}
          className={`p-2 rounded-lg border text-xs transition-all ${
            isCopilotOpen
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
              : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Toggle Gemini Silicon Copilot"
        >
          <Bot className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          title="Toggle theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
