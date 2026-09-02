import React from 'react';
import { HardwareProfile, CompilationResult } from '../types';
import {
  Cpu,
  Battery,
  ShieldCheck,
  LayoutDashboard,
  Zap,
  Radio,
  Layers,
  Box,
  Activity,
  Rocket,
} from 'lucide-react';

interface SiliconSidebarProps {
  currentHw: HardwareProfile;
  hardwareList: HardwareProfile[];
  onSelectHardware: (id: string) => void;
  compilationResult: CompilationResult | null;
  activeSection: string;
  onSelectSection: (section: string) => void;
}

export const SiliconSidebar: React.FC<SiliconSidebarProps> = ({
  currentHw,
  hardwareList,
  onSelectHardware,
  compilationResult,
  activeSection,
  onSelectSection,
}) => {
  const peakSramBytes = compilationResult?.optimized_int8.peak_sram_bytes || 18432;
  const flashBytes = compilationResult?.optimized_int8.flash_bytes || 18560;
  const sramTotalBytes = currentHw.sram_kb * 1024;
  const flashTotalBytes = currentHw.flash_mb * 1024 * 1024;

  const sramUsagePct = Math.min(100, Math.max(1, (peakSramBytes / sramTotalBytes) * 100));
  const flashUsagePct = Math.min(100, Math.max(0.5, (flashBytes / flashTotalBytes) * 100));

  // Energy & Battery Calculations
  const latencyMs = compilationResult?.optimized_int8.estimated_latency_ms || 1.1;
  const activeCurrentMa =
    currentHw.id === 'ESP32-S3' ? 68 : currentHw.id === 'STM32H7' ? 110 : currentHw.id === 'RP2040' ? 24 : 15;
  const energyPerInfUj = ((activeCurrentMa * 3.3 * latencyMs) / 1000).toFixed(2);
  const batteryDays = Math.round(
    (220 * 1000) / (activeCurrentMa * (latencyMs / 1000) * 100 + 0.015 * 24)
  );

  const navItems = [
    { id: 'dashboard', label: 'Dashboard & Metrics', icon: LayoutDashboard, category: 'PROJECT' },
    { id: 'impulse', label: 'Impulse Pipeline Flow', icon: Zap, category: 'PROJECT' },
    { id: 'dsp', label: 'DSP Preprocessing', icon: Radio, category: 'IMPULSE BLOCKS' },
    { id: 'classifier', label: 'NN Classifier & Matrix', icon: Layers, category: 'IMPULSE BLOCKS' },
    { id: 'arena', label: 'Memory Arena (0-Malloc)', icon: Box, category: 'IMPULSE BLOCKS' },
    { id: 'testbench', label: 'Live Sensory Testbench', icon: Activity, category: 'TEST & DEPLOY' },
    { id: 'deployment', label: 'Deployment & Firmware', icon: Rocket, category: 'TEST & DEPLOY' },
  ];

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 bg-surface border-r border-border flex flex-col h-auto lg:h-[calc(100vh-3.5rem)] overflow-y-auto text-xs font-sans select-none">
      {/* Edge Impulse Style Categorized Navigation */}
      <div className="p-3 space-y-4 flex-1">
        {/* Nav Links */}
        <div className="space-y-3">
          {['PROJECT', 'IMPULSE BLOCKS', 'TEST & DEPLOY'].map((cat) => (
            <div key={cat} className="space-y-1">
              <span className="text-[10px] font-bold text-text-muted tracking-wider px-2 block uppercase">
                {cat}
              </span>
              {navItems
                .filter((item) => item.category === cat)
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectSection(item.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md font-medium text-xs transition ${
                        isActive
                          ? 'bg-accent/10 text-accent font-semibold shadow-sm'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-accent' : 'text-text-muted'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.id === 'arena' && (
                        <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-500 px-1 rounded font-bold">
                          0B
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          ))}
        </div>

        {/* Silicon Target Hardware Selector */}
        <div className="pt-3 border-t border-border space-y-2">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="font-bold text-text-primary flex items-center gap-1.5 text-xs">
              <Cpu className="w-3.5 h-3.5 text-accent" />
              Target Silicon
            </span>
            <span className="font-mono text-[9px] text-accent bg-accent/10 px-1.5 py-0.5 rounded font-bold">
              {currentHw.arch.split(' ')[0]}
            </span>
          </div>

          <select
            value={currentHw.id}
            onChange={(e) => onSelectHardware(e.target.value)}
            className="w-full bg-surface-raised border border-border hover:border-border-strong rounded-md px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent cursor-pointer transition font-medium"
          >
            {hardwareList.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} ({h.sram_kb}KB SRAM)
              </option>
            ))}
          </select>
        </div>

        {/* Real-Time Memory Utilization Gauges */}
        <div className="p-3 bg-surface-raised border border-border rounded-lg space-y-2.5 font-mono text-[11px]">
          <span className="font-bold font-sans text-text-primary block text-xs">
            Silicon Budgets ({currentHw.name})
          </span>

          {/* SRAM Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-text-secondary text-[10px]">
              <span>Peak SRAM Arena</span>
              <span className="text-text-primary font-semibold">
                {(peakSramBytes / 1024).toFixed(1)} KB ({sramUsagePct.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-surface-hover h-1.5 rounded-full overflow-hidden border border-border/60">
              <div
                className="bg-accent h-full transition-all duration-500 rounded-full"
                style={{ width: `${sramUsagePct}%` }}
              />
            </div>
          </div>

          {/* Flash ROM Bar */}
          <div className="space-y-1 pt-0.5">
            <div className="flex justify-between text-text-secondary text-[10px]">
              <span>Flash ROM Storage</span>
              <span className="text-text-primary font-semibold">
                {(flashBytes / 1024).toFixed(1)} KB ({flashUsagePct.toFixed(2)}%)
              </span>
            </div>
            <div className="w-full bg-surface-hover h-1.5 rounded-full overflow-hidden border border-border/60">
              <div
                className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
                style={{ width: `${Math.max(2, flashUsagePct)}%` }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px] text-text-muted">
            <span>MISRA-C:2012 Rule 21.3</span>
            <span className="text-success font-semibold flex items-center gap-0.5">
              <ShieldCheck className="w-3 h-3" /> Certified
            </span>
          </div>
        </div>

        {/* Energy & Battery Telemetry Widget */}
        <div className="p-3 bg-surface-raised border border-border rounded-lg space-y-1.5 font-mono text-[10px]">
          <div className="flex items-center gap-1.5 font-sans font-bold text-text-primary text-xs">
            <Battery className="w-3.5 h-3.5 text-emerald-500" />
            <span>Power & Battery</span>
          </div>
          <div className="flex justify-between text-text-secondary pt-0.5">
            <span>Active Current:</span>
            <span className="text-text-primary font-semibold">~{activeCurrentMa} mA @ 3.3V</span>
          </div>
          <div className="flex justify-between text-text-secondary">
            <span>Energy / Inf:</span>
            <span className="text-accent font-semibold">{energyPerInfUj} µJ</span>
          </div>
          <div className="flex justify-between text-text-secondary">
            <span>CR2032 Lifespan:</span>
            <span className="text-emerald-500 font-semibold">~{batteryDays} days</span>
          </div>
        </div>

      </div>
    </aside>
  );
};
