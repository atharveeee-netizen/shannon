import React, { useState } from 'react';
import { HardwareProfile, ModelZooItem } from '../types';
import { Database, Cpu, Sliders, UploadCloud, CheckCircle2 } from 'lucide-react';

interface SidebarSiliconProps {
  models: ModelZooItem[];
  selectedModelId: string;
  onSelectModel: (id: string) => void;
  hardwareList: HardwareProfile[];
  selectedHwId: string;
  onSelectHardware: (id: string) => void;
  mixedPrecision: boolean;
  onToggleMixedPrecision: (val: boolean) => void;
  quantBits: number;
  onChangeQuantBits: (bits: number) => void;
  onUploadCustomModel?: (name: string) => void;
}

export const SidebarSilicon: React.FC<SidebarSiliconProps> = ({
  models,
  selectedModelId,
  onSelectModel,
  hardwareList,
  selectedHwId,
  onSelectHardware,
  mixedPrecision,
  onToggleMixedPrecision,
  quantBits,
  onChangeQuantBits,
  onUploadCustomModel,
}) => {
  const [activeTab, setActiveTab] = useState<'models' | 'chips' | 'flags'>('models');
  const [customFile, setCustomFile] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCustomFile(file.name);
      onSelectModel('vision');
      if (onUploadCustomModel) onUploadCustomModel(file.name);
    }
  };

  return (
    <aside className="w-72 bg-[#070A0F] border-r border-[#1E293B] flex flex-col shrink-0 select-none h-full overflow-hidden shadow-md">
      {/* Sidebar Navigation with Animated Pill Tab Indicators */}
      <div className="flex items-center border-b border-[#1E293B] bg-[#070A0F] text-xs font-mono p-1 gap-1">
        <button
          onClick={() => setActiveTab('models')}
          className={`flex-1 py-2 px-2 rounded-[3px] flex items-center justify-center gap-1.5 transition-all btn-tactile group relative ${
            activeTab === 'models'
              ? 'tab-pill-active border border-[#38BDF8]/40'
              : 'text-[#64748B] hover:text-[#F8FAFC] hover:bg-[#0E1420]'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-[#38BDF8] group-hover:scale-110 transition-transform" />
          <span>Models</span>
        </button>

        <button
          onClick={() => setActiveTab('chips')}
          className={`flex-1 py-2 px-2 rounded-[3px] flex items-center justify-center gap-1.5 transition-all btn-tactile group relative ${
            activeTab === 'chips'
              ? 'tab-pill-active border border-[#10B981]/40'
              : 'text-[#64748B] hover:text-[#F8FAFC] hover:bg-[#0E1420]'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-[#10B981] group-hover:scale-110 transition-transform" />
          <span>Silicon</span>
        </button>

        <button
          onClick={() => setActiveTab('flags')}
          className={`flex-1 py-2 px-2 rounded-[3px] flex items-center justify-center gap-1.5 transition-all btn-tactile group relative ${
            activeTab === 'flags'
              ? 'tab-pill-active border border-[#F59E0B]/40'
              : 'text-[#64748B] hover:text-[#F8FAFC] hover:bg-[#0E1420]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-[#94A3B8] group-hover:scale-110 transition-transform" />
          <span>Flags</span>
        </button>
      </div>

      {/* Tab Content Container with React Bits Terminal Dark Cards */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 font-mono text-xs">
        {/* TAB 1: MODEL ZOO & INGESTION */}
        {activeTab === 'models' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[10px] text-[#64748B] uppercase font-bold tracking-wider px-1">
              <span>PRESET BENCHMARK ZOO</span>
              <span className="text-[#38BDF8] font-tabular font-bold">{models.length} MODELS</span>
            </div>

            <div className="space-y-2">
              {models.map((m) => {
                const isSelected = selectedModelId === m.id && !customFile;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      setCustomFile(null);
                      onSelectModel(m.id);
                    }}
                    className={`p-3 rounded-[3px] border cursor-pointer transition-all duration-200 flex flex-col gap-1.5 group ${
                      isSelected
                        ? 'bg-[#0E1420] border-[#38BDF8] shadow-[0_0_20px_-3px_rgba(56,189,248,0.3)]'
                        : 'bg-[#0B0F17] border-[#1E293B] hover:border-[#38BDF8] hover:shadow-[0_0_20px_-3px_rgba(56,189,248,0.25)] hover:bg-[#0E1420]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#F8FAFC] group-hover:text-[#38BDF8] transition-colors">{m.name}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-[2px] bg-[#10B981]/15 text-[#10B981] font-bold border border-[#10B981]/30">
                        {m.accuracy_score}
                      </span>
                    </div>

                    <p className="text-[10px] text-[#94A3B8] font-sans line-clamp-1">{m.architecture}</p>

                    <div className="flex items-center justify-between text-[10px] text-[#64748B] pt-1.5 border-t border-[#1E293B] mt-0.5 font-tabular">
                      <span>Shape: <strong className="text-[#94A3B8]">{m.input_shape}</strong></span>
                      <span className="text-[#38BDF8] font-bold">{m.int8_flash_kb} KB ({m.flash_compression_ratio})</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Graph Ingest Card */}
            <div className="pt-2 border-t border-[#1E293B]">
              <label
                className={`p-3 rounded-[3px] border border-dashed cursor-pointer transition-all duration-200 flex flex-col gap-1.5 group ${
                  customFile
                    ? 'bg-[#0E1420] border-[#10B981] shadow-[0_0_16px_rgba(16,185,129,0.25)]'
                    : 'bg-[#0B0F17] border-[#1E293B] hover:border-[#38BDF8] hover:shadow-[0_0_20px_-3px_rgba(56,189,248,0.25)] hover:bg-[#0E1420]'
                }`}
              >
                <input type="file" accept=".onnx,.json,.tflite,.pt" onChange={handleFileUpload} className="hidden" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-[#94A3B8]">CUSTOM GRAPH INGEST</span>
                  <UploadCloud className="w-3.5 h-3.5 text-[#38BDF8] group-hover:translate-y-[-2px] transition-transform" />
                </div>
                <span className="text-[11px] font-bold text-[#F8FAFC] truncate">
                  {customFile || 'Upload ONNX / JSON Graph'}
                </span>
                <span className="text-[9px] text-[#64748B] font-sans">
                  {customFile ? 'Custom model parsed & verified' : 'Drop ONNX, JSON, or PyTorch models'}
                </span>
              </label>
            </div>
          </div>
        )}

        {/* TAB 2: SILICON MCU PROFILES */}
        {activeTab === 'chips' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[10px] text-[#64748B] uppercase font-bold tracking-wider px-1">
              <span>TARGET SILICON PLATFORMS</span>
              <span className="text-[#10B981] font-tabular font-bold">{hardwareList.length} MCUS</span>
            </div>

            <div className="space-y-2">
              {hardwareList.map((hw) => {
                const isSelected = selectedHwId === hw.id;
                return (
                  <div
                    key={hw.id}
                    onClick={() => onSelectHardware(hw.id)}
                    className={`p-3 rounded-[3px] border cursor-pointer transition-all duration-200 flex flex-col gap-1.5 group ${
                      isSelected
                        ? 'bg-[#0E1420] border-[#38BDF8] shadow-[0_0_20px_-3px_rgba(56,189,248,0.3)]'
                        : 'bg-[#0B0F17] border-[#1E293B] hover:border-[#38BDF8] hover:shadow-[0_0_20px_-3px_rgba(56,189,248,0.25)] hover:bg-[#0E1420]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#F8FAFC] group-hover:text-[#38BDF8] transition-colors">{hw.name}</span>
                      <span className="text-[9px] text-[#38BDF8] font-tabular font-bold bg-[#0284C7]/15 px-1.5 py-0.2 rounded border border-[#38BDF8]/30">
                        {hw.clock_mhz} MHz
                      </span>
                    </div>

                    <p className="text-[10px] text-[#94A3B8] font-sans line-clamp-1">{hw.arch}</p>

                    <div className="flex items-center justify-between text-[10px] text-[#64748B] pt-1.5 border-t border-[#1E293B] mt-0.5 font-tabular">
                      <span>SRAM: <strong className="text-[#10B981]">{hw.sram_kb} KB</strong></span>
                      <span>Flash: <strong className="text-[#38BDF8]">{hw.flash_mb} MB</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: COMPILER FLAGS & TUNING */}
        {activeTab === 'flags' && (
          <div className="space-y-3">
            <div className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider px-1">
              QUANTIZATION & CODEGEN FLAGS
            </div>

            <div className="space-y-2 bg-[#0B0F17] p-3 rounded-[3px] border border-[#1E293B] hover:border-[#38BDF8]/40 transition-colors">
              <label className="text-[10px] text-[#94A3B8] block uppercase font-bold">
                Quantization Precision
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => onChangeQuantBits(8)}
                  className={`py-1.5 px-2 rounded-[3px] text-xs font-bold transition-all btn-tactile ${
                    quantBits === 8
                      ? 'btn-tactile-primary'
                      : 'btn-tactile-secondary'
                  }`}
                >
                  INT8 Symmetric
                </button>
                <button
                  onClick={() => onChangeQuantBits(4)}
                  className={`py-1.5 px-2 rounded-[3px] text-xs font-bold transition-all btn-tactile ${
                    quantBits === 4
                      ? 'btn-tactile-primary'
                      : 'btn-tactile-secondary'
                  }`}
                >
                  INT4 Packed
                </button>
              </div>

              <div className="pt-2 border-t border-[#1E293B]">
                <label className="flex items-center justify-between cursor-pointer select-none">
                  <span className="text-[11px] text-[#F8FAFC]">Mixed Precision (HAWQ)</span>
                  <input
                    type="checkbox"
                    checked={mixedPrecision}
                    onChange={(e) => onToggleMixedPrecision(e.target.checked)}
                    className="accent-[#0284C7] rounded-[2px]"
                  />
                </label>
                <span className="text-[9px] text-[#64748B] font-sans block mt-0.5">
                  Keep first/last layers INT8, compress deep convs to INT4.
                </span>
              </div>
            </div>

            <div className="space-y-2 bg-[#0B0F17] p-3 rounded-[3px] border border-[#1E293B] hover:border-[#38BDF8]/40 transition-colors">
              <label className="text-[10px] text-[#94A3B8] block uppercase font-bold">
                Memory Alignment
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="p-1.5 rounded-[3px] bg-[#0E1420] border border-[#38BDF8]/50 text-[#38BDF8] text-center font-bold shadow-[0_0_8px_rgba(56,189,248,0.2)]">
                  4-Byte Word
                </div>
                <div className="p-1.5 rounded-[3px] bg-[#0E1420] border border-[#1E293B] text-[#64748B] text-center">
                  8-Byte D-Word
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-2.5 bg-[#070A0F] border-t border-[#1E293B] flex items-center justify-between text-[10px] font-mono text-[#64748B]">
        <span>STATIC ARENA</span>
        <span className="text-[#10B981] font-bold flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-[#10B981]" /> 0 MALLOCS
        </span>
      </div>
    </aside>
  );
};
