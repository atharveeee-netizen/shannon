import React, { useState } from 'react';
import {
  Waves,
  Sliders,
  Volume2,
  Battery,
  RefreshCw,
} from 'lucide-react';
import { CompilationResult, HardwareProfile, PresetModel } from '../../types';

interface DspBlockViewProps {
  result: CompilationResult | null;
  selectedModel: PresetModel | null;
  selectedHw: HardwareProfile;
}

export const DspBlockView: React.FC<DspBlockViewProps> = ({
  result,
  selectedHw,
}) => {
  const [frameLengthMs, setFrameLengthMs] = useState<number>(30);
  const [frameStrideMs, setFrameStrideMs] = useState<number>(20);
  const [numFilterBanks, setNumFilterBanks] = useState<number>(10);
  const [fftLength, setFftLength] = useState<number>(128);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Generate synthetic audio spectrogram bars
  const [spectrogramData, setSpectrogramData] = useState<number[][]>(() => {
    return Array.from({ length: 49 }, () =>
      Array.from({ length: 10 }, () => Math.random() * 0.9 + 0.1)
    );
  });

  const handleRecalculateDsp = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setSpectrogramData(
        Array.from({ length: 49 }, () =>
          Array.from({ length: numFilterBanks }, () => Math.random() * 0.9 + 0.1)
        )
      );
      setIsGenerating(false);
    }, 300);
  };

  const latencyMs = result?.optimized_int8.estimated_latency_ms || 1.84;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-purple-400">
            <Waves className="w-4 h-4" />
            <span>SPECTRAL DSP PREPROCESSING</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Sensory Feature Extraction & Filterbank
          </h1>
          <p className="text-xs text-slate-400">
            Transforms raw time-series sensor waveforms into normalized INT8 frequency feature matrices using fixed-point integer math.
          </p>
        </div>

        <button
          onClick={handleRecalculateDsp}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 text-xs font-semibold shadow-md shadow-purple-500/20 transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>Recalculate DSP Features</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Column: DSP Parameters */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white">Parameters</h2>
          </div>

          {/* Slider 1: Frame Length */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Frame Length:</span>
              <span className="text-white font-bold">{frameLengthMs} ms</span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              value={frameLengthMs}
              onChange={(e) => setFrameLengthMs(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
          </div>

          {/* Slider 2: Frame Stride */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Frame Stride:</span>
              <span className="text-white font-bold">{frameStrideMs} ms</span>
            </div>
            <input
              type="range"
              min="10"
              max="30"
              value={frameStrideMs}
              onChange={(e) => setFrameStrideMs(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
          </div>

          {/* Slider 3: Filter Banks */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">MFCC Filter Banks:</span>
              <span className="text-white font-bold">{numFilterBanks}</span>
            </div>
            <input
              type="range"
              min="6"
              max="20"
              value={numFilterBanks}
              onChange={(e) => setNumFilterBanks(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
          </div>

          {/* Select: FFT Length */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">FFT Length:</span>
              <span className="text-white font-bold">{fftLength} Bins</span>
            </div>
            <select
              value={fftLength}
              onChange={(e) => setFftLength(Number(e.target.value))}
              className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
            >
              <option value={64}>64 Bins (Ultra-low latency)</option>
              <option value={128}>128 Bins (Standard Speech/Vibration)</option>
              <option value={256}>256 Bins (High frequency resolution)</option>
            </select>
          </div>

          {/* Computed Feature Shape Card */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 font-mono text-xs">
            <div className="text-slate-500 font-bold">COMPUTED DSP MATRIX</div>
            <div className="flex justify-between">
              <span className="text-slate-400">Output Tensor:</span>
              <span className="text-purple-300 font-bold">[1, 49, {numFilterBanks}]</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Features:</span>
              <span className="text-white font-bold">{49 * numFilterBanks} bytes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Arithmetic:</span>
              <span className="text-emerald-400">Jacob INT8 Fixed-Point</span>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Spectrogram Waterfall & Sensory Energy */}
        <div className="lg:col-span-2 space-y-6">
          {/* Spectrogram Waterfall Simulation Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-purple-400" />
                <h2 className="text-sm font-bold text-white">Live Spectrogram Waterfall Heatmap</h2>
              </div>
              <span className="text-xs font-mono text-slate-500">49 Time Frames × {numFilterBanks} Mel Channels</span>
            </div>

            {/* Spectrogram Grid Canvas Simulation */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
              <div className="grid grid-flow-col auto-cols-max gap-1 h-44 items-end">
                {spectrogramData.map((frame, fIdx) => (
                  <div key={fIdx} className="flex flex-col gap-0.5 w-3">
                    {frame.map((val, vIdx) => {
                      const hue = Math.round(280 - val * 120); // purple to cyan
                      const opacity = Math.min(1, Math.max(0.2, val));
                      return (
                        <div
                          key={vIdx}
                          className="h-3 w-3 rounded-[2px] transition-all duration-300"
                          style={{
                            backgroundColor: `hsla(${hue}, 80%, 55%, ${opacity})`,
                          }}
                          title={`Time Frame #${fIdx}, Mel Channel #${vIdx}: ${val.toFixed(3)}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>0.00s (Audio Ingestion Start)</span>
              <span>Time →</span>
              <span>1.00s (Classification Trigger)</span>
            </div>
          </div>

          {/* Physical Sensory Energy & Battery Profiling */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Battery className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white">Sensor Energy & Battery Profiling</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-slate-500 block">Target Microcontroller</span>
                <span className="text-base font-bold text-white">
                  {selectedHw.name}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-slate-500 block">DSP Energy / Inference</span>
                <span className="text-base font-bold text-emerald-400">
                  {(3.3 * latencyMs * 0.05).toFixed(2)} mJ
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-slate-500 block">Battery Lifetime (500mAh)</span>
                <span className="text-base font-bold text-cyan-400">
                  {Math.round(500 / 2.5)} Days
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
