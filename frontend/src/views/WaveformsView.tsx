import React, { useState } from 'react';
import { PresetModel } from '../types';
import { Radio } from 'lucide-react';

interface WaveformsViewProps {
  model: PresetModel;
}

export const WaveformsView: React.FC<WaveformsViewProps> = ({ model }) => {
  const isKws = model.id === 'kws';
  const isVision = model.id === 'vision';
  const isAnomaly = model.id === 'anomaly';

  const [activeTab, setActiveTab] = useState<'raw' | 'preprocessed' | 'features' | 'activation'>('raw');

  // Ground truth MFCC Mel Filterbank energy bins for KWS
  const kwsMelBins = [
    { name: '0-250 Hz', energy: 38 },
    { name: '250-500 Hz', energy: 86 },
    { name: '500-1000 Hz', energy: 94 },
    { name: '1-2 kHz', energy: 72 },
    { name: '2-4 kHz', energy: 45 },
    { name: '4-8 kHz', energy: 22 },
  ];

  // Ground truth FFT power spectrum for Anomaly
  const anomalyFftBins = [
    { freq: '120 Hz', power: 42, label: 'Base Motor Fundamental' },
    { freq: '342 Hz', power: 94, label: 'Bearing Defect BPFO' },
    { freq: '684 Hz', power: 68, label: '2x Harmonic' },
    { freq: '1026 Hz', power: 35, label: '3x Harmonic' },
    { freq: '2400 Hz', power: 18, label: 'Resonance Band' },
  ];

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h2 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-4 h-4 text-primary" />
            Sensor Signal Preprocessing & Feature Transformation Pipeline
          </h2>
          <p className="text-text-secondary text-xs mt-0.5">
            Step-by-step tensor visualization from raw physical sensor capture to mathematical feature representations.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="text-text-muted">Provenance:</span>
          <span className="text-primary font-bold bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
            [SIMULATED]
          </span>
        </div>
      </div>

      {/* Stage Selector Tabs */}
      <div className="flex items-center gap-2 bg-surface-raised p-1 rounded border border-border font-mono text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('raw')}
          className={`px-3 py-1.5 rounded font-bold transition flex items-center gap-1.5 ${
            activeTab === 'raw' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <span>1. Raw Sensor Input</span>
        </button>
        <button
          onClick={() => setActiveTab('preprocessed')}
          className={`px-3 py-1.5 rounded font-bold transition flex items-center gap-1.5 ${
            activeTab === 'preprocessed' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <span>2. Preprocessed Window</span>
        </button>
        <button
          onClick={() => setActiveTab('features')}
          className={`px-3 py-1.5 rounded font-bold transition flex items-center gap-1.5 ${
            activeTab === 'features' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <span>3. Feature Matrix ({isKws ? 'MFCC' : isVision ? 'Normalized 48x48' : 'FFT Energy'})</span>
        </button>
        <button
          onClick={() => setActiveTab('activation')}
          className={`px-3 py-1.5 rounded font-bold transition flex items-center gap-1.5 ${
            activeTab === 'activation' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <span>4. Model Input Tensor</span>
        </button>
      </div>

      {/* Main Feature Transformation Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 bg-surface border border-border rounded p-4 space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="font-bold text-xs text-text-primary uppercase tracking-wider font-sans">
              {activeTab === 'raw' && 'Raw Sensor Stream Capture'}
              {activeTab === 'preprocessed' && 'Hanning Window Preprocessing & Normalization'}
              {activeTab === 'features' && 'Extracted Feature Energy Distribution'}
              {activeTab === 'activation' && 'Static Model Entry Tensor Geometry'}
            </span>
            <span className="text-[10px] text-text-muted">{model.input_shape}</span>
          </div>

          {/* Audio (KWS) Visualization */}
          {isKws && (
            <div className="space-y-3">
              {activeTab === 'raw' && (
                <div className="h-44 bg-canvas rounded border border-border p-3 flex items-center justify-between gap-1 relative overflow-hidden">
                  {Array.from({ length: 64 }).map((_, i) => {
                    const h = Math.sin(i * 0.28) * 40 + Math.cos(i * 0.6) * 25 + 50;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center justify-center h-full">
                        <div className="w-1 bg-primary rounded-full" style={{ height: `${Math.max(8, h)}%` }} />
                      </div>
                    );
                  })}
                  <span className="absolute top-2 left-2 text-[9px] text-text-muted">16,000 Hz Raw Audio PCM Stream</span>
                </div>
              )}

              {activeTab === 'preprocessed' && (
                <div className="h-44 bg-canvas rounded border border-border p-3 flex items-center justify-between gap-1 relative overflow-hidden">
                  {Array.from({ length: 64 }).map((_, i) => {
                    const windowHanning = Math.sin((Math.PI * i) / 64);
                    const h = (Math.sin(i * 0.28) * 40 + 50) * windowHanning;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center justify-center h-full">
                        <div className="w-1 bg-cyan-400 rounded-full" style={{ height: `${Math.max(4, h)}%` }} />
                      </div>
                    );
                  })}
                  <span className="absolute top-2 left-2 text-[9px] text-text-muted">Hanning Tapered Slice (32ms Frame, 512 Samples)</span>
                </div>
              )}

              {activeTab === 'features' && (
                <div className="h-44 bg-canvas rounded border border-border p-3 flex items-end justify-between gap-3 relative overflow-hidden">
                  {kwsMelBins.map((bin, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                      <div className="w-full bg-emerald-500 rounded-t" style={{ height: `${bin.energy}%` }} />
                      <span className="text-[9px] text-text-muted mt-1 truncate">{bin.name}</span>
                    </div>
                  ))}
                  <span className="absolute top-2 left-2 text-[9px] text-text-muted">10-Bin Mel Filterbank Energy</span>
                </div>
              )}

              {activeTab === 'activation' && (
                <div className="h-44 bg-canvas rounded border border-border p-3 flex flex-col justify-center items-center font-mono space-y-2">
                  <div className="text-center">
                    <span className="text-[10px] text-text-muted uppercase block">Staged Quantized Tensor</span>
                    <strong className="text-base text-primary block">[1, 49, 10, 1] (Signed INT8)</strong>
                    <span className="text-xs text-text-secondary">490 Elements &times; 1 Byte = 490 Bytes Static SRAM</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded">
                    Mapped to Memory Arena Offset: 0x20000000
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Vision Visualization */}
          {isVision && (
            <div className="space-y-3">
              <div className="aspect-square max-w-[200px] mx-auto bg-canvas rounded border border-border p-2 flex items-center justify-center relative">
                <div className="grid grid-cols-6 gap-1 w-full h-full p-2 bg-black/40 rounded">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-[1px] bg-primary/40 flex items-center justify-center text-[7px] text-white/80"
                    >
                      {Math.round(30 + (i % 6) * 16)}
                    </div>
                  ))}
                </div>
                <span className="absolute bottom-1 right-2 text-[9px] text-text-muted">48&times;48 8-bit Grayscale</span>
              </div>
            </div>
          )}

          {/* Vibration Anomaly Visualization */}
          {isAnomaly && (
            <div className="h-44 bg-canvas rounded border border-border p-3 flex items-end justify-between gap-2 relative overflow-hidden">
              {anomalyFftBins.map((bin, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div className="w-full bg-primary rounded-t" style={{ height: `${bin.power}%` }} />
                  <span className="text-[8px] text-text-muted mt-1 truncate max-w-[50px]">{bin.freq}</span>
                </div>
              ))}
              <span className="absolute top-2 left-2 text-[9px] text-text-muted">128-Point FFT Magnitude Spectrum</span>
            </div>
          )}
        </div>

        {/* Feature Metadata Panel */}
        <div className="lg:col-span-4 bg-surface border border-border rounded p-4 space-y-3 font-mono text-xs">
          <span className="font-bold text-text-primary uppercase tracking-wider block font-sans border-b border-border pb-2">
            Signal Pipeline Telemetry
          </span>

          <div className="space-y-2 text-[11px]">
            <div className="p-2.5 bg-surface-raised border border-border rounded space-y-1">
              <span className="text-[10px] text-text-muted block uppercase">Domain Protocol</span>
              <strong className="text-text-primary block">{model.domain}</strong>
              <span className="text-[10px] text-text-secondary">{model.input_type}</span>
            </div>

            <div className="p-2.5 bg-surface-raised border border-border rounded space-y-1.5">
              <div className="flex justify-between">
                <span className="text-text-secondary">Input Tensor Shape:</span>
                <strong className="text-primary">{model.input_shape}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">DSP Execution Cycles:</span>
                <strong className="text-text-primary">1,420 Cycles <span className="text-[9px] text-text-muted">[ESTIMATED]</span></strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">DMA Ring Buffer:</span>
                <strong className="text-success">0-Copy SRAM Ptr</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
