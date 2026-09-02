import React from 'react';
import { Box, Play } from 'lucide-react';
import { useCompiler } from '../../context/CompilerContext';
import { PRESET_MODELS } from '../../services/api';

export const ModelsView: React.FC = () => {
  const { loadedModel, loadPreset, setActiveTab, selectedHw } = useCompiler();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-accent">
            <Box className="w-4 h-4" />
            <span>MODEL ZOO & BENCHMARKS</span>
          </div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">Curated Production Models</h1>
          <p className="text-xs text-text-secondary">
            Verified TinyML deep learning models trained with PyTorch, quantized to INT8, and certified for zero-malloc MCU deployment.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('import')}
          className="px-3.5 py-1.5 rounded bg-surface-raised hover:bg-surface-hover border border-border text-text-primary text-xs font-medium self-start transition-colors"
        >
          + Import Custom Model
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PRESET_MODELS.map((model) => {
          const isSelected = loadedModel?.id === model.id;
          return (
            <div
              key={model.id}
              className={`rounded p-5 border transition-all flex flex-col justify-between space-y-4 ${
                isSelected
                  ? 'bg-surface border-accent ring-1 ring-accent'
                  : 'bg-surface border-border hover:border-border-strong hover:bg-surface-raised/40'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-accent uppercase tracking-wider">
                    {model.domain}
                  </span>
                  {isSelected && (
                    <span className="flex items-center gap-1.5 text-[11px] font-mono text-accent font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      ACTIVE
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-text-primary">{model.name}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">{model.description}</p>

                <div className="pt-3 border-t border-border space-y-1.5 text-xs font-mono text-text-secondary">
                  <div className="flex justify-between">
                    <span>Architecture:</span>
                    <span className="text-text-primary font-medium">{model.architecture}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dataset:</span>
                    <span className="text-text-primary">{model.dataset}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Input Tensor:</span>
                    <span className="text-accent">{model.input_shape}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => loadPreset(model.id, true)}
                  className={`w-full flex items-center justify-center gap-2 py-2 rounded text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-accent/15 text-accent border border-accent/30'
                      : 'bg-surface-raised hover:bg-accent hover:text-black border border-border text-text-primary'
                  }`}
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{isSelected ? 'Loaded & Active' : `Compile for ${selectedHw.name}`}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
