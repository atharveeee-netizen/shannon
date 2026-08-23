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
    <aside className="w-72 bg-[#0D1117] border-r border-[#21262D] flex flex-col shrink-0 select-none h-full overflow-hidden">
      {/* Sidebar Sub-navigation Tabs */}
      <div className="flex items-center border-b border-[#21262D] bg-[#0A0D12] text-xs font-mono">
        <button
          onClick={() => setActiveTab('models')}
          className={`flex-1 py-2 px-2 flex items-center justify-center gap-1.5 transition border-b-2 ${
            activeTab === 'models'
              ? 'text-[#F0F6FC] border-[#0284C7] bg-[#13171F] font-bold'
              : 'text-[#8B949E] border-transparent hover:text-[#F0F6FC]'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Models</span>
        </button>

        <button
          onClick={() => setActiveTab('chips')}
          className={`flex-1 py-2 px-2 flex items-center justify-center gap-1.5 transition border-b-2 ${
            activeTab === 'chips'
              ? 'text-[#F0F6FC] border-[#0284C7] bg-[#13171F] font-bold'
              : 'text-[#8B949E] border-transparent hover:text-[#F0F6FC]'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Silicon</span>
        </button>

        <button
          onClick={() => setActiveTab('flags')}
          className={`flex-1 py-2 px-2 flex items-center justify-center gap-1.5 transition border-b-2 ${
            activeTab === 'flags'
              ? 'text-[#F0F6FC] border-[#0284C7] bg-[#13171F] font-bold'
              : 'text-[#8B949E] border-transparent hover:text-[#F0F6FC]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Flags</span>
        </button>
      </div>

      {/* Tab Content Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 font-mono text-xs">
        {/* TAB 1: MODEL ZOO & INGESTION */}
        {activeTab === 'models' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[10px] text-[#484F58] uppercase font-bold tracking-wider">
              <span>PRESET BENCHMARK ZOO</span>
              <span>{models.length} ITEMS</span>
            </div>

            <div className="space-y-1.5">
              {models.map((m) => {
                const isSelected = selectedModelId === m.id && !customFile;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      setCustomFile(null);
                      onSelectModel(m.id);
                    }}
                    className={`p-2.5 rounded border cursor-pointer transition flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-[#13171F] border-[#38BDF8] shadow-sm'
                        : 'bg-[#0A0D12]/60 border-[#21262D] hover:border-[#30363D] hover:bg-[#13171F]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#F0F6FC]">{m.name}</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-[#10B981]/15 text-[#00FFA3] font-bold">
                        {m.accuracy_score}
                      </span>
                    </div>

                    <p className="text-[10px] text-[#8B949E] font-sans line-clamp-1">{m.architecture}</p>

                    <div className="flex items-center justify-between text-[10px] text-[#484F58] pt-1 border-t border-[#21262D]/60 mt-0.5">
                      <span>Shape: <strong className="text-[#8B949E]">{m.input_shape}</strong></span>
                      <span className="text-[#38BDF8] font-bold font-tabular">{m.int8_flash_kb} KB ({m.flash_compression_ratio})</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom ONNX / JSON Upload */}
            <div className="pt-2 border-t border-[#21262D]">
              <label
                className={`p-3 rounded border border-dashed cursor-pointer transition flex flex-col gap-1.5 ${
                  customFile
                    ? 'bg-[#13171F] border-[#00FFA3]'
                    : 'bg-[#0A0D12]/60 border-[#21262D] hover:border-[#38BDF8]'
                }`}
              >
                <input type="file" accept=".onnx,.json,.tflite,.pt" onChange={handleFileUpload} className="hidden" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-[#8B949E]">CUSTOM GRAPH INGEST</span>
                  <UploadCloud className="w-3.5 h-3.5 text-[#38BDF8]" />
                </div>
                <span className="text-[11px] font-bold text-[#F0F6FC] truncate">
                  {customFile || 'Upload ONNX / JSON Graph'}
                </span>
                <span className="text-[9px] text-[#484F58] font-sans">
                  {customFile ? 'Custom model parsed & ready' : 'Ingest custom neural network definitions'}
                </span>
              </label>
            </div>
          </div>
        )}

        {/* TAB 2: SILICON MCU PROFILES */}
        {activeTab === 'chips' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[10px] text-[#484F58] uppercase font-bold tracking-wider">
              <span>TARGET SILICON PLATFORMS</span>
              <span>{hardwareList.length} MCUS</span>
            </div>

            <div className="space-y-1.5">
              {hardwareList.map((hw) => {
                const isSelected = selectedHwId === hw.id;
                return (
                  <div
                    key={hw.id}
                    onClick={() => onSelectHardware(hw.id)}
                    className={`p-2.5 rounded border cursor-pointer transition flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-[#13171F] border-[#38BDF8] shadow-sm'
                        : 'bg-[#0A0D12]/60 border-[#21262D] hover:border-[#30363D] hover:bg-[#13171F]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#F0F6FC]">{hw.name}</span>
                      <span className="text-[9px] text-[#38BDF8] font-tabular font-bold">
                        {hw.clock_mhz} MHz
                      </span>
                    </div>

                    <p className="text-[10px] text-[#8B949E] font-sans line-clamp-1">{hw.arch}</p>

                    <div className="flex items-center justify-between text-[10px] text-[#484F58] pt-1 border-t border-[#21262D]/60 mt-0.5">
                      <span>SRAM: <strong className="text-[#00FFA3] font-tabular">{hw.sram_kb} KB</strong></span>
                      <span>Flash: <strong className="text-[#38BDF8] font-tabular">{hw.flash_mb} MB</strong></span>
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
            <div className="text-[10px] text-[#484F58] uppercase font-bold tracking-wider">
              QUANTIZATION & CODEGEN FLAGS
            </div>

            <div className="space-y-2 bg-[#0A0D12] p-2.5 rounded border border-[#21262D]">
              <label className="text-[10px] text-[#8B949E] block uppercase font-bold">
                Quantization Precision
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => onChangeQuantBits(8)}
                  className={`py-1 px-2 rounded border text-xs font-bold transition ${
                    quantBits === 8
                      ? 'bg-[#0284C7] text-white border-[#38BDF8]'
                      : 'bg-[#13171F] text-[#8B949E] border-[#21262D]'
                  }`}
                >
                  INT8 Symmetric
                </button>
                <button
                  onClick={() => onChangeQuantBits(4)}
                  className={`py-1 px-2 rounded border text-xs font-bold transition ${
                    quantBits === 4
                      ? 'bg-[#0284C7] text-white border-[#38BDF8]'
                      : 'bg-[#13171F] text-[#8B949E] border-[#21262D]'
                  }`}
                >
                  INT4 Packed
                </button>
              </div>

              <div className="pt-2 border-t border-[#21262D]">
                <label className="flex items-center justify-between cursor-pointer select-none">
                  <span className="text-[11px] text-[#F0F6FC]">Mixed Precision (HAWQ)</span>
                  <input
                    type="checkbox"
                    checked={mixedPrecision}
                    onChange={(e) => onToggleMixedPrecision(e.target.checked)}
                    className="accent-[#0284C7] rounded"
                  />
                </label>
                <span className="text-[9px] text-[#484F58] font-sans block mt-0.5">
                  Keep first/last layers INT8, compress deep convs to INT4.
                </span>
              </div>
            </div>

            <div className="space-y-2 bg-[#0A0D12] p-2.5 rounded border border-[#21262D]">
              <label className="text-[10px] text-[#8B949E] block uppercase font-bold">
                Memory Alignment
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="p-1.5 rounded bg-[#13171F] border border-[#38BDF8]/40 text-[#38BDF8] text-center font-bold">
                  4-Byte Word
                </div>
                <div className="p-1.5 rounded bg-[#13171F] border border-[#21262D] text-[#484F58] text-center">
                  8-Byte D-Word
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Footer Info */}
      <div className="p-2.5 bg-[#0A0D12] border-t border-[#21262D] flex items-center justify-between text-[10px] font-mono text-[#8B949E]">
        <span>STATIC ARENA</span>
        <span className="text-[#00FFA3] font-bold flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> 0 MALLOCS
        </span>
      </div>
    </aside>
  );
};
