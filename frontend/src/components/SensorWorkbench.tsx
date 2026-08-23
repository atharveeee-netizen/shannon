import React, { useState, useEffect, useRef } from 'react';
import { HardwareProfile, SimulatedSiliconState } from '../types';
import { Terminal, Camera, Mic, Activity, ChevronDown, ChevronUp, Radio } from 'lucide-react';

interface SensorWorkbenchProps {
  simState: SimulatedSiliconState;
  targetHw?: HardwareProfile;
  isSimulating?: boolean;
  onToggleSim?: () => void;
  onUpdateGpio?: (pin: string, val: boolean) => void;
  onUpdateAdc?: (pin: string, val: number) => void;
}

export const SensorWorkbench: React.FC<SensorWorkbenchProps> = ({
  simState,
  targetHw: _targetHw,
  isSimulating: _isSimulating,
  onToggleSim: _onToggleSim,
  onUpdateGpio: _onUpdateGpio,
  onUpdateAdc: _onUpdateAdc,
}) => {
  const [activeTab, setActiveTab] = useState<'mic' | 'camera' | 'imu' | 'uart'>('mic');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);

  const [audioSpectrum, setAudioSpectrum] = useState<number[]>([
    25, 45, 70, 85, 95, 60, 40, 75, 90, 80, 55, 35, 65, 80, 50, 30
  ]);
  const [audioKeywords, setAudioKeywords] = useState<Record<string, number>>({ YES: 89.2, NO: 3.1, SILENCE: 4.5, UNKNOWN: 3.2 });
  const [cameraConfidence, setCameraConfidence] = useState<{ person: number; background: number }>({ person: 94.6, background: 5.4 });
  const [anomalyError, setAnomalyError] = useState<number>(0.048);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const micAnimRef = useRef<number | null>(null);
  const uartEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    uartEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [simState.uartLogs]);

  // Audio equalizer animation loop when idle
  useEffect(() => {
    if (isLiveActive) return;
    const interval = setInterval(() => {
      setAudioSpectrum((prev) =>
        prev.map((v) => {
          const delta = (Math.random() - 0.5) * 30;
          return Math.min(100, Math.max(15, Math.round(v + delta)));
        })
      );
    }, 120);
    return () => clearInterval(interval);
  }, [isLiveActive]);

  // Start / Stop Microphone Stream with Web Audio API
  const startMic = async () => {
    stopAllStreams();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const update = () => {
        analyser.getByteFrequencyData(dataArray);
        const sub = [];
        for (let i = 0; i < 16; i++) {
          sub.push(Math.max(12, Math.round((dataArray[i] / 255) * 100)));
        }
        setAudioSpectrum(sub);

        const avg = sub.reduce((a, b) => a + b, 0) / 16;
        if (avg > 38) {
          setAudioKeywords({
            YES: +(78 + Math.random() * 18).toFixed(1),
            NO: +(2 + Math.random() * 3).toFixed(1),
            SILENCE: +(2 + Math.random() * 2).toFixed(1),
            UNKNOWN: +(3 + Math.random() * 3).toFixed(1),
          });
        } else {
          setAudioKeywords({
            YES: +(4 + Math.random() * 3).toFixed(1),
            NO: +(3 + Math.random() * 3).toFixed(1),
            SILENCE: +(88 + Math.random() * 8).toFixed(1),
            UNKNOWN: +(3 + Math.random() * 3).toFixed(1),
          });
        }
        micAnimRef.current = requestAnimationFrame(update);
      };
      update();
      setIsLiveActive(true);
    } catch {
      alert('Microphone not available or permission denied.');
    }
  };

  // Start / Stop Camera Stream
  const startCamera = async () => {
    stopAllStreams();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsLiveActive(true);
    } catch {
      alert('Camera not available or permission denied.');
    }
  };

  const stopAllStreams = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    if (micAnimRef.current) {
      cancelAnimationFrame(micAnimRef.current);
      micAnimRef.current = null;
    }
    setIsLiveActive(false);
  };

  useEffect(() => {
    return () => stopAllStreams();
  }, []);

  // Update camera downsample canvas
  useEffect(() => {
    if (activeTab !== 'camera' || !isLiveActive) return;
    const interval = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, 48, 48);
          setCameraConfidence({
            person: +(93.0 + Math.random() * 6.0).toFixed(1),
            background: +(1.0 + Math.random() * 2.5).toFixed(1),
          });
        }
      }
    }, 150);
    return () => clearInterval(interval);
  }, [activeTab, isLiveActive]);

  // Update synthetic IMU
  useEffect(() => {
    if (activeTab !== 'imu') return;
    const interval = setInterval(() => {
      setAnomalyError(+(0.038 + Math.random() * 0.024).toFixed(3));
    }, 500);
    return () => clearInterval(interval);
  }, [activeTab]);

  return (
    <div className="bg-[#05050A] border-t border-[#1A2138] flex flex-col shrink-0 select-none shadow-lg">
      {/* Workbench Tab Strip */}
      <div className="h-9 px-4 flex items-center justify-between border-b border-[#1A2138] bg-[#05050A] text-xs font-mono">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('mic')}
            className={`px-3 py-1.5 rounded-t-[3px] transition-all flex items-center gap-1.5 border-t-2 btn-tactile ${
              activeTab === 'mic'
                ? 'bg-[#080914] text-[#E6FFFF] font-bold border-[#5CF2E7] shadow-[0_-2px_8px_rgba(92,242,231,0.25)]'
                : 'text-[#E6FFFF]/50 border-transparent hover:text-[#E6FFFF]'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-[#5CF2E7]" />
            <span>Mic MFCC</span>
          </button>

          <button
            onClick={() => setActiveTab('camera')}
            className={`px-3 py-1.5 rounded-t-[3px] transition-all flex items-center gap-1.5 border-t-2 btn-tactile ${
              activeTab === 'camera'
                ? 'bg-[#080914] text-[#E6FFFF] font-bold border-[#FF7AC6] shadow-[0_-2px_8px_rgba(255,122,198,0.25)]'
                : 'text-[#E6FFFF]/50 border-transparent hover:text-[#E6FFFF]'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-[#FF7AC6]" />
            <span>Camera 48x48</span>
          </button>

          <button
            onClick={() => setActiveTab('imu')}
            className={`px-3 py-1.5 rounded-t-[3px] transition-all flex items-center gap-1.5 border-t-2 btn-tactile ${
              activeTab === 'imu'
                ? 'bg-[#080914] text-[#E6FFFF] font-bold border-[#5CF2E7] shadow-[0_-2px_8px_rgba(92,242,231,0.25)]'
                : 'text-[#E6FFFF]/50 border-transparent hover:text-[#E6FFFF]'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-[#5CF2E7]" />
            <span>Vibration IMU</span>
          </button>

          <button
            onClick={() => setActiveTab('uart')}
            className={`px-3 py-1.5 rounded-t-[3px] transition-all flex items-center gap-1.5 border-t-2 btn-tactile ${
              activeTab === 'uart'
                ? 'bg-[#080914] text-[#E6FFFF] font-bold border-[#FF7AC6] shadow-[0_-2px_8px_rgba(255,122,198,0.25)]'
                : 'text-[#E6FFFF]/50 border-transparent hover:text-[#E6FFFF]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-[#FF7AC6]" />
            <span>UART Console</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[11px] font-tabular">
            <span className="text-[#E6FFFF]/50">Temp: <strong className="text-[#FF7AC6]">{simState.coreTempC}°C</strong></span>
            <span className="text-[#1A2138]">|</span>
            <span className="text-[#E6FFFF]/50">Power: <strong className="text-[#5CF2E7]">{simState.powerMw}mW</strong></span>
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-[#E6FFFF]/50 hover:text-[#E6FFFF] transition-all"
            title={isCollapsed ? 'Expand Workbench' : 'Collapse Workbench'}
          >
            {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Collapsible Workbench Body */}
      {!isCollapsed && (
        <div className="h-44 p-3 bg-[#080914] overflow-hidden font-mono text-xs">
          {/* TAB 1: MIC STREAM WITH CYBER EQUALIZER WAVE */}
          {activeTab === 'mic' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 h-full items-center">
              <div className="md:col-span-3 flex flex-col justify-center space-y-2">
                <span className="text-[10px] font-bold uppercase text-[#5CF2E7] flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-[#5CF2E7] animate-pulse" /> AUDIO SPECTROGRAM STREAM
                </span>
                <button
                  onClick={isLiveActive ? stopAllStreams : startMic}
                  className={`px-3 py-1.5 rounded-[3px] text-xs font-bold flex items-center justify-center gap-1.5 transition-all btn-tactile ${
                    isLiveActive
                      ? 'bg-[#FF7AC6]/20 text-[#FF7AC6] border border-[#FF7AC6]/50 shadow-[0_0_12px_rgba(255,122,198,0.3)]'
                      : 'btn-tactile-primary'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{isLiveActive ? 'Stop Stream' : 'Start Live Mic'}</span>
                </button>
                <span className="text-[9px] text-[#64748B] font-sans">
                  {isLiveActive ? '16kHz PCM audio stream active' : 'Click to stream live microphone'}
                </span>
              </div>

              {/* Dynamic Equalizer Wave Visualizer with Sakura & Cyan Gradient */}
              <div className="md:col-span-5 bg-[#05050A] p-2.5 rounded-[3px] border border-[#1A2138] h-32 flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between text-[9px] text-[#E6FFFF]/70 z-10">
                  <span>16-BAND FFT EQUALIZER WAVE</span>
                  <span className="text-[#5CF2E7] font-bold">16kHz PCM (49x10 MFCC)</span>
                </div>

                <div className="h-16 flex items-end justify-between gap-1.5 px-1 z-10">
                  {audioSpectrum.map((v, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-[2px] transition-all duration-100 relative group"
                      style={{
                        height: `${v}%`,
                        background: v > 65 
                          ? 'linear-gradient(180deg, #FF7AC6 0%, #4B1886 100%)' 
                          : 'linear-gradient(180deg, #5CF2E7 0%, #0E3B43 100%)',
                        boxShadow: v > 65 ? '0 0 10px rgba(255,122,198,0.5)' : '0 0 8px rgba(92,242,231,0.35)'
                      }}
                    >
                      <div className="w-full h-1 bg-white/70 rounded-t-[1px] absolute top-0" />
                    </div>
                  ))}
                </div>

                <div className="text-[8px] text-[#64748B] flex justify-between font-tabular z-10">
                  <span>0 Hz</span>
                  <span>4000 Hz</span>
                  <span>8000 Hz</span>
                </div>
              </div>

              {/* Keyword Probabilities */}
              <div className="md:col-span-4 bg-[#05050A] p-2.5 rounded-[3px] border border-[#1A2138] h-32 flex flex-col justify-between">
                <span className="text-[9px] font-bold text-[#FF7AC6]">WAKE-WORD DETECTION CONFIDENCE</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.entries(audioKeywords).map(([kw, sc]) => (
                    <div key={kw} className="p-1.5 rounded-[2px] bg-[#080914] border border-[#1A2138] flex items-center justify-between">
                      <span className="text-[#E6FFFF]/70 text-[10px]">{kw}</span>
                      <span className={`font-bold font-tabular text-[11px] ${kw === 'YES' && sc > 60 ? 'text-[#5CF2E7]' : 'text-[#E6FFFF]'}`}>
                        {sc}%
                      </span>
                    </div>
                  ))}
                </div>
                <span className="text-[8px] text-[#5CF2E7] font-bold font-tabular">INFERENCE LATENCY: 0.42 ms</span>
              </div>
            </div>
          )}

          {/* TAB 2: CAMERA 48x48 */}
          {activeTab === 'camera' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 h-full items-center">
              <div className="md:col-span-3 flex flex-col justify-center space-y-2">
                <span className="text-[10px] font-bold uppercase text-[#FF7AC6]">VISION DOWNSAMPLER</span>
                <button
                  onClick={isLiveActive ? stopAllStreams : startCamera}
                  className={`px-3 py-1.5 rounded-[3px] text-xs font-bold flex items-center justify-center gap-1.5 transition-all btn-tactile ${
                    isLiveActive
                      ? 'bg-[#FF7AC6]/20 text-[#FF7AC6] border border-[#FF7AC6]/50 shadow-[0_0_12px_rgba(255,122,198,0.3)]'
                      : 'btn-tactile-pink'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{isLiveActive ? 'Stop Stream' : 'Start Live Cam'}</span>
                </button>
              </div>

              <div className="md:col-span-5 flex items-center justify-center gap-3">
                <div className="relative rounded-[3px] overflow-hidden border border-[#1A2138] bg-black h-28 w-36 flex items-center justify-center">
                  <video ref={videoRef} className="h-full w-full object-cover grayscale opacity-90" autoPlay muted playsInline />
                  <span className="absolute bottom-1 left-1 text-[8px] bg-black/80 text-[#5CF2E7] px-1 rounded-[2px]">Raw Ingest</span>
                </div>

                <div className="relative rounded-[3px] overflow-hidden border border-[#1A2138] bg-[#05050A] h-28 w-36 flex flex-col items-center justify-center p-1">
                  <span className="text-[8px] text-[#E6FFFF]/70 block mb-1">Downsampled 48x48</span>
                  <canvas ref={canvasRef} width={48} height={48} className="w-16 h-16 border border-[#5CF2E7]/40 bg-black image-rendering-pixelated rounded-[2px] shadow-[0_0_12px_rgba(92,242,231,0.2)]" />
                </div>
              </div>

              <div className="md:col-span-4 bg-[#05050A] p-2.5 rounded-[3px] border border-[#1A2138] h-32 flex flex-col justify-between">
                <span className="text-[9px] font-bold text-[#5CF2E7]">PERSON DETECTOR OUTPUT</span>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1 font-tabular">
                    <span className="text-[#5CF2E7]">PERSON PRESENT:</span>
                    <span className="text-[#5CF2E7]">{cameraConfidence.person}%</span>
                  </div>
                  <div className="w-full bg-[#080914] h-2 rounded-[2px] overflow-hidden">
                    <div className="bg-gradient-to-r from-[#5CF2E7] to-[#FF7AC6] h-full shadow-[0_0_8px_#5CF2E7]" style={{ width: `${cameraConfidence.person}%` }} />
                  </div>
                </div>
                <span className="text-[8px] text-[#FF7AC6] font-bold font-tabular">FPS: 2,380 | LATENCY: 1.84 ms</span>
              </div>
            </div>
          )}

          {/* TAB 3: IMU VIBRATION */}
          {activeTab === 'imu' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 h-full items-center">
              <div className="md:col-span-4 flex flex-col justify-center space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#5CF2E7]">3-AXIS VIBRATION SPECTRUM</span>
                <p className="text-[10px] text-[#E6FFFF]/70 font-sans">
                  Simulating accelerometer FFT spectrum for industrial motor bearings (NASA Bearing Dataset).
                </p>
                <div className="text-[10px] text-[#5CF2E7] font-bold pt-1 font-tabular">
                  RECONSTRUCTION ERROR: {anomalyError} (NORMAL &lt; 0.150)
                </div>
              </div>

              <div className="md:col-span-8 bg-[#05050A] p-2.5 rounded-[3px] border border-[#1A2138] h-32 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[9px] text-[#E6FFFF]/70">
                  <span>64-POINT FFT SPECTRUM</span>
                  <span className="text-[#5CF2E7] font-bold">MOTOR OPERATIONAL: PASS</span>
                </div>

                <div className="h-16 flex items-end gap-1">
                  {Array.from({ length: 32 }).map((_, i) => {
                    const h = Math.sin(i * 0.4) * 30 + 40 + Math.random() * 15;
                    return (
                      <div
                        key={i}
                        className="flex-1 rounded-t-[1px]"
                        style={{
                          height: `${h}%`,
                          background: 'linear-gradient(180deg, #5CF2E7 0%, #0E3B43 100%)',
                          boxShadow: '0 0 6px rgba(92,242,231,0.3)'
                        }}
                      />
                    );
                  })}
                </div>

                <span className="text-[8px] text-[#64748B]">5-Layer Deep Autoencoder (64 &rarr; 32 &rarr; 8 &rarr; 32 &rarr; 64)</span>
              </div>
            </div>
          )}

          {/* TAB 4: UART CONSOLE */}
          {activeTab === 'uart' && (
            <div className="bg-[#05050A] rounded-[3px] border border-[#1A2138] h-full p-2 overflow-y-auto space-y-1 text-[11px]">
              {simState.uartLogs.map((l, i) => (
                <div key={i} className="text-[#E6FFFF]/80 font-tabular">
                  {l}
                </div>
              ))}
              <div className="flex items-center gap-1 text-[#5CF2E7]">
                <span>&gt;</span>
                <span className="inline-block w-2 h-3.5 bg-[#5CF2E7] animate-pulse" />
              </div>
              <div ref={uartEndRef} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
