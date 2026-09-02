import React from 'react';
import { HardwareProfile } from '../types';
import { HardDrive, Cpu, ShieldCheck } from 'lucide-react';

interface TargetsViewProps {
  currentHw: HardwareProfile;
  hardwareList: HardwareProfile[];
  onSelectHardware: (id: string) => void;
}

export const TargetsView: React.FC<TargetsViewProps> = ({
  currentHw,
  hardwareList,
  onSelectHardware,
}) => {
  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h2 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-primary" />
            Target Silicon Architecture Catalog
          </h2>
          <p className="text-text-secondary text-xs mt-0.5">
            Hardware-specific register architectures, vector instruction pipelines, and memory constraints.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-text-secondary">
          <span>Active: <strong className="text-primary">{currentHw.name}</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono">
        {hardwareList.map((hw) => {
          const isSelected = hw.id === currentHw.id;
          return (
            <div
              key={hw.id}
              onClick={() => onSelectHardware(hw.id)}
              className={`p-4 rounded border transition cursor-pointer flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary/40'
                  : 'bg-surface hover:bg-surface-hover border-border'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs text-text-primary flex items-center gap-1.5 font-sans">
                    <Cpu className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-text-muted'}`} />
                    {hw.name}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded font-bold">
                      ACTIVE TARGET
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-text-secondary">{hw.arch}</div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-border/60 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-text-muted">Clock Speed:</span>
                  <strong className="text-text-primary">{hw.clock_mhz} MHz</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">SRAM Capacity:</span>
                  <strong className="text-primary">{hw.sram_kb} KB</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Flash Storage:</span>
                  <strong className="text-text-primary">{hw.flash_mb} MB</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">SIMD / Vector:</span>
                  <strong className="text-text-primary truncate max-w-[140px]" title={hw.simd}>{hw.simd}</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                <span className="text-[10px] text-success flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  MISRA-C Certified
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectHardware(hw.id);
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                    isSelected
                      ? 'bg-primary text-white'
                      : 'bg-surface-raised border border-border text-text-primary hover:border-primary'
                  }`}
                >
                  {isSelected ? 'Selected' : 'Select Target'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
