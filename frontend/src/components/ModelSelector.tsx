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
      <div className="flex items-center justify-between text-xs font-mono text-[#8A8A84]">
        <span>SELECT NEURAL NETWORK MODEL</span>
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
                  ? 'bg-[#1A1A1A] border-[#F3F3EF] text-[#F3F3EF]'
                  : 'bg-[#111111] border-[#292929] text-[#8A8A84] hover:border-[#3D3D3D] hover:text-[#F3F3EF]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-[#8A8A84] uppercase">
                    {m.domain}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#0D8050]" />}
                </div>
                <h4 className="font-medium text-xs text-[#F3F3EF] leading-snug">
                  {m.name}
                </h4>
              </div>

              <div className="mt-3 pt-2 border-t border-[#292929] flex items-center justify-between text-[10px] font-mono text-[#8A8A84]">
                <span>Input: {m.input_shape}</span>
                <span>{m.architecture.split(' ')[0]}</span>
              </div>
            </button>
          );
        })}

        {/* Custom ONNX Drop Area */}
        <label
          className={`p-3 rounded-[3px] border border-dashed text-left cursor-pointer transition flex flex-col justify-between ${
            customFilename
              ? 'bg-[#1A1A1A] border-[#0D8050] text-[#F3F3EF]'
              : 'bg-[#111111] border-[#292929] text-[#8A8A84] hover:border-[#3D3D3D] hover:text-[#F3F3EF]'
          }`}
        >
          <input type="file" accept=".onnx,.tflite,.pt" onChange={handleFileChange} className="hidden" />
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-[#8A8A84] uppercase">CUSTOM GRAPH</span>
              <UploadCloud className="w-3.5 h-3.5 text-[#8A8A84]" />
            </div>
            <h4 className="font-medium text-xs text-[#F3F3EF] truncate">
              {customFilename || 'Upload .ONNX'}
            </h4>
          </div>

          <div className="mt-3 pt-2 border-t border-[#292929] text-[10px] font-mono text-[#8A8A84]">
            {customFilename ? 'Custom model parsed' : 'Drop model file here'}
          </div>
        </label>
      </div>
    </div>
  );
};