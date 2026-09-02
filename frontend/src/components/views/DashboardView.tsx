import React from 'react';
import {
  ChevronRight,
  Play,
  CheckCircle2,
  AlertCircle,
  FileCode,
  GitMerge,
  Cpu,
  RotateCcw,
} from 'lucide-react';
import { useCompiler } from '../../context/CompilerContext';
import { Panel } from '../ui/Panel';
import { StatusBadge } from '../ui/StatusBadge';
import { PipelineStage } from '../../types';

export const DashboardView: React.FC = () => {
  const {
    loadedModel,
    modelStatus,
    selectedHw,
    compilationResult,
    isCompiling,
    isTargetInvalidated,
    triggerCompile,
    setActiveTab,
    downloadHeader,
    pipelineStages,
  } = useCompiler();

  const isCompiled = compilationResult !== null && !isTargetInvalidated;

  const flashKb = isCompiled ? (compilationResult.optimized_int8.flash_bytes / 1024).toFixed(2) : '—';
  const sramKb = isCompiled ? (compilationResult.optimized_int8.peak_sram_bytes / 1024).toFixed(2) : '—';
  const macsFormatted = isCompiled ? compilationResult.optimized_int8.total_macs.toLocaleString() : '—';
  const latencyMs = isCompiled ? compilationResult.optimized_int8.estimated_latency_ms.toFixed(2) : '—';

  const flashPct = isCompiled
    ? Math.min(100, (compilationResult.optimized_int8.flash_bytes / (selectedHw.flash_mb * 1024 * 1024)) * 100).toFixed(2)
    : null;

  const sramPct = isCompiled
    ? Math.min(100, (compilationResult.optimized_int8.peak_sram_bytes / (selectedHw.sram_kb * 1024)) * 100).toFixed(2)
    : null;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* 1. Executive Status & Target Context Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <StatusBadge status={modelStatus} size="md" />
            <span className="text-xs font-mono text-text-secondary">
              Silicon Target: <strong className="text-text-primary">{selectedHw.name}</strong> (@{selectedHw.clock_mhz}MHz)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            {loadedModel ? loadedModel.name : 'No Model Loaded'}
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed max-w-3xl">
            {loadedModel
              ? loadedModel.description
              : 'Load a verified TinyML neural network from the Model Zoo or import custom ONNX/JSON to compile.'}
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-2 self-start md:self-center">
          {loadedModel && !isCompiled && (
            <button
              onClick={() => triggerCompile()}
              disabled={isCompiling}
              className="flex items-center gap-2 px-4 py-2 rounded bg-accent hover:bg-accent-hover text-black text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {isCompiling ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  <span>Compiling Pipeline...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>Compile for {selectedHw.name}</span>
                </>
              )}
            </button>
          )}

          {isCompiled && (
            <button
              onClick={downloadHeader}
              className="flex items-center gap-2 px-4 py-2 rounded bg-accent hover:bg-accent-hover text-black text-xs font-bold shadow-sm transition-all"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Export .h Header</span>
            </button>
          )}
        </div>
      </div>

      {/* Target Invalidation Alert */}
      {isTargetInvalidated && (
        <div className="p-3.5 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-400">
          <div className="flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Target microcontroller changed to {selectedHw.name}. Recompilation required for cycle accuracy.</span>
          </div>
          <button
            onClick={() => triggerCompile()}
            className="px-3 py-1 rounded bg-amber-500 text-black font-semibold text-xs hover:bg-amber-400 transition-colors"
          >
            Recompile
          </button>
        </div>
      )}

      {/* 2. Compilation Pipeline Flow */}
      <Panel
        title="Compilation Pipeline Execution"
        subtitle={
          isCompiled
            ? `Pipeline completed successfully (${compilationResult.layers.length} layers optimized)`
            : isCompiling
            ? 'Compiling layers and generating memory allocation plan...'
            : 'Awaiting model compilation trigger'
        }
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
          {(pipelineStages.length > 0
            ? pipelineStages
            : ([
                { id: 'import', name: 'Import', status: 'pending' },
                { id: 'parse', name: 'Parse IR', status: 'pending' },
                { id: 'quantize', name: 'INT8 Quant', status: 'pending' },
                { id: 'memory', name: 'SRAM Arena', status: 'pending' },
                { id: 'optimize', name: 'SIMD Pass', status: 'pending' },
                { id: 'codegen', name: 'C Header', status: 'pending' },
                { id: 'verify', name: 'MISRA-C', status: 'pending' },
                { id: 'deploy', name: 'Target Fit', status: 'pending' },
              ] as PipelineStage[])
          ).map((stg, idx) => {
            const isDone = stg.status === 'success';
            const isRunning = stg.status === 'running';
            const isFailed = stg.status === 'failed';

            return (
              <div
                key={idx}
                className={`p-2.5 rounded border text-center font-mono text-xs flex flex-col justify-between transition-all ${
                  isDone
                    ? 'bg-surface-raised border-emerald-500/30 text-emerald-400'
                    : isRunning
                    ? 'bg-surface-raised border-cyan-500/40 text-cyan-300 animate-pulse'
                    : isFailed
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    : 'bg-surface border-border text-text-muted opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-text-muted">0{idx + 1}</span>
                  {isDone ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-border" />
                  )}
                </div>
                <span className="font-semibold text-[11px] truncate">{stg.name}</span>
                <span className="text-[10px] text-text-muted mt-1">
                  {stg.duration_ms !== undefined ? `${stg.duration_ms}ms` : '—'}
                </span>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* 3. Core Silicon Resource Results */}
      <Panel
        title="Silicon Resource Footprint"
        subtitle={
          isCompiled
            ? `Measured for ${compilationResult.model_name} on ${selectedHw.name}`
            : 'Compile model to inspect static SRAM, Flash ROM, and latency'
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Flash ROM */}
          <div className="p-4 rounded bg-surface-raised/40 border border-border space-y-1.5">
            <span className="text-[11px] font-mono font-semibold text-text-muted uppercase tracking-wider">
              Flash ROM Weights
            </span>
            <div className="text-2xl font-bold font-mono text-text-primary">
              {flashKb} <span className="text-xs text-text-secondary font-normal font-sans">KB</span>
            </div>
            <p className="text-xs font-mono text-text-secondary">
              {flashPct ? `${flashPct}% of ${selectedHw.flash_mb} MB Flash` : 'Static parameter storage'}
            </p>
          </div>

          {/* Peak SRAM Arena */}
          <div className="p-4 rounded bg-surface-raised/40 border border-border space-y-1.5">
            <span className="text-[11px] font-mono font-semibold text-text-muted uppercase tracking-wider">
              Peak SRAM Arena
            </span>
            <div className="text-2xl font-bold font-mono text-cyan-400">
              {sramKb} <span className="text-xs text-text-secondary font-normal font-sans">KB</span>
            </div>
            <p className="text-xs font-mono text-text-secondary">
              {sramPct ? `${sramPct}% of ${selectedHw.sram_kb} KB SRAM` : '0 dynamic heap allocations'}
            </p>
          </div>

          {/* Inference Latency */}
          <div className="p-4 rounded bg-surface-raised/40 border border-border space-y-1.5">
            <span className="text-[11px] font-mono font-semibold text-text-muted uppercase tracking-wider">
              Inference Latency
            </span>
            <div className="text-2xl font-bold font-mono text-amber-400">
              {latencyMs} <span className="text-xs text-text-secondary font-normal font-sans">ms</span>
            </div>
            <p className="text-xs font-mono text-text-secondary">
              {isCompiled ? `@ ${selectedHw.clock_mhz}MHz core clock` : 'Cycle-accurate static model'}
            </p>
          </div>

          {/* Compute Operations */}
          <div className="p-4 rounded bg-surface-raised/40 border border-border space-y-1.5">
            <span className="text-[11px] font-mono font-semibold text-text-muted uppercase tracking-wider">
              Compute Load
            </span>
            <div className="text-2xl font-bold font-mono text-text-primary">
              {macsFormatted} <span className="text-xs text-text-secondary font-normal font-sans">MACs</span>
            </div>
            <p className="text-xs font-mono text-text-secondary">
              {isCompiled ? 'Vectorized SIMD multipliers' : 'Multiply-accumulate operations'}
            </p>
          </div>
        </div>
      </Panel>

      {/* 4. Next Recommended Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveTab('graph')}
          className="p-4 rounded bg-surface border border-border hover:border-border-strong hover:bg-surface-raised/50 text-left transition-all group flex flex-col justify-between space-y-3"
        >
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold text-accent uppercase">Step 1</span>
              <GitMerge className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors" />
            </div>
            <h4 className="text-sm font-bold text-text-primary">Inspect Computation DAG</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Explore the computation graph topology, node operator parameters, and intermediate tensor shapes.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-accent font-semibold">
            <span>Open Graph View</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => setActiveTab('memory')}
          className="p-4 rounded bg-surface border border-border hover:border-border-strong hover:bg-surface-raised/50 text-left transition-all group flex flex-col justify-between space-y-3"
        >
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold text-cyan-400 uppercase">Step 2</span>
              <Cpu className="w-4 h-4 text-text-muted group-hover:text-cyan-400 transition-colors" />
            </div>
            <h4 className="text-sm font-bold text-text-primary">SRAM Memory Arena</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              View the Greedy Interval Graph Coloring memory layout at physical section 0x20000000.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-cyan-400 font-semibold">
            <span>Inspect Memory Map</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => setActiveTab('codegen')}
          className="p-4 rounded bg-surface border border-border hover:border-border-strong hover:bg-surface-raised/50 text-left transition-all group flex flex-col justify-between space-y-3"
        >
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold text-emerald-400 uppercase">Step 3</span>
              <FileCode className="w-4 h-4 text-text-muted group-hover:text-emerald-400 transition-colors" />
            </div>
            <h4 className="text-sm font-bold text-text-primary">Generated C/C++ Code</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Inspect and download the MISRA-C:2012 Rule 21.3 compliant standalone embedded C header.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
            <span>View Source Code</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      </div>
    </div>
  );
};
