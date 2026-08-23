import React, { useState, useEffect, useRef } from 'react';
import { SimulatedSiliconState, HardwareProfile } from '../types';
import { Activity, Terminal, Play, Square, Camera, Mic, Flame, Zap, Cpu, Radio, Volume2 } from 'lucide-react';

interface LiveSimulatorPanelProps {
  simState: SimulatedSiliconState;
  targetHw: HardwareProfile;
  isSimulating: boolean;
  onToggleSim: () => void;
  onUpdateGpio: (pin: string, val: boolean) => void;
  onUpdateAdc: (pin: string, val: number) => void;
}

export const LiveSimulatorPanel: React.FC<LiveSimulatorPanelProps> = ({
  simState,
  targetHw,
  isSimulating,
  onToggleSim,
  onUpdateGpio,
  onUpdateAdc,
}) => {
  const [sensorMode, setSensorMode] = useState<'synthetic' | 'camera' | 'mic'>('camera');
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [cameraClassConfidence, setCameraClassConfidence] = useState<{ person: number; background: number }>({ person: 94.2, background: 5.8 });
  const [audioKeywordScores, setAudioKeywordScores] = useState<Record<string, number>>({ YES: 88.5, NO: 3.2, SILENCE: 4.1, UNKNOWN: 4.2 });
  const [anomalyScore, setAnomalyScore] = useState<number>(0.042);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micAnimRef = useRef<number | null>(null);
  const [audioSpectrum, setAudioSpectrum] = useState<number[]>(Array(16).fill(20));
  const uartEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    uartEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [simState.uartLogs]);

  // Handle camera start/stop
  const startCamera = async () => {
    stopAllStreams();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240, facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsLiveActive(true);
      setSensorMode('camera');
    } catch {
      alert('Camera access unavailable or permission denied. Falling back to synthetic video simulation.');
      setSensorMode('synthetic');
    }
  };

  // Handle mic start/stop with Web Audio API
  const startMic = async () => {
    stopAllStreams();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateAudio = () => {
        analyser.getByteFrequencyData(dataArray);
        const subSample = [];
        for (let i = 0; i < 16; i++) {
          subSample.push(Math.max(10, Math.round((dataArray[i] / 255) * 100)));
        }
        setAudioSpectrum(subSample);
        // Simulate keyword detection probability based on audio volume
        const avgVol = subSample.reduce((a, b) => a + b, 0) / 16;
        if (avgVol > 45) {
          setAudioKeywordScores({
            YES: +(70 + Math.random() * 25).toFixed(1),
            NO: +(5 + Math.random() * 5).toFixed(1),
            SILENCE: +(2 + Math.random() * 2).toFixed(1),
            UNKNOWN: +(5 + Math.random() * 5).toFixed(1),
          });
        } else {
          setAudioKeywordScores({
            YES: +(5 + Math.random() * 5).toFixed(1),
            NO: +(4 + Math.random() * 5).toFixed(1),
            SILENCE: +(80 + Math.random() * 15).toFixed(1),
            UNKNOWN: +(5 + Math.random() * 5).toFixed(1),
          });
        }
        micAnimRef.current = requestAnimationFrame(updateAudio);
      };
      updateAudio();

      setIsLiveActive(true);
      setSensorMode('mic');
    } catch {
      alert('Microphone access unavailable or permission denied. Falling back to synthetic audio stream.');
      setSensorMode('synthetic');
    }
  };

  const stopAllStreams = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
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

  // Update real-time camera downsampling to 48x48
  useEffect(() => {
    if (sensorMode !== 'camera' || !isLiveActive) return;

    const interval = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, 48, 48);
          // High-fidelity confidence fluctuation
          setCameraClassConfidence({
            person: +(91.5 + Math.random() * 7.5).toFixed(1),
            background: +(1.0 + Math.random() * 3.5).toFixed(1),
          });
        }
      }
    }, 150);

    return () => clearInterval(interval);
  }, [sensorMode, isLiveActive]);

  // Update synthetic anomaly score
  useEffect(() => {
    if (sensorMode !== 'synthetic') return;
    const interval = setInterval(() => {
      setAnomalyScore(+(0.035 + Math.random() * 0.025).toFixed(3));
    }, 500);
    return () => clearInterval(interval);
  }, [sensorMode]);

  return (
    <div className="space-y-4">
      {/* Title & Telemetry Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#21262D] pb-3 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-[#0284C7]/15 border border-[#0284C7]/30 text-[#38BDF8]">
              <Activity className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-[#F0F6FC] font-mono tracking-tight uppercase">
              HARDWARE IN-THE-LOOP SILICON SIMULATOR
            </h2>
          </div>
          <p className="text-xs text-[#8B949E] mt-0.5 font-sans">
            Real-time sensory execution running on virtualized {targetHw.name} ({targetHw.arch}) with zero malloc overhead.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#13171F] px-3 py-1 border border-[#21262D] rounded-[3px] text-xs font-mono">
            <div className="flex items-center gap-1 text-[#F59E0B]">
              <Flame className="w-3.5 h-3.5" />
              <span>{simState.coreTempC}°C</span>
            </div>
            <span className="text-[#30363D]">|</span>
            <div className="flex items-center gap-1 text-[#00FFA3] font-bold">
              <Zap className="w-3.5 h-3.5" />
              <span>{simState.powerMw} mW</span>
            </div>
            <span className="text-[#30363D]">|</span>
            <div className="flex items-center gap-1 text-[#38BDF8]">
              <Radio className="w-3.5 h-3.5" />
              <span>{simState.latencyMicros} μs</span>
            </div>
          </div>

          <button
            onClick={onToggleSim}
            className={`px-3 py-1 text-xs font-mono font-bold rounded-[3px] flex items-center gap-1.5 transition border ${
              isSimulating
                ? 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/50 shadow-sm'
                : 'bg-[#10B981]/20 text-[#00FFA3] border-[#10B981]/50 hover:bg-[#10B981]/30 shadow-glow-emerald'
            }`}
          >
            {isSimulating ? (
              <>
                <Square className="w-3 h-3 fill-current" /> Halt Clock
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" /> Run Clock
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid: Sensory Simulator (5 cols) + Virtual Bench UART & Pins (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Sensory Input Stream */}
        <div className="lg:col-span-5 space-y-3">
          {/* Sensory Mode Switcher */}
          <div className="bg-[#13171F] border border-[#21262D] rounded-[4px] p-3.5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-[#F0F6FC] uppercase font-bold flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#38BDF8]" />
                SENSORY INPUT STREAM
              </span>
              <div className="flex items-center gap-1 bg-[#0A0D12] p-0.5 rounded-[3px] border border-[#21262D] text-[10px] font-mono">
                <button
                  onClick={() => {
                    stopAllStreams();
                    setSensorMode('camera');
                    startCamera();
                  }}
                  className={`px-2 py-0.5 rounded-[2px] flex items-center gap-1 transition ${
                    sensorMode === 'camera' ? 'bg-[#0284C7] text-white font-bold' : 'text-[#8B949E] hover:text-[#F0F6FC]'
                  }`}
                >
                  <Camera className="w-3 h-3" /> Live Cam
                </button>
                <button
                  onClick={() => {
                    stopAllStreams();
                    setSensorMode('mic');
                    startMic();
                  }}
                  className={`px-2 py-0.5 rounded-[2px] flex items-center gap-1 transition ${
                    sensorMode === 'mic' ? 'bg-[#0284C7] text-white font-bold' : 'text-[#8B949E] hover:text-[#F0F6FC]'
                  }`}
                >
                  <Mic className="w-3 h-3" /> Live Mic
                </button>
                <button
                  onClick={() => {
                    stopAllStreams();
                    setSensorMode('synthetic');
                  }}
                  className={`px-2 py-0.5 rounded-[2px] transition ${
                    sensorMode === 'synthetic' ? 'bg-[#0284C7] text-white font-bold' : 'text-[#8B949E] hover:text-[#F0F6FC]'
                  }`}
                >
                  Synthetic IMU
                </button>
              </div>
            </div>

            {/* Mode 1: Camera Feed with Downsampler */}
            {sensorMode === 'camera' && (
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative rounded-[3px] overflow-hidden border border-[#21262D] bg-black h-36 flex items-center justify-center">
                    <video ref={videoRef} className="h-full w-full object-cover grayscale opacity-90" autoPlay muted playsInline />
                    <div className="absolute inset-0 border border-[#00FFA3]/40 p-1.5 flex items-start justify-between pointer-events-none">
                      <span className="text-[8px] font-mono bg-black/80 text-[#00FFA3] px-1 py-0.5 rounded-[2px]">
                        Raw Stream 320x240
                      </span>
                      <span className="h-2 w-2 rounded-full bg-[#EF4444] animate-pulse"></span>
                    </div>
                  </div>

                  <div className="relative rounded-[3px] overflow-hidden border border-[#21262D] bg-[#0A0D12] h-36 flex flex-col items-center justify-center p-2">
                    <span className="text-[9px] font-mono text-[#8B949E] block mb-1">Downsampled 48x48 Grayscale</span>
                    <canvas ref={canvasRef} width={48} height={48} className="w-20 h-20 border border-[#30363D] bg-black image-rendering-pixelated rounded-[2px]" />
                    <span className="text-[8px] font-mono text-[#00FFA3] mt-1">1x48x48 INT8 Tensor (2,304 B)</span>
                  </div>
                </div>

                {/* Model Inference Output Bar */}
                <div className="p-2 bg-[#0A0D12] rounded-[3px] border border-[#21262D] font-mono text-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[#8B949E]">PERSON DETECTION SCORE:</span>
                    <span className="text-[#00FFA3] font-bold font-tabular">{cameraClassConfidence.person}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#161B22] rounded-full overflow-hidden">
                    <div className="h-full bg-[#00FFA3] rounded-full" style={{ width: `${cameraClassConfidence.person}%` }} />
                  </div>
                </div>
              </div>
            )}

            {/* Mode 2: Microphone Spectrogram */}
            {sensorMode === 'mic' && (
              <div className="space-y-2.5">
                <div className="h-32 bg-[#0A0D12] rounded-[3px] border border-[#21262D] p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#8B949E]">
                    <span className="flex items-center gap-1 text-[#38BDF8]">
                      <Volume2 className="w-3.5 h-3.5" /> 16kHz PCM MFCC STREAM
                    </span>
                    <span className="text-[#00FFA3] font-bold">49x10 MFCC BINS</span>
                  </div>

                  <div className="h-16 flex items-end justify-between gap-1 px-1">
                    {audioSpectrum.map((val, idx) => (
                      <div
                        key={idx}
                        className="w-full bg-[#0284C7] rounded-t-[1px] transition-all duration-75"
                        style={{ height: `${val}%`, backgroundColor: val > 60 ? '#00FFA3' : '#0284C7' }}
                      />
                    ))}
                  </div>

                  <div className="text-[9px] font-mono text-[#484F58] flex justify-between">
                    <span>0 Hz</span>
                    <span>4000 Hz (Nyquist)</span>
                    <span>8000 Hz</span>
                  </div>
                </div>

                {/* Keyword Confidence Bars */}
                <div className="grid grid-cols-4 gap-1.5 font-mono text-[10px]">
                  {Object.entries(audioKeywordScores).map(([kw, score]) => (
                    <div key={kw} className="p-1.5 bg-[#0A0D12] rounded-[3px] border border-[#21262D] text-center">
                      <span className="text-[#8B949E] block text-[9px]">{kw}</span>
                      <span className={`font-bold font-tabular ${kw === 'YES' && score > 60 ? 'text-[#00FFA3]' : 'text-[#F0F6FC]'}`}>
                        {score}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mode 3: Synthetic Vibration Spectrum */}
            {sensorMode === 'synthetic' && (
              <div className="space-y-2.5">
                <div className="p-3 bg-[#0A0D12] rounded-[3px] border border-[#21262D] text-xs font-mono space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-[#8B949E]">
                    <span>3-AXIS IMU FFT POWER SPECTRUM</span>
                    <span className="text-[#00FFA3] font-bold">1x64 TENSOR</span>
                  </div>

                  <div className="h-20 flex items-end gap-0.5">
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

                  <div className="pt-2 border-t border-[#21262D] flex items-center justify-between text-[11px]">
                    <span className="text-[#8B949E]">RECONSTRUCTION ERROR:</span>
                    <span className="text-[#00FFA3] font-bold font-tabular">{anomalyScore} (NORMAL &lt; 0.150)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Virtual GPIO Controller */}
          <div className="bg-[#13171F] border border-[#21262D] rounded-[4px] p-3.5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider font-bold">
                DIGITAL GPIO OUTPUT STATE
              </label>
              <span className="text-[9px] font-mono text-[#38BDF8]">CLICK TO TOGGLE</span>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              {Object.entries(simState.gpio).map(([pin, isHigh]) => (
                <div
                  key={pin}
                  onClick={() => onUpdateGpio(pin, !isHigh)}
                  className={`p-2 rounded-[3px] border flex items-center justify-between cursor-pointer transition select-none ${
                    isHigh
                      ? 'bg-[#10B981]/15 border-[#10B981]/40 text-[#F0F6FC]'
                      : 'bg-[#0A0D12] border-[#21262D] text-[#8B949E]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isHigh ? 'bg-[#00FFA3] shadow-glow-emerald' : 'bg-[#30363D]'}`} />
                    <span>{pin}</span>
                  </div>
                  <span className={`text-[10px] font-bold ${isHigh ? 'text-[#00FFA3]' : 'text-[#484F58]'}`}>
                    {isHigh ? 'HIGH (3.3V)' : 'LOW (0V)'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ADC Potentiometer */}
          <div className="bg-[#13171F] border border-[#21262D] rounded-[4px] p-3.5">
            <div className="flex items-center justify-between mb-1.5 text-xs font-mono">
              <span className="text-[#8B949E] flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-[#38BDF8]" /> ADC ANALOG INPUT (CH1)
              </span>
              <span className="text-[#38BDF8] font-bold font-tabular">
                {(simState.adc['ADC_IN1'] || 1.65).toFixed(2)} V / 3.3V
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="3.3"
              step="0.05"
              value={simState.adc['ADC_IN1'] || 1.65}
              onChange={(e) => onUpdateAdc('ADC_IN1', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[#0A0D12] rounded appearance-none cursor-pointer accent-[#38BDF8]"
            />
          </div>
        </div>

        {/* Right Column: Virtual UART Serial Terminal */}
        <div className="lg:col-span-7 bg-[#13171F] border border-[#21262D] rounded-[4px] flex flex-col h-[520px] overflow-hidden">
          <div className="px-3.5 py-2.5 border-b border-[#21262D] bg-[#0D1117] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#00FFA3]" />
              <span className="text-xs font-mono font-bold text-[#F0F6FC]">
                UART SERIAL TERMINAL @ 115200 BAUD
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono px-2 py-0.5 bg-[#10B981]/15 text-[#00FFA3] border border-[#10B981]/30 rounded-[2px] font-bold">
                TX/RX BUFFER READY
              </span>
            </div>
          </div>

          <div className="flex-1 p-3.5 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-1 select-text bg-[#0A0D12]">
            {simState.uartLogs.map((log, i) => {
              let textColor = 'text-[#8B949E]';
              if (log.includes('CRITICAL') || log.includes('ERR')) textColor = 'text-[#EF4444] font-bold';
              if (log.includes('WARN')) textColor = 'text-[#F59E0B] font-semibold';
              if (log.includes('INFERENCE') || log.includes('SHANNON') || log.includes('SUCCESS')) textColor = 'text-[#00FFA3]';
              if (log.includes('SRAM') || log.includes('ARENA')) textColor = 'text-[#38BDF8] font-bold';

              return (
                <div key={i} className={textColor}>
                  {log}
                </div>
              );
            })}
            <div ref={uartEndRef} />
          </div>

          <div className="p-2.5 bg-[#0D1117] border-t border-[#21262D] flex items-center justify-between text-[10px] font-mono text-[#8B949E]">
            <span>Active Target: <strong className="text-[#F0F6FC]">{targetHw.name}</strong></span>
            <span>Clock Frequency: <strong className="text-[#38BDF8]">{targetHw.clock_mhz} MHz</strong></span>
            <span className="text-[#00FFA3] font-bold">0 HEAP CRASHES</span>
          </div>
        </div>
      </div>
    </div>
  );
};