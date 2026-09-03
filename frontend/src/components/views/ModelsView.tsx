import React from 'react';
import { Box, Play, CheckCircle2 } from 'lucide-react';
import { useCompiler } from '../../context/CompilerContext';
import { PRESET_MODELS } from '../../services/api';
import { SpotlightCard } from '../react-bits/SpotlightCard';

export const ModelsView: React.FC = () => {
  const { loadedModel, loadPreset, setActiveTab, selectedHw } = useCompiler();

  return (
    <div className="p-6 space-y-6 w-full max-w-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-semibold">
            <Box className="w-4 h-4" />
            <span>REFERENCE MODELS & TOPOLOGIES</span>
          </div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">Curated Reference Topologies</h1>
          <p className="text-xs text-text-secondary max-w-4xl">
            Reference compiler demonstration models with deterministic topologies for integer quantization, memory arena scheduling, and zero-malloc MCU deployment.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('import')}
          className="px-3.5 py-1.5 rounded-md bg-surface-raised hover:bg-surface-hover border border-border text-text-primary text-xs font-medium self-start transition-colors cursor-pointer"
        >
          + Import Custom Model
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PRESET_MODELS.map((model) => {
          const isSelected = loadedModel?.id === model.id;
          return (
            <SpotlightCard
              key={model.id}
              className={`p-5 flex flex-col justify-between space-y-4 ${
                isSelected ? 'ring-2 ring-primary border-primary bg-surface-raised/40' : ''
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-primary uppercase tracking-wider">
                    {model.domain}
                  </span>
                  {isSelected && (
                    <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      ACTIVE
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-text-primary">{model.name}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">{model.description}</p>

                <div className="pt-3 border-t border-border space-y-1.5 text-xs font-mono text-text-secondary">
                  <div className="flex justify-between">
                    <span>Input Shape:</span>
                    <span className="text-text-primary">{model.input_shape}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Architecture:</span>
                    <span className="text-text-primary">{model.architecture}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Fit:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> FITS {selectedHw.name}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => loadPreset(model.id)}
                  className={`w-full py-2 px-3 rounded-md text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-surface-raised hover:bg-surface-hover border border-border text-text-primary'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isSelected ? 'Currently Loaded' : 'Load Model'}</span>
                </button>
              </div>
            </SpotlightCard>
          );
        })}
      </div>
    </div>
  );
};
