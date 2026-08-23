import React, { useRef } from 'react';
import { HardwareProfile, PresetModel } from '../types';
import { Loader2 } from 'lucide-react';

interface CompilerControlsProps {
  models: PresetModel[];
  selectedModelId: string;
  onSelectModel: (id: string) => void;
  customFilename: string | null;
  onUploadCustom: (file: File) => void;
  hardwareList: HardwareProfile[];
  selectedHwId: string;
  onSelectHardware: (id: string) => void;
  isCompiling: boolean;
  onCompile: () => void;
}

export const CompilerControls: React.FC<CompilerControlsProps> = ({
  models,
  selectedModelId,
  onSelectModel,
  customFilename,
  onUploadCustom,
  hardwareList,
  selectedHwId,
  onSelectHardware,
  isCompiling,
  onCompile,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadCustom(e.target.files[0]);
    }
  };

  return (
    <div className="border-b border-border pb-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
        {/* Model Selector */}
        <div className="sm:col-span-5 space-y-1.5">
          <label className="block text-xs text-text-secondary font-medium">
            Model
          </label>
          <div className="flex items-center gap-2">
            <select
              value={customFilename ? 'custom' : selectedModelId}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  fileInputRef.current?.click();
                } else {
                  onSelectModel(e.target.value);
                }
              }}
              className="w-full bg-surface border border-border rounded-[3px] px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-border-strong cursor-pointer"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.input_shape})
                </option>
              ))}
              {customFilename && (
                <option value="custom">Custom: {customFilename}</option>
              )}
            </select>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 bg-surface-raised hover:bg-surface-hover border border-border rounded-[3px] text-xs text-text-secondary hover:text-text-primary whitespace-nowrap transition"
            >
              {customFilename ? 'Change file' : 'Upload ONNX'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".onnx,.tflite,.pt"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Target Hardware Selector */}
        <div className="sm:col-span-5 space-y-1.5">
          <label className="block text-xs text-text-secondary font-medium">
            Target Hardware
          </label>
          <select
            value={selectedHwId}
            onChange={(e) => onSelectHardware(e.target.value)}
            className="w-full bg-surface border border-border rounded-[3px] px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-border-strong cursor-pointer"
          >
            {hardwareList.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} — {h.sram_kb} KB SRAM, {h.flash_mb} MB Flash ({h.arch})
              </option>
            ))}
          </select>
        </div>

        {/* Primary Compile Action */}
        <div className="sm:col-span-2">
          <button
            onClick={onCompile}
            disabled={isCompiling}
            className="w-full px-4 py-1.5 bg-text-primary hover:opacity-90 text-canvas text-xs font-medium rounded-[3px] transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isCompiling ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Compiling</span>
              </>
            ) : (
              <span>Compile</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};