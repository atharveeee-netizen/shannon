import React, { useState } from 'react';
import { CompilationResult, HardwareProfile } from '../types';
import { Rocket, Download, FileCode, Cpu, Check } from 'lucide-react';
import { generateStarterKitSource } from '../services/api';

interface DeploymentViewProps {
  currentHw: HardwareProfile;
  compilationResult: CompilationResult | null;
  onDownloadHeader: () => void;
}

export const DeploymentView: React.FC<DeploymentViewProps> = ({
  currentHw,
  compilationResult,
  onDownloadHeader,
}) => {
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  const handleDownloadStarter = (format: string) => {
    setDownloadingFormat(format);
    const modelName = compilationResult?.model_name || 'CompiledModel';
    const cHeader = compilationResult?.c_header_code || '';
    const { filename, content } = generateStarterKitSource(format, modelName, currentHw, cHeader);

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);

    setTimeout(() => setDownloadingFormat(null), 1200);
  };

  const steps = [
    { name: 'Model Ingest', status: '✓ Complete' },
    { name: 'Quantization (INT8)', status: '✓ Complete' },
    { name: 'Zero-Malloc Plan', status: '✓ Complete' },
    { name: 'C Code Generation', status: '✓ Complete' },
    { name: 'Target Link & Flash', status: 'Ready' },
  ];

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h2 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider flex items-center gap-2">
            <Rocket className="w-4 h-4 text-primary" />
            Target Silicon Deployment & Firmware Generation
          </h2>
          <p className="text-text-secondary text-xs mt-0.5">
            Export standalone production firmware artifacts and library packages ready to flash to microcontrollers.
          </p>
        </div>

        <button
          onClick={onDownloadHeader}
          className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded font-mono font-semibold text-xs flex items-center gap-1.5 transition shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export shannon_model.h</span>
        </button>
      </div>

      {/* Deployment Pipeline Status */}
      <div className="p-4 bg-surface border border-border rounded space-y-2 font-mono">
        <div className="flex items-center justify-between text-xs font-sans border-b border-border pb-2">
          <span className="font-bold text-text-primary uppercase tracking-wider">
            Deployment Toolchain Pipeline
          </span>
          <span className="text-[11px] text-text-muted">Target: {currentHw.name} ({currentHw.arch})</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-xs">
          {steps.map((st, i) => (
            <div key={st.name} className="p-2.5 bg-surface-raised border border-border rounded flex flex-col justify-between">
              <span className="text-[10px] text-text-muted">STEP 0{i + 1}</span>
              <strong className="text-text-primary truncate">{st.name}</strong>
              <span className="text-[10px] text-success font-semibold">{st.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Deployment Artifact Formats */}
      <div className="space-y-3">
        <h3 className="font-bold text-xs text-text-primary font-mono uppercase tracking-wider">
          Export Firmware Starter Packages
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
          {/* C++ Header */}
          <div className="p-4 bg-surface border border-border rounded space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-text-primary flex items-center gap-1.5 font-sans">
                  <FileCode className="w-4 h-4 text-primary" />
                  C++ Standalone Header
                </span>
                <span className="text-[9px] font-mono bg-success-subtle text-success px-1.5 py-0.2 rounded font-bold">
                  UNIVERSAL
                </span>
              </div>
              <p className="text-[11px] text-text-secondary font-sans leading-relaxed">
                Header-only library containing complete INT8 quantized weights, 4-way SIMD kernels, and 0-malloc memory invoker.
              </p>
            </div>

            <button
              onClick={onDownloadHeader}
              className="w-full py-1.5 bg-surface-raised hover:bg-surface-hover border border-border text-text-primary font-bold rounded text-xs transition flex items-center justify-center gap-1"
            >
              <Download className="w-3.5 h-3.5 text-primary" />
              <span>Download .h Header</span>
            </button>
          </div>

          {/* Arduino IDE */}
          <div className="p-4 bg-surface border border-border rounded space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-text-primary flex items-center gap-1.5 font-sans">
                  <Cpu className="w-4 h-4 text-success" />
                  Arduino IDE Sketch (.ino)
                </span>
                <span className="text-[9px] text-text-muted">ESP32 / UNO</span>
              </div>
              <p className="text-[11px] text-text-secondary font-sans leading-relaxed">
                Ready-to-upload Arduino sketch with sensor frame staging, execution timing loop, and Serial monitor telemetry.
              </p>
            </div>

            <button
              onClick={() => handleDownloadStarter('esp32')}
              className="w-full py-1.5 bg-surface-raised hover:bg-surface-hover border border-border text-text-primary font-bold rounded text-xs transition flex items-center justify-center gap-1"
            >
              {downloadingFormat === 'esp32' ? <Check className="w-3.5 h-3.5 text-success" /> : <Download className="w-3.5 h-3.5 text-success" />}
              <span>{downloadingFormat === 'esp32' ? 'Downloaded' : 'Download .ino Sketch'}</span>
            </button>
          </div>

          {/* Bare-Metal Pico / STM32 */}
          <div className="p-4 bg-surface border border-border rounded space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-text-primary flex items-center gap-1.5 font-sans">
                  <Rocket className="w-4 h-4 text-amber-500" />
                  Bare-Metal C-SDK (.c)
                </span>
                <span className="text-[9px] text-text-muted">PICO / STM32</span>
              </div>
              <p className="text-[11px] text-text-secondary font-sans leading-relaxed">
                Native C starter file with microsecond hardware cycle counters and zero-copy DMA sensor pointers.
              </p>
            </div>

            <button
              onClick={() => handleDownloadStarter('pico')}
              className="w-full py-1.5 bg-surface-raised hover:bg-surface-hover border border-border text-text-primary font-bold rounded text-xs transition flex items-center justify-center gap-1"
            >
              {downloadingFormat === 'pico' ? <Check className="w-3.5 h-3.5 text-success" /> : <Download className="w-3.5 h-3.5 text-amber-500" />}
              <span>{downloadingFormat === 'pico' ? 'Downloaded' : 'Download .c Source'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
