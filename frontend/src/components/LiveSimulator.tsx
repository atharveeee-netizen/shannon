import React, { useState, useEffect, useRef } from 'react';
import { Play, Activity, Camera, Mic } from 'lucide-react';

interface Props {
  presetId: string;
  latencyMs: number;
}

export const LiveSimulator: React.FC<Props> = ({ presetId, latencyMs }) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'mic' | 'synthetic'>('synthetic');
  const [isRunning, setIsRunning] = useState(false);
  const [confidence, setConfidence] = useState<number>(94.8);
  const [predictionClass, setPredictionClass] = useState<string>('PERSON_DETECTED');
  const [isLiveActive, setIsLiveActive] = useState(false);
  const fps = Math.round(1000 / Math.max(latencyMs, 1));

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (presetId === 'kws') {
      setPredictionClass('KEYWORD: "YES"');
    } else if (presetId === 'anomaly') {
      setPredictionClass('NORMAL_VIBRATION (Score: 0.04)');
    } else {
      setPredictionClass('PERSON_DETECTED');
    }
    stopLiveStream();
  }, [presetId]);

  const runSingleInference = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setConfidence(+(93 + Math.random() * 6).toFixed(1));
    }, Math.max(latencyMs * 8, 150));
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsLiveActive(true);
      setActiveTab('camera');
    } catch (err) {
      alert('Camera access denied or unavailable. Falling back to synthetic stream.');
      setActiveTab('synthetic');
    }
  };

  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      setIsLiveActive(true);
      setActiveTab('mic');
    } catch (err) {
      alert('Microphone access denied or unavailable. Falling back to synthetic stream.');
      setActiveTab('synthetic');
    }
  };

  const stopLiveStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsLiveActive(false);
  };

  return (
    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Activity className="h-4 w-4 text-cyan-400" />
          <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
            In-Browser WebAssembly Simulator
          </h4>
        </div>
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px] font-mono">
          <button
            onClick={() => { stopLiveStream(); setActiveTab('synthetic'); }}
            className={`px-2 py-0.5 rounded ${activeTab === 'synthetic' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400'}`}
          >
            Synthetic
          </button>
          <button
            onClick={startCamera}
            className={`px-2 py-0.5 rounded flex items-center space-x-1 ${activeTab === 'camera' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400'}`}
          >
            <Camera className="h-3 w-3" />
            <span>Webcam</span>
          </button>
          <button
            onClick={startMic}
            className={`px-2 py-0.5 rounded flex items-center space-x-1 ${activeTab === 'mic' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400'}`}
          >
            <Mic className="h-3 w-3" />
            <span>Mic</span>
          </button>
        </div>
      </div>

      {/* Live Video / Audio Area */}
      {activeTab === 'camera' && isLiveActive && (
        <div className="relative mb-3 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center h-32">
          <video ref={videoRef} className="h-full w-full object-cover grayscale opacity-80" autoPlay muted playsInline />
          <canvas ref={canvasRef} className="hidden" width={48} height={48} />
          <div className="absolute inset-0 border-2 border-emerald-500/40 rounded-lg pointer-events-none flex items-start justify-between p-2">
            <span className="text-[9px] font-mono bg-slate-950/80 px-1.5 py-0.5 rounded text-emerald-400">
              48x48 Downsample • Live Frame
            </span>
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
          </div>
        </div>
      )}

      {activeTab === 'mic' && isLiveActive && (
        <div className="mb-3 p-3 rounded-lg border border-slate-800 bg-slate-950 flex items-center justify-center space-x-1 h-24">
          {[40, 70, 20, 90, 60, 30, 85, 45, 95, 25, 65, 80].map((h, i) => (
            <div
              key={i}
              className="w-2 bg-gradient-to-t from-amber-500 to-emerald-400 rounded-full animate-pulse"
              style={{ height: `${h}%`, animationDuration: `${0.3 + (i % 4) * 0.1}s` }}
            />
          ))}
        </div>
      )}

      {/* Output Display */}
      <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 mb-3 text-center">
        <span className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Live Output Prediction</span>
        <div className="text-xl font-bold font-mono text-emerald-400 tracking-tight">
          {predictionClass}
        </div>
        <div className="flex items-center justify-center space-x-4 mt-2 font-mono text-xs text-slate-400">
          <span>Confidence: <strong className="text-white">{confidence}%</strong></span>
          <span>•</span>
          <span>Latency: <strong className="text-white">{latencyMs} ms</strong></span>
          <span>•</span>
          <span>Throughput: <strong className="text-cyan-400">{fps} FPS</strong></span>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex items-center space-x-2">
        <button
          onClick={runSingleInference}
          disabled={isRunning}
          className="flex-1 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-mono font-bold text-xs flex items-center justify-center space-x-2 transition-all disabled:opacity-50 shadow-md shadow-emerald-500/10"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          <span>{isRunning ? 'Executing Vectorized INT8...' : 'Simulate 1 Hardware Cycle'}</span>
        </button>
      </div>
    </div>
  );
};