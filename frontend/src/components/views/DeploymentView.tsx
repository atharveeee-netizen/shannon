import React, { useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import { useCompiler } from '../../context/CompilerContext';
import { EmptyState } from '../ui/EmptyState';
import { Panel } from '../ui/Panel';

export const DeploymentView: React.FC = () => {
  const { loadedModel, compilationResult, downloadHeader } = useCompiler();
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedKitId, setSelectedKitId] = useState('esp32');

  if (!loadedModel || !compilationResult) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <EmptyState
          title="Deployment Artifact Not Available"
          description="Compile a model to generate the MISRA-C:2012 header and ready-to-flash firmware starter templates."
          allowCompile={true}
        />
      </div>
    );
  }

  const firmwareKits = [
    {
      id: 'esp32',
      name: 'ESP32 & ESP32-S3 (Arduino / PlatformIO)',
      path: 'firmware/esp32_arduino/',
      desc: 'Arduino sketch with I2S DMA microphone audio or OV2640 camera frame capture.',
      chip: 'ESP32-S3 @ 240MHz',
    },
    {
      id: 'rp2040',
      name: 'Raspberry Pi Pico (RP2040 C-SDK)',
      path: 'firmware/rp2040_pico/',
      desc: 'Native bare-metal CMake project with 0-malloc inference loop.',
      chip: 'RP2040 @ 133MHz',
    },
    {
      id: 'stm32',
      name: 'STM32 Starter (HAL CMSIS-NN)',
      path: 'firmware/stm32_starter/',
      desc: 'STM32CubeIDE project with optimized SIMD ARM Cortex-M4/M7 loops.',
      chip: 'STM32H7 / STM32F4',
    },
    {
      id: 'arduino',
      name: 'Universal Arduino C++',
      path: 'firmware/arduino_universal/',
      desc: 'Zero-dependency universal sketch compatible with any Arduino-compatible board.',
      chip: 'Universal Microcontrollers',
    },
  ];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(compilationResult.c_header_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-accent">
            <Download className="w-4 h-4" />
            <span>PRODUCTION FIRMWARE PACKAGES</span>
          </div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            Deploy & Flash: {compilationResult.model_name}
          </h1>
          <p className="text-xs text-text-secondary">
            Standalone MISRA-C:2012 certified C header (<code>shannon_model.h</code>) with verified 0-malloc execution.
          </p>
        </div>

        <button
          onClick={downloadHeader}
          className="flex items-center gap-1.5 px-4 py-2 rounded bg-accent hover:bg-accent-hover text-black text-xs font-bold shadow-sm self-start"
        >
          <Download className="w-4 h-4" />
          <span>Download C Header (.h)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Firmware Kits */}
        <div className="space-y-4">
          <Panel title="Microcontroller Firmware Kits" subtitle="Pre-configured sensor & inference templates">
            <div className="space-y-2">
              {firmwareKits.map((kit) => {
                const isSelected = selectedKitId === kit.id;
                return (
                  <div
                    key={kit.id}
                    onClick={() => setSelectedKitId(kit.id)}
                    className={`p-3 rounded border text-xs cursor-pointer transition-all space-y-1.5 ${
                      isSelected
                        ? 'bg-surface-raised border-accent'
                        : 'bg-surface border-border hover:bg-surface-raised/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-text-primary">{kit.name}</span>
                      <span className="text-[10px] font-mono text-accent">{kit.chip}</span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">{kit.desc}</p>
                    <div className="text-[11px] font-mono text-text-muted pt-1">
                      Path: <code>{kit.path}</code>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>

        {/* Right 2 Cols: Deployment Instructions & Code Preview */}
        <div className="lg:col-span-2 space-y-4">
          <Panel
            title="Firmware Integration Guide"
            subtitle="Drop the generated header into your embedded build system"
            headerRight={
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-surface border border-border hover:bg-surface-hover text-text-primary text-xs font-mono transition-colors"
              >
                {copiedCode ? <Check className="w-3 h-3 text-accent" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            }
          >
            <div className="space-y-4 text-xs font-mono">
              <div className="space-y-2 text-text-secondary font-sans">
                <p className="text-text-primary font-medium">1. Copy the emitted header into your project's include path:</p>
                <div className="p-3 rounded bg-code border border-border font-mono text-xs text-accent">
                  #include "shannon_{compilationResult.model_name.toLowerCase()}_model.h"
                </div>

                <p className="text-text-primary font-medium pt-2">2. Call the zero-malloc inference function in your main sensor loop:</p>
                <div className="p-3 rounded bg-code border border-border font-mono text-xs text-text-primary overflow-x-auto space-y-1.5 leading-relaxed">
                  <div className="text-text-muted">// Sensor input buffer</div>
                  <div>int8_t sensor_sample[SHANNON_INPUT_SIZE_BYTES];</div>
                  <div>int8_t predictions[SHANNON_OUTPUT_SIZE_BYTES];</div>
                  <div className="pt-2 text-text-muted">// Execute 0-malloc inference</div>
                  <div className="text-accent font-bold">shannon_run_inference(sensor_sample, predictions);</div>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};
