import React from 'react';
import { Workflow, Info } from 'lucide-react';
import { useCompiler } from '../../context/CompilerContext';
import { EmptyState } from '../ui/EmptyState';
import { Panel } from '../ui/Panel';
import { SpotlightCard } from '../react-bits/SpotlightCard';

export const SignalFlowView: React.FC = () => {
  const { loadedModel, compilationResult } = useCompiler();

  if (!loadedModel || !compilationResult) {
    return (
      <div className="p-6 w-full max-w-none">
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
    <div className="p-6 space-y-6 w-full max-w-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-semibold">
            <Workflow className="w-4 h-4" />
            <span>END-TO-END EXECUTION ARCHITECTURE</span>
          </div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            Execution Architecture: {compilationResult.model_name}
          </h1>
          <p className="text-xs text-text-secondary max-w-4xl">
            Static dataflow topology: sensor ingestion buffer &rarr; fixed-point operator pipeline &rarr; static classification tensor.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-raised border border-border text-text-secondary font-mono text-xs rounded-md">
          <Info className="w-3.5 h-3.5 text-primary" />
          <span>ARCHITECTURAL DIAGRAM</span>
        </div>
      </div>

      <div className="p-3 bg-surface-raised border border-border text-text-secondary font-mono text-xs rounded-lg flex items-center gap-2">
        <Info className="w-4 h-4 text-primary flex-shrink-0" />
        <span>Structural architectural diagram illustrating data movement and buffer lifecycles across MCU physical memory.</span>
      </div>

      <Panel title="Continuous Streaming Signal Dataflow" subtitle="Hardware DMA to Output Probability">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Step 1 */}
          <SpotlightCard className="p-4 space-y-2 border-t-2 border-t-primary">
            <span className="text-xs font-mono font-bold text-primary">1. Sensor DMA</span>
            <div className="text-sm font-semibold text-text-primary">Raw Hardware Input</div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Interrupt-driven ring buffer streaming directly to SRAM section <code>0x20000000</code>.
            </p>
            <div className="text-xs font-mono text-text-muted pt-2 border-t border-border">
              {layers[0]?.in_shape || loadedModel.input_shape}
            </div>
          </SpotlightCard>

          {/* Step 2 */}
          <SpotlightCard className="p-4 space-y-2 border-t-2 border-t-amber-500">
            <span className="text-xs font-mono font-bold text-amber-500">2. DSP preprocessing</span>
            <div className="text-sm font-semibold text-text-primary">Feature Extraction</div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Fixed-point Hann windowing &amp; integer FFT / spectrogram decomposition.
            </p>
            <div className="text-xs font-mono text-text-muted pt-2 border-t border-border">
              Fixed-Point Q7.8 Format
            </div>
          </SpotlightCard>

          {/* Step 3 */}
          <SpotlightCard className="p-4 space-y-2 border-t-2 border-t-emerald-500">
            <span className="text-xs font-mono font-bold text-emerald-500">3. INT8 arena inference</span>
            <div className="text-sm font-semibold text-text-primary">Quantized Kernel DAG</div>
            <p className="text-xs text-text-secondary leading-relaxed">
              In-place 4-way loop unrolled kernels executing in non-overlapping SRAM arena intervals.
            </p>
            <div className="text-xs font-mono text-text-muted pt-2 border-t border-border">
              {compilationResult.optimized_int8.peak_sram_bytes} Bytes Peak Arena
            </div>
          </SpotlightCard>

          {/* Step 4 */}
          <SpotlightCard className="p-4 space-y-2 border-t-2 border-t-cyan-500">
            <span className="text-xs font-mono font-bold text-cyan-500">4. Classification</span>
            <div className="text-sm font-semibold text-text-primary">Decision &amp; Telemetry</div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Softmax or argmax evaluation dispatched over UART / SPI telemetry ring.
            </p>
            <div className="text-xs font-mono text-text-muted pt-2 border-t border-border">
              0 B Heap Allocation
            </div>
          </SpotlightCard>
        </div>
      </Panel>
    </div>
  );
};
