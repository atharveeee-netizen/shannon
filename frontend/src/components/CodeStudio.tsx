import React, { useState } from 'react';
import { TargetLanguage } from '../types';
import { Code, Copy, Download, Check } from 'lucide-react';

interface CodeStudioProps {
  code: string;
  targetLanguage: TargetLanguage;
  onChangeTarget: (target: TargetLanguage) => void;
}

export const CodeStudio: React.FC<CodeStudioProps> = ({
  code,
  targetLanguage,
  onChangeTarget,
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

  const targets: { id: TargetLanguage; label: string; badge: string }[] = [
    { id: 'cpp_esp32', label: 'C++ (ESP32-S3)', badge: 'Xtensa PIE SIMD' },
    { id: 'cpp_stm32', label: 'C/C++ (STM32H7)', badge: 'ARM CMSIS-NN' },
    { id: 'rust_embedded', label: 'Embedded Rust', badge: 'no_std / Cortex-M' },
    { id: 'micropython', label: 'MicroPython C-Module', badge: 'RP2040 Pico' },
  ];

  return (
    <div className="w-full h-[580px] bg-slate-950/80 rounded-xl border border-slate-800 backdrop-blur-md p-4 flex flex-col gap-3 overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
            MULTI-TARGET BARE-METAL FIRMWARE COMPILER
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 flex items-center gap-1 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy Code
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="px-2.5 py-1 text-xs font-medium bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 rounded flex items-center gap-1 transition"
          >
            <Download className="w-3.5 h-3.5" /> Export Source Header
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
        {targets.map((t) => (
          <button
            key={t.id}
            onClick={() => onChangeTarget(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition flex items-center gap-2 ${
              targetLanguage === t.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'bg-slate-900/40 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span>{t.label}</span>
            <span className="text-[9px] text-slate-500 uppercase">{t.badge}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 bg-slate-950 rounded-lg border border-slate-800 p-3 overflow-auto font-mono text-xs text-slate-200 leading-relaxed select-text">
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};