import React from 'react';
import {
  GitMerge,
  Settings,
  Cpu,
  CheckCircle2,
} from 'lucide-react';
import { CompilationResult, HardwareProfile, PresetModel } from '../../types';

interface ImpulseDesignViewProps {
  result: CompilationResult | null;
  selectedModel: PresetModel | null;
  selectedHw: HardwareProfile;
  onNavigateToTab: (tab: any) => void;
}

export const ImpulseDesignView: React.FC<ImpulseDesignViewProps> = ({
  result,
  selectedModel,
  selectedHw,
  onNavigateToTab,
}) => {
  const isAudio = selectedModel?.id === 'kws';
  const isVision = selectedModel?.id === 'vision';

  const inputTitle = isAudio
    ? 'Time-Series Audio Data'
    : isVision
    ? 'Grayscale Image Frame'
    : 'Vibration Accelerometer Data';

  const inputSpecs = isAudio
    ? { sampleRate: '16000 Hz', windowSize: '1000 ms', axes: '1 (Mono I2S Mic)', length: '16000 samples' }
    : isVision
    ? { dimensions: '48 x 48 px', channels: '1 (Grayscale)', sensor: 'OV2640 Camera', depth: '8-bit pixels' }
    : { sampleRate: '1000 Hz', windowSize: '128 ms', axes: '3 (X, Y, Z Accel)', fftBins: '128 FFT Bins' };

  const dspTitle = isAudio
    ? 'Audio MFCC Spectrogram'
    : isVision
    ? 'Spatial Normalization & Patch'
    : 'Spectral FFT Power Density';

  const nnTitle = isAudio
    ? '1D-CNN Acoustic Classifier'
    : isVision
    ? 'MobileNet-Tiny Depthwise 2D'
    : '5-Layer Reconstruction Autoencoder';

  const outputLabels = isAudio
    ? ['yes', 'no', 'up', 'down', 'left', 'right', 'on', 'off', 'stop', 'go', 'silence', 'unknown']
    : isVision
    ? ['person', 'background']
    : ['Normal Operation', 'Bearing Defect Anomaly'];

  const flashBytes = result?.optimized_int8.flash_bytes || 24576;
  const sramBytes = result?.optimized_int8.peak_sram_bytes || 1144;
  const latencyMs = result?.optimized_int8.estimated_latency_ms || 1.84;
  const totalMacs = result?.optimized_int8.total_macs || 46368;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
          <GitMerge className="w-4 h-4" />
          <span>IMPULSE DESIGN PIPELINE</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Silicon Computation Graph
        </h1>
        <p className="text-xs text-slate-400">
          Visual dataflow from raw physical sensor acquisition → DSP spectral preprocessing → neural network inference → output prediction.
        </p>
      </div>

      {/* Impulse Interactive Block Flow Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
        {/* Block 1: Time Series / Image Input */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-md flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                INPUT BLOCK
              </span>
              <Settings className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-pointer" />
            </div>
            <h3 className="text-sm font-bold text-white">{inputTitle}</h3>
            <p className="text-[11px] text-slate-400">Physical sensor ingestion buffer mapped to DMA memory.</p>
          </div>

          <div className="space-y-1.5 p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] font-mono text-slate-400">
            {Object.entries(inputSpecs).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-slate-500">{k}:</span>
                <span className="text-slate-200">{v}</span>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Buffer: Direct DMA Stream</span>
          </div>
        </div>

        {/* Block 2: DSP Preprocessing */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-md flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                PROCESSING BLOCK
              </span>
              <button
                onClick={() => onNavigateToTab('dsp')}
                className="text-xs text-purple-400 hover:underline flex items-center gap-0.5"
              >
                Inspect
              </button>
            </div>
            <h3 className="text-sm font-bold text-white">{dspTitle}</h3>
            <p className="text-[11px] text-slate-400">Fixed-point integer spectral transformation & filterbank.</p>
          </div>

          <div className="space-y-1.5 p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] font-mono text-slate-400">
            <div className="flex justify-between">
              <span className="text-slate-500">Output Features:</span>
              <span className="text-white font-bold">{isAudio ? '490 values' : isVision ? '2,304 values' : '128 values'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Quantization:</span>
              <span className="text-emerald-400">INT8 Scale Factor</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Arithmetic:</span>
              <span className="text-purple-300">Jacob Bitshift</span>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('dsp')}
            className="w-full py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-mono font-medium border border-purple-500/30 transition-all text-center"
          >
            Configure DSP & FFT
          </button>
        </div>

        {/* Block 3: Neural Network Classifier */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-4 shadow-lg shadow-emerald-500/5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                LEARNING BLOCK
              </span>
              <button
                onClick={() => onNavigateToTab('classifier')}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-0.5"
              >
                Layers
              </button>
            </div>
            <h3 className="text-sm font-bold text-white">{nnTitle}</h3>
            <p className="text-[11px] text-slate-400">Symmetric INT8 quantized neural topology.</p>
          </div>

          <div className="space-y-1.5 p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] font-mono text-slate-400">
            <div className="flex justify-between">
              <span className="text-slate-500">Total Layers:</span>
              <span className="text-white font-bold">{result?.layers?.length || 5} Layers</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Flash ROM:</span>
              <span className="text-white font-bold">{(flashBytes / 1024).toFixed(1)} KB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">SRAM Arena:</span>
              <span className="text-emerald-400 font-bold">{(sramBytes / 1024).toFixed(2)} KB</span>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('classifier')}
            className="w-full py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-mono font-medium border border-emerald-500/30 transition-all text-center"
          >
            Inspect NN Weights & Confusion
          </button>
        </div>

        {/* Block 4: Output Features */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-md flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                OUTPUT FEATURES
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {outputLabels.length} Classes
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">Classification Target</h3>
            <p className="text-[11px] text-slate-400">Real-time inference probabilities & thresholding.</p>
          </div>

          <div className="flex flex-wrap gap-1 p-3 rounded-lg bg-slate-950/60 border border-slate-800 max-h-24 overflow-y-auto custom-scrollbar">
            {outputLabels.map((lbl) => (
              <span
                key={lbl}
                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
              >
                {lbl}
              </span>
            ))}
          </div>

          <button
            onClick={() => onNavigateToTab('live')}
            className="w-full py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-mono font-medium border border-amber-500/30 transition-all text-center"
          >
            Test Live Classification
          </button>
        </div>
      </div>

      {/* Hardware Latency & SIMD Vectorization Stats */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Target Silicon Execution Profile</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {selectedHw.name} @ {selectedHw.clock_mhz} MHz
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-slate-500 block">Total Multiply-Accumulates</span>
            <span className="text-lg font-bold text-white">
              {totalMacs.toLocaleString()} MACs
            </span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-slate-500 block">Inference Clock Cycles</span>
            <span className="text-lg font-bold text-emerald-400">
              {Math.round(latencyMs * selectedHw.clock_mhz * 1000).toLocaleString()} cycles
            </span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-slate-500 block">Memory Arena Allocations</span>
            <span className="text-lg font-bold text-cyan-400">0 Bytes (MISRA-C Certified)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
