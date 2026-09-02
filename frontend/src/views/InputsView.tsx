import React, { useState } from 'react';
import { PresetModel } from '../types';
import { Radio } from 'lucide-react';

interface InputsViewProps {
  model: PresetModel;
}

export const InputsView: React.FC<InputsViewProps> = ({ model }) => {
  const isKws = model.id === 'kws';
  const isVision = model.id === 'vision';

  const [selectedSample, setSelectedSample] = useState(0);

  const samples = isKws
    ? ['sample_01_yes.wav', 'sample_02_no.wav', 'sample_03_yes.wav', 'sample_04_unknown.wav']
    : isVision
    ? ['frame_01_person.raw', 'frame_02_empty.raw', 'frame_03_person.raw']
    : ['bearing_run_01.dat', 'bearing_defect_02.dat', 'bearing_run_03.dat'];

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h2 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-4 h-4 text-primary" />
            Sensor Data & Input Tensor Inspector
          </h2>
          <p className="text-text-secondary text-xs mt-0.5">
            Preprocessed calibration dataset samples, sensor sampling rates, and feature extraction tensor geometry.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-text-secondary">
          <span>Format: <strong className="text-primary">{model.input_type}</strong></span>
          <span>·</span>
          <span>Shape: <strong className="text-text-primary">{model.input_shape}</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Sample Browser */}
        <div className="lg:col-span-4 bg-surface border border-border rounded p-4 space-y-3 font-mono">
          <span className="font-bold text-text-primary uppercase tracking-wider block font-sans border-b border-border pb-2">
            Test Dataset Samples
          </span>

          <div className="space-y-1">
            {samples.map((s, idx) => (
              <button
                key={s}
                onClick={() => setSelectedSample(idx)}
                className={`w-full text-left p-2.5 rounded text-xs transition flex items-center justify-between ${
                  selectedSample === idx
                    ? 'bg-primary/10 border border-primary/30 text-primary font-bold'
                    : 'bg-surface-raised border border-border text-text-secondary hover:text-text-primary'
                }`}
              >
                <span>{s}</span>
                <span className="text-[10px] text-text-muted">#0{idx + 1}</span>
              </button>
            ))}
          </div>

          <div className="p-3 bg-surface-raised border border-border rounded space-y-1.5 text-[11px]">
            <span className="font-bold text-text-primary block font-sans">Dataset Metadata</span>
            <div className="text-text-secondary space-y-0.5">
              <div>Source: <strong>{model.dataset}</strong></div>
              <div>Domain: <strong>{model.domain}</strong></div>
              <div>Quantization Scale: <strong>0.007812 (Signed INT8)</strong></div>
            </div>
          </div>
        </div>

        {/* Right: Sensor Visualizer */}
        <div className="lg:col-span-8 bg-surface border border-border rounded p-4 space-y-4 font-mono">
          <span className="font-bold text-xs text-text-primary uppercase tracking-wider block font-sans border-b border-border pb-2">
            Sensor Signal Preview & Feature Map
          </span>

          {isKws ? (
            /* Audio Waveform + Spectrogram */
            <div className="space-y-3">
              <div className="h-32 bg-canvas rounded border border-border p-3 flex items-center justify-center relative overflow-hidden">
                <div className="flex items-center gap-1 w-full justify-center">
                  {[12, 28, 45, 80, 95, 60, 40, 85, 55, 30, 48, 20, 65, 88, 70, 35, 18, 50, 75, 90, 60, 25].map(
                    (h, i) => (
                      <div
                        key={i}
                        className="w-1.5 bg-primary rounded-full transition-all"
                        style={{ height: `${h}%` }}
                      />
                    )
                  )}
                </div>
                <span className="absolute top-2 left-2 text-[9px] text-text-muted">16,000 Hz Raw PCM Waveform</span>
              </div>

              <div className="flex justify-between text-[11px] text-text-muted">
                <span>0.00 s (Start)</span>
                <span>49 Time Windows x 10 MFCC Bins = 490 Input Elements</span>
                <span>1.00 s (End)</span>
              </div>
            </div>
          ) : isVision ? (
            /* 48x48 Vision Grid */
            <div className="space-y-3">
              <div className="aspect-square max-w-[200px] mx-auto bg-canvas rounded border border-border p-2 flex items-center justify-center relative">
                <div className="grid grid-cols-6 gap-1 w-full h-full p-2 bg-black/30 rounded">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-[1px] bg-primary/40 flex items-center justify-center text-[7px] text-white/80"
                    >
                      {Math.round(40 + (i % 6) * 14)}
                    </div>
                  ))}
                </div>
                <span className="absolute bottom-1 right-2 text-[9px] text-text-muted">48x48 8-bit Grayscale</span>
              </div>
            </div>
          ) : (
            /* Vibration FFT Spectrum */
            <div className="space-y-3">
              <div className="h-32 bg-canvas rounded border border-border p-3 flex items-end justify-between gap-1 overflow-hidden relative">
                {[15, 30, 22, 55, 85, 98, 45, 20, 65, 35, 18, 12, 40, 75, 30, 15].map((h, i) => (
                  <div key={i} className="flex-1 bg-emerald-500 rounded-t" style={{ height: `${h}%` }} />
                ))}
                <span className="absolute top-2 left-2 text-[9px] text-text-muted">128-Point FFT Power Spectrum</span>
              </div>

              <div className="flex justify-between text-[11px] text-text-muted">
                <span>0 Hz</span>
                <span>Bearing Defect BPFO (342Hz)</span>
                <span>10 kHz</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
