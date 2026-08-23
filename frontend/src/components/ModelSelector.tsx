import React from 'react';
import { PresetModel } from '../types';
import { UploadCloud, Check } from 'lucide-react';

interface ModelSelectorProps {
  models: PresetModel[];
  selectedModelId: string;
  onSelectModel: (id: string) => void;
  customFilename: string | null;
  onUploadCustom: (file: File) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModelId,
  onSelectModel,
  customFilename,
  onUploadCustom,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadCustom(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-mono text-text-secondary">
        <span>1. SELECT NEURAL NETWORK MODEL</span>
        <span>Preset or custom ONNX</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
        {models.map((m) => {
          const isSelected = selectedModelId === m.id && !customFilename;
          return (
            <button
              key={m.id}
              onClick={() => onSelectModel(m.id)}
              className={`p-3 rounded-[3px] border text-left transition flex flex-col justify-between ${
                isSelected
                  ? 'bg-surface-raised border-border-strong text-text-primary ring-1 ring-border-strong'
                  : 'bg-surface border-border text-text-secondary hover:border-border-strong hover:text-text-primary'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-text-secondary uppercase">
                    {m.domain}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-success" />}
                </div>
                <h4 className="font-medium text-xs text-text-primary leading-snug">
                  {m.name}
                </h4>
              </div>

              <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-[10px] font-mono text-text-secondary">
                <span>Input: {m.input_shape}</span>
                <span>{m.architecture.split(' ')[0]}</span>
              </div>
            </button>
          );
        })}

        {/* Custom ONNX Upload Card */}
        <label
          className={`p-3 rounded-[3px] border border-dashed text-left cursor-pointer transition flex flex-col justify-between ${
            customFilename
              ? 'bg-surface-raised border-success text-text-primary ring-1 ring-success'
              : 'bg-surface border-border text-text-secondary hover:border-border-strong hover:text-text-primary'
          }`}
        >
          <input type="file" accept=".onnx,.tflite,.pt" onChange={handleFileChange} className="hidden" />
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-text-secondary uppercase">CUSTOM GRAPH</span>
              <UploadCloud className="w-3.5 h-3.5 text-text-secondary" />
            </div>
            <h4 className="font-medium text-xs text-text-primary truncate">
              {customFilename || 'Upload .ONNX'}
            </h4>
          </div>

          <div className="mt-3 pt-2 border-t border-border text-[10px] font-mono text-text-secondary">
            {customFilename ? 'Custom graph parsed' : 'Drop model file here'}
          </div>
        </label>
      </div>
    </div>
  );
};