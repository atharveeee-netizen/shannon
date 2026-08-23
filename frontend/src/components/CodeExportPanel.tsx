import React, { useState } from 'react';
import { TargetLanguage, HardwareProfile } from '../types';
import { Code, Copy, Download, Check, Sparkles, CheckCircle2 } from 'lucide-react';

interface CodeExportPanelProps {
  code: string;
  targetLanguage: TargetLanguage;
  onChangeTarget: (lang: TargetLanguage) => void;
  targetHw: HardwareProfile;
}

export const CodeExportPanel: React.FC<CodeExportPanelProps> = ({
  code,
  targetLanguage,
  onChangeTarget,
  targetHw,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extMap: Record<TargetLanguage, string> = {
      cpp_esp32: 'h',
      cpp_stm32: 'h',
      rust_embedded: 'rs',
      micropython: 'py',
    };
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `shannon_model.${extMap[targetLanguage]}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const targetTabs: { id: TargetLanguage; label: string; badge: string }[] = [
    { id: 'cpp_esp32', label: 'C++ (ESP32-S3)', badge: 'Xtensa PIE SIMD' },
    { id: 'cpp_stm32', label: 'C/C++ (STM32H7)', badge: 'ARM CMSIS-NN' },
    { id: 'rust_embedded', label: 'Embedded Rust', badge: 'no_std Cortex-M' },
    { id: 'micropython', label: 'MicroPython Module', badge: 'RP2040 Pico' },
  ];

  return (
    <div className="space-y-4">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#21262D] pb-3 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-[#0284C7]/15 border border-[#0284C7]/30 text-[#38BDF8]">
              <Code className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-[#F0F6FC] font-mono tracking-tight uppercase">
              STANDALONE C/C++ FIRMWARE CODEGEN
            </h2>
          </div>
          <p className="text-xs text-[#8B949E] mt-0.5 font-sans">
            Zero-dependency header with INT8 Flash weights and static contiguous SRAM execution loops (0 malloc).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-[#13171F] hover:bg-[#161B22] text-[#F0F6FC] border border-[#21262D] text-xs font-mono rounded-[3px] flex items-center gap-1.5 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#00FFA3]" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#38BDF8]" /> Copy Code
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="px-3 py-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white border border-[#38BDF8]/40 text-xs font-mono font-bold rounded-[3px] flex items-center gap-1.5 transition shadow-glow-cyan"
          >
            <Download className="w-3.5 h-3.5" /> Export Header (.h)
          </button>
        </div>
      </div>

      {/* Target Language Selector */}
      <div className="flex items-center gap-2 bg-[#0D1117] p-1.5 rounded-[4px] border border-[#21262D] overflow-x-auto">
        {targetTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChangeTarget(tab.id)}
            className={`px-3 py-1 text-xs font-mono rounded-[3px] transition flex items-center gap-2 whitespace-nowrap ${
              targetLanguage === tab.id
                ? 'bg-[#0284C7] text-white font-bold shadow-sm'
                : 'text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#13171F]'
            }`}
          >
            <span>{tab.label}</span>
            <span className="text-[9px] opacity-75 uppercase">[{tab.badge}]</span>
          </button>
        ))}
      </div>

      {/* Code Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 bg-[#0A0D12] border border-[#21262D] rounded-[4px] p-4 font-mono text-xs text-[#F0F6FC] overflow-auto h-[490px] leading-relaxed select-text shadow-inner">
          <pre>
            <code>{code}</code>
          </pre>
        </div>

        {/* Flashing Instructions */}
        <div className="lg:col-span-4 bg-[#13171F] border border-[#21262D] rounded-[4px] p-4 flex flex-col justify-between h-[490px]">
          <div>
            <div className="flex items-center gap-2 border-b border-[#21262D] pb-2.5 mb-3">
              <Sparkles className="w-4 h-4 text-[#00FFA3]" />
              <h3 className="text-xs font-bold text-[#F0F6FC] font-mono uppercase">
                EMBEDDED FLASHING GUIDE ({targetHw.name})
              </h3>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-2.5 bg-[#0A0D12] border border-[#21262D] rounded-[3px]">
                <span className="text-[10px] text-[#38BDF8] font-bold block mb-1">1. COPY HEADER FILE</span>
                <p className="text-[11px] text-[#8B949E] font-sans">
                  Drop <code className="text-[#00FFA3] bg-[#161B22] px-1 rounded font-mono">shannon_model.h</code> directly into your Arduino sketch or ESP-IDF <code className="text-[#00FFA3] bg-[#161B22] px-1 rounded font-mono">main/</code> source folder.
                </p>
              </div>

              <div className="p-2.5 bg-[#0A0D12] border border-[#21262D] rounded-[3px]">
                <span className="text-[10px] text-[#38BDF8] font-bold block mb-1">2. INVOKE INFERENCE LOOP</span>
                <pre className="text-[10px] text-[#F0F6FC] bg-[#161B22] p-2 rounded border border-[#21262D] mt-1 leading-snug">
{`#include "shannon_model.h"

// Zero heap allocation!
int res = shannon_run_inference(
    sensor_int8_buffer, 
    model_output_buffer
);`}
                </pre>
              </div>

              <div className="p-2.5 bg-[#0A0D12] border border-[#21262D] rounded-[3px]">
                <span className="text-[10px] text-[#38BDF8] font-bold block mb-1">3. COMPILE & FLASH FIRMWARE</span>
                <p className="text-[11px] text-[#8B949E] font-sans">
                  Compile with compiler flag <code className="text-[#00FFA3] bg-[#161B22] px-1 rounded font-mono">-O3</code>. The binary runs bare-metal without TensorFlow Lite Micro or ONNX runtime overhead.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#21262D] text-[10px] font-mono text-[#00FFA3] flex items-center justify-between">
            <span>ZERO PYTHON ON DEVICE (PURE C99)</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};