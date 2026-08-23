import React, { useState, useEffect, useRef } from 'react';
import { SimulatedSiliconState, HardwareProfile } from '../types';
import { Activity, Terminal, Play, Square, Camera, Mic, Flame, Zap } from 'lucide-react';

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
      alert('Camera access denied or unavailable. Using synthetic sensor stream.');
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
      alert('Microphone access denied or unavailable. Using synthetic sensor stream.');
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
    <div className="space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-[#232936] pb-3">
        <div>
          <h2 className="text-sm font-semibold text-[#F5F8FA] font-mono flex items-center gap-2 uppercase tracking-wide">
            <Activity className="w-4 h-4 text-[#2B95D6]" />
            SILICON BENCH AND HARDWARE SIMULATOR
          </h2>
          <p className="text-xs text-[#A7B6C2]">
            Real-time sensory loop execution running on virtual {targetHw.name} ({targetHw.arch}).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#1A1F28] px-2.5 py-1 border border-[#232936] rounded-[3px] text-xs font-mono">
            <Flame className="w-3.5 h-3.5 text-[#D9822B]" />
            <span className="text-[#F5F8FA]">{simState.coreTempC}°C</span>
            <span className="text-[#303846]">|</span>
            <Zap className="w-3.5 h-3.5 text-[#0D8050]" />
            <span className="text-[#0D8050] font-bold">{simState.powerMw} mW</span>
          </div>

          <button
            onClick={onToggleSim}
            className={`px-3 py-1 text-xs font-mono font-semibold rounded-[3px] flex items-center gap-1.5 transition border ${
              isSimulating
                ? 'bg-[#C23030]/20 text-[#C23030] border-[#C23030]/50'
                : 'bg-[#0D8050]/20 text-[#0D8050] border-[#0D8050]/50 hover:bg-[#0D8050]/30'
            }`}
          >
            {isSimulating ? (
              <>
                <Square className="w-3 h-3 fill-current" /> Stop Clock
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" /> Run Clock
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid: Inputs (5 cols) + UART (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 space-y-3">
          {/* Sensory Inputs */}
          <div className="bg-[#1A1F28] border border-[#232936] rounded-[3px] p-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-mono text-[#F5F8FA] uppercase font-semibold">
                SENSORY INPUT STREAM
              </span>
              <div className="flex items-center gap-1 bg-[#0B0D11] p-0.5 rounded-[2px] border border-[#232936] text-[9px] font-mono">
                <button
                  onClick={stopSensors}
                  className={`px-2 py-0.5 rounded-[2px] ${sensorMode === 'synthetic' ? 'bg-[#106BA3] text-[#F5F8FA]' : 'text-[#A7B6C2]'}`}
                >
                  Synthetic
                </button>
                <button
                  onClick={startCamera}
                  className={`px-2 py-0.5 rounded-[2px] flex items-center gap-1 ${sensorMode === 'camera' ? 'bg-[#106BA3] text-[#F5F8FA]' : 'text-[#A7B6C2]'}`}
                >
                  <Camera className="w-3 h-3" /> Cam
                </button>
                <button
                  onClick={startMic}
                  className={`px-2 py-0.5 rounded-[2px] flex items-center gap-1 ${sensorMode === 'mic' ? 'bg-[#106BA3] text-[#F5F8FA]' : 'text-[#A7B6C2]'}`}
                >
                  <Mic className="w-3 h-3" /> Mic
                </button>
              </div>
            </div>

            {sensorMode === 'camera' && isLiveActive && (
              <div className="relative rounded-[2px] overflow-hidden border border-[#232936] bg-black h-32 flex items-center justify-center">
                <video ref={videoRef} className="h-full w-full object-cover grayscale opacity-90" autoPlay muted playsInline />
                <div className="absolute inset-0 border border-[#0D8050] p-1.5 flex items-start justify-between pointer-events-none">
                  <span className="text-[8px] font-mono bg-black/80 text-[#0D8050] px-1 py-0.5 rounded-[2px]">
                    48x48 Downsample [Live]
                  </span>
                  <span className="h-2 w-2 rounded-full bg-[#C23030] animate-pulse"></span>
                </div>
              </div>
            )}

            {sensorMode === 'mic' && isLiveActive && (
              <div className="h-24 bg-[#0B0D11] rounded-[2px] border border-[#232936] p-2.5 flex items-center justify-center gap-1.5">
                {[30, 70, 90, 40, 85, 60, 95, 20, 75, 45, 65, 80].map((h, i) => (
                  <div
                    key={i}
                    className="w-2 bg-[#0D8050] rounded-full animate-pulse"
                    style={{ height: `${h}%`, animationDuration: `${0.3 + (i % 3) * 0.1}s` }}
                  />
                ))}
              </div>
            )}

            {sensorMode === 'synthetic' && (
              <div className="p-3 bg-[#0B0D11] rounded-[2px] border border-[#232936] text-xs font-mono text-[#A7B6C2] flex items-center justify-between">
                <span>Synthetic Generator: 64-FFT Spectrum</span>
                <span className="text-[#0D8050] font-semibold">STREAMING</span>
              </div>
            )}
          </div>

          {/* GPIO Pins */}
          <div className="bg-[#1A1F28] border border-[#232936] rounded-[3px] p-3.5">
            <label className="text-[10px] font-mono text-[#5C7080] uppercase tracking-wider block mb-2 font-semibold">
              GPIO DIGITAL PINS
            </label>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              {Object.entries(simState.gpio).map(([pin, isHigh]) => (
                <div
                  key={pin}
                  onClick={() => onUpdateGpio(pin, !isHigh)}
                  className={`p-2 rounded-[2px] border flex items-center justify-between cursor-pointer transition select-none ${
                    isHigh
                      ? 'bg-[#0D8050]/20 border-[#0D8050]/50 text-[#F5F8FA]'
                      : 'bg-[#0B0D11] border-[#232936] text-[#A7B6C2]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isHigh ? 'bg-[#0D8050]' : 'bg-[#232936]'}`} />
                    <span>{pin}</span>
                  </div>
                  <span className={`text-[10px] font-bold ${isHigh ? 'text-[#0D8050]' : 'text-[#5C7080]'}`}>
                    {isHigh ? 'HIGH' : 'LOW'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ADC Potentiometer */}
          <div className="bg-[#1A1F28] border border-[#232936] rounded-[3px] p-3.5">
            <div className="flex items-center justify-between mb-1.5 text-xs font-mono">
              <span className="text-[#5C7080] flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-[#2B95D6]" /> ADC ANALOG VOLTAGE (ADC_CH1)
              </span>
              <span className="text-[#2B95D6] font-bold">
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
              className="w-full h-1 bg-[#0B0D11] rounded appearance-none cursor-pointer accent-[#2B95D6]"
            />
          </div>
        </div>

        {/* Live UART Terminal */}
        <div className="lg:col-span-7 bg-[#1A1F28] border border-[#232936] rounded-[3px] flex flex-col h-[460px] overflow-hidden">
          <div className="px-3.5 py-2.5 border-b border-[#232936] bg-[#12151B] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#0D8050]" />
              <span className="text-xs font-mono font-semibold text-[#F5F8FA]">
                UART SERIAL TERMINAL @ 115200 BAUD
              </span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#0D8050]/20 text-[#0D8050] rounded-[2px] font-bold">
              RX/TX READY
            </span>
          </div>

          <div className="flex-1 p-3.5 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-1 select-text bg-[#0B0D11]">
            {simState.uartLogs.map((log, i) => {
              let textColor = 'text-[#A7B6C2]';
              if (log.includes('CRITICAL') || log.includes('ERR')) textColor = 'text-[#C23030] font-bold';
              if (log.includes('WARN')) textColor = 'text-[#D9822B] font-semibold';
              if (log.includes('INFERENCE') || log.includes('SHANNON') || log.includes('SUCCESS')) textColor = 'text-[#0D8050]';
              if (log.includes('SRAM') || log.includes('ARENA')) textColor = 'text-[#2B95D6]';

              return (
                <div key={i} className={textColor}>
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