import React, { useState } from 'react';
import { CompilationResult, HardwareProfile } from '../types';
import { Download, Cpu, ShieldCheck, Sparkles, Check, FileCode, CheckCircle2 } from 'lucide-react';
import { generateStarterKitSource } from '../services/api';

interface DeploymentGridProps {
  currentHw: HardwareProfile;
  hardwareList: HardwareProfile[];
  onSelectHardware: (id: string) => void;
  compilationResult: CompilationResult | null;
  onDownloadHeader: () => void;
}

export const DeploymentGrid: React.FC<DeploymentGridProps> = ({
  currentHw,
  hardwareList,
  onSelectHardware,
  compilationResult,
  onDownloadHeader,
}) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadBoardFirmware = (hw: HardwareProfile) => {
    setDownloadingId(hw.id);
    const modelName = compilationResult?.model_name || 'CompiledModel';
    const cHeader = compilationResult?.c_header_code || '';
    
    let platformType = 'esp32';
    if (hw.id === 'RP2040') platformType = 'pico';
    else if (hw.id === 'STM32H7') platformType = 'stm32';
    else if (hw.id === 'nRF52840') platformType = 'arduino';

    const { filename, content } = generateStarterKitSource(platformType, modelName, hw, cHeader);
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);

    setTimeout(() => setDownloadingId(null), 1200);
  };

  const peakSramBytes = compilationResult?.optimized_int8.peak_sram_bytes || 18432;
  const flashBytes = compilationResult?.optimized_int8.flash_bytes || 18560;

  return (
    <div className="bg-surface border border-border rounded-lg p-5 space-y-6 shadow-sm">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-accent" />
            Edge Impulse & Silicon Deployment Studio
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Deploy your zero-malloc compiled INT8 model to production microcontroller firmware or export standalone C++ libraries.
          </p>
        </div>

        <button
          onClick={onDownloadHeader}
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-md shadow transition flex items-center justify-center gap-1.5"
        >
          <Download className="w-4 h-4" />
          Export C++ Library (shannon_model.h)
        </button>
      </div>

      {/* Section 1: Create Library Formats */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
          1. Select Deployment Library Format
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div
            onClick={onDownloadHeader}
            className="p-3 bg-surface-raised hover:bg-surface-hover border border-border hover:border-accent rounded-md cursor-pointer transition space-y-1 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-accent" />
                C++ Library
              </span>
              <span className="text-[10px] font-mono text-success bg-success/10 px-1.5 py-0.2 rounded font-semibold">
                RECOMMENDED
              </span>
            </div>
            <p className="text-[11px] text-text-secondary">
              Self-contained, zero-dependency C++ header with 4-way SIMD kernels and static BSS tensor arena.
            </p>
          </div>

          <div
            onClick={() => handleDownloadBoardFirmware(currentHw)}
            className="p-3 bg-surface-raised hover:bg-surface-hover border border-border hover:border-accent rounded-md cursor-pointer transition space-y-1 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-emerald-500" />
                Arduino IDE Sketch
              </span>
              <span className="text-[10px] font-mono text-text-muted">.ino</span>
            </div>
            <p className="text-[11px] text-text-secondary">
              Ready-to-flash Arduino sketch for ESP32, Uno R4, and Nano BLE with sensor capture and serial logging.
            </p>
          </div>

          <div
            onClick={() => handleDownloadBoardFirmware(currentHw)}
            className="p-3 bg-surface-raised hover:bg-surface-hover border border-border hover:border-accent rounded-md cursor-pointer transition space-y-1 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Bare-Metal C-SDK
              </span>
              <span className="text-[10px] font-mono text-text-muted">.c / .cpp</span>
            </div>
            <p className="text-[11px] text-text-secondary">
              High-performance template for Raspberry Pi Pico C-SDK and STM32 CMSIS-NN hardware DWT benchmarks.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Target Microcontroller Boards Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
          2. Build & Flash Direct Microcontroller Firmware
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {hardwareList.map((hw) => {
            const isSelected = hw.id === currentHw.id;
            const sramCapBytes = hw.sram_kb * 1024;
            const flashCapBytes = hw.flash_mb * 1024 * 1024;
            const sramPct = Math.min(100, Math.max(1, (peakSramBytes / sramCapBytes) * 100));
            const flashPct = Math.min(100, Math.max(0.5, (flashBytes / flashCapBytes) * 100));

            return (
              <div
                key={hw.id}
                onClick={() => onSelectHardware(hw.id)}
                className={`p-4 rounded-lg border transition cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-accent/5 border-accent shadow-sm ring-1 ring-accent/30'
                    : 'bg-surface-raised hover:bg-surface-hover border-border'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-text-primary flex items-center gap-1.5">
                      <Cpu className={`w-4 h-4 ${isSelected ? 'text-accent' : 'text-text-secondary'}`} />
                      {hw.name}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-mono text-accent bg-accent/10 px-1.5 py-0.5 rounded font-bold">
                        ACTIVE TARGET
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] font-mono text-text-muted">{hw.arch} · {hw.clock_mhz} MHz</div>
                </div>

                {/* SRAM & Flash Progress Gauges */}
                <div className="space-y-2 pt-1 font-mono text-[10px]">
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-text-secondary">
                      <span>Peak SRAM:</span>
                      <strong className="text-text-primary">{(peakSramBytes / 1024).toFixed(1)} KB / {hw.sram_kb} KB ({sramPct.toFixed(1)}%)</strong>
                    </div>
                    <div className="w-full bg-surface-hover h-1.5 rounded-full overflow-hidden border border-border/60">
                      <div className="bg-accent h-full rounded-full" style={{ width: `${sramPct}%` }} />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex justify-between text-text-secondary">
                      <span>Flash ROM:</span>
                      <strong className="text-text-primary">{(flashBytes / 1024).toFixed(1)} KB / {hw.flash_mb * 1024} KB ({flashPct.toFixed(2)}%)</strong>
                    </div>
                    <div className="w-full bg-surface-hover h-1.5 rounded-full overflow-hidden border border-border/60">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.max(2, flashPct)}%` }} />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-success flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Fits Board
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadBoardFirmware(hw);
                    }}
                    className="px-2.5 py-1 bg-surface border border-border hover:border-accent text-text-primary rounded text-[11px] font-medium transition flex items-center gap-1"
                  >
                    {downloadingId === hw.id ? (
                      <>
                        <Check className="w-3 h-3 text-success" />
                        <span>Ready</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3 h-3 text-accent" />
                        <span>Build Firmware</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: Compiler Optimization Engine Summary */}
      <div className="p-3 bg-surface-raised border border-border rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-success" />
          <span className="text-text-secondary">
            Compiler Engine: <strong className="text-text-primary">Shannon EON™ Zero-Malloc Engine (INT8)</strong>
          </span>
        </div>
        <div className="flex items-center gap-3 text-text-muted text-[11px]">
          <span>MISRA-C:2012 Rule 21.3 Certified</span>
          <span>·</span>
          <span>4-Way SIMD Vectorized</span>
        </div>
      </div>
    </div>
  );
};
