import React, { useState, useRef } from 'react';
import { Upload, FileCode, Play, AlertCircle, ArrowRight } from 'lucide-react';
import { useCompiler } from '../../context/CompilerContext';
import { Panel } from '../ui/Panel';

export const ImportView: React.FC = () => {
  const { uploadCustomModel, isCompiling, compilationError, loadedModel, setActiveTab } = useCompiler();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [jsonText, setJsonText] = useState(`{
  "name": "Custom_Gesture_Model",
  "input_shape": [1, 3, 32],
  "layers": [
    { "type": "Conv1D", "filters": 16, "kernel_size": 3, "activation": "relu" },
    { "type": "MaxPool1D", "pool_size": 2 },
    { "type": "Dense", "units": 8, "activation": "relu" },
    { "type": "Dense", "units": 4, "activation": "softmax" }
  ]
}`);

  const [parseError, setParseError] = useState<string | null>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadCustomModel(e.dataTransfer.files[0], true);
    }
  };

  const handleManualCompileJson = () => {
    setParseError(null);
    try {
      JSON.parse(jsonText);
      const file = new File([jsonText], 'custom_graph.json', { type: 'application/json' });
      uploadCustomModel(file, true);
    } catch (err: any) {
      setParseError(err.message || 'Invalid JSON syntax');
    }
  };

  return (
    <div className="p-6 space-y-6 w-full max-w-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-semibold">
            <Upload className="w-4 h-4" />
            <span>MODEL INGESTION WORKSTATION</span>
          </div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">Import Custom Model</h1>
          <p className="text-xs text-text-secondary max-w-4xl">
            Upload genuine ONNX computation graphs (<code>.onnx</code>) or structured JSON layer definitions. Graphs are validated strictly with zero silent fallbacks.
          </p>
        </div>

        {loadedModel?.isCustom && (
          <button
            onClick={() => setActiveTab('graph')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-primary hover:bg-primary-hover text-white text-xs font-bold self-start transition-all cursor-pointer"
          >
            <span>View Imported DAG</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Col: Drag & Drop Dropzone */}
        <div className="space-y-6">
          <Panel title="Drag & Drop Ingestion (.onnx, .json)">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-border hover:border-primary rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-surface-raised/30 space-y-3"
            >
              <div className="w-12 h-12 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-primary">
                <FileCode className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-text-primary">Click to Browse or Drag File Here</h3>
                <p className="text-xs text-text-secondary">Genuine ONNX Protobuf parser (.onnx) and JSON layer graphs</p>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-surface border border-border text-[11px] font-mono text-text-muted">
                Zero Cloud Upload - Parsed & Compiled In-Browser
              </span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  uploadCustomModel(e.target.files[0], true);
                }
              }}
              accept=".json,.onnx"
              className="hidden"
            />

            {(compilationError || parseError) && (
              <div className="mt-4 p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Ingestion Error:</strong>
                  <div className="font-mono text-xs mt-0.5">{compilationError || parseError}</div>
                </div>
              </div>
            )}
          </Panel>
        </div>

        {/* Right Col: Interactive JSON Layer Schema Editor */}
        <div className="space-y-6">
          <Panel
            title="Layer Graph JSON Editor"
            subtitle="Define custom layers and compile instantly"
            headerRight={
              <button
                onClick={handleManualCompileJson}
                disabled={isCompiling}
                className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all cursor-pointer"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Compile JSON</span>
              </button>
            }
          >
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={14}
              className="w-full font-mono text-xs p-3 rounded-lg bg-canvas border border-border text-text-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none custom-scrollbar leading-relaxed"
              spellCheck={false}
            />
          </Panel>
        </div>
      </div>
    </div>
  );
};
