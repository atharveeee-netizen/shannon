import React, { useState, useEffect, useRef } from 'react';
import { SimulatedSiliconState, HardwareProfile } from '../types';
import { Cpu, Activity, Terminal, Play, Square, Camera, Mic, Flame, Zap } from 'lucide-react';

interface SiliconSimulatorProps {
  simState: SimulatedSiliconState;
  targetHw: HardwareProfile;
  isSimulating: boolean;
  onToggleSim: () => void;
  onUpdateGpio: (pin: string, val: boolean) => void;
  onUpdateAdc: (pin: string, val: number) => void;
  onUpdatePwm?: (freq: number) => void;
}

export const SiliconSimulator: React.FC<SiliconSimulatorProps> = ({
  simState,
  targetHw,
  isSimulating,
  onToggleSim,
  onUpdateGpio,
  onUpdateAdc,
}) => {
  const [sensorMode, setSensorMode] = useState<'synthetic' | 'camera' | 'mic'>('synthetic');
  const [isLiveActive, setIsLiveActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const uartEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    uartEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [simState.uartLogs]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsLiveActive(true);
      setSensorMode('camera');
    } catch {
      alert('Camera access denied. Using synthetic sensory stream.');
      setSensorMode('synthetic');
    }
  };

  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setIsLiveActive(true);
      setSensorMode('mic');
    } catch {
      alert('Microphone access denied. Using synthetic sensory stream.');
      setSensorMode('synthetic');
    }
  };

  const stopSensors = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsLiveActive(false);
    setSensorMode('synthetic');
  };

  return (
    <div className="w-full h-[580px] bg-slate-950/80 rounded-xl border border-slate-800 backdrop-blur-md p-4 flex flex-col gap-4 overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <div>
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
              VIRTUAL HARDWARE SILICON BENCH ({targetHw.name})
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              {targetHw.arch} • {targetHw.clock_mhz} MHz • {targetHw.simd || 'Vector SIMD'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800 text-[10px] font-mono">
            <Flame className="w-3 h-3 text-amber-400" />
            <span className="text-slate-300">{simState.coreTempC}°C</span>
            <span className="text-slate-600">|</span>
            <Zap className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400">{simState.powerMw} mW</span>
          </div>

          <button
            onClick={onToggleSim}
            className={`px-3 py-1.5 text-xs font-semibold font-mono rounded-lg flex items-center gap-1.5 transition ${
              isSimulating
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            {isSimulating ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" /> Stop Hardware Loop
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Run Clock Simulation
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 overflow-hidden">
        <div className="md:col-span-5 flex flex-col gap-3 overflow-y-auto pr-1">
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono font-medium text-slate-300 uppercase">Sensory Feed</span>
              <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800 text-[9px] font-mono">
                <button
                  onClick={stopSensors}
                  className={`px-2 py-0.5 rounded ${sensorMode === 'synthetic' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'}`}
                >
                  Synthetic
                </button>
                <button
                  onClick={startCamera}
                  className={`px-2 py-0.5 rounded flex items-center gap-1 ${sensorMode === 'camera' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'}`}
                >
                  <Camera className="w-3 h-3" /> Cam
                </button>
                <button
                  onClick={startMic}
                  className={`px-2 py-0.5 rounded flex items-center gap-1 ${sensorMode === 'mic' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'}`}
                >
                  <Mic className="w-3 h-3" /> Mic
                </button>
              </div>
            </div>

            {sensorMode === 'camera' && isLiveActive && (
              <div className="relative rounded overflow-hidden border border-slate-800 bg-slate-950 h-28 flex items-center justify-center">
                <video ref={videoRef} className="h-full w-full object-cover grayscale" autoPlay muted playsInline />
                <div className="absolute inset-0 border border-emerald-500/50 p-1 flex justify-between">
                  <span className="text-[8px] font-mono bg-black/70 text-emerald-400 px-1 rounded">48x48 Grayscale</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                </div>
              </div>
            )}

            {sensorMode === 'mic' && isLiveActive && (
              <div className="h-20 bg-slate-950 rounded border border-slate-800 p-2 flex items-center justify-center gap-1">
                {[30, 70, 90, 40, 85, 60, 95, 20, 75, 45, 65, 80].map((h, i) => (
                  <div
                    key={i}
                    className="w-2 bg-gradient-to-t from-amber-500 to-emerald-400 rounded-full animate-pulse"
                    style={{ height: `${h}%`, animationDuration: `${0.3 + (i % 3) * 0.1}s` }}
                  />
                ))}
              </div>
            )}

            {sensorMode === 'synthetic' && (
              <div className="p-2 bg-slate-950 rounded border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                <span>Pattern Generator: IMU 64-FFT</span>
                <span className="text-emerald-400 font-semibold">Active</span>
              </div>
            )}
          </div>

          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
              GPIO DIGITAL I/O PINS
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(simState.gpio).map(([pinName, isHigh]) => (
                <div
                  key={pinName}
                  onClick={() => onUpdateGpio(pinName, !isHigh)}
                  className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition select-none ${
                    isHigh
                      ? 'bg-emerald-950/50 border-emerald-500/60 shadow-sm shadow-emerald-500/20'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        isHigh ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-slate-700'
                      }`}
                    />
                    <span className="font-mono text-xs text-slate-300">{pinName}</span>
                  </div>
                  <span className={`text-[9px] font-mono font-bold ${isHigh ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {isHigh ? 'HIGH' : 'LOW'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <Activity className="w-3 h-3 text-cyan-400" /> ADC SENSOR VOLTAGE (ADC_CH1)
              </span>
              <span className="font-mono text-xs text-cyan-400 font-bold">
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
              className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>
        </div>

        <div className="md:col-span-7 flex flex-col bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-mono font-semibold text-slate-200">
                UART SERIAL CONSOLE @ 115200 BAUD
              </span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
              RX/TX Active
            </span>
          </div>

          <div className="flex-1 p-3 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-1 select-text bg-slate-950">
            {simState.uartLogs.map((log, index) => {
              let color = 'text-slate-300';
              if (log.includes('CRITICAL') || log.includes('ERR')) color = 'text-rose-400';
              if (log.includes('WARN')) color = 'text-amber-400';
              if (log.includes('INFERENCE') || log.includes('SHANNON')) color = 'text-emerald-400';
              if (log.includes('SRAM') || log.includes('ARENA')) color = 'text-cyan-400';

              return (
                <div key={index} className={color}>
                  {log}
                </div>
              );
            })}
            <div ref={uartEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};