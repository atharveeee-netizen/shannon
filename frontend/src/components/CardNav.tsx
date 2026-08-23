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
            ? 'bg-[#0E1420] border-[#38BDF8] text-[#F8FAFC] shadow-[0_0_12px_rgba(56,189,248,0.25)]'
            : 'bg-[#0B0F17] border-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#38BDF8]/40'
        }`}
      >
        <Database className="w-3.5 h-3.5 text-[#38BDF8]" />
        <span className="font-semibold text-[#F8FAFC]">{currentModel.name}</span>
        <span className="text-[10px] text-[#38BDF8] bg-[#0284C7]/15 px-1 rounded font-bold">
          {currentModel.int8_flash_kb}KB
        </span>
        <ChevronDown className={`w-3 h-3 text-[#64748B] transition-transform ${activeMenu === 'models' ? 'rotate-180' : ''}`} />
      </button>

      {/* 2. Silicon Hardware Card Trigger */}
      <button
        onClick={() => setActiveMenu(activeMenu === 'hardware' ? null : 'hardware')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] border transition-all btn-tactile ${
          activeMenu === 'hardware'
            ? 'bg-[#0E1420] border-[#10B981] text-[#F8FAFC] shadow-[0_0_12px_rgba(16,185,129,0.25)]'
            : 'bg-[#0B0F17] border-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#10B981]/40'
        }`}
      >
        <Cpu className="w-3.5 h-3.5 text-[#10B981]" />
        <span className="font-semibold text-[#F8FAFC]">{currentHw.name}</span>
        <span className="text-[10px] text-[#10B981] bg-[#10B981]/15 px-1 rounded font-bold">
          {currentHw.sram_kb}KB
        </span>
        <ChevronDown className={`w-3 h-3 text-[#64748B] transition-transform ${activeMenu === 'hardware' ? 'rotate-180' : ''}`} />
      </button>

      {/* 3. Compiler Options Card Trigger */}
      <button
        onClick={() => setActiveMenu(activeMenu === 'compiler' ? null : 'compiler')}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-[3px] border transition-all btn-tactile ${
          activeMenu === 'compiler'
            ? 'bg-[#0E1420] border-[#F59E0B] text-[#F8FAFC] shadow-[0_0_12px_rgba(245,158,11,0.25)]'
            : 'bg-[#0B0F17] border-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#F59E0B]/40'
        }`}
      >
        <Sliders className="w-3.5 h-3.5 text-[#F59E0B]" />
        <span>INT{quantBits}</span>
        <ChevronDown className={`w-3 h-3 text-[#64748B] transition-transform ${activeMenu === 'compiler' ? 'rotate-180' : ''}`} />
      </button>

      {/* EXPANDABLE CARD NAV FLYOUTS */}
      {/* A. Models Flyout */}
      {activeMenu === 'models' && (
        <div className="absolute top-10 left-0 w-80 bg-[#070A0F]/95 backdrop-blur-md border border-[#1E293B] rounded-[3px] p-2 shadow-2xl z-50 space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="text-[10px] font-bold text-[#64748B] uppercase px-1 pb-1 border-b border-[#1E293B] flex items-center justify-between">
            <span>SELECT PRE-TRAINED MODEL</span>
            <span className="text-[#38BDF8]">{models.length} BENCHMARKS</span>
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
                    isSelected ? 'border-[#38BDF8] bg-[#0E1420]' : 'hover:border-[#38BDF8]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#F8FAFC]">{m.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#38BDF8]" />}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#64748B] pt-1">
                    <span>{m.domain}</span>
                    <span className="text-[#38BDF8] font-bold">{m.int8_flash_kb} KB Flash</span>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        </div>
      )}

      {/* B. Hardware Flyout */}
      {activeMenu === 'hardware' && (
        <div className="absolute top-10 left-36 w-84 bg-[#070A0F]/95 backdrop-blur-md border border-[#1E293B] rounded-[3px] p-2 shadow-2xl z-50 space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="text-[10px] font-bold text-[#64748B] uppercase px-1 pb-1 border-b border-[#1E293B] flex items-center justify-between">
            <span>TARGET SILICON PLATFORMS</span>
            <span className="text-[#10B981]">{hardwareList.length} MCUS</span>
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
                    isSelected ? 'border-[#10B981] bg-[#0E1420]' : 'hover:border-[#10B981]/50'
                  }`}
                  spotlightColor="rgba(16, 185, 129, 0.15)"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#F8FAFC]">{hw.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#10B981]" />}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#64748B] pt-1 font-tabular">
                    <span>{hw.clock_mhz} MHz</span>
                    <span className="text-[#10B981] font-bold">{hw.sram_kb} KB SRAM</span>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        </div>
      )}

      {/* C. Compiler Options Flyout */}
      {activeMenu === 'compiler' && (
        <div className="absolute top-10 left-72 w-64 bg-[#070A0F]/95 backdrop-blur-md border border-[#1E293B] rounded-[3px] p-2.5 shadow-2xl z-50 space-y-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="text-[10px] font-bold text-[#64748B] uppercase pb-1 border-b border-[#1E293B]">
            COMPILER PRECISION
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => {
                onChangeQuantBits(8);
                setActiveMenu(null);
              }}
              className={`py-1.5 px-2 rounded-[2px] font-bold text-xs transition-all btn-tactile ${
                quantBits === 8 ? 'btn-tactile-primary' : 'bg-[#0E1420] text-[#94A3B8] border border-[#1E293B]'
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
                quantBits === 4 ? 'btn-tactile-primary' : 'bg-[#0E1420] text-[#94A3B8] border border-[#1E293B]'
              }`}
            >
              INT4 Packed
            </button>
          </div>

          <div className="text-[9px] text-[#64748B] pt-1 border-t border-[#1E293B]">
            SRAM Tensor Arena: 4-Byte Word Aligned
          </div>
        </div>
      )}
    </div>
  );
};
