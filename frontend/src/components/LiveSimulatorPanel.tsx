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
      {/* Top Header & Simulation Controls */}
      <div className="flex items-center justify-between border-b border-palantir-border pb-3">
        <div>
          <h2 className="text-lg font-semibold text-palantir-textPrimary font-mono flex items-center gap-2">
            <Activity className="w-4 h-4 text-palantir-cobalt" />
            IN-BROWSER WEBASSEMBLY HARDWARE SILICON BENCH
          </h2>
          <p className="text-xs text-palantir-textSecondary font-sans">
            Real-time sensory loop execution running on virtual {targetHw.name} ({targetHw.arch}).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-palantir-card px-2.5 py-1 border border-palantir-border rounded-[3px] text-xs font-mono">
            <Flame className="w-3.5 h-3.5 text-palantir-warn" />
            <span className="text-palantir-textPrimary">{simState.coreTempC}°C</span>
            <span className="text-palantir-borderLight">|</span>
            <Zap className="w-3.5 h-3.5 text-palantir-pass" />
            <span className="text-palantir-pass font-bold">{simState.powerMw} mW</span>
          </div>

          <button
            onClick={onToggleSim}
            className={`px-3.5 py-1.5 text-xs font-mono font-semibold rounded-[3px] flex items-center gap-1.5 transition border ${
              isSimulating
                ? 'bg-palantir-dangerLight text-palantir-danger border-palantir-danger/50'
                : 'bg-palantir-passLight text-palantir-pass border-palantir-pass/50 hover:bg-palantir-pass/30'
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

      {/* Main Grid: Sensory & Pinout Inputs (5 cols) + UART Terminal (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 space-y-3">
          {/* Sensory Mode Selection */}
          <div className="bg-palantir-card border border-palantir-border rounded-[3px] p-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-mono text-palantir-textPrimary uppercase font-semibold">
                SENSORY INPUT STREAM
              </span>
              <div className="flex items-center gap-1 bg-palantir-canvas p-0.5 rounded-[2px] border border-palantir-border text-[9px] font-mono">
                <button
                  onClick={stopSensors}
                  className={`px-2 py-0.5 rounded-[2px] ${sensorMode === 'synthetic' ? 'bg-palantir-action text-palantir-textPrimary' : 'text-palantir-textSecondary'}`}
                >
                  Synthetic
                </button>
                <button
                  onClick={startCamera}
                  className={`px-2 py-0.5 rounded-[2px] flex items-center gap-1 ${sensorMode === 'camera' ? 'bg-palantir-action text-palantir-textPrimary' : 'text-palantir-textSecondary'}`}
                >
                  <Camera className="w-3 h-3" /> Cam
                </button>
                <button
                  onClick={startMic}
                  className={`px-2 py-0.5 rounded-[2px] flex items-center gap-1 ${sensorMode === 'mic' ? 'bg-palantir-action text-palantir-textPrimary' : 'text-palantir-textSecondary'}`}
                >
                  <Mic className="w-3 h-3" /> Mic
                </button>
              </div>
            </div>

            {sensorMode === 'camera' && isLiveActive && (
              <div className="relative rounded-[2px] overflow-hidden border border-palantir-border bg-black h-32 flex items-center justify-center">
                <video ref={videoRef} className="h-full w-full object-cover grayscale opacity-90" autoPlay muted playsInline />
                <div className="absolute inset-0 border border-palantir-pass p-1.5 flex items-start justify-between pointer-events-none">
                  <span className="text-[8px] font-mono bg-black/80 text-palantir-pass px-1 py-0.5 rounded-[2px]">
                    48x48 Downsample • Live Frame
                  </span>
                  <span className="h-2 w-2 rounded-full bg-palantir-danger animate-pulse"></span>
                </div>
              </div>
            )}

            {sensorMode === 'mic' && isLiveActive && (
              <div className="h-24 bg-palantir-canvas rounded-[2px] border border-palantir-border p-2.5 flex items-center justify-center gap-1.5">
                {[30, 70, 90, 40, 85, 60, 95, 20, 75, 45, 65, 80].map((h, i) => (
                  <div
                    key={i}
                    className="w-2 bg-gradient-to-t from-palantir-warn to-palantir-pass rounded-full animate-pulse"
                    style={{ height: `${h}%`, animationDuration: `${0.3 + (i % 3) * 0.1}s` }}
                  />
                ))}
              </div>
            )}

            {sensorMode === 'synthetic' && (
              <div className="p-3 bg-palantir-canvas rounded-[2px] border border-palantir-border text-xs font-mono text-palantir-textSecondary flex items-center justify-between">
                <span>Synthetic Generator: 64-FFT Spectrum</span>
                <span className="text-palantir-pass font-semibold">STREAMING</span>
              </div>
            )}
          </div>

          {/* GPIO Digital Pins */}
          <div className="bg-palantir-card border border-palantir-border rounded-[3px] p-3.5">
            <label className="text-[10px] font-mono text-palantir-textMuted uppercase tracking-wider block mb-2 font-semibold">
              GPIO DIGITAL I/O PINS
            </label>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              {Object.entries(simState.gpio).map(([pin, isHigh]) => (
                <div
                  key={pin}
                  onClick={() => onUpdateGpio(pin, !isHigh)}
                  className={`p-2 rounded-[2px] border flex items-center justify-between cursor-pointer transition select-none ${
                    isHigh
                      ? 'bg-palantir-passLight border-palantir-pass/50 text-palantir-textPrimary'
                      : 'bg-palantir-canvas border-palantir-border text-palantir-textSecondary'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${isHigh ? 'bg-palantir-pass shadow-[0_0_8px_#0D8050]' : 'bg-palantir-border'}`} />
                    <span>{pin}</span>
                  </div>
                  <span className={`text-[10px] font-bold ${isHigh ? 'text-palantir-pass' : 'text-palantir-textMuted'}`}>
                    {isHigh ? 'HIGH' : 'LOW'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ADC Potentiometer Slider */}
          <div className="bg-palantir-card border border-palantir-border rounded-[3px] p-3.5">
            <div className="flex items-center justify-between mb-1.5 text-xs font-mono">
              <span className="text-palantir-textMuted flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-palantir-cobalt" /> ADC ANALOG VOLTAGE (ADC_CH1)
              </span>
              <span className="text-palantir-cobalt font-bold">
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
              className="w-full h-1 bg-palantir-canvas rounded appearance-none cursor-pointer accent-palantir-cobalt"
            />
          </div>
        </div>

        {/* Live UART Serial Console */}
        <div className="lg:col-span-7 bg-palantir-card border border-palantir-border rounded-[3px] flex flex-col h-[460px] overflow-hidden">
          <div className="px-3.5 py-2.5 border-b border-palantir-border bg-palantir-nav flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-palantir-pass" />
              <span className="text-xs font-mono font-semibold text-palantir-textPrimary">
                UART SERIAL CONSOLE @ 115200 BAUD (VIRTUAL SILICON)
              </span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 bg-palantir-passLight text-palantir-pass rounded-[2px] font-bold">
              RX/TX LIVE
            </span>
          </div>

          <div className="flex-1 p-3.5 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-1 select-text bg-palantir-canvas">
            {simState.uartLogs.map((log, i) => {
              let textColor = 'text-palantir-textSecondary';
              if (log.includes('CRITICAL') || log.includes('ERR')) textColor = 'text-palantir-danger font-bold';
              if (log.includes('WARN')) textColor = 'text-palantir-warn font-semibold';
              if (log.includes('INFERENCE') || log.includes('SHANNON') || log.includes('SUCCESS')) textColor = 'text-palantir-pass';
              if (log.includes('SRAM') || log.includes('ARENA')) textColor = 'text-palantir-cobalt';

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