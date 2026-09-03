import React from 'react';
import { Workflow, Info } from 'lucide-react';
import { useCompiler } from '../../context/CompilerContext';
import { EmptyState } from '../ui/EmptyState';
import { Panel } from '../ui/Panel';

export const SignalFlowView: React.FC = () => {
  const { loadedModel, compilationResult } = useCompiler();

  if (!loadedModel || !compilationResult) {
    return (
      <div className="p-6 max-w-7xl mx-auto rounded-none">
        <EmptyState
          title="Execution Architecture Not Available"
          description="Compile a model to view the physical memory and dataflow execution architecture."
          allowCompile={true}
        />
      </div>
    );
  }

  const layers = compilationResult.layers;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto rounded-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4 rounded-none">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-primary">
            <Workflow className="w-3.5 h-3.5" />
            <span>END-TO-END EXECUTION ARCHITECTURE</span>
          </div>
          <h1 className="text-xl font-light text-text-primary tracking-tight">
            Execution Architecture: {compilationResult.model_name}
          </h1>
          <p className="text-xs text-text-secondary">
            Static dataflow topology: sensor ingestion buffer &rarr; fixed-point operator pipeline &rarr; static classification tensor.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-raised border border-border text-text-secondary font-mono text-xs rounded-none">
          <Info className="w-3.5 h-3.5 text-primary" />
          <span>ARCHITECTURAL DIAGRAM</span>
        </div>
      </div>

      <div className="p-3 bg-surface border border-border text-text-secondary font-mono text-xs rounded-none flex items-center gap-2">
        <Info className="w-4 h-4 text-primary flex-shrink-0" />
        <span>Notice: This is a structural architectural diagram illustrating data movement and buffer lifecycles, not live measured hardware telemetry.</span>
      </div>

      <Panel title="Continuous Streaming Signal Dataflow" subtitle="Hardware DMA to Output Probability">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Step 1 */}
          <div className="p-3.5 bg-surface-raised/40 border border-border border-t-2 border-t-primary space-y-2 rounded-none">
            <span className="text-[10px] font-mono font-bold text-primary uppercase">1. SENSOR DMA</span>
            <div className="text-sm font-semibold text-text-primary">Raw Hardware Input</div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Interrupt-driven ring buffer streaming directly to SRAM section <code>0x20000000</code>.
            </p>
            <div className="text-xs font-mono text-text-muted pt-2 border-t border-border">
              {layers[0]?.in_shape || loadedModel.input_shape}
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 bg-surface-raised/40 border border-border border-t-2 border-t-amber-500 space-y-2 rounded-none">
            <span className="text-[10px] font-mono font-bold text-amber-500 uppercase">2. DSP PREPROCESSING</span>
            <div className="text-sm font-semibold text-text-primary">Feature Extraction</div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Fixed-point Hann windowing &amp; integer FFT / spectrogram decomposition.
            </p>
            <div className="text-xs font-mono text-text-muted pt-2 border-t border-border">
              Fixed-Point Q7.8 Format
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 bg-surface-raised/40 border border-border border-t-2 border-t-emerald-500 space-y-2 rounded-none">
            <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase">3. INT8 ARENA INFERENCE</span>
            <div className="text-sm font-semibold text-text-primary">Quantized Kernel DAG</div>
            <p className="text-xs text-text-secondary leading-relaxed">
              In-place 4-way loop unrolled kernels executing in non-overlapping SRAM arena intervals.
            </p>
            <div className="text-xs font-mono text-text-muted pt-2 border-t border-border">
              {compilationResult.optimized_int8.peak_sram_bytes} Bytes Peak Arena
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-3.5 bg-surface-raised/40 border border-border border-t-2 border-t-cyan-500 space-y-2 rounded-none">
            <span className="text-[10px] font-mono font-bold text-cyan-500 uppercase">4. CLASSIFICATION</span>
            <div className="text-sm font-semibold text-text-primary">Decision &amp; Telemetry</div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Softmax or argmax evaluation dispatched over UART / SPI telemetry ring.
            </p>
            <div className="text-xs font-mono text-text-muted pt-2 border-t border-border">
              0 B Heap Allocation
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
};
