import React, { useState, useEffect } from 'react';
import { PresetModel, HardwareProfile } from '../types';
import { Activity, Play, Pause } from 'lucide-react';

interface SignalFlowViewProps {
  model: PresetModel;
  targetHw: HardwareProfile;
}

export const SignalFlowView: React.FC<SignalFlowViewProps> = ({ model, targetHw }) => {
  const [isRunning, setIsRunning] = useState(true);
  const [samplingRate, setSamplingRate] = useState(16000);
  const [windowSizeMs, setWindowSizeMs] = useState(1000);
  const [noiseLevel, setNoiseLevel] = useState(5);

  const [activeFrame, setActiveFrame] = useState(0);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setActiveFrame((f) => (f + 1) % 100);
    }, 150);
    return () => clearInterval(interval);
  }, [isRunning]);

  const stages = [
    {
      name: 'Physical Sensor',
      type: model.id === 'kws' ? 'MEMS Microphone' : model.id === 'vision' ? 'OV2640 Camera' : '3-Axis Accelerometer',
      format: model.id === 'kws' ? '16-bit PDM/I2S @ 16kHz' : model.id === 'vision' ? '8-bit Mono @ 15fps' : 'Analog SPI @ 10kHz',
      rate: '16,000 Samples/s',
    },
    {
      name: 'Hardware DSP Pipeline',
      type: model.id === 'kws' ? 'Hanning + 128-pt FFT + Mel Filter' : model.id === 'vision' ? 'Bilinear Resize + Grayscale' : 'Bandpass 10Hz-5kHz + FFT',
      format: model.id === 'kws' ? '49 Frames x 10 MFCC Bins' : model.id === 'vision' ? '48 x 48 Pixel Tensor' : '128 Frequency Energy Bins',
      rate: '40 ms Frame Hop',
    },
    {
      name: 'Static DMA Staging',
      type: 'Zero-Copy Ring Buffer',
      format: 'Fixed 4-Byte Word Aligned',
      rate: '0x20000000 Base Offset',
    },
    {
      name: 'Quantized Inference',
      type: 'Shannon 0-Malloc Engine',
      format: 'INT8 Symmetric SIMD Kernels',
      rate: targetHw.simd,
    },
  ];

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h2 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Sensor-to-Silicon Signal Flow Simulator
          </h2>
          <p className="text-text-secondary text-xs mt-0.5">
            End-to-end signal chain simulation from raw analog/digital sensor ingestion to DSP feature extraction and static model entry.
          </p>
        </div>

        <button
          onClick={() => setIsRunning(!isRunning)}
          className="px-3 py-1.5 bg-surface-raised hover:bg-surface-hover border border-border rounded font-mono font-semibold text-xs flex items-center gap-1.5 transition"
        >
          {isRunning ? <Pause className="w-3 h-3 text-amber-500" /> : <Play className="w-3 h-3 text-primary fill-current" />}
          <span>{isRunning ? 'Pause Signal' : 'Stream Signal'}</span>
        </button>
      </div>

      {/* Stage Flow Nodes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        {stages.map((st, idx) => (
          <div
            key={st.name}
            className="p-3 bg-surface border border-border rounded flex flex-col justify-between space-y-2 relative overflow-hidden group hover:border-primary/50 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-text-muted">STAGE 0{idx + 1}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            </div>

            <div>
              <strong className="text-xs text-text-primary block font-sans">{st.name}</strong>
              <span className="text-[11px] text-primary font-semibold block mt-0.5">{st.type}</span>
              <span className="text-[10px] text-text-secondary block mt-1">{st.format}</span>
            </div>

            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px] text-text-muted">
              <span>Throughput:</span>
              <span className="text-text-primary font-semibold">{st.rate}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Real-time Oscilloscope & Spectrum Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Main Oscilloscope */}
        <div className="lg:col-span-8 bg-surface border border-border rounded p-4 space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="font-bold text-xs text-text-primary uppercase tracking-wider font-sans">
              Real-time Ingestion Oscilloscope
            </span>
            <span className="text-[10px] text-primary">Frame #{activeFrame.toString().padStart(3, '0')}</span>
          </div>

          <div className="h-40 bg-canvas rounded border border-border p-3 flex items-center justify-between gap-1 relative overflow-hidden">
            {Array.from({ length: 48 }).map((_, i) => {
              const val = Math.sin((activeFrame + i) * 0.3) * 35 + Math.cos((activeFrame + i * 2) * 0.15) * 20 + 50;
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-center h-full">
                  <div
                    className="w-1 bg-primary rounded-full transition-all duration-100"
                    style={{ height: `${Math.max(6, Math.min(95, val))}%` }}
                  />
                </div>
              );
            })}
            <span className="absolute top-2 left-2 text-[9px] text-text-muted">DMA Buffer (Ring Pointer: 0x{(0x20000000 + (activeFrame * 32)).toString(16).toUpperCase()})</span>
          </div>

          <div className="flex justify-between text-[11px] text-text-muted">
            <span>Sampling: {samplingRate} Hz</span>
            <span>Window: {windowSizeMs} ms</span>
            <span>Sensor Noise SNR: 42 dB</span>
          </div>
        </div>

        {/* Signal Controls */}
        <div className="lg:col-span-4 bg-surface border border-border rounded p-4 space-y-3 font-mono text-xs">
          <span className="font-bold text-text-primary uppercase tracking-wider block font-sans border-b border-border pb-2">
            Signal Generator Directives
          </span>

          <div className="space-y-1">
            <label className="text-[11px] text-text-secondary block font-medium">Sampling Frequency</label>
            <select
              value={samplingRate}
              onChange={(e) => setSamplingRate(parseInt(e.target.value))}
              className="w-full bg-surface-raised border border-border rounded px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value={16000}>16,000 Hz (Standard Audio / Speech)</option>
              <option value={8000}>8,000 Hz (Low Power Wake Word)</option>
              <option value={44100}>44,100 Hz (High Fidelity Acoustic)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-text-secondary block font-medium">Capture Window Duration</label>
            <select
              value={windowSizeMs}
              onChange={(e) => setWindowSizeMs(parseInt(e.target.value))}
              className="w-full bg-surface-raised border border-border rounded px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value={1000}>1000 ms (1.0 Second Slice)</option>
              <option value={500}>500 ms (Fast Reaction Slice)</option>
              <option value={2000}>2000 ms (Extended Observation)</option>
            </select>
          </div>

          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-text-secondary">Synthetic Jitter / Noise:</span>
              <strong className="text-text-primary">{noiseLevel}%</strong>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={noiseLevel}
              onChange={(e) => setNoiseLevel(parseInt(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
