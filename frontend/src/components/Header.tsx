import React from 'react';
import { Zap, Github } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-cyan-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xl tracking-tight text-white font-mono">SHANNON</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-semibold uppercase tracking-wider">
                Autonomous Studio v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Autonomous TinyML Compiler & Hardware Optimization Engine</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Agent: <strong>Claude-Shannon</strong></span>
          </div>

          <a
            href="https://github.com/atharveeee-netizen/shannon"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-850 text-slate-200 text-xs font-medium transition-colors"
          >
            <Github className="h-4 w-4" />
            <span className="hidden sm:inline">Private Repo</span>
          </a>
        </div>
      </div>
    </header>
  );
};