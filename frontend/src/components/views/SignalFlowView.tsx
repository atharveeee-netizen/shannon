import React from 'react';
import { Workflow } from 'lucide-react';
import { useCompiler } from '../../context/CompilerContext';
import { EmptyState } from '../ui/EmptyState';
import { Panel } from '../ui/Panel';

export const SignalFlowView: React.FC = () => {
  const { loadedModel, compilationResult } = useCompiler();

  if (!loadedModel || !compilationResult) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <EmptyState
          title="Signal Flow Diagram Not Available"
          description="Compile a model to map the physical sensor signal flow through the DSP preprocessing and quantized tensor arena."
          allowCompile={true}
        />
      </div>
    );
  }

  const layers = compilationResult.layers;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-accent">
            <Workflow className="w-4 h-4" />
            <span>END-TO-END SIGNAL PIPELINE</span>
          </div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            Signal Flow Data Pipeline: {compilationResult.model_name}
          </h1>
          <p className="text-xs text-text-secondary">
            Continuous sensor DMA acquisition &rarr; fixed-point feature extraction &rarr; static tensor arena inference.
          </p>
        </div>
      </div>

      <Panel title="Continuous Streaming Signal Dataflow" subtitle="Hardware DMA to Output Probability">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div className="p-4 rounded bg-surface-raised/40 border border-border border-t-2 border-t-blue-400 space-y-2">
            <span className="text-[10px] font-mono font-bold text-blue-400 uppercase">1. SENSOR DMA</span>
            <div className="text-sm font-bold text-text-primary">Raw Hardware Input</div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Interrupt-driven ring buffer streaming directly to SRAM section <code>0x20000000</code>.
            </p>
            <div className="text-xs font-mono text-text-muted pt-2 border-t border-border">
              {layers[0]?.in_shape || loadedModel.input_shape}
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded bg-surface-raised/40 border border-border border-t-2 border-t-amber-400 space-y-2">
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">2. DSP PREPROCESSING</span>
            <div className="text-sm font-bold text-text-primary">Feature Extraction</div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Fixed-point normalization and spectral feature transforms in zero-malloc buffers.
            </p>
            <div className="text-xs font-mono text-text-muted pt-2 border-t border-border">
              CMSIS-DSP Native
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded bg-surface-raised/40 border border-border border-t-2 border-t-accent space-y-2">
            <span className="text-[10px] font-mono font-bold text-accent uppercase">3. INT8 INFERENCE</span>
            <div className="text-sm font-bold text-text-primary">Quantized Neural Core</div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Vectorized SIMD multiplier kernel executing layer operations within {compilationResult.optimized_int8.peak_sram_bytes} Bytes SRAM.
            </p>
            <div className="text-xs font-mono text-accent pt-2 border-t border-border">
              {layers.length} Layers Executed
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded bg-surface-raised/40 border border-border border-t-2 border-t-emerald-400 space-y-2">
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">4. SILICON OUTPUT</span>
            <div className="text-sm font-bold text-text-primary">Classification Vector</div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Output probability vector written to caller buffer with 0 heap allocation.
            </p>
            <div className="text-xs font-mono text-emerald-400 pt-2 border-t border-border">
              {layers[layers.length - 1]?.out_shape || 'Output Logits'}
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
};
