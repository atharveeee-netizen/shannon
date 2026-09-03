import React from 'react';
import { Check } from 'lucide-react';

export interface StepItem {
  id: string | number;
  label: string;
  description?: string;
  status: 'complete' | 'current' | 'upcoming' | 'error';
}

interface StepperProps {
  steps: StepItem[];
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({ steps, className = '' }) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {steps.map((step, idx) => {
          const isComplete = step.status === 'complete';
          const isCurrent = step.status === 'current';
          const isError = step.status === 'error';

          return (
            <div
              key={step.id}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                isComplete
                  ? 'bg-surface-raised border-emerald-500/30 text-text-primary'
                  : isCurrent
                  ? 'bg-primary/10 border-primary/50 text-text-primary ring-1 ring-primary/30'
                  : isError
                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-400'
                  : 'bg-surface border-border/60 text-text-muted opacity-70'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                    isComplete
                      ? 'bg-emerald-500 text-black'
                      : isCurrent
                      ? 'bg-primary text-white animate-pulse'
                      : isError
                      ? 'bg-rose-500 text-white'
                      : 'bg-surface-raised text-text-muted border border-border'
                  }`}
                >
                  {isComplete ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : idx + 1}
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                  S{idx + 1}
                </span>
              </div>
              <p className="text-xs font-medium leading-tight line-clamp-1">{step.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
