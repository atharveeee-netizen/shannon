import React, { useState, useRef, useEffect } from 'react';
import { HardwareProfile, ModelZooItem } from '../types';
import { Database, Cpu, Sliders, ChevronDown, Check } from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';

interface CardNavProps {
  models: ModelZooItem[];
  selectedModelId: string;
  onSelectModel: (id: string) => void;
  hardwareList: HardwareProfile[];
  selectedHwId: string;
  onSelectHardware: (id: string) => void;
  quantBits: number;
  onChangeQuantBits: (bits: number) => void;
}

export const CardNav: React.FC<CardNavProps> = ({
  models,
  selectedModelId,
  onSelectModel,
  hardwareList,
  selectedHwId,
  onSelectHardware,
  quantBits,
  onChangeQuantBits,
}) => {
  const [activeMenu, setActiveMenu] = useState<'models' | 'hardware' | 'compiler' | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentHw = hardwareList.find((h) => h.id === selectedHwId) || hardwareList[0];
  const currentModel = models.find((m) => m.id === selectedModelId) || models[0];

  return (
    <div ref={navRef} className="relative flex items-center gap-1.5 font-mono text-xs select-none">
      {/* 1. Models Card Trigger */}
      <button
        onClick={() => setActiveMenu(activeMenu === 'models' ? null : 'models')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] border transition-all btn-tactile ${
          activeMenu === 'models'
            ? 'bg-[#0D1122] border-[#5CF2E7] text-[#E6FFFF] shadow-[0_0_12px_rgba(92,242,231,0.3)]'
            : 'bg-[#080914] border-[#1A2138] text-[#E6FFFF]/80 hover:text-[#E6FFFF] hover:border-[#5CF2E7]/50'
        }`}
      >
        <Database className="w-3.5 h-3.5 text-[#5CF2E7]" />
        <span className="font-semibold text-[#E6FFFF]">{currentModel.name}</span>
        <span className="text-[10px] text-[#5CF2E7] bg-[#0E3B43]/40 px-1 rounded font-bold border border-[#5CF2E7]/30">
          {currentModel.int8_flash_kb}KB
        </span>
        <ChevronDown className={`w-3 h-3 text-[#5CF2E7]/70 transition-transform ${activeMenu === 'models' ? 'rotate-180' : ''}`} />
      </button>

      {/* 2. Silicon Hardware Card Trigger */}
      <button
        onClick={() => setActiveMenu(activeMenu === 'hardware' ? null : 'hardware')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] border transition-all btn-tactile ${
          activeMenu === 'hardware'
            ? 'bg-[#0D1122] border-[#FF7AC6] text-[#E6FFFF] shadow-[0_0_12px_rgba(255,122,198,0.3)]'
            : 'bg-[#080914] border-[#1A2138] text-[#E6FFFF]/80 hover:text-[#E6FFFF] hover:border-[#FF7AC6]/50'
        }`}
      >
        <Cpu className="w-3.5 h-3.5 text-[#FF7AC6]" />
        <span className="font-semibold text-[#E6FFFF]">{currentHw.name}</span>
        <span className="text-[10px] text-[#FF7AC6] bg-[#4B1886]/40 px-1 rounded font-bold border border-[#FF7AC6]/30">
          {currentHw.sram_kb}KB
        </span>
        <ChevronDown className={`w-3 h-3 text-[#FF7AC6]/70 transition-transform ${activeMenu === 'hardware' ? 'rotate-180' : ''}`} />
      </button>

      {/* 3. Compiler Options Card Trigger */}
      <button
        onClick={() => setActiveMenu(activeMenu === 'compiler' ? null : 'compiler')}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-[3px] border transition-all btn-tactile ${
          activeMenu === 'compiler'
            ? 'bg-[#0D1122] border-[#5CF2E7] text-[#E6FFFF] shadow-[0_0_12px_rgba(92,242,231,0.3)]'
            : 'bg-[#080914] border-[#1A2138] text-[#E6FFFF]/80 hover:text-[#E6FFFF] hover:border-[#5CF2E7]/40'
        }`}
      >
        <Sliders className="w-3.5 h-3.5 text-[#5CF2E7]" />
        <span>INT{quantBits}</span>
        <ChevronDown className={`w-3 h-3 text-[#64748B] transition-transform ${activeMenu === 'compiler' ? 'rotate-180' : ''}`} />
      </button>

      {/* EXPANDABLE CARD NAV FLYOUTS */}
      {/* A. Models Flyout */}
      {activeMenu === 'models' && (
        <div className="absolute top-10 left-0 w-80 bg-[#05050A]/95 backdrop-blur-md border border-[#1A2138] rounded-[3px] p-2 shadow-2xl z-50 space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="text-[10px] font-bold text-[#5CF2E7] uppercase px-1 pb-1 border-b border-[#1A2138] flex items-center justify-between">
            <span>SELECT PRE-TRAINED MODEL</span>
            <span className="text-[#FF7AC6]">{models.length} BENCHMARKS</span>
          </div>

          <div className="space-y-1">
            {models.map((m) => {
              const isSelected = m.id === selectedModelId;
              return (
                <SpotlightCard
                  key={m.id}
                  onClick={() => {
                    onSelectModel(m.id);
                    setActiveMenu(null);
                  }}
                  className={`p-2 cursor-pointer transition-all ${
                    isSelected ? 'border-[#5CF2E7] bg-[#0D1122]' : 'hover:border-[#5CF2E7]/50'
                  }`}
                  spotlightColor="rgba(92, 242, 231, 0.15)"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#E6FFFF]">{m.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#5CF2E7]" />}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#64748B] pt-1">
                    <span>{m.domain}</span>
                    <span className="text-[#5CF2E7] font-bold">{m.int8_flash_kb} KB Flash</span>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        </div>
      )}

      {/* B. Hardware Flyout */}
      {activeMenu === 'hardware' && (
        <div className="absolute top-10 left-36 w-84 bg-[#05050A]/95 backdrop-blur-md border border-[#1A2138] rounded-[3px] p-2 shadow-2xl z-50 space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="text-[10px] font-bold text-[#FF7AC6] uppercase px-1 pb-1 border-b border-[#1A2138] flex items-center justify-between">
            <span>TARGET SILICON PLATFORMS</span>
            <span className="text-[#5CF2E7]">{hardwareList.length} MCUS</span>
          </div>

          <div className="space-y-1 max-h-72 overflow-y-auto">
            {hardwareList.map((hw) => {
              const isSelected = hw.id === selectedHwId;
              return (
                <SpotlightCard
                  key={hw.id}
                  onClick={() => {
                    onSelectHardware(hw.id);
                    setActiveMenu(null);
                  }}
                  className={`p-2 cursor-pointer transition-all ${
                    isSelected ? 'border-[#FF7AC6] bg-[#0D1122]' : 'hover:border-[#FF7AC6]/50'
                  }`}
                  spotlightColor="rgba(255, 122, 198, 0.15)"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#E6FFFF]">{hw.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#FF7AC6]" />}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#64748B] pt-1 font-tabular">
                    <span>{hw.clock_mhz} MHz</span>
                    <span className="text-[#FF7AC6] font-bold">{hw.sram_kb} KB SRAM</span>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        </div>
      )}

      {/* C. Compiler Options Flyout */}
      {activeMenu === 'compiler' && (
        <div className="absolute top-10 left-72 w-64 bg-[#05050A]/95 backdrop-blur-md border border-[#1A2138] rounded-[3px] p-2.5 shadow-2xl z-50 space-y-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="text-[10px] font-bold text-[#5CF2E7] uppercase pb-1 border-b border-[#1A2138]">
            COMPILER PRECISION
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => {
                onChangeQuantBits(8);
                setActiveMenu(null);
              }}
              className={`py-1.5 px-2 rounded-[2px] font-bold text-xs transition-all btn-tactile ${
                quantBits === 8 ? 'btn-tactile-primary' : 'bg-[#080914] text-[#64748B] border border-[#1A2138]'
              }`}
            >
              INT8 Symmetric
            </button>
            <button
              onClick={() => {
                onChangeQuantBits(4);
                setActiveMenu(null);
              }}
              className={`py-1.5 px-2 rounded-[2px] font-bold text-xs transition-all btn-tactile ${
                quantBits === 4 ? 'btn-tactile-pink' : 'bg-[#080914] text-[#64748B] border border-[#1A2138]'
              }`}
            >
              INT4 Packed
            </button>
          </div>

          <div className="text-[9px] text-[#64748B] pt-1 border-t border-[#1A2138]">
            SRAM Tensor Arena: 4-Byte Word Aligned
          </div>
        </div>
      )}
    </div>
  );
};
