import React from 'react';
import { Settings, Moon, Sun, CheckCircle2 } from 'lucide-react';
import { useCompiler } from '../../context/CompilerContext';
import { Panel } from '../ui/Panel';

export const SettingsView: React.FC = () => {
  const { isDarkMode, setIsDarkMode } = useCompiler();

  return (
    <div className="p-6 space-y-6 w-full max-w-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-semibold">
            <Settings className="w-4 h-4" />
            <span>STUDIO & COMPILER CONFIGURATION</span>
          </div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">Studio Settings</h1>
          <p className="text-xs text-text-secondary max-w-4xl">
            Configure IDE appearance and developer environment settings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* IDE Preferences */}
        <Panel title="IDE Appearance & Environment" subtitle="Theme and workstation settings">
          <div className="space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div>
                <div className="text-text-primary font-bold text-sm">Theme Mode</div>
                <div className="text-text-secondary text-xs font-sans mt-0.5">Matte Graphite EDA / Light Studio</div>
              </div>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface-raised hover:bg-surface-hover border border-border text-text-primary text-xs font-medium transition-colors cursor-pointer"
              >
                {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-primary" />}
                <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>

            <div className="space-y-2 text-text-secondary font-sans text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Static BSS Arena Memory Model Active (0 B Malloc)</span>
              </div>
              <p className="text-xs leading-relaxed text-text-secondary">
                The compiler automatically enforces zero dynamic heap allocations (<code>malloc</code>, <code>calloc</code>, <code>free</code>) for all output embedded C code.
              </p>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
};
