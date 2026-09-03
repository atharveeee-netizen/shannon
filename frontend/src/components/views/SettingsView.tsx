import React, { useState } from 'react';
import { Settings, Moon, Sun, CheckCircle2 } from 'lucide-react';
import { useCompiler } from '../../context/CompilerContext';
import { Panel } from '../ui/Panel';

export const SettingsView: React.FC = () => {
  const { isDarkMode, setIsDarkMode } = useCompiler();

  const [alignment, setAlignment] = useState<number>(4);
  const [baseAddressHex, setBaseAddressHex] = useState<string>('0x20000000');
  const [quantMode, setQuantMode] = useState<'symmetric' | 'asymmetric'>('symmetric');

  return (
    <div className="p-6 space-y-6 w-full max-w-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-semibold">
            <Settings className="w-4 h-4" />
            <span>STUDIO & COMPILER CONFIGURATION</span>
          </div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">Compiler Settings</h1>
          <p className="text-xs text-text-secondary max-w-4xl">
            Tune memory arena alignment, physical base section offsets, and quantization pass parameters.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compiler Flags */}
        <Panel title="Memory Arena Allocator Flags" subtitle="Hardware memory layout parameters">
          <div className="space-y-4 text-xs font-mono">
            <div className="space-y-1.5">
              <label className="text-text-secondary block font-medium">Tensor Arena Memory Alignment:</label>
              <select
                value={alignment}
                onChange={(e) => setAlignment(Number(e.target.value))}
                className="w-full bg-surface-raised border border-border rounded-md p-2.5 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value={4}>4-Byte Word Alignment (32-bit ARM Cortex / Xtensa Native)</option>
                <option value={8}>8-Byte Double Word Alignment (64-bit / DMA Native)</option>
                <option value={16}>16-Byte Quad Word (Vector SIMD)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-text-secondary block font-medium">Physical Base Address Offset (Hex):</label>
              <input
                type="text"
                value={baseAddressHex}
                onChange={(e) => setBaseAddressHex(e.target.value)}
                className="w-full bg-surface-raised border border-border rounded-md p-2.5 text-text-primary font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-text-secondary block font-medium">Quantization Calibration Scheme:</label>
              <div className="grid grid-cols-2 gap-2 font-sans">
                <button
                  onClick={() => setQuantMode('symmetric')}
                  className={`p-2.5 rounded-md border text-center text-xs transition-all cursor-pointer ${
                    quantMode === 'symmetric'
                      ? 'bg-primary/15 border-primary text-primary font-bold'
                      : 'bg-surface-raised border-border text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Symmetric (Z = 0)
                </button>
                <button
                  onClick={() => setQuantMode('asymmetric')}
                  className={`p-2.5 rounded-md border text-center text-xs transition-all cursor-pointer ${
                    quantMode === 'asymmetric'
                      ? 'bg-primary/15 border-primary text-primary font-bold'
                      : 'bg-surface-raised border-border text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Asymmetric (Z &ne; 0)
                </button>
              </div>
            </div>
          </div>
        </Panel>

        {/* IDE Preferences */}
        <Panel title="IDE Appearance & Environment" subtitle="Theme and workstation settings">
          <div className="space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div>
                <div className="text-text-primary font-bold text-sm">Theme Mode</div>
                <div className="text-text-secondary text-xs font-sans mt-0.5">Matte Graphite EDA / Light Studio</div>
              </div>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface-raised hover:bg-surface-hover border border-border text-text-primary text-xs font-medium transition-colors cursor-pointer"
              >
                {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-primary" />}
                <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>

            <div className="space-y-2 text-text-secondary font-sans text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Static BSS Arena Memory Model Active (0 B Malloc)</span>
              </div>
              <p className="text-xs leading-relaxed text-text-secondary">
                The compiler automatically enforces zero dynamic heap allocations (<code>malloc</code>, <code>calloc</code>, <code>free</code>) for all output embedded C code.
              </p>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
};
