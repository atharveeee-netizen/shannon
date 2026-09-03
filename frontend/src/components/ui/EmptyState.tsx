import React from 'react';
import { Layers, ArrowRight, Upload, Play } from 'lucide-react';
import { useCompiler } from '../../context/CompilerContext';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  allowCompile?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data Available',
  description = 'No model has been imported or compiled for this view.',
  icon: Icon = Layers,
  allowCompile = false,
}) => {
  const { loadedModel, triggerCompile, setActiveTab, loadPreset } = useCompiler();

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-none border border-border bg-surface/40 max-w-2xl mx-auto my-8 space-y-4">
      <div className="w-12 h-12 rounded-none bg-surface-raised border border-border flex items-center justify-center text-text-muted">
        <Icon className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-text-primary tracking-tight">{title}</h3>
        <p className="text-xs text-text-secondary max-w-md leading-relaxed">{description}</p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        {loadedModel && allowCompile && (
          <button
            onClick={() => triggerCompile()}
            className="flex items-center gap-2 px-4 py-2 rounded-none bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Compile {loadedModel.name}</span>
          </button>
        )}

        {!loadedModel && (
          <>
            <button
              onClick={() => setActiveTab('models')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-none bg-surface-raised hover:bg-surface-hover border border-border text-text-primary text-xs font-medium transition-all"
            >
              <span>Browse Reference Models</span>
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-none bg-surface-raised hover:bg-surface-hover border border-border text-text-primary text-xs font-medium transition-all"
            >
              <Upload className="w-3.5 h-3.5 text-primary" />
              <span>Import Model</span>
            </button>
            <button
              onClick={() => loadPreset('kws', true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-none bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all"
            >
              <span>Load Reference Model</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
