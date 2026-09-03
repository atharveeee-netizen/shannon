import React from 'react';
import { FileCode, CheckCircle2, ArrowRight } from 'lucide-react';
import { useCompiler } from '../../context/CompilerContext';
import { PRESET_MODELS } from '../../services/api';

export const DashboardView: React.FC = () => {
  const {
    loadedModel,
    selectedHw,
    isCompiling,
    compilationResult,
    triggerCompile,
    loadPreset,
    downloadHeader,
    setActiveTab,
  } = useCompiler();

  const isCompiled = !!compilationResult && !isCompiling;

  // 1. MODEL
  const modelName = loadedModel ? loadedModel.name : 'NO MODEL';
  const modelParams = loadedModel ? loadedModel.architecture : '—';
  
  // 2. INT8
  const layersCount = isCompiled ? compilationResult.optimized_int8.compression_ratio.toFixed(1) + 'x' : '—';

  // 3. MEMORY
  const sramBytes = isCompiled ? compilationResult.optimized_int8.peak_sram_bytes.toLocaleString() : '—';
  const zeroMalloc = isCompiled ? compilationResult.zero_malloc_verified : false;

  // 4. HARDWARE
  const hwName = selectedHw.name;
  const sramPct = isCompiled ? (compilationResult.optimized_int8.peak_sram_bytes / (selectedHw.sram_kb * 1024)) * 100 : 0;
  const flashPct = isCompiled ? (compilationResult.optimized_int8.flash_bytes / (selectedHw.flash_mb * 1024 * 1024)) * 100 : 0;

  // 5. C CODE
  const flashBytes = isCompiled ? compilationResult.optimized_int8.flash_bytes.toLocaleString() : '—';

  return (
    <div className="w-full h-full p-8 md:p-12 max-w-[1600px] mx-auto flex flex-col justify-center">
      
      {!loadedModel && (
        <div className="mb-16">
          <div className="text-[11px] uppercase tracking-widest text-text-muted mb-6">Select a reference model to begin</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PRESET_MODELS.map((preset) => (
              <div 
                key={preset.id}
                onClick={() => loadPreset(preset.id, true)}
                className="group cursor-pointer border-t border-border pt-4 transition-colors hover:border-primary"
              >
                <div className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">{preset.name}</div>
                <div className="text-xs text-text-secondary mt-1 font-mono">{preset.input_shape} • {preset.architecture}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* THE 5 SECONDS PIPELINE */}
      <div className="flex flex-col md:flex-row items-stretch justify-between gap-4 md:gap-0 relative">
        
        {/* MODEL */}
        <div className="flex-1 flex flex-col justify-between py-6 px-4 md:px-6 hover:bg-surface-raised transition-colors group">
          <div>
            <div className="text-[11px] font-mono text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-4 h-[1px] bg-border group-hover:bg-primary transition-colors"></span>
              1. Model
            </div>
            <div className="text-3xl lg:text-4xl font-medium text-text-primary tracking-tight leading-none mb-2">
              {modelName}
            </div>
          </div>
          <div className="text-sm font-mono text-text-secondary mt-8">
            {modelParams}
          </div>
        </div>

        {/* INT8 */}
        <div className="flex-1 flex flex-col justify-between py-6 px-4 md:px-6 border-t md:border-t-0 md:border-l border-border hover:bg-surface-raised transition-colors group">
          <div>
            <div className="text-[11px] font-mono text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-4 h-[1px] bg-border group-hover:bg-primary transition-colors"></span>
              2. INT8
            </div>
            <div className="text-3xl lg:text-4xl font-medium text-text-primary tracking-tight leading-none mb-2 font-mono">
              {layersCount}
            </div>
          </div>
          <div className="text-sm font-mono text-text-secondary mt-8">
            Compression Ratio
          </div>
        </div>

        {/* MEMORY */}
        <div className="flex-1 flex flex-col justify-between py-6 px-4 md:px-6 border-t md:border-t-0 md:border-l border-border hover:bg-surface-raised transition-colors group">
          <div>
            <div className="text-[11px] font-mono text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-4 h-[1px] bg-border group-hover:bg-primary transition-colors"></span>
              3. Memory
            </div>
            <div className="text-3xl lg:text-4xl font-medium text-text-primary tracking-tight leading-none mb-2 font-mono flex items-baseline gap-1">
              {sramBytes} <span className="text-sm text-text-muted">B</span>
            </div>
          </div>
          <div className="text-sm font-mono text-text-secondary mt-8 flex items-center gap-2">
            Peak SRAM Arena
            {zeroMalloc && <CheckCircle2 className="w-4 h-4 text-success" />}
          </div>
        </div>

        {/* HARDWARE */}
        <div className="flex-1 flex flex-col justify-between py-6 px-4 md:px-6 border-t md:border-t-0 md:border-l border-border hover:bg-surface-raised transition-colors group">
          <div>
            <div className="text-[11px] font-mono text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-4 h-[1px] bg-border group-hover:bg-primary transition-colors"></span>
              4. Hardware
            </div>
            <div className="text-3xl lg:text-4xl font-medium text-text-primary tracking-tight leading-none mb-2">
              {hwName}
            </div>
          </div>
          <div className="text-sm font-mono mt-8 flex flex-col gap-1">
            <span className={sramPct > 100 ? 'text-danger' : 'text-text-secondary'}>SRAM: {sramPct.toFixed(1)}%</span>
            <span className={flashPct > 100 ? 'text-danger' : 'text-text-secondary'}>Flash: {flashPct.toFixed(1)}%</span>
          </div>
        </div>

        {/* C CODE */}
        <div className="flex-1 flex flex-col justify-between py-6 px-4 md:px-6 border-t md:border-t-0 md:border-l border-border hover:bg-surface-raised transition-colors group">
          <div>
            <div className="text-[11px] font-mono text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-4 h-[1px] bg-border group-hover:bg-primary transition-colors"></span>
              5. C Code
            </div>
            <div className="text-3xl lg:text-4xl font-medium text-text-primary tracking-tight leading-none mb-2 font-mono flex items-baseline gap-1">
              {flashBytes} <span className="text-sm text-text-muted">B</span>
            </div>
          </div>
          <div className="text-sm font-mono text-text-secondary mt-8">
            Total Binary Footprint
          </div>
        </div>
      </div>

      {/* PRIMARY CTA */}
      <div className="mt-16 flex flex-col md:flex-row items-center gap-6 justify-center">
        <button
          onClick={() => triggerCompile()}
          disabled={!loadedModel || isCompiling}
          className={`px-12 py-4 rounded-[6px] text-base font-medium flex items-center gap-3 transition-colors ${
            !loadedModel 
              ? 'bg-surface-raised text-text-muted cursor-not-allowed'
              : isCompiling 
              ? 'bg-primary/50 text-white cursor-wait'
              : 'bg-primary text-white hover:bg-[#0043CE] cursor-pointer'
          }`}
        >
          {isCompiling ? 'COMPILING...' : 'COMPILE PIPELINE'}
        </button>

        {isCompiled && (
          <div className="flex items-center gap-4 border-l border-border pl-6">
            <button 
              onClick={() => setActiveTab('graph')}
              className="text-sm text-text-secondary hover:text-primary transition-colors cursor-pointer flex items-center gap-1"
            >
              Inspect DAG <ArrowRight className="w-3 h-3" />
            </button>
            <button 
              onClick={() => setActiveTab('memory')}
              className="text-sm text-text-secondary hover:text-primary transition-colors cursor-pointer flex items-center gap-1"
            >
              View Arena <ArrowRight className="w-3 h-3" />
            </button>
            <button 
              onClick={downloadHeader}
              className="text-sm text-text-secondary hover:text-primary transition-colors cursor-pointer flex items-center gap-1"
            >
              Export C99 Header <FileCode className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
