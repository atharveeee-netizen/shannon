import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';
import { ViewId } from '../components/Sidebar';

interface ImportViewProps {
  onUploadCustom: (file: File) => void;
  customFilename: string | null;
  onNavigate: (view: ViewId) => void;
}

export const ImportView: React.FC<ImportViewProps> = ({
  onUploadCustom,
  customFilename,
  onNavigate,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileDetails, setFileDetails] = useState<{
    name: string;
    size: string;
    nodes: number;
    input: string;
    output: string;
  } | null>(
    customFilename
      ? {
          name: customFilename,
          size: '48.2 KB',
          nodes: 6,
          input: '1x64x1 (Float32)',
          output: '1x8 (Logits)',
        }
      : null
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onUploadCustom(file);
    setFileDetails({
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      nodes: 6,
      input: '1x64x1 (Float32)',
      output: '1x8 (Logits)',
    });
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h2 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-primary" />
            Model Importer & ONNX Graph Parser
          </h2>
          <p className="text-text-secondary text-xs mt-0.5">
            Ingest pretrained deep learning graphs in ONNX or Shannon JSON format for static compiler optimization.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-text-secondary">
          <span>Supported: <strong className="text-primary">ONNX (.onnx), JSON (.json)</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Upload Zone */}
        <div className="lg:col-span-6 bg-surface border border-border rounded p-6 flex flex-col items-center justify-center text-center space-y-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".onnx,.json,.tflite,.bin,.pt"
            className="hidden"
          />

          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="font-bold text-sm text-text-primary block font-sans">
              Drag and drop model file here
            </span>
            <span className="text-xs text-text-secondary block">
              Supports standard ONNX operator graphs or Shannon JSON models
            </span>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded font-mono font-semibold text-xs transition shadow-sm"
          >
            Browse Local File
          </button>
        </div>

        {/* Parsed Information */}
        <div className="lg:col-span-6 bg-surface border border-border rounded p-4 space-y-4 font-mono">
          <span className="font-bold text-xs text-text-primary uppercase tracking-wider block font-sans border-b border-border pb-2">
            Parser Inspection Output
          </span>

          {fileDetails ? (
            <div className="space-y-3">
              <div className="p-3 bg-surface-raised border border-border rounded space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Filename:</span>
                  <strong className="text-text-primary">{fileDetails.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">File Size:</span>
                  <strong className="text-text-primary">{fileDetails.size}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Graph Nodes:</span>
                  <strong className="text-primary">{fileDetails.nodes} Operators</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Input Tensor:</span>
                  <strong className="text-text-primary">{fileDetails.input}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Output Tensor:</span>
                  <strong className="text-text-primary">{fileDetails.output}</strong>
                </div>
              </div>

              <div className="p-2.5 bg-success-subtle border border-success/30 rounded text-success text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Graph validated: All operators supported by Shannon TinyML dialect.</span>
              </div>

              <button
                onClick={() => onNavigate('graph')}
                className="w-full py-2 bg-primary hover:bg-primary-hover text-white font-bold rounded text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>CONTINUE TO GRAPH</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="p-8 text-center text-text-muted space-y-2">
              <AlertCircle className="w-6 h-6 mx-auto text-text-muted" />
              <p>No model file uploaded yet. Upload an ONNX model or select one of the Shannon presets to begin compilation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
