import React, { useState, useEffect, useRef } from 'react';
import { HardwareProfile, SimulatedSiliconState } from '../types';
import { Terminal, Camera, Mic, Activity, ChevronDown, ChevronUp } from 'lucide-react';

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

  const [audioSpectrum, setAudioSpectrum] = useState<number[]>(Array(16).fill(15));
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
          sub.push(Math.max(10, Math.round((dataArray[i] / 255) * 100)));
        }
        setAudioSpectrum(sub);

        const avg = sub.reduce((a, b) => a + b, 0) / 16;
        if (avg > 40) {
          setAudioKeywords({
            YES: +(75 + Math.random() * 20).toFixed(1),
            NO: +(3 + Math.random() * 4).toFixed(1),
            SILENCE: +(2 + Math.random() * 3).toFixed(1),
            UNKNOWN: +(4 + Math.random() * 4).toFixed(1),
          });
        } else {
          setAudioKeywords({
            YES: +(4 + Math.random() * 4).toFixed(1),
            NO: +(3 + Math.random() * 4).toFixed(1),
            SILENCE: +(85 + Math.random() * 10).toFixed(1),
            UNKNOWN: +(4 + Math.random() * 4).toFixed(1),
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
            person: +(92.0 + Math.random() * 7.0).toFixed(1),
            background: +(1.0 + Math.random() * 3.0).toFixed(1),
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
    <div className="bg-[#0D1117] border-t border-[#21262D] flex flex-col shrink-0 select-none shadow-lg">
      {/* Workbench Tab Strip */}
      <div className="h-9 px-4 flex items-center justify-between border-b border-[#21262D] bg-[#0A0D12] text-xs font-mono">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('mic')}
            className={`px-3 py-1.5 rounded-t transition flex items-center gap-1.5 border-t-2 ${
              activeTab === 'mic'
                ? 'bg-[#13171F] text-[#F0F6FC] font-bold border-[#0284C7]'
                : 'text-[#8B949E] border-transparent hover:text-[#F0F6FC]'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Mic MFCC</span>
          </button>

          <button
            onClick={() => setActiveTab('camera')}
            className={`px-3 py-1.5 rounded-t transition flex items-center gap-1.5 border-t-2 ${
              activeTab === 'camera'
                ? 'bg-[#13171F] text-[#F0F6FC] font-bold border-[#0284C7]'
                : 'text-[#8B949E] border-transparent hover:text-[#F0F6FC]'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-[#00FFA3]" />
            <span>Camera 48x48</span>
          </button>

          <button
            onClick={() => setActiveTab('imu')}
            className={`px-3 py-1.5 rounded-t transition flex items-center gap-1.5 border-t-2 ${
              activeTab === 'imu'
                ? 'bg-[#13171F] text-[#F0F6FC] font-bold border-[#0284C7]'
                : 'text-[#8B949E] border-transparent hover:text-[#F0F6FC]'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Vibration IMU</span>
          </button>

          <button
            onClick={() => setActiveTab('uart')}
            className={`px-3 py-1.5 rounded-t transition flex items-center gap-1.5 border-t-2 ${
              activeTab === 'uart'
                ? 'bg-[#13171F] text-[#F0F6FC] font-bold border-[#0284C7]'
                : 'text-[#8B949E] border-transparent hover:text-[#F0F6FC]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>UART Console</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-[#8B949E]">Temp: <strong className="text-[#F59E0B] font-tabular">{simState.coreTempC}°C</strong></span>
            <span className="text-[#30363D]">|</span>
            <span className="text-[#8B949E]">Power: <strong className="text-[#00FFA3] font-tabular">{simState.powerMw}mW</strong></span>
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-[#8B949E] hover:text-[#F0F6FC] transition"
            title={isCollapsed ? 'Expand Workbench' : 'Collapse Workbench'}
          >
            {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Collapsible Workbench Body */}
      {!isCollapsed && (
        <div className="h-44 p-3 bg-[#13171F] overflow-hidden font-mono text-xs">
          {/* TAB 1: MIC STREAM */}
          {activeTab === 'mic' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 h-full items-center">
              <div className="md:col-span-3 flex flex-col justify-center space-y-2">
                <span className="text-[10px] font-bold uppercase text-[#8B949E]">AUDIO SPECTROGRAM STREAM</span>
                <button
                  onClick={isLiveActive ? stopAllStreams : startMic}
                  className={`px-3 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    isLiveActive
                      ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40'
                      : 'bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-sm'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{isLiveActive ? 'Stop Mic Stream' : 'Start Live Mic'}</span>
                </button>
                <span className="text-[9px] text-[#484F58] font-sans">
                  {isLiveActive ? 'Live PCM audio input active' : 'Click to stream real microphone audio'}
                </span>
              </div>

              {/* Frequency Bars */}
              <div className="md:col-span-5 bg-[#0A0D12] p-2.5 rounded border border-[#21262D] h-32 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[9px] text-[#8B949E]">
                  <span>16-BAND FFT SPECTROGRAM</span>
                  <span className="text-[#00FFA3] font-bold">16kHz PCM (49x10 MFCC)</span>
                </div>

                <div className="h-16 flex items-end justify-between gap-1 px-1">
                  {audioSpectrum.map((v, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-[#0284C7] rounded-t-[1px] transition-all duration-75"
                      style={{ height: `${v}%`, backgroundColor: v > 60 ? '#00FFA3' : '#0284C7' }}
                    />
                  ))}
                </div>

                <div className="text-[8px] text-[#484F58] flex justify-between">
                  <span>0 Hz</span>
                  <span>4000 Hz</span>
                  <span>8000 Hz</span>
                </div>
              </div>

              {/* Inference Keyword Probabilities */}
              <div className="md:col-span-4 bg-[#0A0D12] p-2.5 rounded border border-[#21262D] h-32 flex flex-col justify-between">
                <span className="text-[9px] font-bold text-[#8B949E]">WAKE-WORD DETECTION CONFIDENCE</span>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(audioKeywords).map(([kw, sc]) => (
                    <div key={kw} className="p-1.5 rounded bg-[#13171F] border border-[#21262D] flex items-center justify-between">
                      <span className="text-[#8B949E] text-[10px]">{kw}</span>
                      <span className={`font-bold font-tabular text-[11px] ${kw === 'YES' && sc > 60 ? 'text-[#00FFA3]' : 'text-[#F0F6FC]'}`}>
                        {sc}%
                      </span>
                    </div>
                  ))}
                </div>
                <span className="text-[8px] text-[#00FFA3] font-bold">INFERENCE LATENCY: 0.42 ms</span>
              </div>
            </div>
          )}

          {/* TAB 2: CAMERA 48x48 */}
          {activeTab === 'camera' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 h-full items-center">
              <div className="md:col-span-3 flex flex-col justify-center space-y-2">
                <span className="text-[10px] font-bold uppercase text-[#8B949E]">VISION DOWNSAMPLER</span>
                <button
                  onClick={isLiveActive ? stopAllStreams : startCamera}
                  className={`px-3 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    isLiveActive
                      ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40'
                      : 'bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-sm'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{isLiveActive ? 'Stop Webcam' : 'Start Live Cam'}</span>
                </button>
              </div>

              <div className="md:col-span-5 flex items-center justify-center gap-3">
                <div className="relative rounded overflow-hidden border border-[#21262D] bg-black h-28 w-36 flex items-center justify-center">
                  <video ref={videoRef} className="h-full w-full object-cover grayscale opacity-90" autoPlay muted playsInline />
                  <span className="absolute bottom-1 left-1 text-[8px] bg-black/80 text-[#00FFA3] px-1 rounded">Raw Ingest</span>
                </div>

                <div className="relative rounded overflow-hidden border border-[#21262D] bg-[#0A0D12] h-28 w-36 flex flex-col items-center justify-center p-1">
                  <span className="text-[8px] text-[#8B949E] block mb-1">Downsampled 48x48</span>
                  <canvas ref={canvasRef} width={48} height={48} className="w-16 h-16 border border-[#30363D] bg-black image-rendering-pixelated rounded" />
                </div>
              </div>

              <div className="md:col-span-4 bg-[#0A0D12] p-2.5 rounded border border-[#21262D] h-32 flex flex-col justify-between">
                <span className="text-[9px] font-bold text-[#8B949E]">PERSON DETECTOR OUTPUT</span>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-[#00FFA3]">PERSON PRESENT:</span>
                    <span className="text-[#00FFA3] font-tabular">{cameraConfidence.person}%</span>
                  </div>
                  <div className="w-full bg-[#161B22] h-2 rounded overflow-hidden">
                    <div className="bg-[#00FFA3] h-full" style={{ width: `${cameraConfidence.person}%` }} />
                  </div>
                </div>
                <span className="text-[8px] text-[#38BDF8] font-bold">FPS: 2,380 | LATENCY: 1.84 ms</span>
              </div>
            </div>
          )}

          {/* TAB 3: IMU VIBRATION */}
          {activeTab === 'imu' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 h-full items-center">
              <div className="md:col-span-4 flex flex-col justify-center space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#8B949E]">3-AXIS VIBRATION SPECTRUM</span>
                <p className="text-[10px] text-[#8B949E] font-sans">
                  Simulating accelerometer FFT spectrum for industrial motor bearings (NASA Bearing Dataset).
                </p>
                <div className="text-[10px] text-[#00FFA3] font-bold pt-1">
                  RECONSTRUCTION ERROR: {anomalyError} (NORMAL &lt; 0.150)
                </div>
              </div>

              <div className="md:col-span-8 bg-[#0A0D12] p-2.5 rounded border border-[#21262D] h-32 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[9px] text-[#8B949E]">
                  <span>64-POINT FFT SPECTRUM</span>
                  <span className="text-[#00FFA3] font-bold">MOTOR OPERATIONAL: PASS</span>
                </div>

                <div className="h-16 flex items-end gap-1">
                  {Array.from({ length: 32 }).map((_, i) => {
                    const h = Math.sin(i * 0.4) * 30 + 40 + Math.random() * 15;
                    return (
                      <div
                        key={i}
                        className="flex-1 bg-[#38BDF8] rounded-t-[1px]"
                        style={{ height: `${h}%` }}
                      />
                    );
                  })}
                </div>

                <span className="text-[8px] text-[#484F58]">5-Layer Deep Autoencoder (64 &rarr; 32 &rarr; 8 &rarr; 32 &rarr; 64)</span>
              </div>
            </div>
          )}

          {/* TAB 4: UART CONSOLE */}
          {activeTab === 'uart' && (
            <div className="bg-[#0A0D12] rounded border border-[#21262D] h-full p-2 overflow-y-auto space-y-1 text-[11px]">
              {simState.uartLogs.map((l, i) => (
                <div key={i} className="text-[#8B949E]">
                  {l}
                </div>
              ))}
              <div ref={uartEndRef} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
