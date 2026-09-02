import React from 'react';
import { Activity, Info } from 'lucide-react';
import { useCompiler } from '../../context/CompilerContext';
import { EmptyState } from '../ui/EmptyState';
import { Panel } from '../ui/Panel';

export const WaveformsView: React.FC = () => {
  const { loadedModel, compilationResult, selectedHw } = useCompiler();

  if (!loadedModel || !compilationResult) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <EmptyState
          title="Waveform Trace Not Available"
          description="Compile a model and connect a hardware MCU probe or simulation testbench to inspect sensor time-series waveforms."
          allowCompile={true}
        />
      </div>
    );
  }

  const isAudio = loadedModel.id === 'kws' || loadedModel.domain.toLowerCase().includes('audio');

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-accent">
            <Activity className="w-4 h-4" />
            <span>SENSOR WAVEFORMS & SPECTRAL ANALYSIS</span>
          </div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            Signal Waveform Inspector: {compilationResult.model_name}
          </h1>
          <p className="text-xs text-text-secondary">
            Time-domain and frequency-domain telemetry channels for microcontroller sensor DMA streams.
          </p>
        </div>
      </div>

      <div className="p-4 rounded bg-surface border border-border flex items-start gap-3 text-xs text-text-secondary leading-relaxed">
        <Info className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-text-primary">Waveform Provenance Notice:</strong> Live streaming waveforms require an attached MCU serial bridge or hardware debugging probe. To test inference offline, use the{' '}
          <strong className="text-accent">Testbench</strong> or <strong className="text-accent">Numerical Parity</strong> views.
        </div>
      </div>

      <Panel title="Sensor Ingestion Specifications" subtitle={`Configured for ${selectedHw.name}`}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 rounded bg-surface-raised/40 border border-border space-y-1">
            <span className="text-text-muted text-[11px] uppercase">Sampling Rate</span>
            <div className="text-text-primary font-bold text-sm">{isAudio ? '16,000 Hz' : '1,000 Hz'}</div>
          </div>
          <div className="p-4 rounded bg-surface-raised/40 border border-border space-y-1">
            <span className="text-text-muted text-[11px] uppercase">Channel Width</span>
            <div className="text-text-primary font-bold text-sm">{isAudio ? '16-bit Mono I2S' : '3-Axis ±16g'}</div>
          </div>
          <div className="p-4 rounded bg-surface-raised/40 border border-border space-y-1">
            <span className="text-text-muted text-[11px] uppercase">Input Buffer Size</span>
            <div className="text-accent font-bold text-sm">{compilationResult.layers[0]?.in_shape || loadedModel.input_shape}</div>
          </div>
        </div>
      </Panel>
    </div>
  );
};
