import React from 'react';
import { HardwareProfile } from '../types';
import { HARDWARE_PROFILES } from '../services/api';
import { Cpu, HardDrive, Gauge, Layers } from 'lucide-react';

interface Props {
  selected: string;
  onSelect: (hw: string) => void;
}

export const HardwareSelector: React.FC<Props> = ({ selected, onSelect }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
          <Cpu className="h-4 w-4 text-emerald-400" />
          <span>Target Microcontroller Architecture</span>
        </label>
        <span className="text-xs text-slate-400 font-mono">Select target hardware</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {Object.entries(HARDWARE_PROFILES).map(([key, hw]) => {
          const isSelected = selected === key;
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900/90 border-emerald-500 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/50'
                  : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700'
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 h-2 w-full bg-gradient-to-r from-emerald-500 to-cyan-500" />
              )}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="font-bold text-sm text-white font-mono">{hw.name}</h4>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    {hw.clock_mhz} MHz
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1 mb-2.5">{hw.recommendedFor}</p>
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-800/60 font-mono text-[11px]">
                <div className="flex items-center space-x-1 text-emerald-400">
                  <Layers className="h-3 w-3" />
                  <span>{hw.sram_kb} KB RAM</span>
                </div>
                <div className="flex items-center space-x-1 text-cyan-400">
                  <HardDrive className="h-3 w-3" />
                  <span>{hw.flash_mb} MB ROM</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};