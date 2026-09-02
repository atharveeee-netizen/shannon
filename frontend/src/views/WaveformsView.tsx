import React, { useState } from 'react';
import { PresetModel } from '../types';
import { Radio } from 'lucide-react';

interface WaveformsViewProps {
  model: PresetModel;
}

export const WaveformsView: React.FC<WaveformsViewProps> = ({ model }) => {
  const [signalType, setSignalType] = useState<'sine' | 'chirp' | 'pulse' | 'noise'>('chirp');
  const [channel, setChannel] = useState<'ch1' | 'ch2' | 'fft'>('ch1');

  const fftBins = [
    { freq: '120 Hz', power: 42, label: 'Base Motor Fundamental' },
    { freq: '342 Hz', power: 94, label: 'Bearing Defect BPFO' },
    { freq: '684 Hz', power: 68, label: '2x Harmonic' },
    { freq: '1026 Hz', power: 35, label: '3x Harmonic' },
    { freq: '2400 Hz', power: 18, label: 'High-Freq Resonance' },
  ];

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h2 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-4 h-4 text-primary" />
            Multi-Channel Sensory Waveform & Harmonic Analyzer
          </h2>
          <p className="text-text-secondary text-xs mt-0.5">
            Multi-channel analog signal generator, windowing functions, and frequency FFT decomposition testbench.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-text-secondary">
          <span>Active Domain: <strong className="text-primary">{model.domain}</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Waveform Generator & Controls */}
        <div className="lg:col-span-4 bg-surface border border-border rounded p-4 space-y-4 font-mono text-xs">
          <span className="font-bold text-text-primary uppercase tracking-wider block font-sans border-b border-border pb-2">
            Signal Configuration
          </span>

          <div className="space-y-1.5">
            <label className="text-[11px] text-text-secondary block font-medium">Test Waveform Profile</label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'chirp', label: 'Frequency Chirp' },
                { id: 'sine', label: 'Harmonic Sine' },
                { id: 'pulse', label: 'Impulse Pulse' },
                { id: 'noise', label: 'Gaussian Noise' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSignalType(p.id as any)}
                  className={`py-1.5 px-2 rounded text-xs transition border text-center font-semibold ${
                    signalType === p.id
                      ? 'bg-primary/10 border-primary text-primary font-bold'
                      : 'bg-surface-raised border-border text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-surface-raised border border-border rounded space-y-1.5 text-[11px]">
            <span className="font-bold text-text-primary block font-sans">Signal Metrics</span>
            <div className="text-text-secondary space-y-0.5">
              <div className="flex justify-between">
                <span>RMS Amplitude:</span>
                <strong className="text-text-primary">0.707 V</strong>
              </div>
              <div className="flex justify-between">
                <span>Crest Factor:</span>
                <strong className="text-text-primary">1.414</strong>
              </div>
              <div className="flex justify-between">
                <span>THD (Total Distortion):</span>
                <strong className="text-success">&lt;0.05%</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Time-Domain & Frequency Visualizer */}
        <div className="lg:col-span-8 bg-surface border border-border rounded p-4 space-y-4 font-mono">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setChannel('ch1')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                  channel === 'ch1' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Channel 1 (Time-Domain)
              </button>
              <button
                onClick={() => setChannel('fft')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                  channel === 'fft' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                FFT Power Spectrum
              </button>
            </div>
            <span className="text-[10px] text-text-muted">Window: 128 Points</span>
          </div>

          {channel === 'ch1' ? (
            <div className="h-48 bg-canvas rounded border border-border p-3 flex items-center justify-between gap-1 relative overflow-hidden">
              {Array.from({ length: 64 }).map((_, i) => {
                const height = Math.sin(i * 0.25) * 40 + 50;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-center h-full">
                    <div className="w-1 bg-emerald-400 rounded-full" style={{ height: `${height}%` }} />
                  </div>
                );
              })}
              <span className="absolute top-2 left-2 text-[9px] text-text-muted">Voltage Scale: ±1.0 V</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="h-48 bg-canvas rounded border border-border p-3 flex items-end justify-between gap-2 relative overflow-hidden">
                {fftBins.map((bin, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
                    <div
                      className="w-full bg-primary/80 group-hover:bg-primary rounded-t transition-all"
                      style={{ height: `${bin.power}%` }}
                    />
                    <span className="text-[8px] text-text-muted mt-1 truncate max-w-[50px]">{bin.freq}</span>
                  </div>
                ))}
                <span className="absolute top-2 left-2 text-[9px] text-text-muted">Power Spectral Density (dB/Hz)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
