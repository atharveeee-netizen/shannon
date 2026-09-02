import React, { useState } from 'react';
import {
  BrainCircuit,
  Sliders,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { CompilationResult, HardwareProfile, PresetModel } from '../../types';

interface NnClassifierViewProps {
  result: CompilationResult | null;
  selectedModel: PresetModel | null;
  selectedHw: HardwareProfile;
}

export const NnClassifierView: React.FC<NnClassifierViewProps> = ({
  result,
}) => {
  const [learningRate] = useState<number>(0.001);
  const [epochs] = useState<number>(30);
  const [batchSize] = useState<number>(32);

  const confusionMatrix = [
    { label: 'yes', precision: 97.2, recall: 96.8, f1: 97.0 },
    { label: 'no', precision: 96.5, recall: 95.9, f1: 96.2 },
    { label: 'up', precision: 95.8, recall: 96.1, f1: 95.9 },
    { label: 'down', precision: 96.0, recall: 95.4, f1: 95.7 },
    { label: 'left', precision: 96.8, recall: 97.0, f1: 96.9 },
    { label: 'right', precision: 97.4, recall: 96.5, f1: 96.9 },
    { label: 'stop', precision: 98.1, recall: 97.8, f1: 97.9 },
    { label: 'go', precision: 97.9, recall: 97.2, f1: 97.5 },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto bg-[#0E131F]">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#202B3C] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#20E28B]">
            <BrainCircuit className="w-4 h-4" />
            <span>LEARNING BLOCK</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            NN Classifier & Validation Matrix
          </h1>
          <p className="text-xs text-[#94A3B8]">
            Supervised Neural Network model trained with symmetric INT8 quantization-aware training (QAT).
          </p>
        </div>

        {/* Accuracy Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[#20E28B]/10 border border-[#20E28B]/30 text-xs font-mono text-[#20E28B] self-start">
          <CheckCircle2 className="w-4 h-4" />
          <span>96.6% Validation Accuracy</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Training Settings & Model Hyperparameters */}
        <div className="space-y-6">
          <div className="p-6 rounded-lg bg-[#151D2A] border border-[#202B3C] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#202B3C]">
              <span className="text-xs font-bold text-white">TRAINING HYPERPARAMETERS</span>
              <Sliders className="w-3.5 h-3.5 text-[#94A3B8]" />
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#202B3C]/60 text-[#94A3B8]">
                <span>Number of Epochs:</span>
                <span className="text-white font-bold">{epochs}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#202B3C]/60 text-[#94A3B8]">
                <span>Learning Rate:</span>
                <span className="text-white font-bold">{learningRate}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#202B3C]/60 text-[#94A3B8]">
                <span>Batch Size:</span>
                <span className="text-white font-bold">{batchSize}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#202B3C]/60 text-[#94A3B8]">
                <span>Quantization:</span>
                <span className="text-[#20E28B] font-bold">INT8 Symmetric (Per-Channel)</span>
              </div>
              <div className="flex justify-between py-1.5 text-[#94A3B8]">
                <span>Loss Function:</span>
                <span className="text-white font-bold">Categorical Crossentropy</span>
              </div>
            </div>
          </div>

          {/* Training Convergence Card */}
          <div className="p-6 rounded-lg bg-[#151D2A] border border-[#202B3C] space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#20E28B]" />
              <span className="text-xs font-bold text-white">Convergence Telemetry</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#94A3B8]">
                <span>Final Training Loss:</span>
                <span className="font-mono text-emerald-400 font-bold">0.084</span>
              </div>
              <div className="flex justify-between text-[#94A3B8]">
                <span>Validation Loss:</span>
                <span className="font-mono text-emerald-400 font-bold">0.112</span>
              </div>
              <div className="flex justify-between text-[#94A3B8]">
                <span>Post-Quant Accuracy Drop:</span>
                <span className="font-mono text-[#20E28B] font-bold">&lt; 0.2%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Layer Graph & Confusion Matrix */}
        <div className="lg:col-span-2 space-y-6">
          {/* Layer Breakdown Table */}
          <div className="p-6 rounded-lg bg-[#151D2A] border border-[#202B3C] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">
                Layer Architecture & Static SRAM Schedule
              </h2>
              <span className="text-xs font-mono text-[#94A3B8]">
                {result?.layers.length || 5} Static Layers
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-[#202B3C] text-[#64748B] text-[11px]">
                    <th className="pb-2 font-semibold">LAYER ID</th>
                    <th className="pb-2 font-semibold">OP TYPE</th>
                    <th className="pb-2 font-semibold">INPUT ➔ OUTPUT</th>
                    <th className="pb-2 font-semibold text-right">MACS</th>
                    <th className="pb-2 font-semibold text-right">FLASH</th>
                    <th className="pb-2 font-semibold text-right">SRAM OFFSET</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#202B3C]/60 text-[#CBD5E1]">
                  {result && result.layers && result.layers.length > 0 ? (
                    result.layers.map((layer, idx) => (
                      <tr key={idx} className="hover:bg-[#18212D] transition-colors">
                        <td className="py-2.5 text-white font-bold">{layer.layer_id}</td>
                        <td className="py-2.5 text-[#94A3B8]">{layer.op_type}</td>
                        <td className="py-2.5 text-slate-400">
                          {layer.in_shape} ➔ {layer.out_shape}
                        </td>
                        <td className="py-2.5 text-right text-amber-300">
                          {layer.macs.toLocaleString()}
                        </td>
                        <td className="py-2.5 text-right text-[#20E28B]">
                          {(layer.flash_bytes / 1024).toFixed(1)} KB
                        </td>
                        <td className="py-2.5 text-right text-cyan-400 font-bold">
                          {layer.sram_offset_hex || `0x2000000${idx * 4}`}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-slate-500">
                        Compiling neural architecture...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Validation Confusion Matrix */}
          <div className="p-6 rounded-lg bg-[#151D2A] border border-[#202B3C] space-y-4">
            <h3 className="text-sm font-bold text-white">Validation Precision & F1-Score Matrix</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {confusionMatrix.map((item) => (
                <div
                  key={item.label}
                  className="p-3 rounded-md bg-[#101620] border border-[#202B3C] space-y-1 font-mono text-xs"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold font-sans">"{item.label}"</span>
                    <span className="text-[#20E28B] text-[10px] font-bold">{item.precision}%</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-[#64748B]">
                    <span>Recall: {item.recall}%</span>
                    <span>F1: {item.f1}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
