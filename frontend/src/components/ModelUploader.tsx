import React from 'react';
import { PRESET_MODELS } from '../services/api';
import { Sparkles, Mic, Activity, Eye, UploadCloud } from 'lucide-react';

interface Props {
  selectedPreset: string;
  onSelectPreset: (presetId: string) => void;
  onUploadCustom?: () => void;
}

export const ModelUploader: React.FC<Props> = ({ selectedPreset, onSelectPreset }) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'kws': return <Mic className="h-4 w-4 text-amber-400" />;
      case 'anomaly': return <Activity className="h-4 w-4 text-rose-400" />;
      case 'vision': return <Eye className="h-4 w-4 text-cyan-400" />;
      default: return <Sparkles className="h-4 w-4 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <span>Model Ingestion & Architecture</span>
        </label>
        <span className="text-xs text-slate-400 font-mono">PyTorch / ONNX / TinyML</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PRESET_MODELS.map((model) => {
          const isSelected = selectedPreset === model.id;
          return (
            <button
              key={model.id}
              onClick={() => onSelectPreset(model.id)}
              className={`p-4 rounded-xl border text-left transition-all relative ${
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
              <p className="text-xs text-slate-400 leading-relaxed mb-3">{model.description}</p>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/60">
                <span>Input: {model.input_shape.join('×')}</span>
                <span className="text-emerald-400 font-semibold">1-Click Load</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};