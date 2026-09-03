import React, { useState, useEffect, useRef } from 'react';
import {
  FileCode,
  Download,
  Copy,
  Check,
  Search,
  CheckCircle2,
  RotateCcw,
  Edit3,
  Eye,
} from 'lucide-react';
import { useCompiler } from '../../context/CompilerContext';
import { EmptyState } from '../ui/EmptyState';

export const CodeGenView: React.FC = () => {
  const { loadedModel, compilationResult } = useCompiler();
  const [copied, setCopied] = useState(false);
  const [searchCode, setSearchCode] = useState('');
  const [isEditMode, setIsEditMode] = useState(true);
  const [userCode, setUserCode] = useState('');
  const [isModified, setIsModified] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  // Sync userCode when a new compilation completes
  useEffect(() => {
    if (compilationResult?.c_header_code) {
      setUserCode(compilationResult.c_header_code);
      setIsModified(false);
    }
  }, [compilationResult?.c_header_code]);

  if (!loadedModel || !compilationResult || !compilationResult.c_header_code) {
    return (
      <div className="p-6 w-full max-w-none">
        <EmptyState
          title="Generated C Header Not Available"
          description="Compile a model to emit standalone ANSI C99 inference code with zero runtime heap allocation (malloc = 0 B)."
          allowCompile={true}
        />
      </div>
    );
  }

  const generatedCode = compilationResult.c_header_code;
  const lines = userCode.split('\n');

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setUserCode(val);
    setIsModified(val !== generatedCode);
  };

  const handleReset = () => {
    setUserCode(generatedCode);
    setIsModified(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(userCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([userCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeName = compilationResult.model_name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    link.download = `shannon_${safeName}_model.h`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Synchronize textarea scroll with gutter
  const handleScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const filteredLines = searchCode
    ? lines.map((l, i) => ({ text: l, num: i + 1, match: l.toLowerCase().includes(searchCode.toLowerCase()) }))
    : lines.map((l, i) => ({ text: l, num: i + 1, match: false }));

  return (
    <div className="p-6 space-y-4 w-full max-w-none h-full flex flex-col">
      {/* 1. Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4 flex-shrink-0">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-semibold">
            <FileCode className="w-4 h-4" />
            <span>STANDALONE SILICON CODE GENERATION & LIVE EDITOR</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-text-primary tracking-tight">
              Header: <code>shannon_{compilationResult.model_name.toLowerCase()}_model.h</code>
            </h1>
            {isModified && (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-mono font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                User Modified
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View / Edit Mode Toggle */}
          <div className="flex items-center border border-border rounded-md bg-surface-raised p-0.5 text-xs font-mono">
            <button
              onClick={() => setIsEditMode(true)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors cursor-pointer ${
                isEditMode ? 'bg-primary text-white font-bold shadow-sm' : 'text-text-secondary hover:text-text-primary'
              }`}
              title="Interactive code editor with direct editing"
            >
              <Edit3 className="w-3 h-3" />
              <span>Editor</span>
            </button>
            <button
              onClick={() => setIsEditMode(false)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors cursor-pointer ${
                !isEditMode ? 'bg-primary text-white font-bold shadow-sm' : 'text-text-secondary hover:text-text-primary'
              }`}
              title="Read-only view with line search"
            >
              <Eye className="w-3 h-3" />
              <span>Viewer</span>
            </button>
          </div>

          {/* Reset if modified */}
          {isModified && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-surface-raised hover:bg-surface-hover border border-border text-amber-400 hover:text-amber-300 text-xs font-medium transition-colors cursor-pointer"
              title="Revert modifications to original compiler output"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          {/* Search in code (Viewer mode) */}
          {!isEditMode && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-2 pointer-events-none" />
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Find in source..."
                className="bg-surface-raised text-text-primary text-xs pl-8 pr-3 py-1.5 rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-primary font-mono w-40"
              />
            </div>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-raised hover:bg-surface-hover border border-border text-text-primary text-xs font-medium transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .h</span>
          </button>
        </div>
      </div>

      {/* 2. Main Full-Height Code Area */}
      <div className="flex-1 rounded-xl bg-surface border border-border overflow-hidden font-mono text-xs flex flex-col min-h-0">
        <div className="px-4 py-2 border-b border-border bg-surface-raised/60 flex items-center justify-between text-[11px] text-text-secondary flex-shrink-0">
          <div className="flex items-center gap-2">
            <span>ISO C99 / C++11 STANDALONE EMISSION</span>
            {isEditMode && (
              <span className="text-text-muted">(Edit mode — changes will be exported)</span>
            )}
          </div>
          <span>{lines.length} LINES | {(userCode.length / 1024).toFixed(1)} KB SOURCE</span>
        </div>

        {isEditMode ? (
          /* Interactive Code Editor with synchronized line numbering gutter */
          <div className="flex-1 flex overflow-hidden relative min-h-0 bg-canvas">
            {/* Gutter with line numbers */}
            <div
              ref={gutterRef}
              className="w-12 bg-surface-raised/30 border-r border-border py-4 px-2 select-none text-right text-text-muted font-mono text-xs overflow-hidden leading-relaxed opacity-60"
            >
              {lines.map((_, i) => (
                <div key={i} className="h-6">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Editable Textarea */}
            <textarea
              ref={textareaRef}
              value={userCode}
              onChange={handleCodeChange}
              onScroll={handleScroll}
              spellCheck={false}
              className="flex-1 bg-transparent text-text-primary p-4 font-mono text-xs leading-relaxed resize-none focus:outline-none custom-scrollbar whitespace-pre overflow-auto"
              style={{ tabSize: 4 }}
            />
          </div>
        ) : (
          /* Formatted Viewer with Search Match Highlighting */
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-canvas">
            {filteredLines.map((line) => (
              <div
                key={line.num}
                className={`flex items-start gap-4 py-0.5 px-2 rounded ${
                  line.match ? 'bg-primary/15 text-primary font-bold' : 'hover:bg-surface-raised/30 text-text-secondary'
                }`}
              >
                <span className="w-8 select-none text-text-muted text-right text-[11px] opacity-50">
                  {line.num}
                </span>
                <pre className="text-text-primary overflow-x-auto whitespace-pre leading-relaxed">{line.text}</pre>
              </div>
            ))}
          </div>
        )}

        {/* 3. Bottom Status Bar */}
        <div className="px-4 py-2.5 border-t border-border bg-surface flex flex-wrap items-center justify-between text-xs text-text-muted gap-2 flex-shrink-0 font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-success">
              <CheckCircle2 className="w-3 h-3" />
              <span>0 B dynamic</span>
            </span>
            <span>Arena: <strong className="text-text-primary">{(compilationResult.optimized_int8.peak_sram_bytes / 1024).toFixed(2)} KB</strong></span>
            <span>Flash: <strong className="text-text-primary">{(compilationResult.optimized_int8.flash_bytes / 1024).toFixed(1)} KB</strong></span>
          </div>
          <span>{compilationResult.target_hardware}</span>
        </div>
      </div>
    </div>
  );
};
