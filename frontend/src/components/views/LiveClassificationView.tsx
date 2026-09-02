import React, { useState } from 'react';
import {
  Radio,
  Play,
  Square,
  Sparkles,
  Zap,
} from 'lucide-react';
import { CompilationResult, HardwareProfile, PresetModel } from '../../types';

interface LiveClassificationViewProps {
  result: CompilationResult | null;
  selectedModel: PresetModel | null;
  selectedHw: HardwareProfile;
}

export const LiveClassificationView: React.FC<LiveClassificationViewProps> = ({
  result,
  selectedHw,
}) => {
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [activeWord, setActiveWord] = useState<string>('yes');
  const [confidence, setConfidence] = useState<number>(97.4);

  const testClasses = [
    { label: 'yes', prob: activeWord === 'yes' ? confidence : 0.4 },
    { label: 'no', prob: activeWord === 'no' ? confidence : 0.2 },
    { label: 'stop', prob: activeWord === 'stop' ? confidence : 0.3 },
    { label: 'go', prob: activeWord === 'go' ? confidence : 0.1 },
    { label: 'up', prob: activeWord === 'up' ? confidence : 0.2 },
    { label: 'down', prob: activeWord === 'down' ? confidence : 0.1 },
    { label: '_noise', prob: activeWord === '_noise' ? 88.0 : 1.2 },
  ];

  const handleSimulateWord = (word: string) => {
    setActiveWord(word);
    setConfidence(94.0 + Math.random() * 5.5);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto bg-[#0E131F]">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#202B3C] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#20E28B]">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>REAL-TIME INFERENCE TESTER</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Live Classification & Sensor Simulation
          </h1>
          <p className="text-xs text-[#94A3B8]">
            Test live audio streaming or accelerometer signals in real time using the compiled 0-malloc inference kernel.
          </p>
        </div>

        {/* Live Stream Toggle Button */}
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all self-start ${
            isRunning
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
              : 'bg-[#20E28B] text-[#0E131F] hover:bg-[#1BC97B]'
          }`}
        >
          {isRunning ? <Square className="w-3.5 h-3.5 fill-rose-400" /> : <Play className="w-3.5 h-3.5 fill-[#0E131F]" />}
          <span>{isRunning ? 'Pause Live Stream' : 'Start Live Stream'}</span>
        </button>
      </div>

      {/* 2. Audio Waveform Simulator Card */}
      <div className="p-6 rounded-lg bg-[#151D2A] border border-[#202B3C] space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#20E28B]" />
            <h2 className="text-sm font-bold text-white">Live Microphone Signal (16kHz PCM DMA)</h2>
          </div>
          <span className="text-xs font-mono text-[#94A3B8]">
            Sample Rate: 16,000 Hz | Window: 1000ms
          </span>
        </div>

        {/* Dynamic Simulated Waveform Bars */}
        <div className="h-32 bg-[#101620] rounded-lg border border-[#202B3C] p-4 flex items-center justify-center gap-1 overflow-hidden">
          {Array.from({ length: 64 }).map((_, idx) => {
            const h = isRunning
              ? Math.sin((idx + Date.now() / 300) * 0.3) * 45 + Math.cos(idx * 0.6) * 35 + 15
              : 8;
            const clampedH = Math.max(6, Math.min(95, h));
            const isCenter = idx > 22 && idx < 42;

            return (
              <div
                key={idx}
                className={`flex-1 rounded-full transition-all duration-150 ${
                  isCenter
                    ? 'bg-[#20E28B]'
                    : 'bg-[#334155]'
                }`}
                style={{ height: `${clampedH}%` }}
              />
            );
          })}
        </div>

        {/* Quick Acoustic Trigger Test Buttons */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono text-[#64748B] block">
            INJECT SIMULATED VOICE DATA:
          </span>
          <div className="flex flex-wrap gap-2">
            {['yes', 'no', 'stop', 'go', 'up', 'down', '_noise'].map((word) => (
              <button
                key={word}
                onClick={() => handleSimulateWord(word)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all ${
                  activeWord === word
                    ? 'bg-[#20E28B] text-[#0E131F] shadow-sm shadow-[#20E28B]/20'
                    : 'bg-[#1B2431] text-[#CBD5E1] border border-[#2A3649] hover:bg-[#232E3E]'
                }`}
              >
                "{word}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Real-Time Classification Output Meters */}
      <div className="p-6 rounded-lg bg-[#151D2A] border border-[#202B3C] space-y-5">
        <div className="flex items-center justify-between border-b border-[#202B3C] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#20E28B]" />
            <h3 className="text-sm font-bold text-white">Class Confidence Vectors</h3>
          </div>
          <span className="text-xs font-mono text-[#20E28B]">
            Latency: {result?.optimized_int8.estimated_latency_ms.toFixed(2) || '1.84'} ms ({selectedHw.name})
          </span>
        </div>

        <div className="space-y-3">
          {testClasses.map((item) => {
            const isTop = item.prob > 50;
            return (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className={`font-bold ${isTop ? 'text-white text-sm' : 'text-[#94A3B8]'}`}>
                    {item.label}
                  </span>
                  <span className={`font-bold ${isTop ? 'text-[#20E28B]' : 'text-[#64748B]'}`}>
                    {item.prob.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-[#101620] h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isTop
                        ? 'bg-[#20E28B]'
                        : 'bg-[#253041]'
                    }`}
                    style={{ width: `${item.prob}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Telemetry Footer */}
      <div className="p-4 rounded-lg bg-[#151D2A] border border-[#202B3C] flex items-center justify-between text-xs font-mono text-[#94A3B8]">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>DMA Buffer: 1,000 samples @ 16-bit PCM (0 Heap Allocations)</span>
        </div>
        <span className="text-[#20E28B] font-bold">100% Deterministic Execution</span>
      </div>
    </div>
  );
};
