import React, { useState } from 'react';
import { Terminal, Download, Copy, Trash2, Check } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  message: string;
}

export const LogsView: React.FC = () => {
  const [filter, setFilter] = useState<'ALL' | 'INFO' | 'WARNING' | 'ERROR'>('ALL');
  const [copied, setCopied] = useState(false);

  const initialLogs: LogEntry[] = [
    { timestamp: '17:42:01.104', level: 'INFO', message: 'Shannon TinyML Compiler Studio initialized' },
    { timestamp: '17:42:01.112', level: 'INFO', message: 'Target hardware loaded: STM32H7 (ARM Cortex-M7 @ 480MHz)' },
    { timestamp: '17:42:01.150', level: 'INFO', message: 'Ingested model graph: KeywordSpotter_v1 (1D Depthwise CNN)' },
    { timestamp: '17:42:01.182', level: 'INFO', message: 'AST Validator: Parsed 4 computational operators with word alignment' },
    { timestamp: '17:42:01.210', level: 'INFO', message: 'Running symmetric INT8 post-training quantization (Jacob et al.)' },
    { timestamp: '17:42:01.245', level: 'SUCCESS', message: 'Quantization complete: 96,256 B (FP32) -> 24,576 B (INT8) [-74.5% Flash saved]' },
    { timestamp: '17:42:01.290', level: 'INFO', message: 'Starting Greedy Interval Graph Coloring on activation buffer lifetimes' },
    { timestamp: '17:42:01.320', level: 'SUCCESS', message: 'Tensor arena scheduled: 1,120 Bytes pinned to static offset 0x20000000' },
    { timestamp: '17:42:01.340', level: 'SUCCESS', message: 'MISRA-C:2012 Rule 21.3 check: 0 calls to malloc/calloc/free detected' },
    { timestamp: '17:42:01.380', level: 'INFO', message: 'Emitting standalone C/C++ header: shannon_model.h with 4-way SIMD loop unrolling' },
    { timestamp: '17:42:01.420', level: 'SUCCESS', message: 'ARM GCC 12.3 AST dry-run build: 0 errors, 0 warnings' },
    { timestamp: '17:42:01.460', level: 'SUCCESS', message: 'Numerical parity validation: Max Absolute Error = 0.00312 (100% Agreement)' },
  ];

  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);

  const filteredLogs = logs.filter((l) => {
    if (filter === 'ALL') return true;
    if (filter === 'INFO') return l.level === 'INFO' || l.level === 'SUCCESS';
    return l.level === filter;
  });

  const handleCopy = () => {
    const text = filteredLogs.map((l) => `[${l.timestamp}] [${l.level}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = filteredLogs.map((l) => `[${l.timestamp}] [${l.level}] ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'shannon_compiler.log';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h2 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            Compiler Execution & Toolchain Logs
          </h2>
          <p className="text-text-secondary text-xs mt-0.5">
            Real-time pipeline diagnostics, graph traversal steps, memory allocations, and toolchain logs.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 bg-surface-raised hover:bg-surface-hover border border-border rounded text-xs text-text-secondary hover:text-text-primary transition flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-2.5 py-1 bg-primary hover:bg-primary-hover text-white rounded text-xs font-semibold transition flex items-center gap-1 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
          <button
            onClick={() => setLogs([])}
            className="p-1 bg-surface-raised hover:bg-surface-hover border border-border text-text-secondary hover:text-danger rounded transition"
            title="Clear Logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 font-mono text-xs">
        {(['ALL', 'INFO', 'WARNING', 'ERROR'] as const).map((lvl) => (
          <button
            key={lvl}
            onClick={() => setFilter(lvl)}
            className={`px-2.5 py-0.5 rounded text-xs transition border font-semibold ${
              filter === lvl
                ? 'bg-primary/10 border-primary text-primary'
                : 'bg-surface-raised border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            {lvl}
          </button>
        ))}
      </div>

      {/* Terminal Log Output Window */}
      <div className="bg-code text-code-text border border-border rounded p-3 font-mono text-xs max-h-[500px] overflow-y-auto space-y-1 select-text">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((l, i) => (
            <div key={i} className="flex items-start gap-2.5 leading-relaxed">
              <span className="text-text-muted/70 select-none">{l.timestamp}</span>
              <span
                className={`font-bold select-none px-1 rounded text-[10px] ${
                  l.level === 'SUCCESS'
                    ? 'bg-success-subtle text-success'
                    : l.level === 'ERROR'
                    ? 'bg-danger-subtle text-danger'
                    : l.level === 'WARNING'
                    ? 'bg-warning-subtle text-warning'
                    : 'bg-primary-subtle text-primary'
                }`}
              >
                {l.level}
              </span>
              <span className="text-code-text flex-1">{l.message}</span>
            </div>
          ))
        ) : (
          <div className="text-text-muted text-center py-8">No log entries matching filter.</div>
        )}
      </div>
    </div>
  );
};
