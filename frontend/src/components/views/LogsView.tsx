import React, { useState } from 'react';
import { Terminal, Copy, Check } from 'lucide-react';
import { useCompiler } from '../../context/CompilerContext';

export const LogsView: React.FC = () => {
  const { compilerLogs } = useCompiler();
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS'>('ALL');
  const [copied, setCopied] = useState(false);

  const filteredLogs = compilerLogs.filter((log) => {
    if (filterLevel === 'ALL') return true;
    return log.level === filterLevel;
  });

  const handleCopyLogs = () => {
    const text = compilerLogs.map((l) => `[${l.timestamp}] [${l.level}] ${l.stage ? `[${l.stage}] ` : ''}${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 space-y-4 max-w-7xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4 flex-shrink-0">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-mono text-accent">
            <Terminal className="w-4 h-4" />
            <span>COMPILER PIPELINE EXECUTION LOGS</span>
          </div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">Compiler Terminal Output</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Level Filter */}
          <div className="flex items-center border border-border rounded bg-surface text-xs font-mono">
            {(['ALL', 'INFO', 'WARN', 'ERROR', 'SUCCESS'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-2.5 py-1 text-xs transition-colors ${
                  filterLevel === lvl ? 'bg-surface-raised text-text-primary font-bold' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopyLogs}
            disabled={compilerLogs.length === 0}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-surface-raised hover:bg-surface-hover border border-border text-text-primary text-xs font-mono disabled:opacity-50 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Logs'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 rounded bg-code border border-border overflow-hidden font-mono text-xs flex flex-col min-h-0">
        <div className="px-4 py-2 border-b border-border bg-surface-raised/40 flex items-center justify-between text-[11px] text-text-secondary">
          <span>PIPELINE LOG STREAM</span>
          <span>{filteredLogs.length} LOG ENTRIES</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
          {filteredLogs.length === 0 ? (
            <div className="py-20 text-center text-text-muted">
              No compilation logs recorded. Trigger a compilation pipeline to view execution trace.
            </div>
          ) : (
            filteredLogs.map((log) => {
              let color = 'text-text-secondary';
              if (log.level === 'SUCCESS') color = 'text-emerald-400 font-medium';
              if (log.level === 'WARN') color = 'text-amber-400 font-medium';
              if (log.level === 'ERROR') color = 'text-rose-400 font-bold';
              if (log.level === 'INFO') color = 'text-text-primary';

              return (
                <div key={log.id} className="flex items-start gap-3 py-0.5 hover:bg-surface-raised/30 px-2 rounded">
                  <span className="text-text-muted select-none text-[11px] w-20 flex-shrink-0">{log.timestamp}</span>
                  <span
                    className={`select-none text-[11px] font-bold w-14 flex-shrink-0 ${
                      log.level === 'SUCCESS' ? 'text-emerald-400' : log.level === 'ERROR' ? 'text-rose-400' : 'text-cyan-400'
                    }`}
                  >
                    [{log.level}]
                  </span>
                  {log.stage && <span className="text-accent text-[11px] font-medium select-none">[{log.stage}]</span>}
                  <span className={`${color} leading-relaxed`}>{log.message}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
