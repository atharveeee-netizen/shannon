import React from 'react';
import { PresetModel } from '../types';
import { Box, ArrowRight } from 'lucide-react';
import { ViewId } from '../components/Sidebar';

interface ModelsViewProps {
  models: PresetModel[];
  selectedModelId: string;
  onSelectModel: (id: string) => void;
  onNavigate: (view: ViewId) => void;
}

export const ModelsView: React.FC<ModelsViewProps> = ({
  models,
  selectedModelId,
  onSelectModel,
  onNavigate,
}) => {
  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h2 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider flex items-center gap-2">
            <Box className="w-4 h-4 text-primary" />
            Shannon Production Model Zoo & Benchmarks
          </h2>
          <p className="text-text-secondary text-xs mt-0.5">
            Fully trained, 10-epoch plateau converged TinyML neural network topologies with validated ground truth weights.
          </p>
        </div>

        <button
          onClick={() => onNavigate('import')}
          className="px-3 py-1.5 bg-surface-raised hover:bg-surface-hover border border-border rounded font-mono font-semibold text-xs text-text-primary transition"
        >
          + Import Custom ONNX
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
        {models.map((m) => {
          const isSelected = selectedModelId === m.id;
          return (
            <div
              key={m.id}
              onClick={() => onSelectModel(m.id)}
              className={`p-4 rounded border transition cursor-pointer flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary/40'
                  : 'bg-surface hover:bg-surface-hover border-border'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-text-primary font-sans">{m.name}</span>
                  {isSelected && (
                    <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-text-muted block">{m.domain}</span>
                <p className="text-[11px] text-text-secondary font-sans mt-2 leading-relaxed">
                  {m.description}
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-border/60 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-text-muted">Topology:</span>
                  <strong className="text-text-primary truncate max-w-[150px]">{m.architecture}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Input Tensor:</span>
                  <strong className="text-primary">{m.input_shape}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Dataset:</span>
                  <strong className="text-text-primary truncate max-w-[150px]">{m.dataset}</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectModel(m.id);
                    onNavigate('dashboard');
                  }}
                  className={`w-full py-1.5 rounded text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'bg-primary text-white'
                      : 'bg-surface-raised border border-border text-text-primary hover:border-primary'
                  }`}
                >
                  <span>{isSelected ? 'Open in Compiler' : 'Select Model'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
