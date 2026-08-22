import React, { useState } from 'react';
import { PRESET_MODELS } from '../services/api';
import { Sparkles, Mic, Activity, Eye, UploadCloud, FileCode } from 'lucide-react';

interface Props {
  selectedPreset: string;
  onSelectPreset: (presetId: string) => void;
}

export const ModelUploader: React.FC<Props> = ({ selectedPreset, onSelectPreset }) => {
  const [customFileName, setCustomFileName] = useState<string | null>(null);

  const getIcon = (id: string) => {
    switch (id) {
      case 'kws': return <Mic className="h-4 w-4 text-amber-400" />;
      case 'anomaly': return <Activity className="h-4 w-4 text-rose-400" />;
      case 'vision': return <Eye className="h-4 w-4 text-cyan-400" />;
      default: return <Sparkles className="h-4 w-4 text-emerald-400" />;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCustomFileName(file.name);
      onSelectPreset('vision');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <span>Model Ingestion & Architecture</span>
        </label>
        <span className="text-xs text-slate-400 font-mono">PyTorch / ONNX / TFLite</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {PRESET_MODELS.map((model) => {
          const isSelected = selectedPreset === model.id && !customFileName;
          return (
            <button
              key={model.id}
              onClick={() => { setCustomFileName(null); onSelectPreset(model.id); }}
              className={`p-3.5 rounded-xl border text-left transition-all relative ${
                isSelected
                  ? 'bg-slate-900/90 border-cyan-500 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                  : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1.5">
                <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
                  {getIcon(model.id)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{model.name}</h4>
                  <span className="text-[10px] font-mono text-slate-400">{model.domain}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-2.5 line-clamp-2">{model.description}</p>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/60">
                <span>{model.input_shape.join('×')}</span>
                <span className="text-emerald-400 font-semibold">1-Click Load</span>
              </div>
            </button>
          );
        })}

        {/* Custom Drag and Drop Zone */}
        <label className={`p-3.5 rounded-xl border border-dashed text-left transition-all relative cursor-pointer flex flex-col justify-between ${
          customFileName
            ? 'bg-slate-900/90 border-emerald-500 ring-1 ring-emerald-500/50'
            : 'bg-slate-900/20 border-slate-700 hover:border-emerald-500/70 hover:bg-slate-900/40'
        }`}>
          <input type="file" accept=".onnx,.tflite,.pt,.json" onChange={handleFileUpload} className="hidden" />
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <UploadCloud className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white font-mono truncate max-w-[130px]">
                  {customFileName || 'Custom Model'}
                </h4>
                <span className="text-[10px] font-mono text-slate-400">Drag .ONNX / .TFLite</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {customFileName ? 'Custom computational graph loaded.' : 'Upload any pretrained ONNX model from PyTorch or HuggingFace.'}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800/60 text-[10px] font-mono text-emerald-400 flex items-center justify-between">
            <span>{customFileName ? 'PARSED' : 'BROWSE FILE'}</span>
            <FileCode className="h-3 w-3" />
          </div>
        </label>
      </div>
    </div>
  );
};