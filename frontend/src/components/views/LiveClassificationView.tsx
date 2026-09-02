import React, { useState, useEffect } from 'react';
import {
  Radio,
  Mic,
  MicOff,
  Activity,
  Volume2,
} from 'lucide-react';
import { CompilationResult, HardwareProfile, PresetModel } from '../../types';

interface LiveClassificationViewProps {
  result: CompilationResult | null;
  selectedModel: PresetModel | null;
  selectedHw: HardwareProfile;
}

export const LiveClassificationView: React.FC<LiveClassificationViewProps> = ({
  result,
  selectedModel,
  selectedHw,
}) => {
  const isAudio = selectedModel?.id === 'kws';
  const isVision = selectedModel?.id === 'vision';
  const isAnomaly = selectedModel?.id === 'anomaly';

  const [isListening, setIsListening] = useState<boolean>(false);
  const [activeWord, setActiveWord] = useState<string>('stop');
  const [probabilities, setProbabilities] = useState<{ label: string; score: number }[]>([
    { label: 'stop', score: 0.964 },
    { label: 'go', score: 0.012 },
    { label: 'yes', score: 0.008 },
    { label: 'no', score: 0.005 },
    { label: 'silence', score: 0.006 },
    { label: 'unknown', score: 0.005 },
  ]);

  const [isAnomalous, setIsAnomalous] = useState<boolean>(false);

  useEffect(() => {
    let interval: any;
    if (isListening) {
      interval = setInterval(() => {
        if (isAudio) {
          const words = ['yes', 'no', 'stop', 'go', 'on', 'off'];
          const picked = words[Math.floor(Math.random() * words.length)];
          setActiveWord(picked);
          setProbabilities([
            { label: picked, score: 0.94 + Math.random() * 0.05 },
            { label: 'silence', score: 0.02 },
            { label: 'unknown', score: 0.01 },
            { label: 'other', score: 0.01 },
          ]);
        }
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [isListening, isAudio]);

  const latencyMs = result?.optimized_int8.estimated_latency_ms || 1.84;
  const sramBytes = result?.optimized_int8.peak_sram_bytes || 1144;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
            <Radio className="w-4 h-4" />
            <span>REAL-TIME SENSOR TESTING</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Live Classification Studio
          </h1>
          <p className="text-xs text-slate-400">
            Simulate and test real-time INT8 model inference before deploying code to physical microcontroller silicon.
          </p>
        </div>

        <button
          onClick={() => setIsListening(!isListening)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-md ${
            isListening
              ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4" />
              <span>Stop Live Simulation</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              <span>Start Live Sensor Stream</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Live Sensor Canvas & Inference Stream */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Waveform / Visualizer Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white">
                  {isAudio ? 'Acoustic DMA Waveform Stream' : isVision ? 'Camera Frame 48x48 Matrix' : '3-Axis Vibration Sensor PSD'}
                </h2>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
                {isListening ? 'STREAMING ACTIVE' : 'STANDBY'}
              </span>
            </div>

            {/* Visualizer Canvas Simulation */}
            <div className="h-44 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
              {isListening ? (
                <div className="flex items-end gap-1.5 h-full w-full justify-center">
                  {Array.from({ length: 32 }).map((_, i) => {
                    const height = Math.min(100, Math.max(15, Math.sin(i * 0.4 + Date.now() * 0.005) * 50 + 50));
                    return (
                      <div
                        key={i}
                        className="w-2.5 bg-gradient-to-t from-emerald-500/30 to-emerald-400 rounded-t transition-all duration-150"
                        style={{ height: `${height}%` }}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <Activity className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-500 font-mono">Click "Start Live Sensor Stream" to begin real-time inference</p>
                </div>
              )}

              {/* Detected Trigger Badge Overlay */}
              {isListening && isAudio && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-xs">
                  DETECTED: "{activeWord.toUpperCase()}"
                </div>
              )}
            </div>

            {/* Quick Test Sample Trigger Buttons */}
            {isAudio && (
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-mono text-slate-500">Inject Simulated Voice Sample:</span>
                <div className="flex flex-wrap gap-2">
                  {['yes', 'no', 'stop', 'go', 'on', 'off'].map((w) => (
                    <button
                      key={w}
                      onClick={() => {
                        setActiveWord(w);
                        setProbabilities([
                          { label: w, score: 0.97 },
                          { label: 'silence', score: 0.01 },
                          { label: 'unknown', score: 0.01 },
                          { label: 'other', score: 0.01 },
                        ]);
                      }}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700 transition-all"
                    >
                      🗣️ "{w}"
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isAnomaly && (
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setIsAnomalous(!isAnomalous)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                    isAnomalous
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  {isAnomalous ? 'Simulating Bearing Fault (Defect)' : 'Simulate Bearing Defect Injection'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Real-Time Prediction Confidences */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Live Prediction Scores</h3>
            <span className="text-[11px] font-mono text-emerald-400">
              {latencyMs.toFixed(2)} ms
            </span>
          </div>

          {/* Probabilities Bars */}
          <div className="space-y-4">
            {probabilities.map((item, idx) => (
              <div key={idx} className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold capitalize">{item.label}</span>
                  <span className={item.score > 0.5 ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                    {(item.score * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      item.score > 0.5 ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                    style={{ width: `${Math.min(100, item.score * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Microcontroller Silicon Execution Proof */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
            <div className="text-slate-500 font-bold">SILICON TELEMETRY</div>
            <div className="flex justify-between">
              <span className="text-slate-400">Target Chip:</span>
              <span className="text-white font-bold">{selectedHw.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Heap Allocations:</span>
              <span className="text-emerald-400 font-bold">0 bytes malloc</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">SRAM Arena Used:</span>
              <span className="text-cyan-300 font-bold">{(sramBytes / 1024).toFixed(2)} KB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
