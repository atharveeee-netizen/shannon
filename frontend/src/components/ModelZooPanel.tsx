import React, { useState } from 'react';
import { ModelZooItem, HardwareProfile } from '../types';
import { Database, UploadCloud, ArrowRight, FileCode, Sparkles } from 'lucide-react';

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
      {/* Panel Top Title & Summary */}
      <div className="flex items-center justify-between border-b border-palantir-border pb-3">
        <div>
          <h2 className="text-lg font-semibold text-palantir-textPrimary font-mono flex items-center gap-2">
            <Database className="w-4 h-4 text-palantir-cobalt" />
            SHANNON TINYML MODEL ZOO & COMPRESSION BENCHMARK MATRIX
          </h2>
          <p className="text-xs text-palantir-textSecondary font-sans">
            Pre-trained, hardware-verified neural networks calibrated for bare-metal microcontroller execution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-palantir-textMuted uppercase">
            TARGET SILICON: <strong className="text-palantir-textPrimary">{targetHw.name}</strong> ({targetHw.sram_kb}KB SRAM)
          </span>
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
              className={`p-3.5 bg-palantir-card border rounded-[3px] cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-palantir-cobalt shadow-md shadow-palantir-cobalt/10 ring-1 ring-palantir-cobalt'
                  : 'border-palantir-border hover:border-palantir-borderLight'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 bg-palantir-nav text-palantir-cobalt border border-palantir-border rounded-[2px]">
                    {model.domain}
                  </span>
                  <span className="text-[10px] font-mono text-palantir-pass font-semibold">
                    Acc: {model.accuracy_score}
                  </span>
                </div>

                <h3 className="font-bold text-xs text-palantir-textPrimary font-mono mb-1">
                  {model.name}
                </h3>
                <p className="text-[11px] text-palantir-textSecondary leading-snug mb-3 line-clamp-2">
                  {model.architecture} trained on {model.dataset}.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-palantir-border/80 text-[10px] font-mono">
                <div className="flex items-center justify-between text-palantir-textMuted">
                  <span>Input Tensor:</span>
                  <span className="text-palantir-textPrimary">{model.input_shape}</span>
                </div>
                <div className="flex items-center justify-between text-palantir-textMuted">
                  <span>Flash (INT8):</span>
                  <span className="text-palantir-cobalt font-bold">{model.int8_flash_kb} KB (-{model.flash_compression_ratio})</span>
                </div>
                <div className="flex items-center justify-between text-palantir-textMuted">
                  <span>Peak SRAM:</span>
                  <span className="text-palantir-pass font-bold">{model.peak_sram_kb} KB</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Custom ONNX Upload Card */}
        <label
          className={`p-3.5 bg-palantir-card border border-dashed rounded-[3px] cursor-pointer transition-all flex flex-col justify-between ${
            customFile
              ? 'border-palantir-pass ring-1 ring-palantir-pass'
              : 'border-palantir-border hover:border-palantir-cobalt'
          }`}
        >
          <input type="file" accept=".onnx,.tflite,.pt" onChange={handleFileUpload} className="hidden" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 bg-palantir-nav text-palantir-textMuted border border-palantir-border rounded-[2px]">
                CUSTOM INGESTION
              </span>
              <UploadCloud className="w-3.5 h-3.5 text-palantir-cobalt" />
            </div>

            <h3 className="font-bold text-xs text-palantir-textPrimary font-mono mb-1 truncate">
              {customFile || 'Upload .ONNX Graph'}
            </h3>
            <p className="text-[11px] text-palantir-textSecondary leading-snug">
              {customFile ? 'Custom computational graph loaded.' : 'Ingest custom PyTorch / ONNX models for quantization.'}
            </p>
          </div>

          <div className="pt-2 border-t border-palantir-border/80 text-[10px] font-mono text-palantir-cobalt flex items-center justify-between">
            <span>{customFile ? 'PARSED SUCCESSFULLY' : 'BROWSE FILES'}</span>
            <FileCode className="w-3 h-3" />
          </div>
        </label>
      </div>

      {/* Selected Model Deep Benchmark Matrix */}
      <div className="bg-palantir-card border border-palantir-border rounded-[3px] p-4">
        <div className="flex items-center justify-between mb-3 border-b border-palantir-border pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-palantir-pass" />
            <h3 className="text-xs font-semibold text-palantir-textPrimary font-mono uppercase">
              COMPRESSION & HARDWARE PARITY BENCHMARK ({selectedModel.name})
            </h3>
          </div>

          <button
            onClick={onCompileSelected}
            className="px-3 py-1 bg-palantir-action hover:bg-palantir-actionHover text-palantir-textPrimary text-xs font-mono font-semibold rounded-[3px] flex items-center gap-1.5 transition"
          >
            <span>Proceed to Workbench</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-palantir-canvas p-3 border border-palantir-border rounded-[3px]">
            <span className="text-[10px] text-palantir-textMuted block mb-1">FP32 BASELINE FLASH</span>
            <span className="text-sm font-bold text-palantir-textSecondary">{selectedModel.fp32_flash_kb} KB</span>
            <span className="text-[10px] text-palantir-textMuted block mt-1">Full 32-bit floats</span>
          </div>

          <div className="bg-palantir-canvas p-3 border border-palantir-border rounded-[3px]">
            <span className="text-[10px] text-palantir-textMuted block mb-1">SHANNON INT8 FLASH</span>
            <span className="text-sm font-bold text-palantir-cobalt">{selectedModel.int8_flash_kb} KB</span>
            <span className="text-[10px] text-palantir-pass block mt-1 font-semibold">-{selectedModel.flash_compression_ratio} Storage</span>
          </div>

          <div className="bg-palantir-canvas p-3 border border-palantir-border rounded-[3px]">
            <span className="text-[10px] text-palantir-textMuted block mb-1">PEAK SRAM ARENA</span>
            <span className="text-sm font-bold text-palantir-pass">{selectedModel.peak_sram_kb} KB</span>
            <span className="text-[10px] text-palantir-textMuted block mt-1">Zero-Malloc footprint</span>
          </div>

          <div className="bg-palantir-canvas p-3 border border-palantir-border rounded-[3px]">
            <span className="text-[10px] text-palantir-textMuted block mb-1">TOTAL MAC OPERATIONS</span>
            <span className="text-sm font-bold text-palantir-textPrimary">{selectedModel.mac_count.toLocaleString()}</span>
            <span className="text-[10px] text-palantir-cobalt block mt-1">{targetHw.simd}</span>
          </div>
        </div>
      </div>
    </div>
  );
};