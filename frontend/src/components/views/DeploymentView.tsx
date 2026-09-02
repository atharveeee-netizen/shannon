import React, { useState } from 'react';
import {
  Download,
  FileCode,
  Check,
  Copy,
  Cpu,
  Sliders,
} from 'lucide-react';
import { CompilationResult, HardwareProfile, PresetModel } from '../../types';

interface DeploymentViewProps {
  result: CompilationResult | null;
  selectedModel: PresetModel | null;
  selectedHw: HardwareProfile;
  onDownloadHeader: () => void;
}

export const DeploymentView: React.FC<DeploymentViewProps> = ({
  result,
  onDownloadHeader,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [quantMode, setQuantMode] = useState<'int8' | 'int4' | 'mixed'>('int8');
  const [selectedFirmwareTab, setSelectedFirmwareTab] = useState<string>('esp32');

  const handleCopyCode = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.c_header_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const firmwareKits = [
    {
      id: 'esp32',
      name: 'ESP32 & ESP32-CAM',
      desc: 'Arduino IDE / PlatformIO sketch with I2S microphone DMA audio or OV2640 camera capture.',
      chip: 'ESP32-S3 @ 240MHz',
    },
    {
      id: 'rp2040',
      name: 'Raspberry Pi Pico (RP2040)',
      desc: 'Native C/C++ SDK project with CMakeLists.txt and dual Cortex-M0+ execution.',
      chip: 'RP2040 @ 133MHz',
    },
    {
      id: 'stm32',
      name: 'STM32 Starter (HAL CMSIS)',
      desc: 'STM32CubeIDE project with optimized SIMD ARM Cortex-M4/M7 loops.',
      chip: 'STM32H7 @ 480MHz',
    },
    {
      id: 'arduino',
      name: 'Universal Arduino C++',
      desc: 'Zero-dependency universal sketch compatible with any Arduino-compatible MCU.',
      chip: 'Arduino Compatible',
    },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <Download className="w-4 h-4" />
            <span>DEPLOYMENT & FIRMWARE EMISSION</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Build & Export C/C++ Silicon Code
          </h1>
          <p className="text-xs text-slate-400">
            Download your standalone MISRA-C:2012 certified C header (<code className="text-emerald-400">shannon_model.h</code>) or full multi-MCU firmware starter kits.
          </p>
        </div>

        {/* 1-Click Master Download CTA */}
        <button
          onClick={onDownloadHeader}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Download Standalone C Header (.h)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Column: Quantization & Firmware Kits */}
        <div className="space-y-6">
          {/* Quantization Mode Selector */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Quantization Precision</h2>
            </div>

            <div className="space-y-2">
              {[
                { id: 'int8', label: 'Symmetric INT8 (Recommended)', desc: '4x Flash reduction, 99.8% precision retention' },
                { id: 'int4', label: 'Ultra-Compact INT4', desc: '8x Flash reduction, optimized for ultra-tiny MCUs' },
                { id: 'mixed', label: 'Adaptive Mixed-Precision', desc: 'Auto-assigns 8-bit to sensitive layers and 4-bit to bulk' },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setQuantMode(opt.id as any)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    quantMode === opt.id
                      ? 'bg-emerald-500/10 border-emerald-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold text-white">{opt.label}</div>
                  <div className="text-[11px] text-slate-400 pt-0.5">{opt.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Multi-MCU Firmware Ecosystem Cards */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white">Firmware Starter Kits</h2>
            </div>

            <div className="space-y-2.5">
              {firmwareKits.map((kit) => {
                const isSelected = selectedFirmwareTab === kit.id;
                return (
                  <div
                    key={kit.id}
                    onClick={() => setSelectedFirmwareTab(kit.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-cyan-500/50 text-white'
                        : 'bg-slate-950 border-slate-800 hover:bg-slate-850 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{kit.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">
                        {kit.chip}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 pt-1">{kit.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Live C/C++ Header Code Viewer */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col h-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white font-mono">
                  shannon_{result?.model_name?.toLowerCase() || 'kws'}_model.h
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium border border-slate-700 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Code'}</span>
                </button>
                <button
                  onClick={onDownloadHeader}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .h</span>
                </button>
              </div>
            </div>

            {/* Code Block Window */}
            <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs text-slate-300 overflow-y-auto max-h-[520px] custom-scrollbar">
              <pre className="whitespace-pre">{result?.c_header_code || `// Compiling model...
#include <stdint.h>
#include <string.h>

#define SHANNON_ARENA_SIZE 1144
static uint8_t shannon_tensor_arena[SHANNON_ARENA_SIZE] __attribute__((aligned(4)));

void shannon_run_inference(const int8_t* input, int8_t* output) {
    // 0-malloc inference loop
}`}</pre>
            </div>

            {/* Quick Microcontroller Integration Snippet */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-400 space-y-1">
              <div className="text-emerald-400 font-bold">4-LINE EMBEDDED INTEGRATION:</div>
              <div className="text-slate-300">
                <code>#include "shannon_model.h"</code>
              </div>
              <div className="text-slate-300">
                <code>shannon_run_inference(sensor_buffer, output_probabilities);</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
