import React from 'react';
import { PresetModel, HardwareProfile, CompilationResult } from '../types';
import { Radio, Cpu, Layers, CheckCircle2, ChevronRight, Zap } from 'lucide-react';

interface ImpulseFlowGraphProps {
  model: PresetModel;
  targetHw: HardwareProfile;
  compilationResult: CompilationResult | null;
  activeSection: string;
  onSelectSection: (section: string) => void;
}

export const ImpulseFlowGraph: React.FC<ImpulseFlowGraphProps> = ({
  model,
  targetHw,
  compilationResult,
  activeSection,
  onSelectSection,
}) => {
  const isKws = model.id === 'kws';
  const isVision = model.id === 'vision';
  const isAnomaly = model.id === 'anomaly';

  const inputName = isKws
    ? 'Time Series Audio'
    : isVision
    ? 'Raw Camera Sensor'
    : isAnomaly
    ? 'Tri-Axial Accelerometer'
    : 'Custom Sensor Stream';

  const inputDetails = isKws
    ? '16000 Hz · 1000 ms window'
    : isVision
    ? '48x48 Grayscale · 1 channel'
    : '20.48 kHz · 128-point FFT';

  const dspName = isKws
    ? 'MFCC Extraction'
    : isVision
    ? 'Grayscale Pixel DSP'
    : 'Spectral Power DSP';

  const dspFeatures = isKws
    ? '490 features (49x10)'
    : isVision
    ? '2,304 pixels'
    : '128 FFT power bins';

  const nnName = isKws
    ? '1D Depthwise CNN'
    : isVision
    ? 'MobileNet-Tiny (0.25x)'
    : '5-Layer Deep Autoencoder';

  const outputName = isKws
    ? '12-Class Wake Words'
    : isVision
    ? '2 Classes (Person / None)'
    : 'Anomaly MSE Score';

  return (
    <div className="bg-surface border border-border rounded-lg p-4 space-y-3 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
            Impulse Design Pipeline Flow
          </h3>
          <span className="text-[10px] font-mono text-text-muted bg-surface-raised px-2 py-0.5 rounded border border-border">
            Impulse #1103752
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-text-secondary">
          <span className="flex items-center gap-1 text-success font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Zero-Malloc Verified
          </span>
          <span>·</span>
          <span>Target: <strong className="text-text-primary">{targetHw.name}</strong></span>
        </div>
      </div>

      {/* Impulse Connected Block Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
        
        {/* Block 1: Input Data Sensor */}
        <div
          onClick={() => onSelectSection('impulse')}
          className={`p-3 rounded-md border transition cursor-pointer relative group ${
            activeSection === 'impulse'
              ? 'bg-accent/10 border-accent text-text-primary shadow-sm'
              : 'bg-surface-raised hover:bg-surface-hover border-border text-text-secondary'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-bold text-accent tracking-wider flex items-center gap-1">
              <Radio className="w-3 h-3" />
              1. Sensor Input
            </span>
            <span className="text-[9px] font-mono text-text-muted">RAW</span>
          </div>
          <div className="font-bold text-xs text-text-primary truncate">{inputName}</div>
          <div className="text-[11px] font-mono text-text-muted mt-0.5 truncate">{inputDetails}</div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:block opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition">
            <ChevronRight className="w-4 h-4 text-accent" />
          </div>
        </div>

        {/* Block 2: DSP Processing Block */}
        <div
          onClick={() => onSelectSection('dsp')}
          className={`p-3 rounded-md border transition cursor-pointer relative group ${
            activeSection === 'dsp'
              ? 'bg-emerald-500/10 border-emerald-500 text-text-primary shadow-sm'
              : 'bg-surface-raised hover:bg-surface-hover border-border text-text-secondary'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3" />
              2. Processing (DSP)
            </span>
            <span className="text-[9px] font-mono text-emerald-500 bg-emerald-500/10 px-1 rounded">
              0.1 ms
            </span>
          </div>
          <div className="font-bold text-xs text-text-primary truncate">{dspName}</div>
          <div className="text-[11px] font-mono text-text-muted mt-0.5 truncate">{dspFeatures}</div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:block opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition">
            <ChevronRight className="w-4 h-4 text-emerald-500" />
          </div>
        </div>

        {/* Block 3: Learning Block (Shannon INT8 NN) */}
        <div
          onClick={() => onSelectSection('classifier')}
          className={`p-3 rounded-md border transition cursor-pointer relative group ${
            activeSection === 'classifier'
              ? 'bg-indigo-500/10 border-indigo-500 text-text-primary shadow-sm'
              : 'bg-surface-raised hover:bg-surface-hover border-border text-text-secondary'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider flex items-center gap-1">
              <Layers className="w-3 h-3" />
              3. Learning Block
            </span>
            <span className="text-[9px] font-mono text-indigo-500 bg-indigo-500/10 px-1 rounded">
              INT8 PTQ
            </span>
          </div>
          <div className="font-bold text-xs text-text-primary truncate">{nnName}</div>
          <div className="text-[11px] font-mono text-text-muted mt-0.5 truncate">
            {compilationResult?.optimized_int8.estimated_latency_ms || 1.1} ms · {((compilationResult?.optimized_int8.flash_bytes || 18560) / 1024).toFixed(1)} KB Flash
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:block opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition">
            <ChevronRight className="w-4 h-4 text-indigo-500" />
          </div>
        </div>

        {/* Block 4: Output Hardware Execution */}
        <div
          onClick={() => onSelectSection('deployment')}
          className={`p-3 rounded-md border transition cursor-pointer relative ${
            activeSection === 'deployment'
              ? 'bg-amber-500/10 border-amber-500 text-text-primary shadow-sm'
              : 'bg-surface-raised hover:bg-surface-hover border-border text-text-secondary'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              4. Hardware Output
            </span>
            <span className="text-[9px] font-mono text-amber-500 bg-amber-500/10 px-1 rounded">
              0-Malloc
            </span>
          </div>
          <div className="font-bold text-xs text-text-primary truncate">{outputName}</div>
          <div className="text-[11px] font-mono text-text-muted mt-0.5 truncate">
            {((compilationResult?.optimized_int8.peak_sram_bytes || 18432) / 1024).toFixed(1)} KB Static Arena
          </div>
        </div>

      </div>
    </div>
  );
};
