import React, { useState } from 'react';
import { ModelZooItem, HardwareProfile } from '../types';
import { Database, UploadCloud, ArrowRight, FileCode, CheckCircle2, Cpu } from 'lucide-react';

interface ModelZooPanelProps {
  models: ModelZooItem[];
  selectedModelId: string;
  onSelectModel: (id: string) => void;
  targetHw: HardwareProfile;
  onCompileSelected: () => void;
}

export const ModelZooPanel: React.FC<ModelZooPanelProps> = ({
  models,
  selectedModelId,
  onSelectModel,
  targetHw,
  onCompileSelected,
}) => {
  const [customFile, setCustomFile] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCustomFile(file.name);
      onSelectModel('vision');
    }
  };

  const selectedModel = models.find((m) => m.id === selectedModelId) || models[0];

  return (
    <div className="space-y-4">
      {/* Title & Silicon Target Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#21262D] pb-3 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-[#0284C7]/15 border border-[#0284C7]/30 text-[#38BDF8]">
              <Database className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-[#F0F6FC] font-mono tracking-tight uppercase">
              TINYML BENCHMARK MODEL ZOO
            </h2>
          </div>
          <p className="text-xs text-[#8B949E] mt-0.5 font-sans">
            Calibrated neural networks verified for bare metal microcontroller execution with zero dynamic malloc.
          </p>
        </div>

        <div className="text-xs font-mono text-[#8B949E] flex items-center gap-2 bg-[#13171F] px-3 py-1.5 rounded-[3px] border border-[#21262D]">
          <Cpu className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>TARGET: <strong className="text-[#F0F6FC]">{targetHw.name}</strong> ({targetHw.sram_kb}KB SRAM / {targetHw.flash_mb}MB Flash)</span>
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {models.map((model) => {
          const isSelected = selectedModelId === model.id && !customFile;
          return (
            <div
              key={model.id}
              onClick={() => {
                setCustomFile(null);
                onSelectModel(model.id);
              }}
              className={`p-3.5 bg-[#13171F] border rounded-[4px] cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-[#38BDF8] ring-1 ring-[#38BDF8] shadow-glow-cyan'
                  : 'border-[#21262D] hover:border-[#30363D] hover:bg-[#161B22]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 bg-[#0A0D12] text-[#38BDF8] border border-[#21262D] rounded-[3px]">
                    {model.domain}
                  </span>
                  <span className="text-[10px] font-mono text-[#00FFA3] font-bold">
                    Acc: {model.accuracy_score}
                  </span>
                </div>

                <h3 className="font-bold text-xs text-[#F0F6FC] font-mono mb-1">
                  {model.name}
                </h3>
                <p className="text-[11px] text-[#8B949E] leading-snug mb-3 font-sans">
                  {model.architecture} trained on {model.dataset}.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[#21262D] text-[10px] font-mono">
                <div className="flex items-center justify-between text-[#8B949E]">
                  <span>Input Shape:</span>
                  <span className="text-[#F0F6FC]">{model.input_shape}</span>
                </div>
                <div className="flex items-center justify-between text-[#8B949E]">
                  <span>Flash INT8:</span>
                  <span className="text-[#38BDF8] font-bold font-tabular">{model.int8_flash_kb} KB ({model.flash_compression_ratio})</span>
                </div>
                <div className="flex items-center justify-between text-[#8B949E]">
                  <span>Peak SRAM:</span>
                  <span className="text-[#00FFA3] font-bold font-tabular">{model.peak_sram_kb} KB</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Custom Upload Card */}
        <label
          className={`p-3.5 bg-[#13171F] border border-dashed rounded-[4px] cursor-pointer transition-all flex flex-col justify-between ${
            customFile
              ? 'border-[#00FFA3] ring-1 ring-[#00FFA3]'
              : 'border-[#21262D] hover:border-[#38BDF8]'
          }`}
        >
          <input type="file" accept=".onnx,.tflite,.pt" onChange={handleFileUpload} className="hidden" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 bg-[#0A0D12] text-[#8B949E] border border-[#21262D] rounded-[3px]">
                CUSTOM ONNX / JSON
              </span>
              <UploadCloud className="w-4 h-4 text-[#38BDF8]" />
            </div>

            <h3 className="font-bold text-xs text-[#F0F6FC] font-mono mb-1 truncate">
              {customFile || 'Upload Graph'}
            </h3>
            <p className="text-[11px] text-[#8B949E] leading-snug font-sans">
              {customFile ? 'Custom ONNX graph ingested.' : 'Upload ONNX/JSON neural network definitions for instant quantization.'}
            </p>
          </div>

          <div className="pt-2 border-t border-[#21262D] text-[10px] font-mono text-[#38BDF8] flex items-center justify-between">
            <span>{customFile ? 'INGESTED OK' : 'BROWSE FILES'}</span>
            <FileCode className="w-3.5 h-3.5" />
          </div>
        </label>
      </div>

      {/* Model Benchmark Matrix Table */}
      <div className="bg-[#13171F] border border-[#21262D] rounded-[4px] p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3 border-b border-[#21262D] pb-2.5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#00FFA3]" />
            <h3 className="text-xs font-bold text-[#F0F6FC] font-mono uppercase">
              COMPRESSION & PERFORMANCE METRICS ({selectedModel.name})
            </h3>
          </div>

          <button
            onClick={onCompileSelected}
            className="px-3 py-1 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-mono font-bold rounded-[3px] flex items-center gap-1.5 transition shadow-glow-cyan"
          >
            <span>Compile in Workbench</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-[#0A0D12] p-3 border border-[#21262D] rounded-[3px]">
            <span className="text-[10px] text-[#8B949E] block mb-1">BASELINE FP32 FLASH</span>
            <span className="text-base font-bold text-[#8B949E] font-tabular">{selectedModel.fp32_flash_kb} KB</span>
            <span className="text-[10px] text-[#484F58] block mt-1">Full 32-bit floats</span>
          </div>

          <div className="bg-[#0A0D12] p-3 border border-[#21262D] rounded-[3px]">
            <span className="text-[10px] text-[#8B949E] block mb-1">INT8 QUANTIZED FLASH</span>
            <span className="text-base font-bold text-[#38BDF8] font-tabular">{selectedModel.int8_flash_kb} KB</span>
            <span className="text-[10px] text-[#00FFA3] block mt-1 font-bold">{selectedModel.flash_compression_ratio} smaller</span>
          </div>

          <div className="bg-[#0A0D12] p-3 border border-[#21262D] rounded-[3px]">
            <span className="text-[10px] text-[#8B949E] block mb-1">PEAK SRAM ARENA</span>
            <span className="text-base font-bold text-[#00FFA3] font-tabular">{selectedModel.peak_sram_kb} KB</span>
            <span className="text-[10px] text-[#8B949E] block mt-1">0 Dynamic Malloc</span>
          </div>

          <div className="bg-[#0A0D12] p-3 border border-[#21262D] rounded-[3px]">
            <span className="text-[10px] text-[#8B949E] block mb-1">TOTAL MAC OPS</span>
            <span className="text-base font-bold text-[#F0F6FC] font-tabular">{selectedModel.mac_count.toLocaleString()}</span>
            <span className="text-[10px] text-[#38BDF8] block mt-1">{targetHw.simd}</span>
          </div>
        </div>
      </div>
    </div>
  );
};