import React from 'react';
import { Sliders, Radio, Activity, Camera, ArrowRight } from 'lucide-react';
import { useCompiler } from '../../context/CompilerContext';
import { Panel } from '../ui/Panel';
import { EmptyState } from '../ui/EmptyState';
import { SpotlightCard } from '../react-bits/SpotlightCard';

export const InputsView: React.FC = () => {
  const { loadedModel, compilationResult, selectedHw, setActiveTab } = useCompiler();

  if (!loadedModel) {
    return (
      <div className="p-6 w-full max-w-none">
        <EmptyState
          title="No Sensor Input Configured"
          description="Load or import a model to configure its real-time sensor DMA buffer and preprocessing specification."
        />
      </div>
    );
  }

  const isAudio = loadedModel.id === 'kws' || loadedModel.domain.toLowerCase().includes('audio');
  const isVision = loadedModel.id === 'vision' || loadedModel.domain.toLowerCase().includes('vision');

  const inputTensor = compilationResult?.layers[0]?.in_shape || loadedModel.input_shape;
  const inputBytes = compilationResult?.layers[0]?.in_shape
    ? compilationResult.layers[0].in_shape.split('x').reduce((a, b) => a * parseInt(b || '1'), 1)
    : 490;

  return (
    <div className="p-6 space-y-6 w-full max-w-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-semibold">
            <Sliders className="w-4 h-4" />
            <span>SENSOR INGESTION & DMA INTERFACE</span>
          </div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            Input Tensor & Preprocessing: {loadedModel.name}
          </h1>
          <p className="text-xs text-text-secondary max-w-4xl">
            Hardware DMA channel bindings, sampling rates, normalization scaling, and tensor buffer geometry.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('graph')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-primary hover:bg-primary-hover text-white text-xs font-semibold self-start transition-all cursor-pointer"
        >
          <span>View Ingestion in DAG</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Sensor Specification */}
        <div className="lg:col-span-2 space-y-6">
          <Panel title="Hardware Sensor DMA Configuration" subtitle={`Mapped to physical ${selectedHw.name} peripheral pins`}>
            <div className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SpotlightCard className="p-4 space-y-1">
                  <div className="flex items-center gap-2 text-text-muted text-[11px]">
                    {isAudio ? <Radio className="w-3.5 h-3.5 text-primary" /> : isVision ? <Camera className="w-3.5 h-3.5 text-primary" /> : <Activity className="w-3.5 h-3.5 text-primary" />}
                    <span>HARDWARE PERIPHERAL</span>
                  </div>
                  <div className="text-sm font-bold text-text-primary">
                    {isAudio ? 'I2S DMA Microphone (INMP441)' : isVision ? 'DVP Camera Interface (OV2640)' : 'I2C/SPI Accelerometer (MPU6050)'}
                  </div>
                </SpotlightCard>

                <SpotlightCard className="p-4 space-y-1">
                  <div className="text-text-muted text-[11px]">SAMPLING SPECIFICATION</div>
                  <div className="text-sm font-bold text-text-primary">
                    {isAudio ? '16,000 Hz, 16-bit Mono PCM' : isVision ? '48x48 Grayscale @ 15 FPS' : '1,000 Hz 3-Axis ±16g'}
                  </div>
                </SpotlightCard>
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex justify-between py-1.5 border-b border-border/50 text-text-secondary">
                  <span>Input Tensor Dimensions:</span>
                  <span className="text-primary font-bold">{inputTensor}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/50 text-text-secondary">
                  <span>DMA Ring Buffer Size:</span>
                  <span className="text-text-primary font-medium">{inputBytes} Bytes (Static 0-Malloc)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/50 text-text-secondary">
                  <span>Physical SRAM Base Section:</span>
                  <span className="text-cyan-400 font-medium">0x20000000 + 0x0000</span>
                </div>
                <div className="flex justify-between py-1.5 text-text-secondary">
                  <span>Normalization Transform:</span>
                  <span className="text-text-primary font-medium">
                    {isAudio ? '10-Channel Mel Filterbank (MFCC)' : isVision ? 'uint8 [0, 255] -> int8 [-128, 127]' : '128-Point FFT Power Spectrum'}
                  </span>
                </div>
              </div>
            </div>
          </Panel>
        </div>

        {/* Right 1 Col: Timing & Ring Buffer */}
        <div className="space-y-6">
          <Panel title="Buffer Lifecycle" subtitle="Continuous streaming sliding window">
            <div className="space-y-3 text-xs">
              <SpotlightCard className="p-4 space-y-1">
                <div className="text-text-muted text-[11px] font-mono uppercase">Window Size</div>
                <div className="text-xl font-bold text-text-primary font-mono">
                  {isAudio ? '1,000 ms' : isVision ? '66.6 ms' : '128 ms'}
                </div>
              </SpotlightCard>

              <SpotlightCard className="p-4 space-y-1">
                <div className="text-text-muted text-[11px] font-mono uppercase">Inference Interval</div>
                <div className="text-xl font-bold text-primary font-mono">
                  {isAudio ? '100 ms (10 Hz)' : isVision ? '66.6 ms (15 Hz)' : '1000 ms (1 Hz)'}
                </div>
              </SpotlightCard>

              <p className="text-xs text-text-secondary leading-relaxed pt-2 font-sans">
                All input samples stream directly into <code>shannon_tensor_arena[0]</code> via DMA without CPU cycle blocking or dynamic allocation.
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};
