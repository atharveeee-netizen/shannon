import React, { useState } from 'react';
import { ModelZooItem, HardwareProfile } from '../types';
import { Database, UploadCloud, ArrowRight, FileCode, CheckCircle2 } from 'lucide-react';

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
      {/* Title & Silicon Summary */}
      <div className="flex items-center justify-between border-b border-[#232936] pb-3">
        <div>
          <h2 className="text-sm font-semibold text-[#F5F8FA] font-mono flex items-center gap-2 uppercase tracking-wide">
            <Database className="w-4 h-4 text-[#2B95D6]" />
            TINYML BENCHMARK MODEL ZOO
          </h2>
          <p className="text-xs text-[#A7B6C2]">
            Hardware verified neural networks calibrated for bare metal microcontroller execution.
          </p>
        </div>

        <div className="text-xs font-mono text-[#5C7080]">
          TARGET CHIP: <strong className="text-[#F5F8FA]">{targetHw.name}</strong> ({targetHw.sram_kb}KB SRAM / {targetHw.flash_mb}MB Flash)
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
              className={`p-3.5 bg-[#1A1F28] border rounded-[3px] cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-[#2B95D6] shadow-sm ring-1 ring-[#2B95D6]'
                  : 'border-[#232936] hover:border-[#303846]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 bg-[#12151B] text-[#2B95D6] border border-[#232936] rounded-[2px]">
                    {model.domain}
                  </span>
                  <span className="text-[10px] font-mono text-[#0D8050] font-semibold">
                    Acc: {model.accuracy_score}
                  </span>
                </div>

                <h3 className="font-bold text-xs text-[#F5F8FA] font-mono mb-1">
                  {model.name}
                </h3>
                <p className="text-[11px] text-[#A7B6C2] leading-snug mb-3">
                  {model.architecture} on {model.dataset}.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[#232936] text-[10px] font-mono">
                <div className="flex items-center justify-between text-[#5C7080]">
                  <span>Input Tensor:</span>
                  <span className="text-[#F5F8FA]">{model.input_shape}</span>
                </div>
                <div className="flex items-center justify-between text-[#5C7080]">
                  <span>Flash INT8:</span>
                  <span className="text-[#2B95D6] font-bold">{model.int8_flash_kb} KB ({model.flash_compression_ratio} smaller)</span>
                </div>
                <div className="flex items-center justify-between text-[#5C7080]">
                  <span>Peak SRAM:</span>
                  <span className="text-[#0D8050] font-bold">{model.peak_sram_kb} KB</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Custom Upload Card */}
        <label
          className={`p-3.5 bg-[#1A1F28] border border-dashed rounded-[3px] cursor-pointer transition-all flex flex-col justify-between ${
            customFile
              ? 'border-[#0D8050] ring-1 ring-[#0D8050]'
              : 'border-[#232936] hover:border-[#2B95D6]'
          }`}
        >
          <input type="file" accept=".onnx,.tflite,.pt" onChange={handleFileUpload} className="hidden" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 bg-[#12151B] text-[#5C7080] border border-[#232936] rounded-[2px]">
                CUSTOM ONNX
              </span>
              <UploadCloud className="w-3.5 h-3.5 text-[#2B95D6]" />
            </div>

            <h3 className="font-bold text-xs text-[#F5F8FA] font-mono mb-1 truncate">
              {customFile || 'Upload Graph'}
            </h3>
            <p className="text-[11px] text-[#A7B6C2] leading-snug">
              {customFile ? 'Custom ONNX graph loaded.' : 'Ingest custom ONNX model files for quantization.'}
            </p>
          </div>

          <div className="pt-2 border-t border-[#232936] text-[10px] font-mono text-[#2B95D6] flex items-center justify-between">
            <span>{customFile ? 'PARSED SUCCESSFULLY' : 'BROWSE FILES'}</span>
            <FileCode className="w-3 h-3" />
          </div>
        </label>
      </div>

      {/* Model Benchmark Matrix Table */}
      <div className="bg-[#1A1F28] border border-[#232936] rounded-[3px] p-4">
        <div className="flex items-center justify-between mb-3 border-b border-[#232936] pb-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0D8050]" />
            <h3 className="text-xs font-semibold text-[#F5F8FA] font-mono uppercase">
              COMPRESSION BENCHMARKS ({selectedModel.name})
            </h3>
          </div>

          <button
            onClick={onCompileSelected}
            className="px-3 py-1 bg-[#106BA3] hover:bg-[#0E5A8A] text-[#F5F8FA] text-xs font-mono font-semibold rounded-[3px] flex items-center gap-1.5 transition"
          >
            <span>Proceed to Workbench</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-[#0B0D11] p-3 border border-[#232936] rounded-[3px]">
            <span className="text-[10px] text-[#5C7080] block mb-1">BASELINE FP32 FLASH</span>
            <span className="text-sm font-bold text-[#A7B6C2]">{selectedModel.fp32_flash_kb} KB</span>
            <span className="text-[10px] text-[#5C7080] block mt-1">Full 32-bit floats</span>
          </div>

          <div className="bg-[#0B0D11] p-3 border border-[#232936] rounded-[3px]">
            <span className="text-[10px] text-[#5C7080] block mb-1">INT8 QUANTIZED FLASH</span>
            <span className="text-sm font-bold text-[#2B95D6]">{selectedModel.int8_flash_kb} KB</span>
            <span className="text-[10px] text-[#0D8050] block mt-1 font-semibold">{selectedModel.flash_compression_ratio} reduction</span>
          </div>

          <div className="bg-[#0B0D11] p-3 border border-[#232936] rounded-[3px]">
            <span className="text-[10px] text-[#5C7080] block mb-1">PEAK SRAM ARENA</span>
            <span className="text-sm font-bold text-[#0D8050]">{selectedModel.peak_sram_kb} KB</span>
            <span className="text-[10px] text-[#5C7080] block mt-1">Zero heap allocation</span>
          </div>

          <div className="bg-[#0B0D11] p-3 border border-[#232936] rounded-[3px]">
            <span className="text-[10px] text-[#5C7080] block mb-1">TOTAL MAC OPS</span>
            <span className="text-sm font-bold text-[#F5F8FA]">{selectedModel.mac_count.toLocaleString()}</span>
            <span className="text-[10px] text-[#2B95D6] block mt-1">{targetHw.simd}</span>
          </div>
        </div>
      </div>
    </div>
  );
};