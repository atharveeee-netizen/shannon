import React from 'react';
import { HardDrive, CheckCircle2 } from 'lucide-react';
import { useCompiler } from '../../context/CompilerContext';
import { SpotlightCard } from '../react-bits/SpotlightCard';

export const TargetsView: React.FC = () => {
  const { hardwareList, selectedHw, setHardware } = useCompiler();

  return (
    <div className="p-6 space-y-6 w-full max-w-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-semibold">
            <HardDrive className="w-4 h-4" />
            <span>SILICON HARDWARE TARGET CATALOG</span>
          </div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">Microcontroller Targets</h1>
          <p className="text-xs text-text-secondary max-w-4xl">
            Datasheets, clock frequencies, memory limits, and vector SIMD hardware accelerator profiles.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hardwareList.map((hw) => {
          const isSelected = selectedHw.id === hw.id;
          return (
            <SpotlightCard
              key={hw.id}
              className={`p-5 space-y-4 ${
                isSelected ? 'ring-2 ring-primary border-primary bg-surface-raised/40' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-text-primary">{hw.name}</span>
                {isSelected ? (
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-mono text-[11px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> ACTIVE
                  </span>
                ) : (
                  <button
                    onClick={() => setHardware(hw.id)}
                    className="px-2.5 py-1 rounded-md bg-surface-raised border border-border text-text-primary hover:border-primary text-xs font-medium transition-colors cursor-pointer"
                  >
                    Select Target
                  </button>
                )}
              </div>

              <div className="space-y-2 font-mono text-xs text-text-secondary">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span>Architecture:</span>
                  <span className="text-text-primary font-medium">{hw.arch}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span>Clock Frequency:</span>
                  <span className="text-primary font-bold">{hw.clock_mhz} MHz</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span>SRAM Pool:</span>
                  <span className="text-cyan-400 font-medium">{hw.sram_kb} KB</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span>Flash Storage:</span>
                  <span className="text-text-primary">{hw.flash_mb} MB</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>SIMD Acceleration:</span>
                  <span className="text-text-primary">{hw.simd}</span>
                </div>
              </div>
            </SpotlightCard>
          );
        })}
      </div>
    </div>
  );
};
