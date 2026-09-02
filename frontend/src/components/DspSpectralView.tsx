import React, { useState } from 'react';
import { PresetModel, HardwareProfile } from '../types';
import { Radio, Zap, Settings, RefreshCw } from 'lucide-react';

interface DspSpectralViewProps {
  model: PresetModel;
  targetHw: HardwareProfile;
}

export const DspSpectralView: React.FC<DspSpectralViewProps> = ({
  model,
  targetHw,
}) => {
  const [frameLength, setFrameLength] = useState(0.02);
  const [frameStride, setFrameStride] = useState(0.01);
  const [numFilters, setNumFilters] = useState(10);
  const [fftLength, setFftLength] = useState(256);

  const isKws = model.id === 'kws';
  const isVision = model.id === 'vision';

  return (
    <div className="bg-surface border border-border rounded-lg p-5 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-500" />
            DSP Preprocessing & Spectral Feature Extraction
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            {isKws
              ? 'Converts raw 16kHz audio stream into Mel-Frequency Cepstral Coefficients (MFCC 49x10).'
              : isVision
              ? 'Downsamples camera frames to 48x48 8-bit grayscale with contrast normalization.'
              : 'Computes real-time 128-point FFT power spectrum for bearing vibration harmonics.'}
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded font-semibold flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            DSP Latency: 0.12 ms @ {targetHw.clock_mhz}MHz
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: DSP Parameters */}
        <div className="lg:col-span-4 bg-surface-raised p-4 rounded-lg border border-border space-y-4 text-xs font-mono">
          <div className="flex items-center justify-between font-sans border-b border-border/60 pb-2">
            <span className="font-bold text-text-primary flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-text-secondary" />
              DSP Filter Parameters
            </span>
            <button
              onClick={() => {
                setFrameLength(0.02);
                setFrameStride(0.01);
                setNumFilters(10);
                setFftLength(256);
              }}
              className="text-[10px] text-accent hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              Reset
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-text-secondary text-[11px] block">Frame Length (s)</label>
            <input
              type="number"
              step="0.005"
              value={frameLength}
              onChange={(e) => setFrameLength(parseFloat(e.target.value) || 0.02)}
              className="w-full bg-surface border border-border rounded px-2.5 py-1.5 text-text-primary focus:outline-none focus:border-accent"
            />
          </div>

          <div className="space-y-1">
            <label className="text-text-secondary text-[11px] block">Frame Stride (s)</label>
            <input
              type="number"
              step="0.005"
              value={frameStride}
              onChange={(e) => setFrameStride(parseFloat(e.target.value) || 0.01)}
              className="w-full bg-surface border border-border rounded px-2.5 py-1.5 text-text-primary focus:outline-none focus:border-accent"
            />
          </div>

          <div className="space-y-1">
            <label className="text-text-secondary text-[11px] block">Number of Mel Filters</label>
            <input
              type="number"
              value={numFilters}
              onChange={(e) => setNumFilters(parseInt(e.target.value) || 10)}
              className="w-full bg-surface border border-border rounded px-2.5 py-1.5 text-text-primary focus:outline-none focus:border-accent"
            />
          </div>

          <div className="space-y-1">
            <label className="text-text-secondary text-[11px] block">FFT Size (Points)</label>
            <select
              value={fftLength}
              onChange={(e) => setFftLength(parseInt(e.target.value) || 256)}
              className="w-full bg-surface border border-border rounded px-2.5 py-1.5 text-text-primary focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value={128}>128 Points</option>
              <option value={256}>256 Points (Standard)</option>
              <option value={512}>512 Points</option>
            </select>
          </div>
        </div>

        {/* Right: Frequency & Spectrogram Response Visualizer */}
        <div className="lg:col-span-8 bg-surface-raised p-4 rounded-lg border border-border space-y-4">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="font-bold text-text-primary">
              {isKws ? 'Mel-Frequency Filterbank Energy' : isVision ? 'Contrast Equalization Curve' : 'FFT Power Spectrum (0-10 kHz)'}
            </span>
            <span className="text-[11px] text-text-muted">49 Frames · 10 Filterbanks</span>
          </div>

          {/* Graphical Filterbank Spectrogram */}
          <div className="h-44 bg-canvas rounded border border-border p-3 flex items-end justify-between gap-1 overflow-hidden relative">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:16px_16px]" />
            
            {[24, 45, 68, 89, 72, 55, 38, 62, 85, 94, 76, 58, 42, 65, 88, 70, 52, 35, 60, 82, 90, 75, 50, 30].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t transition-all relative z-10 opacity-90 hover:opacity-100"
                style={{ height: `${h}%` }}
                title={`Filterbank Bin ${i + 1}: ${h} dB`}
              />
            ))}
          </div>

          <div className="flex justify-between font-mono text-[10px] text-text-muted">
            <span>Low: 300 Hz</span>
            <span>Center: 2,400 Hz</span>
            <span>Nyquist: 8,000 Hz</span>
          </div>
        </div>
      </div>
    </div>
  );
};
