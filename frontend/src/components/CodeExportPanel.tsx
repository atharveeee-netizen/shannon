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
      {/* Panel Top Header */}
      <div className="flex items-center justify-between border-b border-palantir-border pb-3">
        <div>
          <h2 className="text-lg font-semibold text-palantir-textPrimary font-mono flex items-center gap-2">
            <Code className="w-4 h-4 text-palantir-cobalt" />
            STANDALONE ZERO-DEPENDENCY C/C++ FIRMWARE EXPORTER
          </h2>
          <p className="text-xs text-palantir-textSecondary font-sans">
            Ready-to-flash static header files with INT8 arrays in Flash ROM and zero-malloc SRAM execution loops.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-palantir-card hover:bg-palantir-nav text-palantir-textPrimary border border-palantir-border text-xs font-mono rounded-[3px] flex items-center gap-1.5 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-palantir-pass" /> Copied Code!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy Code
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="px-3.5 py-1.5 bg-palantir-action hover:bg-palantir-actionHover text-palantir-textPrimary border border-palantir-cobalt/50 text-xs font-mono font-semibold rounded-[3px] flex items-center gap-1.5 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Export Source Header
          </button>
        </div>
      </div>

      {/* Target Language Switcher */}
      <div className="flex items-center gap-2 border-b border-palantir-border pb-2 bg-palantir-nav p-1.5 rounded-[3px]">
        {targetTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChangeTarget(tab.id)}
            className={`px-3 py-1 text-xs font-mono rounded-[2px] transition flex items-center gap-2 ${
              targetLanguage === tab.id
                ? 'bg-palantir-action text-palantir-textPrimary font-bold shadow-sm'
                : 'text-palantir-textSecondary hover:text-palantir-textPrimary hover:bg-palantir-card'
            }`}
          >
            <span>{tab.label}</span>
            <span className="text-[9px] opacity-60 uppercase">[{tab.badge}]</span>
          </button>
        ))}
      </div>

      {/* Code Editor Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 bg-palantir-canvas border border-palantir-border rounded-[3px] p-4 font-mono text-xs text-palantir-textPrimary overflow-auto h-[480px] leading-relaxed select-text">
          <pre>
            <code>{code}</code>
          </pre>
        </div>

        {/* Flashing Instructions Sidebar */}
        <div className="lg:col-span-4 bg-palantir-card border border-palantir-border rounded-[3px] p-4 flex flex-col justify-between h-[480px]">
          <div>
            <div className="flex items-center gap-2 border-b border-palantir-border pb-2.5 mb-3">
              <Sparkles className="w-4 h-4 text-palantir-pass" />
              <h3 className="text-xs font-semibold text-palantir-textPrimary font-mono uppercase">
                FLASHING GUIDE ({targetHw.name})
              </h3>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-2.5 bg-palantir-canvas border border-palantir-border rounded-[2px]">
                <span className="text-[10px] text-palantir-cobalt font-bold block mb-1">STEP 1: INCLUDE HEADER</span>
                <p className="text-[11px] text-palantir-textSecondary">
                  Copy <code className="text-palantir-pass bg-palantir-nav px-1 rounded">shannon_model.h</code> into your Arduino sketch or ESP-IDF <code className="text-palantir-pass bg-palantir-nav px-1 rounded">main/</code> folder.
                </p>
              </div>

              <div className="p-2.5 bg-palantir-canvas border border-palantir-border rounded-[2px]">
                <span className="text-[10px] text-palantir-cobalt font-bold block mb-1">STEP 2: RUN INFERENCE</span>
                <pre className="text-[10px] text-palantir-textPrimary bg-palantir-nav p-1.5 rounded border border-palantir-border/60 mt-1">
{`shannon_run_inference(
    sensor_input, 
    model_output
);`}
                </pre>
              </div>

              <div className="p-2.5 bg-palantir-canvas border border-palantir-border rounded-[2px]">
                <span className="text-[10px] text-palantir-cobalt font-bold block mb-1">STEP 3: COMPILE & FLASH</span>
                <p className="text-[11px] text-palantir-textSecondary">
                  Compile with optimization flag <code className="text-palantir-pass bg-palantir-nav px-1 rounded">-O3</code>. Standalone binary with zero external library overhead!
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-palantir-border/80 text-[10px] font-mono text-palantir-pass flex items-center justify-between">
            <span>ZERO PYTHON ON DEVICE</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};