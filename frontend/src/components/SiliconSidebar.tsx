import React from 'react';
import { HardwareProfile, CompilationResult } from '../types';
import { Cpu, Battery, Download, ShieldCheck, Settings2, FileCode } from 'lucide-react';
import { generateStarterKitSource } from '../services/api';

interface SiliconSidebarProps {
  currentHw: HardwareProfile;
  hardwareList: HardwareProfile[];
  onSelectHardware: (id: string) => void;
  compilationResult: CompilationResult | null;
  onDownloadHeader?: () => void;
}

export const SiliconSidebar: React.FC<SiliconSidebarProps> = ({
  currentHw,
  hardwareList,
  onSelectHardware,
  compilationResult,
}) => {
  const peakSramBytes = compilationResult?.optimized_int8.peak_sram_bytes || 18432;
  const flashBytes = compilationResult?.optimized_int8.flash_bytes || 18560;
  const sramTotalBytes = currentHw.sram_kb * 1024;
  const flashTotalBytes = currentHw.flash_mb * 1024 * 1024;

  const sramUsagePct = Math.min(100, Math.max(1, (peakSramBytes / sramTotalBytes) * 100));
  const flashUsagePct = Math.min(100, Math.max(0.5, (flashBytes / flashTotalBytes) * 100));

  // Energy & Battery Calculations
  const latencyMs = compilationResult?.optimized_int8.estimated_latency_ms || 1.1;
  const activeCurrentMa = currentHw.id === 'ESP32-S3' ? 68 : currentHw.id === 'STM32H7' ? 110 : currentHw.id === 'RP2040' ? 24 : 15;
  const energyPerInfUj = ((activeCurrentMa * 3.3 * latencyMs) / 1000).toFixed(2);
  const batteryDays = Math.round((220 * 1000) / ((activeCurrentMa * (latencyMs / 1000) * 100) + 0.015 * 24));

  const starterKits = [
    { name: 'ESP32 I2S / CAM', ext: '.ino', target: 'ESP32-S3', type: 'esp32' },
    { name: 'Arduino Uno R4', ext: '.ino', target: 'Universal', type: 'arduino' },
    { name: 'Raspberry Pi Pico', ext: '.c', target: 'RP2040', type: 'pico' },
    { name: 'STM32 CMSIS-NN', ext: '.cpp', target: 'STM32H7', type: 'stm32' },
  ];

  const handleDownloadKit = (kit: typeof starterKits[0]) => {
    const modelName = compilationResult?.model_name || 'CompiledModel';
    const cHeader = compilationResult?.c_header_code || '';
    const { filename, content } = generateStarterKitSource(kit.type, modelName, currentHw, cHeader);
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <aside className="w-full lg:w-80 flex-shrink-0 bg-surface border-r border-border flex flex-col h-auto lg:h-[calc(100vh-3.5rem)] overflow-y-auto text-xs font-sans">
      <div className="p-4 space-y-5">
        
        {/* Silicon Target Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="font-semibold text-text-primary flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-accent" />
              Target Silicon
            </span>
            <span className="font-mono text-[10px] text-accent bg-accent/10 px-1.5 py-0.5 rounded">
              {currentHw.arch.split(' ')[0]}
            </span>
          </div>

          <select
            value={currentHw.id}
            onChange={(e) => onSelectHardware(e.target.value)}
            className="w-full bg-surface-raised border border-border hover:border-border-strong rounded-[3px] px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent cursor-pointer transition font-medium"
          >
            {hardwareList.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}: {h.sram_kb} KB SRAM, {h.flash_mb} MB Flash
              </option>
            ))}
          </select>
        </div>

        {/* Physical Hardware Specs Card */}
        <div className="p-3 bg-surface-raised border border-border rounded-[3px] space-y-2.5 font-mono text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Architecture</span>
            <span className="text-text-primary font-semibold text-right truncate max-w-[150px]" title={currentHw.arch}>
              {currentHw.arch}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Clock Speed</span>
            <span className="text-text-primary font-semibold">{currentHw.clock_mhz} MHz</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">SIMD Engine</span>
            <span className="text-accent font-semibold text-right truncate max-w-[150px]" title={currentHw.simd}>
              {currentHw.simd}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border/60">
            <span className="text-text-secondary">Safety Spec</span>
            <span className="text-success font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              MISRA-C:2012
            </span>
          </div>
        </div>

        {/* Real-Time Memory Utilization Gauges */}
        <div className="space-y-3">
          <span className="font-semibold text-text-primary block text-xs">
            Silicon Memory Budgets
          </span>

          {/* SRAM Bar */}
          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex justify-between text-text-secondary">
              <span>Peak SRAM Arena</span>
              <span className="text-text-primary font-semibold">
                {(peakSramBytes / 1024).toFixed(1)} KB / {currentHw.sram_kb} KB ({sramUsagePct.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-surface-hover h-2 rounded-full overflow-hidden border border-border">
              <div
                className="bg-accent h-full transition-all duration-500 rounded-full"
                style={{ width: `${sramUsagePct}%` }}
              />
            </div>
            <span className="text-[10px] text-text-muted block">Static Tensor Arena: 0 Bytes Malloc</span>
          </div>

          {/* Flash ROM Bar */}
          <div className="space-y-1 font-mono text-[11px] pt-1">
            <div className="flex justify-between text-text-secondary">
              <span>Flash ROM Storage</span>
              <span className="text-text-primary font-semibold">
                {(flashBytes / 1024).toFixed(1)} KB / {currentHw.flash_mb * 1024} KB ({flashUsagePct.toFixed(2)}%)
              </span>
            </div>
            <div className="w-full bg-surface-hover h-2 rounded-full overflow-hidden border border-border">
              <div
                className="bg-success h-full transition-all duration-500 rounded-full"
                style={{ width: `${Math.max(2, flashUsagePct)}%` }}
              />
            </div>
            <span className="text-[10px] text-text-muted block">Quantized INT8 Weights in ROM</span>
          </div>
        </div>

        {/* Energy & Battery Telemetry Widget */}
        <div className="p-3 bg-surface-raised border border-border rounded-[3px] space-y-2 font-mono text-[11px]">
          <div className="flex items-center gap-1.5 font-sans font-semibold text-text-primary">
            <Battery className="w-3.5 h-3.5 text-success" />
            <span>Power & Battery Estimate</span>
          </div>
          <div className="flex justify-between text-text-secondary pt-1">
            <span>Active Current</span>
            <span className="text-text-primary font-semibold">~{activeCurrentMa} mA @ 3.3V</span>
          </div>
          <div className="flex justify-between text-text-secondary">
            <span>Energy / Inference</span>
            <span className="text-accent font-semibold">{energyPerInfUj} µJ</span>
          </div>
          <div className="flex justify-between text-text-secondary">
            <span>CR2032 Lifespan</span>
            <span className="text-success font-semibold">~{batteryDays} days (100 inf/hr)</span>
          </div>
        </div>

        {/* Optimization Pipeline Specs */}
        <div className="space-y-2 pt-1 border-t border-border">
          <span className="font-semibold text-text-primary flex items-center gap-1.5 text-xs">
            <Settings2 className="w-3.5 h-3.5 text-text-secondary" />
            Compiler Directives
          </span>
          <div className="space-y-1.5 text-[11px] text-text-secondary font-mono">
            <div className="flex justify-between py-1 border-b border-border/40">
              <span>Quantization</span>
              <span className="text-text-primary font-semibold">Symmetric INT8 (Jacob)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span>Memory Planner</span>
              <span className="text-text-primary font-semibold">Interval Graph Coloring</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span>Alignment</span>
              <span className="text-text-primary font-semibold">4-Byte Word (0x20000000)</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Vector Unrolling</span>
              <span className="text-accent font-semibold">4-Way SIMD Loop</span>
            </div>
          </div>
        </div>

        {/* Starter Firmware Kits */}
        <div className="space-y-2 pt-1 border-t border-border">
          <span className="font-semibold text-text-primary flex items-center gap-1.5 text-xs">
            <FileCode className="w-3.5 h-3.5 text-text-secondary" />
            Microcontroller Firmware Kits
          </span>
          <div className="space-y-1">
            {starterKits.map((kit, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-1.5 bg-surface-raised hover:bg-surface-hover border border-border rounded text-[11px] font-mono transition"
              >
                <span className="text-text-primary truncate">{kit.name}</span>
                <button
                  onClick={() => handleDownloadKit(kit)}
                  className="px-2 py-0.5 bg-border hover:bg-border-strong text-text-primary rounded text-[10px] flex items-center gap-1 transition"
                  title={`Download ${kit.name} starter firmware`}
                >
                  <Download className="w-2.5 h-2.5" />
                  {kit.ext}
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </aside>
  );
};
