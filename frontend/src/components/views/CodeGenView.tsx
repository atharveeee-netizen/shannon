import React, { useState } from 'react';
import { FileCode, Download, Copy, Check, Search, ShieldCheck } from 'lucide-react';
import { useCompiler } from '../../context/CompilerContext';
import { EmptyState } from '../ui/EmptyState';

export const CodeGenView: React.FC = () => {
  const { loadedModel, compilationResult, downloadHeader } = useCompiler();
  const [copied, setCopied] = useState(false);
  const [searchCode, setSearchCode] = useState('');

  if (!loadedModel || !compilationResult || !compilationResult.c_header_code) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <EmptyState
          title="Generated C Header Not Available"
          description="Compile a model to emit standalone, zero-dependency MISRA-C:2012 certified C code for microcontrollers."
          allowCompile={true}
        />
      </div>
    );
  }

  const code = compilationResult.c_header_code;
  const lines = code.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredLines = searchCode
    ? lines.map((l, i) => ({ text: l, num: i + 1, match: l.toLowerCase().includes(searchCode.toLowerCase()) }))
    : lines.map((l, i) => ({ text: l, num: i + 1, match: false }));

  return (
    <div className="p-6 space-y-4 max-w-7xl mx-auto h-full flex flex-col">
      {/* 1. Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4 flex-shrink-0">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-mono text-accent">
            <FileCode className="w-4 h-4" />
            <span>STANDALONE SILICON CODE GENERATION</span>
          </div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            Header: <code>shannon_{compilationResult.model_name.toLowerCase()}_model.h</code>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Search in code */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-2 pointer-events-none" />
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Find in source..."
              className="bg-surface-raised text-text-primary text-xs pl-8 pr-3 py-1.5 rounded border border-border focus:outline-none focus:ring-1 focus:ring-accent font-mono w-44"
            />
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-raised hover:bg-surface-hover border border-border text-text-primary text-xs font-medium transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={downloadHeader}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-accent hover:bg-accent-hover text-black text-xs font-bold shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .h</span>
          </button>
        </div>
      </div>

      {/* 2. Main Full-Height Code Viewer */}
      <div className="flex-1 rounded bg-code border border-border overflow-hidden font-mono text-xs flex flex-col min-h-0">
        <div className="px-4 py-2 border-b border-border bg-surface-raised/40 flex items-center justify-between text-[11px] text-text-secondary">
          <span>ISO C99 / C++11 STANDALONE EMISSION</span>
          <span>{lines.length} LINES | {(code.length / 1024).toFixed(1)} KB SOURCE</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {filteredLines.map((line) => (
            <div
              key={line.num}
              className={`flex items-start gap-4 py-0.5 px-2 rounded ${
                line.match ? 'bg-accent/15 text-accent font-bold' : 'hover:bg-surface-raised/30 text-text-secondary'
              }`}
            >
              <span className="w-8 select-none text-text-muted text-right text-[11px] opacity-50">
                {line.num}
              </span>
              <pre className="text-text-primary overflow-x-auto whitespace-pre leading-relaxed">{line.text}</pre>
            </div>
          ))}
        </div>

        {/* 3. Bottom Status Bar */}
        <div className="px-4 py-2.5 border-t border-border bg-surface-raised/40 flex flex-wrap items-center justify-between text-xs text-text-secondary gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>MISRA-C:2012 Rule 21.3 (0 B Malloc)</span>
            </span>
            <span>Static Arena: <strong className="text-cyan-400 font-mono">{compilationResult.optimized_int8.peak_sram_bytes} Bytes</strong></span>
            <span>Flash Weights: <strong className="text-text-primary font-mono">{compilationResult.optimized_int8.flash_bytes} Bytes</strong></span>
          </div>
          <span className="font-mono text-[11px] text-text-muted">Zero External Library Dependencies</span>
        </div>
      </div>
    </div>
  );
};
