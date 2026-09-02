import React, { useState } from 'react';
import {
  Waves,
  Play,
  Volume2,
  Activity,
} from 'lucide-react';
import { CompilationResult, HardwareProfile, PresetModel } from '../../types';

interface DspBlockViewProps {
  result: CompilationResult | null;
  selectedModel: PresetModel | null;
  selectedHw: HardwareProfile;
}

export const DspBlockView: React.FC<DspBlockViewProps> = ({
  selectedHw,
}) => {
  const [frameLengthMs, setFrameLengthMs] = useState<number>(30);
  const [frameStrideMs, setFrameStrideMs] = useState<number>(20);
  const [numFilters, setNumFilters] = useState<number>(10);
  const [fftLength, setFftLength] = useState<number>(256);
  const [noiseFloor, setNoiseFloor] = useState<number>(-52);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleGenerateFeatures = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 800);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto bg-[#0E131F]">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#202B3C] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#F59E0B]">
            <Waves className="w-4 h-4" />
            <span>SPECTRAL PROCESSING BLOCK</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Spectral Features (Audio MFCC / FFT)
          </h1>
          <p className="text-xs text-[#94A3B8]">
            Extracts time and frequency features from 16kHz audio signals. Mel-scale filterbanks simulate human auditory perception.
          </p>
        </div>

        <button
          onClick={handleGenerateFeatures}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#F59E0B] hover:bg-[#D97706] text-[#0E131F] font-bold text-xs shadow-md shadow-[#F59E0B]/20 transition-all active:scale-95 disabled:opacity-50 self-start"
        >
          <Play className={`w-3.5 h-3.5 fill-[#0E131F] ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Computing Features...' : 'Save Parameters'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Parameter Configuration Form */}
        <div className="space-y-6">
          <div className="p-6 rounded-lg bg-[#151D2A] border border-[#202B3C] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#202B3C]">
              <span className="text-xs font-bold text-white">MFCC & FFT PARAMETERS</span>
              <span className="text-[10px] font-mono text-[#94A3B8]">CMSIS-DSP Ready</span>
            </div>

            {/* Slider 1: Frame Length */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <label className="text-[#94A3B8]">Frame Length (ms)</label>
                <span className="font-mono text-white font-bold">{frameLengthMs} ms</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={frameLengthMs}
                onChange={(e) => setFrameLengthMs(Number(e.target.value))}
                className="w-full accent-[#F59E0B] bg-[#101620] h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Slider 2: Frame Stride */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <label className="text-[#94A3B8]">Frame Stride (ms)</label>
                <span className="font-mono text-white font-bold">{frameStrideMs} ms</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={frameStrideMs}
                onChange={(e) => setFrameStrideMs(Number(e.target.value))}
                className="w-full accent-[#F59E0B] bg-[#101620] h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Slider 3: Number of Filters */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <label className="text-[#94A3B8]">Mel Filterbanks</label>
                <span className="font-mono text-white font-bold">{numFilters} bands</span>
              </div>
              <input
                type="range"
                min="6"
                max="32"
                step="2"
                value={numFilters}
                onChange={(e) => setNumFilters(Number(e.target.value))}
                className="w-full accent-[#F59E0B] bg-[#101620] h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Dropdown: FFT Length */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <label className="text-[#94A3B8]">FFT Length</label>
                <span className="font-mono text-white font-bold">{fftLength}</span>
              </div>
              <select
                value={fftLength}
                onChange={(e) => setFftLength(Number(e.target.value))}
                className="w-full bg-[#101620] text-white border border-[#202B3C] rounded-md p-2 text-xs font-mono"
              >
                <option value={128}>128 points</option>
                <option value={256}>256 points (Standard)</option>
                <option value={512}>512 points</option>
              </select>
            </div>

            {/* Slider 4: Noise Floor */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <label className="text-[#94A3B8]">Noise Floor (dB)</label>
                <span className="font-mono text-white font-bold">{noiseFloor} dB</span>
              </div>
              <input
                type="range"
                min="-80"
                max="-20"
                step="2"
                value={noiseFloor}
                onChange={(e) => setNoiseFloor(Number(e.target.value))}
                className="w-full accent-[#F59E0B] bg-[#101620] h-1.5 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Compute Budget on MCU */}
          <div className="p-5 rounded-lg bg-[#151D2A] border border-[#202B3C] space-y-3 font-mono text-xs">
            <span className="text-xs font-bold text-white font-sans block">
              DSP Compute Footprint on {selectedHw.name}
            </span>
            <div className="flex justify-between text-[#94A3B8]">
              <span>DSP Execution Time:</span>
              <span className="text-[#F59E0B] font-bold">0.42 ms</span>
            </div>
            <div className="flex justify-between text-[#94A3B8]">
              <span>FFT Scratch RAM:</span>
              <span className="text-cyan-400 font-bold">512 Bytes</span>
            </div>
            <div className="flex justify-between text-[#94A3B8]">
              <span>Feature Vector:</span>
              <span className="text-white font-bold">490 (49x10)</span>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Spectrogram Heatmap & Waveform Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Spectrogram Waterfall Card */}
          <div className="p-6 rounded-lg bg-[#151D2A] border border-[#202B3C] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#F59E0B]" />
                <h2 className="text-sm font-bold text-white">
                  Mel-Frequency Spectrogram Heatmap (49 Frames x 10 Bins)
                </h2>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                <Volume2 className="w-3.5 h-3.5 text-[#20E28B]" />
                <span>Sample: "yes" (16kHz Audio)</span>
              </div>
            </div>

            {/* Simulated Live Spectrogram Matrix */}
            <div className="bg-[#101620] rounded-lg p-4 border border-[#202B3C] space-y-2">
              <div className="h-44 flex items-end gap-1 overflow-hidden px-2">
                {Array.from({ length: 49 }).map((_, idx) => {
                  const energy = Math.sin(idx * 0.18) * 40 + Math.cos(idx * 0.4) * 30 + 45;
                  const clampedEnergy = Math.max(12, Math.min(95, energy));
                  const isSpeechPeak = idx > 15 && idx < 32;

                  return (
                    <div key={idx} className="flex-1 flex flex-col justify-end h-full gap-0.5">
                      <div
                        className={`w-full rounded-t-sm transition-all duration-300 ${
                          isSpeechPeak
                            ? 'bg-gradient-to-t from-[#D97706] to-[#20E28B]'
                            : 'bg-gradient-to-t from-[#1E293B] to-[#3B82F6]'
                        }`}
                        style={{ height: `${clampedEnergy}%` }}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between text-[10px] font-mono text-[#64748B] pt-2 border-t border-[#202B3C]">
                <span>0.0s (Frame 1)</span>
                <span className="text-[#F59E0B]">Speech Formant Frequency Range (300Hz - 3.4kHz)</span>
                <span>1.0s (Frame 49)</span>
              </div>
            </div>
          </div>

          {/* Feature Output Array Preview */}
          <div className="p-6 rounded-lg bg-[#151D2A] border border-[#202B3C] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white">Extracted Feature Buffer Preview (INT8 Array)</h3>
              <span className="text-xs font-mono text-[#64748B]">490 elements</span>
            </div>

            <div className="p-3 bg-[#101620] rounded-md font-mono text-xs text-[#94A3B8] border border-[#202B3C] overflow-x-auto">
              <code className="text-[#20E28B]">
                [-128, -126, -118, -104, -86, -62, -34, -4, 28, 60, 88, 110, 122, 126, 120, 102, 74, 38, -2, -44, -82, -112, -126, ...]
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
