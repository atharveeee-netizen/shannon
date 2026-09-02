import React, { useState } from 'react';
import { Settings, Save, Check } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [optLevel, setOptLevel] = useState('-O3');
  const [baseAddr, setBaseAddr] = useState('0x20000000');
  const [wordAlign, setWordAlign] = useState(4);
  const [strictMisra, setStrictMisra] = useState(true);
  const [autoSimd, setAutoSimd] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h2 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" />
            Compiler Toolchain & Memory Directives
          </h2>
          <p className="text-text-secondary text-xs mt-0.5">
            Configure global code generator flags, memory arena base addresses, and MISRA-C safety compliance checks.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded font-mono font-semibold text-xs flex items-center gap-1.5 transition shadow-sm"
        >
          {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          <span>{saved ? 'Saved' : 'Save Directives'}</span>
        </button>
      </div>

      <div className="max-w-2xl bg-surface border border-border rounded p-5 space-y-4 font-mono">
        <div className="space-y-1">
          <label className="text-xs font-bold text-text-primary block font-sans">GCC Optimization Level</label>
          <select
            value={optLevel}
            onChange={(e) => setOptLevel(e.target.value)}
            className="w-full bg-surface-raised border border-border rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="-O3">-O3 (Aggressive Loop Unrolling & SIMD Inlining)</option>
            <option value="-Os">-Os (Optimize for Minimal Flash Code Size)</option>
            <option value="-O2">-O2 (Standard Embedded Optimization)</option>
            <option value="-O0">-O0 (Debug Non-Optimized)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-text-primary block font-sans">Base Physical SRAM Memory Address</label>
          <input
            type="text"
            value={baseAddr}
            onChange={(e) => setBaseAddr(e.target.value)}
            className="w-full bg-surface-raised border border-border rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
          />
          <span className="text-[10px] text-text-muted">Target MCU SRAM base address offset in hex</span>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-text-primary block font-sans">Bus Word Alignment (Bytes)</label>
          <select
            value={wordAlign}
            onChange={(e) => setWordAlign(parseInt(e.target.value) || 4)}
            className="w-full bg-surface-raised border border-border rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value={4}>4 Bytes (32-Bit ARM Cortex-M / Xtensa)</option>
            <option value={8}>8 Bytes (64-Bit / Double-Word Aligned)</option>
            <option value={2}>2 Bytes (16-Bit Half-Word)</option>
          </select>
        </div>

        <div className="pt-2 border-t border-border space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={strictMisra}
              onChange={(e) => setStrictMisra(e.target.checked)}
              className="accent-primary w-4 h-4 rounded"
            />
            <span className="font-bold text-xs text-text-primary font-sans">
              Enforce Strict MISRA-C:2012 Rule 21.3 (0-Malloc AST Verifier)
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoSimd}
              onChange={(e) => setAutoSimd(e.target.checked)}
              className="accent-primary w-4 h-4 rounded"
            />
            <span className="font-bold text-xs text-text-primary font-sans">
              Auto-Emit Vectorized 4-Way SIMD Loop Unrolling
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};
