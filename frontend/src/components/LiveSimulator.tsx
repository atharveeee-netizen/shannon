import React, { useState, useEffect } from 'react';
import { Play, Activity } from 'lucide-react';

interface Props {
  presetId: string;
  latencyMs: number;
}

export const LiveSimulator: React.FC<Props> = ({ presetId, latencyMs }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [confidence, setConfidence] = useState<number>(94.8);
  const [predictionClass, setPredictionClass] = useState<string>('PERSON_DETECTED');
  const fps = Math.round(1000 / Math.max(latencyMs, 1));

  useEffect(() => {
    if (presetId === 'kws') {
      setPredictionClass('KEYWORD: "YES"');
    } else if (presetId === 'anomaly') {
      setPredictionClass('NORMAL_VIBRATION (Score: 0.04)');
    } else {
      setPredictionClass('PERSON_DETECTED');
    }
  }, [presetId]);

  const runSingleInference = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setConfidence(+(92 + Math.random() * 7).toFixed(1));
    }, Math.max(latencyMs * 10, 200));
  };

  return (
    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Activity className="h-4 w-4 text-cyan-400" />
          <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
            In-Browser WebAssembly Simulator
          </h4>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          Zero Cloud Latency
        </span>
      </div>

      <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80 mb-3 text-center">
        <span className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Live Output Prediction</span>
        <div className="text-xl font-bold font-mono text-emerald-400 tracking-tight">
          {predictionClass}
        </div>
        <div className="flex items-center justify-center space-x-4 mt-2 font-mono text-xs text-slate-400">
          <span>Confidence: <strong className="text-white">{confidence}%</strong></span>
          <span>•</span>
          <span>Exec: <strong className="text-white">{latencyMs} ms</strong></span>
          <span>•</span>
          <span>Throughput: <strong className="text-cyan-400">{fps} FPS</strong></span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={runSingleInference}
          disabled={isRunning}
          className="flex-1 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-mono font-bold text-xs flex items-center justify-center space-x-2 transition-all disabled:opacity-50 shadow-md shadow-emerald-500/10"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          <span>{isRunning ? 'Running Inference...' : 'Simulate 1 Hardware Cycle'}</span>
        </button>
      </div>
    </div>
  );
};