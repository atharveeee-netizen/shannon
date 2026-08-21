import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, Terminal } from 'lucide-react';

interface Props {
  headerCode: string;
  modelName: string;
  targetHardware: string;
}

export const CodeViewer: React.FC<Props> = ({ headerCode, modelName, targetHardware }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(headerCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([headerCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `shannon_${modelName.toLowerCase()}.h`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col h-[420px] overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
        <div className="flex items-center space-x-2">
          <FileCode className="h-4 w-4 text-emerald-400" />
          <span className="font-mono text-xs font-semibold text-slate-200">
            shannon_{modelName.toLowerCase()}.h
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
            Zero-Dependency C/C++
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-mono font-bold transition-colors shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download .H</span>
          </button>
        </div>
      </div>

      {/* Code Area */}
      <div className="flex-1 p-3.5 overflow-auto bg-slate-950 font-mono text-[11px] text-emerald-300/90 leading-relaxed">
        <pre className="whitespace-pre">
          <code>{headerCode}</code>
        </pre>
      </div>
    </div>
  );
};