import React, { useState } from 'react';
import { ShieldCheck, Zap, Cpu, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { HardwareProfile, ModelZooItem } from '../types';

interface DynamicNotchProps {
  currentHw: HardwareProfile;
  currentModel: ModelZooItem;
  isCompiling: boolean;
}

export const DynamicNotch: React.FC<DynamicNotchProps> = ({
  currentHw,
  currentModel,
  isCompiling,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex justify-center select-none">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`bg-[#080914]/95 backdrop-blur-xl border border-[#1A2138] hover:border-[#5CF2E7]/60 rounded-full px-3 py-1 text-xs font-mono transition-all duration-300 cursor-pointer flex items-center gap-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_16px_rgba(92,242,231,0.2)] ${
          isExpanded ? 'ring-1 ring-[#5CF2E7]/40' : ''
        }`}
      >
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5CF2E7] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5CF2E7]"></span>
          </span>
          <span className="text-[#5CF2E7] font-bold">
            {isCompiling ? 'COMPILING & OPTIMIZING...' : 'SILICON READY'}
          </span>
        </div>

        <span className="text-[#1A2138]">|</span>

        <div className="flex items-center gap-1 text-[#E6FFFF]/80">
          <Cpu className="w-3 h-3 text-[#FF7AC6]" />
          <span>{currentHw.name}</span>
        </div>

        <span className="text-[#1A2138]">|</span>

        <div className="flex items-center gap-1 text-[#5CF2E7] font-bold">
          <ShieldCheck className="w-3 h-3 text-[#5CF2E7]" />
          <span>ZERO-MALLOC</span>
        </div>

        <div className="text-[#E6FFFF]/40 hover:text-[#E6FFFF]">
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </div>
      </div>

      {/* Expanded Notch Drawer */}
      {isExpanded && (
        <div className="absolute top-12 max-w-md w-full bg-[#05050A]/95 backdrop-blur-2xl border border-[#1A2138] rounded-[4px] p-3 shadow-2xl z-50 text-xs font-mono space-y-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-[#1A2138] pb-1.5">
            <span className="text-[#5CF2E7] font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#5CF2E7]" /> REAL-TIME SILICON TELEMETRY
            </span>
            <span className="text-[10px] text-[#FF7AC6]">{currentModel.domain}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] text-[#E6FFFF]/80 font-tabular">
            <div className="p-1.5 rounded bg-[#080914] border border-[#1A2138]">
              <span className="text-[#64748B] block">FLASH COMPRESSION</span>
              <strong className="text-[#5CF2E7] text-[11px]">{currentModel.flash_compression_ratio} Savings</strong>
            </div>
            <div className="p-1.5 rounded bg-[#080914] border border-[#1A2138]">
              <span className="text-[#64748B] block">STATIC SRAM ARENA</span>
              <strong className="text-[#FF7AC6] text-[11px]">{currentModel.peak_sram_kb} KB Peak</strong>
            </div>
            <div className="p-1.5 rounded bg-[#080914] border border-[#1A2138]">
              <span className="text-[#64748B] block">SIMD INNER KERNEL</span>
              <strong className="text-[#E6FFFF] text-[11px]">{currentHw.simd}</strong>
            </div>
            <div className="p-1.5 rounded bg-[#080914] border border-[#1A2138]">
              <span className="text-[#64748B] block">SAFETY COMPLIANCE</span>
              <strong className="text-[#5CF2E7] text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#5CF2E7]" /> MISRA-C:2012
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
