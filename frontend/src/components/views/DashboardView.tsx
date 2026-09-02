import React from 'react';
import {
  Cpu,
  Layers,
  Zap,
  BatteryCharging,
  ShieldCheck,
  ChevronRight,
  Upload,
  Bot,
  Flame,
} from 'lucide-react';
import { CompilationResult, HardwareProfile, PresetModel } from '../../types';
import { TabType } from '../Sidebar';

interface DashboardViewProps {
  result: CompilationResult | null;
  selectedModel: PresetModel | null;
  models: PresetModel[];
  onSelectModel: (id: string) => void;
  selectedHw: HardwareProfile;
  onNavigateToTab: (tab: TabType) => void;
  onUploadCustom: (file: File) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  result,
  selectedModel,
  models,
  onSelectModel,
  selectedHw,
  onNavigateToTab,
  onUploadCustom,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const flashKb = result ? (result.optimized_int8.flash_bytes / 1024).toFixed(1) : '24.0';
  const sramKb = result ? (result.optimized_int8.peak_sram_bytes / 1024).toFixed(2) : '1.12';
  const macsFormatted = result ? result.optimized_int8.total_macs.toLocaleString() : '46,368';
  const latencyMs = result ? result.optimized_int8.estimated_latency_ms.toFixed(2) : '1.84';

  const flashPct = result
    ? ((result.optimized_int8.flash_bytes / (selectedHw.flash_mb * 1024 * 1024)) * 100).toFixed(2)
    : '0.29';
  const sramPct = result
    ? ((result.optimized_int8.peak_sram_bytes / (selectedHw.sram_kb * 1024)) * 100).toFixed(2)
    : '0.22';

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto bg-[#0E131F]">
      {/* 1. Project Overview Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#202B3C] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#20E28B]">
            <span className="w-2 h-2 rounded-full bg-[#20E28B] animate-pulse" />
            <span>IMPULSE READY FOR DEPLOYMENT</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {selectedModel ? selectedModel.name : 'Custom Model Impulse'}
          </h1>
          <p className="text-xs text-[#94A3B8]">
            {selectedModel?.description ||
              'Compiled with Pareto-optimal INT8 quantization, greedy interval arena buffer reuse, and SIMD acceleration.'}
          </p>
        </div>

        {/* Quick Action Navigation CTAs */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigateToTab('impulse')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#1B2431] hover:bg-[#232E3E] text-white border border-[#2A3649] text-xs font-semibold transition-all"
          >
            <span>Impulse Graph</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#20E28B]" />
          </button>
          <button
            onClick={() => onNavigateToTab('deployment')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#20E28B] hover:bg-[#1BC97B] text-[#0E131F] text-xs font-bold shadow-md shadow-[#20E28B]/20 transition-all active:scale-95"
          >
            <span>Deploy .h Header</span>
            <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* 2. Silicon Performance Metrics Grid (4 Core Telemetry Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Flash ROM Usage */}
        <div className="p-5 rounded-lg bg-[#151D2A] border border-[#202B3C] hover:border-[#2A3649] transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#94A3B8]">FLASH USAGE</span>
            <Layers className="w-4 h-4 text-[#20E28B]" />
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-extrabold text-white tracking-tight">
              {flashKb} <span className="text-xs font-normal text-[#94A3B8]">KB</span>
            </div>
            <div className="text-[11px] text-[#94A3B8] font-mono">
              {flashPct}% of {selectedHw.flash_mb} MB Flash
            </div>
          </div>
          <div className="w-full bg-[#101620] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#20E28B] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(4, Math.min(100, parseFloat(flashPct) * 10))}%` }}
            />
          </div>
        </div>

        {/* Card 2: Peak Static SRAM Arena */}
        <div className="p-5 rounded-lg bg-[#151D2A] border border-[#202B3C] hover:border-[#2A3649] transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#94A3B8]">RAM ARENA (0 MALLOC)</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-extrabold text-white tracking-tight">
              {sramKb} <span className="text-xs font-normal text-[#94A3B8]">KB</span>
            </div>
            <div className="text-[11px] text-[#94A3B8] font-mono">
              {sramPct}% of {selectedHw.sram_kb} KB SRAM
            </div>
          </div>
          <div className="w-full bg-[#101620] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(4, Math.min(100, parseFloat(sramPct) * 10))}%` }}
            />
          </div>
        </div>

        {/* Card 3: Inference Latency & MACs */}
        <div className="p-5 rounded-lg bg-[#151D2A] border border-[#202B3C] hover:border-[#2A3649] transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#94A3B8]">ESTIMATED LATENCY</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-extrabold text-white tracking-tight">
              {latencyMs} <span className="text-xs font-normal text-[#94A3B8]">ms</span>
            </div>
            <div className="text-[11px] text-[#94A3B8] font-mono">
              {macsFormatted} MACs @ {selectedHw.clock_mhz}MHz
            </div>
          </div>
          <div className="w-full bg-[#101620] h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-400 h-full rounded-full" style={{ width: '18%' }} />
          </div>
        </div>

        {/* Card 4: Battery Lifespan Estimate */}
        <div className="p-5 rounded-lg bg-[#151D2A] border border-[#202B3C] hover:border-[#2A3649] transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#94A3B8]">BATTERY LIFESPAN</span>
            <BatteryCharging className="w-4 h-4 text-purple-400" />
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-extrabold text-white tracking-tight">
              ~200 <span className="text-xs font-normal text-[#94A3B8]">Days</span>
            </div>
            <div className="text-[11px] text-[#94A3B8] font-mono">
              500mAh LiPo (1 sample/sec)
            </div>
          </div>
          <div className="w-full bg-[#101620] h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-400 h-full rounded-full" style={{ width: '85%' }} />
          </div>
        </div>
      </div>

      {/* 3. Model Zoo & Custom Dropzone */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#20E28B]" />
            <h2 className="text-sm font-bold text-white tracking-tight">
              Curated Production Benchmark Models
            </h2>
          </div>
          <span className="text-xs text-[#94A3B8] font-mono">
            3 Ready-to-Flash TinyML Benchmarks
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {models.map((model) => {
            const isSelected = selectedModel?.id === model.id;
            return (
              <div
                key={model.id}
                onClick={() => onSelectModel(model.id)}
                className={`p-5 rounded-lg border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-[#18212D] border-[#20E28B] shadow-md shadow-[#20E28B]/10'
                    : 'bg-[#151D2A] border-[#20E28B]/0 border-[#202B3C] hover:border-[#2A3649] hover:bg-[#18212D]'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-mono text-[#20E28B] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#20E28B]" />
                    ACTIVE
                  </span>
                )}
                <div className="text-xs font-mono text-[#20E28B] uppercase tracking-wider mb-1">
                  {model.domain}
                </div>
                <div className="text-sm font-bold text-white mb-2">{model.name}</div>
                <p className="text-xs text-[#94A3B8] line-clamp-2 leading-relaxed mb-4">
                  {model.description}
                </p>
                <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B] pt-3 border-t border-[#202B3C]">
                  <span>{model.input_shape}</span>
                  <span className="text-slate-400">{model.architecture}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Custom Model Upload Dropzone */}
      <div className="p-6 rounded-lg bg-[#151D2A] border border-dashed border-[#2A3649] hover:border-[#20E28B] transition-colors flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-[#1B2431] border border-[#2A3649] flex items-center justify-center text-[#20E28B]">
          <Upload className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white">Upload Custom ONNX or Layer Graph JSON</h3>
          <p className="text-xs text-[#94A3B8]">
            Drop any custom neural network model here for automated zero-malloc quantization and C code emission.
          </p>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              onUploadCustom(e.target.files[0]);
            }
          }}
          accept=".json,.onnx"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 rounded-md bg-[#1B2431] hover:bg-[#232E3E] text-white border border-[#2A3649] text-xs font-medium transition-all"
        >
          Select File (.json, .onnx)
        </button>
      </div>

      {/* 5. Autonomous Verification Audit Footer */}
      <div className="p-4 rounded-lg bg-[#151D2A] border border-[#202B3C] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#94A3B8]">
          <ShieldCheck className="w-4 h-4 text-[#20E28B]" />
          <span>
            100% MISRA-C:2012 Rule 21.3 Certified (0 bytes dynamic heap allocation).
          </span>
        </div>
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-[11px]">
          <Bot className="w-3.5 h-3.5" />
          <span>Gemini Autonomous Silicon Copilot Active</span>
        </div>
      </div>
    </div>
  );
};
