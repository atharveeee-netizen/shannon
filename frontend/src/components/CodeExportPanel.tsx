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
    { id: 'cpp_esp32', label: 'C++ (ESP32-S3)', badge: 'Xtensa PIE Vector SIMD' },
    { id: 'cpp_stm32', label: 'C/C++ (STM32H7)', badge: 'ARM CMSIS-NN' },
    { id: 'rust_embedded', label: 'Embedded Rust', badge: 'no_std / Cortex-M' },
    { id: 'micropython', label: 'MicroPython Module', badge: 'RP2040 Pico' },
  ];

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-[#232936] pb-3">
        <div>
          <h2 className="text-sm font-semibold text-[#F5F8FA] font-mono flex items-center gap-2 uppercase tracking-wide">
            <Code className="w-4 h-4 text-[#2B95D6]" />
            BARE METAL C/C++ FIRMWARE EXPORTER
          </h2>
          <p className="text-xs text-[#A7B6C2]">
            Standalone static header files with INT8 arrays in Flash ROM and zero malloc SRAM execution loops.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1 bg-[#1A1F28] hover:bg-[#232936] text-[#F5F8FA] border border-[#232936] text-xs font-mono rounded-[3px] flex items-center gap-1.5 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#0D8050]" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy Code
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="px-3 py-1 bg-[#106BA3] hover:bg-[#0E5A8A] text-[#F5F8FA] border border-[#2B95D6]/50 text-xs font-mono font-semibold rounded-[3px] flex items-center gap-1.5 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Export Header
          </button>
        </div>
      </div>

      {/* Target Language Selector */}
      <div className="flex items-center gap-2 border-b border-[#232936] pb-2 bg-[#12151B] p-1.5 rounded-[3px]">
        {targetTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChangeTarget(tab.id)}
            className={`px-3 py-1 text-xs font-mono rounded-[2px] transition flex items-center gap-2 ${
              targetLanguage === tab.id
                ? 'bg-[#106BA3] text-[#F5F8FA] font-bold shadow-sm'
                : 'text-[#A7B6C2] hover:text-[#F5F8FA] hover:bg-[#1A1F28]'
            }`}
          >
            <span>{tab.label}</span>
            <span className="text-[9px] opacity-60 uppercase">[{tab.badge}]</span>
          </button>
        ))}
      </div>

      {/* Code Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 bg-[#0B0D11] border border-[#232936] rounded-[3px] p-4 font-mono text-xs text-[#F5F8FA] overflow-auto h-[480px] leading-relaxed select-text">
          <pre>
            <code>{code}</code>
          </pre>
        </div>

        {/* Flashing Instructions */}
        <div className="lg:col-span-4 bg-[#1A1F28] border border-[#232936] rounded-[3px] p-4 flex flex-col justify-between h-[480px]">
          <div>
            <div className="flex items-center gap-2 border-b border-[#232936] pb-2.5 mb-3">
              <Sparkles className="w-4 h-4 text-[#0D8050]" />
              <h3 className="text-xs font-semibold text-[#F5F8FA] font-mono uppercase">
                DEPLOYMENT GUIDE ({targetHw.name})
              </h3>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-2.5 bg-[#0B0D11] border border-[#232936] rounded-[2px]">
                <span className="text-[10px] text-[#2B95D6] font-bold block mb-1">1. INCLUDE HEADER</span>
                <p className="text-[11px] text-[#A7B6C2]">
                  Copy <code className="text-[#0D8050] bg-[#12151B] px-1 rounded">shannon_model.h</code> into your Arduino sketch or ESP-IDF <code className="text-[#0D8050] bg-[#12151B] px-1 rounded">main/</code> folder.
                </p>
              </div>

              <div className="p-2.5 bg-[#0B0D11] border border-[#232936] rounded-[2px]">
                <span className="text-[10px] text-[#2B95D6] font-bold block mb-1">2. RUN INFERENCE</span>
                <pre className="text-[10px] text-[#F5F8FA] bg-[#12151B] p-1.5 rounded border border-[#232936]/60 mt-1">
{`shannon_run_inference(
    sensor_input, 
    model_output
);`}
                </pre>
              </div>

              <div className="p-2.5 bg-[#0B0D11] border border-[#232936] rounded-[2px]">
                <span className="text-[10px] text-[#2B95D6] font-bold block mb-1">3. COMPILE AND FLASH</span>
                <p className="text-[11px] text-[#A7B6C2]">
                  Compile with optimization flag <code className="text-[#0D8050] bg-[#12151B] px-1 rounded">-O3</code>. Standalone binary with zero external library overhead.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#232936] text-[10px] font-mono text-[#0D8050] flex items-center justify-between">
            <span>ZERO PYTHON ON DEVICE</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};