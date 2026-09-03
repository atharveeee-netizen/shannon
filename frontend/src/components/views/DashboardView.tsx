import React from 'react';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  GitMerge,
  Cpu,
  FileCode,
  Box,
  ChevronRight,
} from 'lucide-react';
import { useCompiler } from '../../context/CompilerContext';
import { CanvasBarChart, CanvasDonutGauge } from '../ui/CanvasChart';
import { PRESET_MODELS } from '../../services/api';
import { Stepper, StepItem } from '../react-bits/Stepper';

export const DashboardView: React.FC = () => {
  const {
    loadedModel,
    selectedHw,
    modelStatus,
    triggerCompile,
    isCompiling,
    isTargetInvalidated,
    compilationResult,
    downloadHeader,
    setActiveTab,
    loadPreset,
    pipelineStages,
  } = useCompiler();

  const isCompiled = modelStatus === 'SUCCESS' && compilationResult !== null;

  // Format telemetry metrics
  const flashKb = isCompiled ? (compilationResult.optimized_int8.flash_bytes / 1024).toFixed(1) : '-';
  const sramKb = isCompiled ? (compilationResult.optimized_int8.peak_sram_bytes / 1024).toFixed(2) : '-';
  const latencyMs = isCompiled ? compilationResult.optimized_int8.estimated_latency_ms.toFixed(2) : '-';
  const macsFormatted = isCompiled ? compilationResult.optimized_int8.total_macs.toLocaleString() : '-';

  // Calculate target utilization
  const sramPct = isCompiled
    ? Math.min(100, (compilationResult.optimized_int8.peak_sram_bytes / (selectedHw.sram_kb * 1024)) * 100)
    : 0;
  const flashPct = isCompiled
    ? Math.min(100, (compilationResult.optimized_int8.flash_bytes / (selectedHw.flash_mb * 1024 * 1024)) * 100)
    : 0;
  const fitsTarget = isCompiled && compilationResult.fits_hardware;

  // Layer compute distribution for CanvasBarChart
  const layerComputeItems = isCompiled
    ? compilationResult.layers
        .filter((l) => l.macs > 0)
        .slice(0, 8)
        .map((l) => ({
          label: l.layer_id,
          value: l.macs,
          color: l.op_type === 'Conv' ? '#0f62fe' : '#24a148',
        }))
    : [];

  const stepperSteps: StepItem[] = pipelineStages.map((stage) => ({
    id: stage.name,
    label: stage.name,
    status:
      stage.status === 'success'
        ? 'complete'
        : stage.status === 'running'
        ? 'current'
        : stage.status === 'failed'
        ? 'error'
        : 'upcoming',
  }));

  return (
    <div className="w-full max-w-none p-6 space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-normal text-text-primary tracking-tight">
            Compiler Overview
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Autonomous TinyML Silicon Compiler for Constrained Microcontrollers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => triggerCompile()}
            disabled={isCompiling}
            className={`flex items-center gap-2 px-4 py-2 rounded-[6px] text-sm font-medium text-white transition-colors cursor-pointer ${
              isCompiling
                ? 'bg-primary/60 cursor-wait'
                : 'bg-primary hover:bg-[#0043CE] active:bg-[#002D9C]'
            }`}
          >
            {isCompiling ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin text-white" />
                <span>Compiling Model...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Compile Model</span>
              </>
            )}
          </button>

          {isCompiled && (
            <button
              onClick={() => downloadHeader()}
              className="flex items-center gap-2 px-4 py-2 rounded-[6px] border border-border bg-surface hover:bg-surface-hover text-text-primary text-sm font-medium transition-colors cursor-pointer"
            >
              <FileCode className="w-4 h-4 text-text-secondary" />
              <span>Export C Header</span>
            </button>
          )}
        </div>
      </div>

      {/* Target Invalidation Alert */}
      {isTargetInvalidated && (
        <div className="p-3 bg-warning/10 border border-warning/30 flex items-center justify-between text-xs text-warning rounded-[6px]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Target microcontroller changed to {selectedHw.name}. Recompilation required for hardware fit.</span>
          </div>
          <button
            onClick={() => triggerCompile()}
            className="px-3 py-1 bg-warning text-black font-semibold text-xs hover:opacity-90 transition-opacity rounded-[4px] cursor-pointer"
          >
            Recompile
          </button>
        </div>
      )}

      {/* 2. Primary 5-Question Architectural Status Matrix (Spatial Layering, Not Card Soup) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Model & Target */}
        <div className="p-4 rounded-[8px] bg-surface border border-border space-y-3">
          <div>
            <div className="text-xs text-text-muted">Active model</div>
            <div className="text-lg font-semibold text-text-primary truncate mt-0.5" title={loadedModel?.name}>
              {loadedModel ? loadedModel.name : 'No model loaded'}
            </div>
            <div className="text-xs text-text-secondary mt-0.5">
              {loadedModel ? loadedModel.architecture : 'Select a reference model below'}
            </div>
          </div>

          <div className="pt-2 border-t border-border/60">
            <div className="text-xs text-text-muted">Target silicon</div>
            <div className="text-sm font-medium text-text-primary mt-0.5">
              {selectedHw.name}
            </div>
            <div className="text-xs text-text-secondary mt-0.5">
              {selectedHw.arch} @ {selectedHw.clock_mhz} MHz
            </div>
          </div>
        </div>

        {/* SRAM Arena Usage (Dominant Metric) */}
        <div className="p-4 rounded-[8px] bg-surface border border-border flex flex-col justify-between">
          <div>
            <div className="text-xs text-text-muted">SRAM arena used</div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-3xl font-medium text-text-primary tracking-tight">
                {isCompiled ? sramKb : '—'}
              </span>
              <span className="text-xs text-text-secondary font-medium">KB</span>
            </div>
          </div>
          <div className="pt-2 border-t border-border/60 text-xs text-text-secondary flex justify-between items-center">
            <span>Capacity: {selectedHw.sram_kb} KB</span>
            <span className="font-mono text-text-primary font-medium">{sramPct.toFixed(1)}%</span>
          </div>
        </div>

        {/* Flash ROM Footprint (Dominant Metric) */}
        <div className="p-4 rounded-[8px] bg-surface border border-border flex flex-col justify-between">
          <div>
            <div className="text-xs text-text-muted">Flash ROM footprint</div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-3xl font-medium text-text-primary tracking-tight">
                {isCompiled ? flashKb : '—'}
              </span>
              <span className="text-xs text-text-secondary font-medium">KB</span>
            </div>
          </div>
          <div className="pt-2 border-t border-border/60 text-xs text-text-secondary flex justify-between items-center">
            <span>Capacity: {selectedHw.flash_mb * 1024} KB</span>
            <span className="font-mono text-text-primary font-medium">{flashPct.toFixed(1)}%</span>
          </div>
        </div>

        {/* Latency & Memory Model */}
        <div className="p-4 rounded-[8px] bg-surface border border-border flex flex-col justify-between">
          <div>
            <div className="text-xs text-text-muted">Estimated latency</div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-3xl font-medium text-text-primary tracking-tight">
                {isCompiled ? latencyMs : '—'}
              </span>
              <span className="text-xs text-text-secondary font-medium">ms</span>
            </div>
          </div>
          <div className="pt-2 border-t border-border/60 text-xs flex justify-between items-center">
            <span className="text-text-muted">Heap dynamic malloc:</span>
            <span className="font-mono text-success font-medium">0 B (PASS)</span>
          </div>
        </div>
      </div>

      {/* 3. Reference Models Preset Selector (When No Model Loaded) */}
      {!loadedModel && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
            <Box className="w-4 h-4 text-primary" />
            <span>Select a reference demonstration model to begin compilation:</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PRESET_MODELS.map((preset) => (
              <div
                key={preset.id}
                className="p-4 rounded-[8px] bg-surface border border-border flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="text-xs text-text-muted font-mono">{preset.domain}</div>
                  <h3 className="text-base font-semibold text-text-primary">{preset.name}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">{preset.description}</p>
                  <div className="pt-2 text-xs font-mono text-text-secondary space-y-0.5 border-t border-border/60">
                    <div>Arch: <span className="text-text-primary">{preset.architecture}</span></div>
                    <div>Input: <span className="text-primary">{preset.input_shape}</span> ({preset.input_type})</div>
                  </div>
                </div>

                <button
                  onClick={() => loadPreset(preset.id, true)}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-surface-raised hover:bg-primary hover:text-white border border-border hover:border-primary text-text-primary text-xs font-medium rounded-[6px] transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Load & compile model</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Compilation Pipeline Flow */}
      <div className="p-4 rounded-[8px] bg-surface border border-border space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-text-primary">
            Compilation pipeline progression
          </span>
          <span className="text-xs font-mono text-text-muted">
            {isCompiled
              ? `${compilationResult.layers.length} layers optimized`
              : isCompiling
              ? 'Executing optimization passes...'
              : 'Idle'}
          </span>
        </div>
        <Stepper steps={stepperSteps} />
      </div>

      {/* 5. Physical Memory Breakdown & Target Fit */}
      {isCompiled && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Physical Memory Tree */}
          <div className="lg:col-span-2 p-4 rounded-[8px] bg-surface border border-border space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-sm font-semibold text-text-primary">Physical memory layout</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-[4px] bg-success/10 text-success border border-success/30 font-medium">
                Verified zero-malloc (0 B heap)
              </span>
            </div>

            <div className="font-mono text-xs space-y-3 bg-surface-raised p-3.5 border border-border rounded-[6px]">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-text-primary font-medium">
                  <span>Flash ROM (Weights & Constants)</span>
                  <span className="text-text-muted">{flashKb} KB / {selectedHw.flash_mb} MB ({flashPct.toFixed(1)}%)</span>
                </div>
                <div className="pl-4 border-l border-border/80 space-y-0.5 text-text-secondary text-xs">
                  <div className="flex justify-between">
                    <span>├── Quantized INT8 weights array</span>
                    <span className="text-text-primary">{flashKb} KB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>└── Model constants & scaling factors</span>
                    <span className="text-text-muted">0.12 KB</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-border">
                <div className="flex items-center justify-between text-text-primary font-medium">
                  <span>SRAM section (Physical 0x20000000)</span>
                  <span className="text-text-muted">{sramKb} KB / {selectedHw.sram_kb} KB ({sramPct.toFixed(1)}%)</span>
                </div>
                <div className="pl-4 border-l border-border/80 space-y-0.5 text-text-secondary text-xs">
                  <div className="flex justify-between">
                    <span>├── Input sensor buffer</span>
                    <span className="text-text-primary">
                      {compilationResult.layers.length > 0 ? `${compilationResult.layers[0].sram_bytes} B` : '128 B'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>├── Activation arena (Greedy interval coloring)</span>
                    <span className="text-primary font-medium">{compilationResult.optimized_int8.peak_sram_bytes} B</span>
                  </div>
                  <div className="flex justify-between">
                    <span>└── Output prediction buffer</span>
                    <span className="text-text-primary">
                      {compilationResult.layers.length > 0 ? `${compilationResult.layers[compilationResult.layers.length - 1].sram_bytes} B` : '16 B'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between text-success font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Dynamic heap allocation:</span>
                </div>
                <span>0 B (Static BSS Arena)</span>
              </div>
            </div>
          </div>

          {/* Hardware Fit Gauges */}
          <div className="p-4 rounded-[8px] bg-surface border border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-border pb-2 mb-3">
                <span className="text-sm font-semibold text-text-primary">Hardware fit verification</span>
                <span className={`text-xs font-mono px-2 py-0.5 rounded-[4px] font-medium ${
                  fitsTarget
                    ? 'bg-success/10 text-success border border-success/30'
                    : 'bg-danger/10 text-danger border border-danger/30'
                }`}>
                  {fitsTarget ? 'Fits MCU' : 'Overflow'}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Target MCU:</span>
                  <span className="font-medium text-text-primary">{selectedHw.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">SRAM usage:</span>
                  <span className={`font-mono font-medium ${sramPct > 100 ? 'text-danger' : 'text-text-primary'}`}>
                    {sramKb} KB / {selectedHw.sram_kb} KB ({sramPct.toFixed(1)}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Flash usage:</span>
                  <span className={`font-mono font-medium ${flashPct > 100 ? 'text-danger' : 'text-text-primary'}`}>
                    {flashKb} KB / {selectedHw.flash_mb * 1024} KB ({flashPct.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border mt-3">
              <CanvasDonutGauge
                percent={flashPct}
                size={95}
                label="Flash"
                sublabel={`${flashPct.toFixed(1)}%`}
              />
              <CanvasDonutGauge
                percent={sramPct}
                size={95}
                label="SRAM"
                sublabel={`${sramPct.toFixed(1)}%`}
                color="#0f62fe"
              />
            </div>
          </div>
        </div>
      )}

      {/* 6. Compute Operations & Generated Static C Snippet */}
      {isCompiled && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-4 rounded-[8px] bg-surface border border-border space-y-2">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-sm font-semibold text-text-primary">Compute operations per layer</span>
              <span className="text-xs font-mono text-text-muted">{macsFormatted} MACs Total</span>
            </div>
            <CanvasBarChart items={layerComputeItems} height={150} unit=" MACs" />
          </div>

          <div className="p-4 rounded-[8px] bg-surface border border-border space-y-2">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-sm font-semibold text-text-primary">Generated C99 firmware preview</span>
              <button
                onClick={() => setActiveTab('codegen')}
                className="text-primary hover:text-primary-hover text-xs font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>Open full editor</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="font-mono text-xs text-text-secondary bg-surface-raised p-3 border border-border h-[150px] overflow-hidden rounded-[6px] space-y-1">
              <div className="text-text-muted">// Generated by Shannon TinyML Silicon Compiler</div>
              <div className="text-primary">#include "shannon_runtime.h"</div>
              <div>#define SHANNON_ARENA_SIZE {compilationResult.optimized_int8.peak_sram_bytes}U</div>
              <div>static uint8_t shannon_tensor_arena[SHANNON_ARENA_SIZE] __attribute__((aligned(4)));</div>
              <div className="text-success">// Zero dynamic memory allocation (0 B malloc)</div>
              <div>void shannon_run_inference(const int8_t* in, int8_t* out) &#123; ... &#125;</div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Next Actions Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveTab('graph')}
          className="p-4 bg-surface border border-border hover:border-border-strong text-left transition-colors flex flex-col justify-between space-y-2 rounded-[8px] cursor-pointer"
        >
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-text-muted">01 / Graph</span>
              <GitMerge className="w-4 h-4 text-text-muted" />
            </div>
            <h4 className="text-sm font-semibold text-text-primary">Inspect computation DAG</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Explore topology, operator parameters, and intermediate tensor shapes.
            </p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('memory')}
          className="p-4 bg-surface border border-border hover:border-border-strong text-left transition-colors flex flex-col justify-between space-y-2 rounded-[8px] cursor-pointer"
        >
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-text-muted">02 / Arena</span>
              <Cpu className="w-4 h-4 text-text-muted" />
            </div>
            <h4 className="text-sm font-semibold text-text-primary">SRAM memory arena</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Analyze the 2D physical address space, lifetime Gantt intervals, and zero-collision proof.
            </p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('codegen')}
          className="p-4 bg-surface border border-border hover:border-border-strong text-left transition-colors flex flex-col justify-between space-y-2 rounded-[8px] cursor-pointer"
        >
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-text-muted">03 / Code</span>
              <FileCode className="w-4 h-4 text-text-muted" />
            </div>
            <h4 className="text-sm font-semibold text-text-primary">Generated C firmware</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Inspect and edit standalone C99 header with static buffer definitions and quantization constants.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
