import React from 'react';
import {
  GitMerge,
  Waves,
  BrainCircuit,
  Radio,
  ArrowRight,
  Sliders,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { CompilationResult, HardwareProfile, PresetModel } from '../../types';
import { TabType } from '../Sidebar';

interface ImpulseDesignViewProps {
  result: CompilationResult | null;
  selectedModel: PresetModel | null;
  selectedHw: HardwareProfile;
  onNavigateToTab: (tab: TabType) => void;
}

export const ImpulseDesignView: React.FC<ImpulseDesignViewProps> = ({
  result,
  selectedModel,
  selectedHw,
  onNavigateToTab,
}) => {
  const isAudio = selectedModel?.id === 'kws';
  const isVision = selectedModel?.id === 'vision';

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto bg-[#0E131F]">
      {/* 1. Impulse Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#202B3C] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#20E28B]">
            <GitMerge className="w-4 h-4" />
            <span>VISUAL DATAFLOW PIPELINE</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Create Impulse
          </h1>
          <p className="text-xs text-[#94A3B8]">
            An impulse takes raw sensor data, uses signal processing to extract features, and then uses a learning block to classify new data.
          </p>
        </div>

        <button
          onClick={() => onNavigateToTab('dsp')}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#20E28B] hover:bg-[#1BC97B] text-[#0E131F] font-bold text-xs shadow-md shadow-[#20E28B]/20 transition-all active:scale-95 self-start"
        >
          <span>Save Impulse & Proceed</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>

      {/* 2. Visual Impulse Flow Diagram (Edge Impulse 4-Block Pipeline) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8]">
          <span>IMPULSE PIPELINE GRAPH: SENSOR DMA ➔ DSP SPECTRAL ➔ NN INFERENCE ➔ OUTPUT</span>
          <span className="text-[#20E28B]">● All blocks compiled to static memory</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* Node 1: Time Series Data Input (Blue Accent) */}
          <div className="p-5 rounded-lg bg-[#151D2A] border border-[#202B3C] border-t-4 border-t-[#3B82F6] space-y-3 relative group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#3B82F6] uppercase tracking-wider">
                1. SENSOR INPUT
              </span>
              <Radio className="w-4 h-4 text-[#3B82F6]" />
            </div>
            <div className="text-sm font-bold text-white">
              {isAudio ? 'Time series audio' : isVision ? 'Camera Frame' : 'Vibration DMA'}
            </div>
            <p className="text-xs text-[#94A3B8]">
              {isAudio
                ? '16000Hz, 1000ms window (16000 samples) via I2S microphone DMA.'
                : isVision
                ? '48x48 Grayscale image capture from camera sensor.'
                : '128-axis 3-axis accelerometer acceleration stream.'}
            </p>
            <div className="pt-3 border-t border-[#202B3C] flex items-center justify-between text-[11px] font-mono text-[#64748B]">
              <span>Shape: {selectedModel?.input_shape || '1x49x10'}</span>
              <span className="text-blue-400">DMA Ringbuf</span>
            </div>
          </div>

          {/* Node 2: Processing Block (DSP MFCC / FFT) (Amber Accent) */}
          <div className="p-5 rounded-lg bg-[#151D2A] border border-[#202B3C] border-t-4 border-t-[#F59E0B] space-y-3 relative group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#F59E0B] uppercase tracking-wider">
                2. PROCESSING BLOCK
              </span>
              <Waves className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div className="text-sm font-bold text-white">
              {isAudio ? 'Audio (MFCC)' : isVision ? 'Image Normalizer' : 'Spectral Analysis'}
            </div>
            <p className="text-xs text-[#94A3B8]">
              {isAudio
                ? 'Extracts time-frequency mel-filterbank power coefficients.'
                : isVision
                ? 'Zero-malloc 8-bit image resize & uint8 normalization.'
                : '128-point Fast Fourier Transform (FFT) power spectral bins.'}
            </p>
            <div className="pt-3 border-t border-[#202B3C] flex items-center justify-between text-[11px] font-mono text-[#64748B]">
              <span>490 Features</span>
              <button
                onClick={() => onNavigateToTab('dsp')}
                className="text-[#F59E0B] hover:underline flex items-center gap-1"
              >
                <span>Edit DSP</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Node 3: Learning Block (NN Classifier) (Green Accent) */}
          <div className="p-5 rounded-lg bg-[#151D2A] border border-[#202B3C] border-t-4 border-t-[#20E28B] space-y-3 relative group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#20E28B] uppercase tracking-wider">
                3. LEARNING BLOCK
              </span>
              <BrainCircuit className="w-4 h-4 text-[#20E28B]" />
            </div>
            <div className="text-sm font-bold text-white">
              Classification (Keras/PyTorch)
            </div>
            <p className="text-xs text-[#94A3B8]">
              {selectedModel?.architecture || '1D Depthwise-Separable CNN'}. Quantized with Pareto-optimal INT8 symmetric weights.
            </p>
            <div className="pt-3 border-t border-[#202B3C] flex items-center justify-between text-[11px] font-mono text-[#64748B]">
              <span>96.6% Accuracy</span>
              <button
                onClick={() => onNavigateToTab('classifier')}
                className="text-[#20E28B] hover:underline flex items-center gap-1"
              >
                <span>Edit NN</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Node 4: Output Features (Purple Accent) */}
          <div className="p-5 rounded-lg bg-[#151D2A] border border-[#202B3C] border-t-4 border-t-[#8B5CF6] space-y-3 relative group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#8B5CF6] uppercase tracking-wider">
                4. OUTPUT FEATURES
              </span>
              <CheckCircle2 className="w-4 h-4 text-[#8B5CF6]" />
            </div>
            <div className="text-sm font-bold text-white">
              {isAudio ? '12 Target Classes' : isVision ? 'Person / No-Person' : 'Normal / Fault'}
            </div>
            <p className="text-xs text-[#94A3B8]">
              {isAudio
                ? 'Emits confidence vector across "yes", "no", "up", "down", "stop", "go", etc.'
                : isVision
                ? 'High-precision boolean presence detection probability.'
                : 'Continuous anomaly score with adaptive Euclidean boundary.'}
            </p>
            <div className="pt-3 border-t border-[#202B3C] flex items-center justify-between text-[11px] font-mono text-[#64748B]">
              <span>Latency: {result?.optimized_int8.estimated_latency_ms.toFixed(2) || '1.84'}ms</span>
              <span className="text-purple-400">Class Probabilities</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Impulse Hardware Profiling Summary */}
      <div className="p-6 rounded-lg bg-[#151D2A] border border-[#202B3C] space-y-5">
        <div className="flex items-center justify-between border-b border-[#202B3C] pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#20E28B]" />
            <h2 className="text-sm font-bold text-white">
              Target Hardware Compute Budget ({selectedHw.name})
            </h2>
          </div>
          <span className="text-xs font-mono text-[#94A3B8]">
            Arch: {selectedHw.arch}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 rounded-md bg-[#101620] border border-[#202B3C] space-y-1">
            <span className="text-[#64748B] text-[11px]">INFERENCE TIME</span>
            <div className="text-lg font-bold text-white">
              {result?.optimized_int8.estimated_latency_ms.toFixed(2) || '1.84'} ms
            </div>
            <div className="text-[10px] text-[#20E28B]">
              ⚡ Optimized with {selectedHw.simd}
            </div>
          </div>

          <div className="p-4 rounded-md bg-[#101620] border border-[#202B3C] space-y-1">
            <span className="text-[#64748B] text-[11px]">PEAK RAM USAGE</span>
            <div className="text-lg font-bold text-cyan-400">
              {result ? (result.optimized_int8.peak_sram_bytes / 1024).toFixed(2) : '1.12'} KB
            </div>
            <div className="text-[10px] text-[#94A3B8]">
              0 dynamic mallocs (Static Arena)
            </div>
          </div>

          <div className="p-4 rounded-md bg-[#101620] border border-[#202B3C] space-y-1">
            <span className="text-[#64748B] text-[11px]">FLASH ROM FOOTPRINT</span>
            <div className="text-lg font-bold text-[#20E28B]">
              {result ? (result.optimized_int8.flash_bytes / 1024).toFixed(1) : '24.0'} KB
            </div>
            <div className="text-[10px] text-[#94A3B8]">
              75.0% reduction from FP32
            </div>
          </div>
        </div>
      </div>

      {/* 4. Action Banner */}
      <div className="p-5 rounded-lg bg-gradient-to-r from-[#151D2A] to-[#182438] border border-[#202B3C] flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <Sparkles className="w-4 h-4 text-[#20E28B]" />
            <span>Ready to fine-tune digital signal preprocessing?</span>
          </div>
          <p className="text-xs text-[#94A3B8]">
            Configure MFCC window size, frame stride, filter frequency bins, and FFT resolution.
          </p>
        </div>

        <button
          onClick={() => onNavigateToTab('dsp')}
          className="px-4 py-2 rounded-md bg-[#1B2431] hover:bg-[#232E3E] text-white border border-[#2A3649] text-xs font-semibold transition-all"
        >
          Open Spectral DSP Block
        </button>
      </div>
    </div>
  );
};
