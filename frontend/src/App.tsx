import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HardwareSelector } from './components/HardwareSelector';
import { ModelUploader } from './components/ModelUploader';
import { MemoryMap } from './components/MemoryMap';
import { AgentChat } from './components/AgentChat';
import { CodeViewer } from './components/CodeViewer';
import { LiveSimulator } from './components/LiveSimulator';
import { optimizeModel } from './services/api';
import { OptimizationResult } from './types';
import { Sparkles, Terminal, Cpu, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export const App: React.FC = () => {
  const [selectedHw, setSelectedHw] = useState<string>('ESP32-S3');
  const [selectedPreset, setSelectedPreset] = useState<string>('kws');
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);

  useEffect(() => {
    runCompiler(selectedPreset, selectedHw);
  }, [selectedPreset, selectedHw]);

  const runCompiler = async (preset: string, hw: string) => {
    setIsCompiling(true);
    try {
      const result = await optimizeModel(preset, hw);
      setOptimizationResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-cyan-950/40 border border-slate-800 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="text-xs font-mono text-emerald-400 font-bold tracking-wider uppercase">
                Zero Cloud Latency • 100% On-Device Execution
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Compress & Compile AI for Microcontrollers in Seconds
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Shannon’s autonomous compiler agent quantizes models to INT8, plans contiguous SRAM memory arenas, and generates zero-dependency C/C++ firmware headers.
            </p>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <div className="px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center font-mono">
              <span className="text-[10px] text-slate-400 uppercase block">Compression</span>
              <span className="text-lg font-bold text-emerald-400">75% - 90%</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center font-mono">
              <span className="text-[10px] text-slate-400 uppercase block">Dynamic Alloc</span>
              <span className="text-lg font-bold text-cyan-400">0 Bytes</span>
            </div>
          </div>
        </div>

        {/* 1. Hardware Selector */}
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-850">
          <HardwareSelector selected={selectedHw} onSelect={setSelectedHw} />
        </div>

        {/* 2. Model Ingestion */}
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-850">
          <ModelUploader selectedPreset={selectedPreset} onSelectPreset={setSelectedPreset} />
        </div>

        {/* 3. Memory & Optimization Metrics */}
        {optimizationResult && (
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-850">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-200 font-mono flex items-center space-x-2">
                <Zap className="h-4 w-4 text-emerald-400" />
                <span>Compiler Optimization & SRAM Arena Layout</span>
              </h3>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                INT8 Quantized
              </span>
            </div>
            <MemoryMap result={optimizationResult} />
          </div>
        )}

        {/* 4. Two-Column Workspace: Code Viewer + AI Copilot / Simulator */}
        {optimizationResult && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <CodeViewer
                headerCode={optimizationResult.c_header_code}
                modelName={optimizationResult.model_name}
                targetHardware={selectedHw}
              />
              <LiveSimulator
                presetId={selectedPreset}
                modelName={optimizationResult.model_name}
                latencyMs={optimizationResult.optimized_int8.estimated_latency_ms}
              />
            </div>

            <div>
              <AgentChat
                targetHardware={selectedHw}
                modelName={optimizationResult.model_name}
                recommendations={optimizationResult.agent_report.recommendations}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-400 font-mono">
        <p>Built with precision for the AI Builders Hackathon 2026 • Shannon Autonomous Studio</p>
      </footer>
    </div>
  );
};