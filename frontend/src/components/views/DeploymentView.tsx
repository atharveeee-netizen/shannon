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
    <div className="p-8 space-y-8 max-w-7xl mx-auto bg-[#0E131F]">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#202B3C] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#20E28B]">
            <Download className="w-4 h-4" />
            <span>DEPLOYMENT & CODE EMISSION</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Build & Export C/C++ Silicon Code
          </h1>
          <p className="text-xs text-[#94A3B8]">
            Download your standalone MISRA-C:2012 certified C header (<code className="text-[#20E28B]">shannon_model.h</code>) or full multi-MCU firmware starter kits.
          </p>
        </div>

        {/* 1-Click Master Download CTA */}
        <button
          onClick={onDownloadHeader}
          className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#20E28B] hover:bg-[#1BC97B] text-[#0E131F] font-bold text-xs shadow-md shadow-[#20E28B]/20 transition-all active:scale-95 self-start"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span>Download Standalone C Header (.h)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Column: Quantization & Firmware Kits */}
        <div className="space-y-6">
          {/* Quantization Mode Selector */}
          <div className="p-6 rounded-lg bg-[#151D2A] border border-[#202B3C] space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#202B3C]">
              <Sliders className="w-4 h-4 text-[#20E28B]" />
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
                  className={`p-3 rounded-md border cursor-pointer transition-all ${
                    quantMode === opt.id
                      ? 'bg-[#20E28B]/10 border-[#20E28B] text-white'
                      : 'bg-[#101620] border-[#202B3C] text-[#94A3B8] hover:border-[#2A3649]'
                  }`}
                >
                  <div className="text-xs font-bold text-white">{opt.label}</div>
                  <div className="text-[11px] text-[#94A3B8] pt-0.5">{opt.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Multi-MCU Firmware Ecosystem Cards */}
          <div className="p-6 rounded-lg bg-[#151D2A] border border-[#202B3C] space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#202B3C]">
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
                    className={`p-3 rounded-md border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#18212D] border-cyan-500/50 text-white'
                        : 'bg-[#101620] border-[#202B3C] hover:bg-[#18212D] text-[#94A3B8]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{kit.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1B2431] text-cyan-300">
                        {kit.chip}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#94A3B8] pt-1">{kit.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Live C/C++ Header Code Viewer */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-lg bg-[#151D2A] border border-[#202B3C] space-y-4 flex flex-col h-full">
            <div className="flex items-center justify-between pb-3 border-b border-[#202B3C]">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-[#20E28B]" />
                <h2 className="text-sm font-bold text-white font-mono">
                  shannon_{result?.model_name?.toLowerCase().replace(/\s+/g, '_') || 'kws'}_model.h
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1B2431] hover:bg-[#232E3E] text-[#CBD5E1] text-xs font-mono font-medium border border-[#2A3649] transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#20E28B]" /> : <Copy className="w-3.5 h-3.5 text-[#94A3B8]" />}
                  <span>{copied ? 'Copied' : 'Copy Code'}</span>
                </button>
                <button
                  onClick={onDownloadHeader}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#20E28B] hover:bg-[#1BC97B] text-[#0E131F] text-xs font-mono font-bold transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Download .h</span>
                </button>
              </div>
            </div>

            {/* Code Block Window */}
            <div className="flex-1 bg-[#101620] rounded-md border border-[#202B3C] p-4 font-mono text-xs text-[#CBD5E1] overflow-y-auto max-h-[520px] custom-scrollbar">
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
            <div className="p-3.5 rounded-md bg-[#101620] border border-[#202B3C] font-mono text-[11px] text-[#94A3B8] space-y-1">
              <div className="text-[#20E28B] font-bold">4-LINE EMBEDDED INTEGRATION:</div>
              <div className="text-white">
                <code>#include "shannon_model.h"</code>
              </div>
              <div className="text-white">
                <code>shannon_run_inference(sensor_buffer, output_probabilities);</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
