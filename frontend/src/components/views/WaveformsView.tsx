import React, { useState, useMemo, useEffect } from 'react';
import {
  Activity,
  Play,
  Pause,
  RotateCcw,
  Info,
} from 'lucide-react';
import { useCompiler } from '../../context/CompilerContext';
import { EmptyState } from '../ui/EmptyState';
import { Panel } from '../ui/Panel';
import { CanvasWaveform, CanvasSpectrum } from '../ui/CanvasChart';

export const WaveformsView: React.FC = () => {
  const { loadedModel, compilationResult, selectedHw } = useCompiler();

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [timeStep, setTimeStep] = useState<number>(0);
  const [signalType, setSignalType] = useState<'normal' | 'active' | 'impulse'>('active');
  const [selectedLayerId, setSelectedLayerId] = useState<string>('');

  const layers = compilationResult?.layers || [];

  // Default selected layer to first layer
  useEffect(() => {
    if (layers.length > 0 && !selectedLayerId) {
      setSelectedLayerId(layers[0].layer_id);
    }
  }, [layers, selectedLayerId]);

  // Animation frame loop for streaming DMA simulation
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setTimeStep((t) => (t + 1) % 1000);
    }, 50);
    return () => clearInterval(timer);
  }, [isPlaying]);

  if (!loadedModel || !compilationResult) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <EmptyState
          title="Waveform Trace Not Available"
          description="Compile a model and explore simulated streaming sensor DMA time-domain signals and frequency spectrograms."
          allowCompile={true}
        />
      </div>
    );
  }

  const isAudio = loadedModel.id === 'kws' || loadedModel.domain.toLowerCase().includes('audio');
  const isVision = loadedModel.id === 'vision' || loadedModel.domain.toLowerCase().includes('vision');

  // Generate continuous time-domain waveform
  const timeDomainWaveform = useMemo(() => {
    const points = 160;
    const wave: number[] = [];
    const t = timeStep * 0.15;

    for (let i = 0; i < points; i++) {
      const sampleIdx = i * 0.1;
      let val = 0;

      if (isAudio) {
        // Speech formant envelope: Carrier + vowel formant harmonics
        const envelope = Math.sin((i / points) * Math.PI);
        const f1 = Math.sin(sampleIdx * 2.4 + t);
        const f2 = 0.5 * Math.sin(sampleIdx * 4.8 + t * 1.5);
        const f3 = 0.25 * Math.sin(sampleIdx * 9.6 + t * 2.0);
        val = (f1 + f2 + f3) * (signalType === 'active' ? envelope * 1.2 : 0.2);
        if (signalType === 'impulse' && i % 40 === 0) val += 1.5;
      } else if (isVision) {
        // Video raster scan line with edge contrast transitions
        val = Math.sin(sampleIdx * 1.8 + t) * Math.cos(sampleIdx * 0.6);
        if (signalType === 'active' && i > 50 && i < 110) val += 0.8;
      } else {
        // Industrial bearing vibration: rotational frequency + bearing defect impulse bursts
        const carrier = Math.sin(sampleIdx * 3.5 + t);
        const bearingFault = signalType === 'active' && i % 25 < 5 ? Math.sin(sampleIdx * 14.0) * 1.4 : 0;
        val = carrier * 0.6 + bearingFault + (Math.random() - 0.5) * 0.15;
      }

      wave.push(val);
    }
    return wave;
  }, [timeStep, isAudio, isVision, signalType]);

  // Generate frequency-domain power spectrum
  const frequencySpectrum = useMemo(() => {
    const bins = 48;
    const spectrum: number[] = [];
    const t = timeStep * 0.1;

    for (let b = 0; b < bins; b++) {
      let power = 0;
      if (isAudio) {
        // Formant peaks around bin 8 (F1) and bin 22 (F2)
        const p1 = Math.exp(-Math.pow(b - 8 - Math.sin(t) * 2, 2) / 12);
        const p2 = 0.6 * Math.exp(-Math.pow(b - 24, 2) / 20);
        power = (p1 + p2) * (signalType === 'active' ? 1.0 : 0.25);
      } else if (isVision) {
        // Spatial frequency: high energy in low frequencies
        power = Math.exp(-b / 10) * (0.8 + 0.2 * Math.sin(t + b));
      } else {
        // Vibration spectrum: harmonic 1X, 2X, 3X peaks + defect sidebands
        const harmonic = b === 6 || b === 12 || b === 18 || b === 24 ? 0.9 : 0.1;
        const faultPeak = signalType === 'active' && (b === 32 || b === 34) ? 0.85 : 0.05;
        power = harmonic + faultPeak + (Math.sin(t * 0.5 + b) * 0.05);
      }
      spectrum.push(Math.max(0.02, power));
    }
    return spectrum;
  }, [timeStep, isAudio, isVision, signalType]);

  // Layer weight distribution or activation probe
  const activeLayer = useMemo(() => {
    return layers.find((l) => l.layer_id === selectedLayerId) || layers[0];
  }, [layers, selectedLayerId]);

  const layerActivationWave = useMemo(() => {
    if (!activeLayer) return [];
    const pts = 120;
    const wave: number[] = [];
    const scale = activeLayer.scale_factor || 0.0078;
    const macFactor = Math.min(2.0, Math.log10(Math.max(10, activeLayer.macs)) / 4);

    for (let i = 0; i < pts; i++) {
      // Modulate signal through layer operator transformation
      const base = timeDomainWaveform[i % timeDomainWaveform.length] || 0;
      let transformed = base * macFactor;

      if (activeLayer.op_type.includes('ReLU')) {
        transformed = Math.max(0, transformed);
      } else if (activeLayer.op_type.includes('Pool')) {
        transformed = Math.abs(transformed) * 0.9;
      }

      // Add INT8 quantization stepped resolution
      const intStep = Math.round(transformed / (scale * 20)) * (scale * 20);
      wave.push(intStep);
    }
    return wave;
  }, [activeLayer, timeDomainWaveform]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
            <Activity className="w-3.5 h-3.5" />
            <span>EXPERIMENTAL SIMULATION ENVIRONMENT</span>
          </div>
          <h1 className="text-xl font-light text-text-primary tracking-tight">
            Synthetic Signal Visualization: {compilationResult.model_name}
          </h1>
          <p className="text-xs text-text-secondary">
            Continuous synthetic sensor DMA waveform simulation, FFT waterfall, and layer activation response probe.
          </p>
        </div>

        {/* Live Simulation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-bold transition-all ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause Stream' : 'Resume Stream'}</span>
          </button>

          <button
            onClick={() => setTimeStep(0)}
            className="p-1.5 rounded-none bg-surface-raised border border-border text-text-muted hover:text-text-primary transition-colors"
            title="Reset simulation step"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Explicit Disclaimer per Submission Requirements */}
      <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs rounded-none flex items-center gap-2.5">
        <Info className="w-4 h-4 flex-shrink-0" />
        <span>NOTICE: Synthetic signal visualization for offline testing - not measured hardware telemetry.</span>
      </div>

      {/* Mode / Profile Notice */}
      <div className="p-4 rounded bg-surface border border-border flex items-start justify-between gap-4 text-xs font-mono">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-bold text-text-primary">
              Sensor Ingestion Mode:{' '}
              <span className="text-accent">
                {isAudio ? '16 kHz Mono I2S Microphone' : isVision ? 'DVP Grayscale Camera Scan' : '3-Axis SPI Accelerometer'}
              </span>
            </div>
            <div className="text-text-secondary text-[11px]">
              Streaming <code>{layers[0]?.in_shape || loadedModel.input_shape}</code> buffers into physical SRAM offset{' '}
              <code>0x20000000</code> via hardware DMA ring-buffer.
            </div>
          </div>
        </div>

        {/* Signal state selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-text-muted text-[11px]">Signal State:</span>
          <div className="flex border border-border rounded bg-surface-raised p-0.5 text-[11px]">
            <button
              onClick={() => setSignalType('normal')}
              className={`px-2 py-0.5 rounded transition-colors ${
                signalType === 'normal' ? 'bg-surface text-text-primary font-bold' : 'text-text-muted'
              }`}
            >
              Baseline
            </button>
            <button
              onClick={() => setSignalType('active')}
              className={`px-2 py-0.5 rounded transition-colors ${
                signalType === 'active' ? 'bg-accent text-black font-bold' : 'text-text-muted'
              }`}
            >
              Trigger Event
            </button>
            <button
              onClick={() => setSignalType('impulse')}
              className={`px-2 py-0.5 rounded transition-colors ${
                signalType === 'impulse' ? 'bg-cyan-500 text-black font-bold' : 'text-text-muted'
              }`}
            >
              Impulse
            </button>
          </div>
        </div>
      </div>

      {/* 2. Waveform & Spectrogram Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time-Domain Waveform */}
        <Panel
          title="Time-Domain Sensor Waveform"
          subtitle={
            isAudio
              ? 'Acoustic sample pressure envelope [Amplitude vs Time]'
              : isVision
              ? 'Raster scan line luminance signal [0..255 Intensity]'
              : 'Vibration acceleration trace [±16g Acceleration]'
          }
        >
          <div className="space-y-3">
            <CanvasWaveform
              data={timeDomainWaveform}
              height={160}
              color={isAudio ? '#10B981' : isVision ? '#38BDF8' : '#F59E0B'}
              fillColor={
                isAudio
                  ? 'rgba(16, 185, 129, 0.12)'
                  : isVision
                  ? 'rgba(56, 189, 248, 0.12)'
                  : 'rgba(245, 158, 11, 0.12)'
              }
              label={isAudio ? '16kHz Audio Stream' : isVision ? 'Camera Scanline' : 'Vibration DMA'}
            />
            <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
              <span>Sample Window: 160 points</span>
              <span>Sampling: {isAudio ? '16,000 Hz' : isVision ? '30 FPS' : '1,000 Hz'}</span>
              <span className="text-accent font-semibold">Live DMA Active</span>
            </div>
          </div>
        </Panel>

        {/* Frequency Spectrogram */}
        <Panel
          title="Frequency-Domain Power Spectrum"
          subtitle={
            isAudio
              ? 'Real-time 48-channel audio spectral power [0 to 8 kHz]'
              : isVision
              ? 'Spatial frequency magnitude distribution'
              : 'FFT vibration spectrum with harmonic peaks'
          }
        >
          <div className="space-y-3">
            <CanvasSpectrum
              magnitudes={frequencySpectrum}
              height={160}
              color="#06B6D4"
              label="48-Band Power Spectrum (dB)"
            />
            <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
              <span>Resolution: 48 FFT Bins</span>
              <span>Range: {isAudio ? '0 Hz - 8,000 Hz' : '0 Hz - 500 Hz'}</span>
              <span className="text-cyan-400 font-semibold">CMSIS-DSP RFFT</span>
            </div>
          </div>
        </Panel>
      </div>

      {/* 3. Layer Activation Waveform Probe */}
      <Panel
        title="Layer Activation Signal Probe"
        subtitle="Inspect intermediate transformed waveforms through quantized pipeline layers"
      >
        <div className="space-y-4">
          {/* Layer Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar text-xs font-mono">
            <span className="text-text-muted text-[11px] flex-shrink-0">Probe Layer:</span>
            {layers.map((l) => {
              const isSel = l.layer_id === selectedLayerId;
              return (
                <button
                  key={l.layer_id}
                  onClick={() => setSelectedLayerId(l.layer_id)}
                  className={`px-3 py-1 rounded border text-xs font-mono transition-all flex-shrink-0 ${
                    isSel
                      ? 'bg-surface-raised border-accent text-accent font-bold ring-1 ring-accent'
                      : 'bg-surface border-border text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <span>{l.layer_id}</span>
                  <span className="ml-1 text-[10px] opacity-70">({l.op_type})</span>
                </button>
              );
            })}
          </div>

          {/* Active Layer Waveform */}
          {activeLayer && (
            <div className="space-y-3">
              <CanvasWaveform
                data={layerActivationWave}
                height={150}
                color="#8B5CF6"
                fillColor="rgba(139, 92, 246, 0.12)"
                label={`Activation Waveform: ${activeLayer.layer_id} (${activeLayer.op_type})`}
              />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-2 border-t border-border">
                <div className="p-2.5 rounded bg-surface-raised/40 border border-border">
                  <span className="text-[10px] text-text-muted block">OUT SHAPE:</span>
                  <span className="text-text-primary font-bold">{activeLayer.out_shape}</span>
                </div>
                <div className="p-2.5 rounded bg-surface-raised/40 border border-border">
                  <span className="text-[10px] text-text-muted block">PRECISION:</span>
                  <span className="text-emerald-400 font-bold">INT{activeLayer.bitwidth} Symmetric</span>
                </div>
                <div className="p-2.5 rounded bg-surface-raised/40 border border-border">
                  <span className="text-[10px] text-text-muted block">QUANT SCALE:</span>
                  <span className="text-text-primary font-bold">{activeLayer.scale_factor.toFixed(6)}</span>
                </div>
                <div className="p-2.5 rounded bg-surface-raised/40 border border-border">
                  <span className="text-[10px] text-text-muted block">SRAM OFFSET:</span>
                  <span className="text-cyan-400 font-bold">{activeLayer.sram_offset_hex}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Panel>

      {/* 4. Sensor Ingestion Specifications */}
      <Panel title="Hardware Ingestion Channel Telemetry" subtitle={`Configured for ${selectedHw.name} (@${selectedHw.clock_mhz}MHz)`}>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-4 rounded bg-surface-raised/40 border border-border space-y-1">
            <span className="text-text-muted text-[11px] uppercase">Sampling Rate</span>
            <div className="text-text-primary font-bold text-sm">{isAudio ? '16,000 Hz' : isVision ? '30 FPS' : '1,000 Hz'}</div>
            <p className="text-[11px] text-text-muted">DMA Timer Trigger</p>
          </div>
          <div className="p-4 rounded bg-surface-raised/40 border border-border space-y-1">
            <span className="text-text-muted text-[11px] uppercase">Channel Width</span>
            <div className="text-text-primary font-bold text-sm">{isAudio ? '16-bit Mono I2S' : isVision ? '8-bit DVP' : '3-Axis ±16g SPI'}</div>
            <p className="text-[11px] text-text-muted">Direct Silicon Peripheral</p>
          </div>
          <div className="p-4 rounded bg-surface-raised/40 border border-border space-y-1">
            <span className="text-text-muted text-[11px] uppercase">DMA Buffer Size</span>
            <div className="text-accent font-bold text-sm">{compilationResult.layers[0]?.in_shape || loadedModel.input_shape}</div>
            <p className="text-[11px] text-text-muted">Double-Buffered Ring</p>
          </div>
          <div className="p-4 rounded bg-surface-raised/40 border border-border space-y-1">
            <span className="text-text-muted text-[11px] uppercase">Inference Period</span>
            <div className="text-cyan-400 font-bold text-sm">{compilationResult.optimized_int8.estimated_latency_ms} ms</div>
            <p className="text-[11px] text-emerald-400">Zero-Overrun Fit</p>
          </div>
        </div>
      </Panel>
    </div>
  );
};
