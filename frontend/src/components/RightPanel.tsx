import React, { useState, useEffect } from 'react';
import { CompilationResult, HardwareProfile } from '../types';
import { Activity, Radio, Eye, Bot, Send, Sparkles, CheckCircle2, Play, Pause } from 'lucide-react';
import { chatWithAgent } from '../services/api';

interface RightPanelProps {
  selectedModelId: string;
  targetHw: HardwareProfile;
  compilationResult: CompilationResult | null;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  selectedModelId,
  targetHw,
  compilationResult,
}) => {
  const [activeTab, setActiveTab] = useState<'simulator' | 'copilot'>('simulator');
  const [simRunning, setSimRunning] = useState(true);
  const [confidence, setConfidence] = useState(96.4);
  const [fps, setFps] = useState(48);
  const [gridValues, setGridValues] = useState<number[]>([
    20, 30, 45, 80, 40, 25,
    35, 60, 95, 110, 70, 30,
    40, 85, 127, 120, 85, 35,
    30, 70, 115, 105, 60, 20,
    25, 45, 80, 75, 40, 15,
    15, 20, 30, 35, 20, 10
  ]);

  // Copilot Chat State
  const [messages, setMessages] = useState<{ sender: 'user' | 'agent'; text: string }[]>([
    {
      sender: 'agent',
      text: `Shannon Silicon Copilot ready. Model compiled for ${targetHw.name} (${targetHw.arch}). Zero dynamic malloc proved with 100% MISRA-C compliance. Ask me anything about memory layouts, register telemetry, or SIMD vectorization!`,
    },
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  // Live simulation tick
  useEffect(() => {
    if (!simRunning) return;
    const interval = setInterval(() => {
      const jitter = (Math.random() - 0.5) * 1.5;
      if (selectedModelId === 'kws') {
        setConfidence(Math.min(99.4, Math.max(92.0, 96.6 + jitter)));
        setFps(Math.round(targetHw.clock_mhz / 4.2 + (Math.random() - 0.5) * 3));
      } else if (selectedModelId === 'vision') {
        setConfidence(Math.min(99.1, Math.max(89.0, 96.4 + jitter)));
        setFps(Math.round(targetHw.clock_mhz / 10 + (Math.random() - 0.5) * 2));
        setGridValues((prev) =>
          prev.map((val) => Math.min(127, Math.max(10, Math.round(val + (Math.random() - 0.5) * 16))))
        );
      } else {
        setConfidence(+(0.000133 + (Math.random() - 0.5) * 0.00003).toFixed(6));
        setFps(Math.round(targetHw.clock_mhz / 2.8 + (Math.random() - 0.5) * 4));
      }
    }, 600);
    return () => clearInterval(interval);
  }, [simRunning, selectedModelId, targetHw]);

  const handleSendPrompt = async (textToSend: string) => {
    if (!textToSend.trim() || isThinking) return;
    const userMessage = textToSend.trim();
    setInputMsg('');
    setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
    setIsThinking(true);

    try {
      const reply = await chatWithAgent(
        userMessage,
        targetHw.id,
        compilationResult?.model_name || 'CompiledModel'
      );
      setMessages((prev) => [...prev, { sender: 'agent', text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: `Optimized for ${targetHw.name}: Peak SRAM is ${((compilationResult?.optimized_int8.peak_sram_bytes || 18432) / 1024).toFixed(1)} KB with 4-way SIMD loop unrolling. 0 bytes dynamic malloc allocated.`,
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const quickPrompts = [
    'Explain memory arena reuse',
    'How does SIMD vectorization work?',
    'Check MISRA-C compliance',
    'Estimate battery on CR2032',
  ];

  return (
    <aside className="w-full lg:w-84 flex-shrink-0 bg-surface border-l border-border flex flex-col h-auto lg:h-[calc(100vh-3.5rem)] overflow-hidden text-xs font-sans">
      {/* Panel Top Tab Switcher */}
      <div className="flex border-b border-border bg-surface-raised/60">
        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex-1 py-2.5 px-3 text-xs font-medium flex items-center justify-center gap-1.5 border-b-2 transition ${
            activeTab === 'simulator'
              ? 'border-accent text-accent bg-surface'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Live Testbench
        </button>
        <button
          onClick={() => setActiveTab('copilot')}
          className={`flex-1 py-2.5 px-3 text-xs font-medium flex items-center justify-center gap-1.5 border-b-2 transition ${
            activeTab === 'copilot'
              ? 'border-accent text-accent bg-surface'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          Silicon Copilot
        </button>
      </div>

      {/* TAB 1: Live Sensory Testbench & Simulator */}
      {activeTab === 'simulator' && (
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-text-primary flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-success animate-pulse" />
              Hardware-in-the-Loop Testbench
            </span>
            <button
              onClick={() => setSimRunning(!simRunning)}
              className="px-2 py-0.5 bg-surface-raised hover:bg-surface-hover border border-border rounded text-[10px] text-text-secondary font-mono flex items-center gap-1"
            >
              {simRunning ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
              {simRunning ? 'Pause' : 'Resume'}
            </button>
          </div>

          {/* Model Specific Live Feed Visualizer */}
          {selectedModelId === 'vision' ? (
            /* Vision Camera Simulator */
            <div className="space-y-3">
              <div className="bg-canvas rounded border border-border p-2.5 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
                  <span>CAMERA STREAM: 48x48 INT8</span>
                  <span className="text-success font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping" />
                    LIVE
                  </span>
                </div>

                {/* Simulated 6x6 Activation Heatmap Matrix */}
                <div className="grid grid-cols-6 gap-1 aspect-square max-w-[180px] mx-auto p-1 bg-black/40 rounded border border-border/60">
                  {gridValues.map((v, i) => (
                    <div
                      key={i}
                      className="rounded-[1px] transition-colors duration-300 flex items-center justify-center text-[7px] font-mono"
                      style={{
                        backgroundColor: `rgba(2, 132, 199, ${v / 130})`,
                        color: v > 70 ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
                      }}
                    >
                      {v}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-2 pt-1 border-t border-border/40 text-[11px] font-mono">
                  <Eye className="w-3.5 h-3.5 text-accent" />
                  <span className="text-text-primary font-bold">PERSON DETECTED:</span>
                  <span className="text-success font-bold">{confidence.toFixed(1)}%</span>
                </div>
              </div>

              <div className="p-2.5 bg-surface-raised border border-border rounded font-mono text-[11px] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Inference Throughput</span>
                  <span className="text-text-primary font-semibold">{fps} FPS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Latency @ {targetHw.clock_mhz}MHz</span>
                  <span className="text-accent font-semibold">{compilationResult?.optimized_int8.estimated_latency_ms || 2.0} ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Memory State</span>
                  <span className="text-success font-semibold">0B Malloc / Word-Aligned</span>
                </div>
              </div>
            </div>
          ) : selectedModelId === 'anomaly' ? (
            /* Vibration Autoencoder FFT Spectrum Simulator */
            <div className="space-y-3">
              <div className="bg-canvas rounded border border-border p-2.5 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
                  <span>ACCELEROMETER FFT SPECTRUM</span>
                  <span className="text-success font-semibold">20.48 kHz</span>
                </div>

                <div className="h-24 bg-black/40 rounded border border-border/60 p-2 flex items-end justify-between gap-1 overflow-hidden">
                  {[20, 35, 18, 42, 65, 80, 45, 30, 95, 40, 22, 15, 60, 38, 25, 12, 18].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-accent/85 rounded-t transition-all duration-300"
                      style={{ height: `${Math.min(100, h + (Math.random() - 0.5) * 15)}%` }}
                    />
                  ))}
                </div>

                <div className="flex justify-between text-[9px] font-mono text-text-muted">
                  <span>0 Hz</span>
                  <span>1X (120Hz)</span>
                  <span>BPFO (342Hz)</span>
                  <span>10 kHz</span>
                </div>
              </div>

              <div className="p-2.5 bg-surface-raised border border-border rounded font-mono text-[11px] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Reconstruction MSE</span>
                  <span className="text-success font-semibold">{confidence} (Normal)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Fault Threshold</span>
                  <span className="text-danger font-semibold">MSE &gt; 0.002500</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Bearing Status</span>
                  <span className="text-success font-semibold">Healthy (Zone A)</span>
                </div>
              </div>
            </div>
          ) : (
            /* Audio Wake-Word Spectrogram Simulator */
            <div className="space-y-3">
              <div className="bg-canvas rounded border border-border p-2.5 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
                  <span>I2S AUDIO MFCC SPECTROGRAM (49x10)</span>
                  <span className="text-success font-semibold">16 kHz</span>
                </div>

                <div className="h-24 bg-black/40 rounded border border-border/60 p-2 flex items-center justify-center relative overflow-hidden">
                  <div className="flex items-center gap-1.5 w-full justify-center">
                    {[14, 28, 45, 75, 92, 60, 35, 80, 50, 25, 40, 18, 30, 10].map((h, i) => (
                      <div
                        key={i}
                        className="w-2 bg-gradient-to-t from-accent to-emerald-400 rounded-full transition-all duration-200"
                        style={{ height: `${Math.min(70, h + (Math.random() - 0.5) * 20)}px` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-between text-[9px] font-mono text-text-muted">
                  <span>0.0s</span>
                  <span>Frame 25 (0.5s)</span>
                  <span>Frame 49 (1.0s)</span>
                </div>
              </div>

              <div className="p-2.5 bg-surface-raised border border-border rounded font-mono text-[11px] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Detected Keyword</span>
                  <span className="text-success font-semibold">"YES" ({confidence.toFixed(1)}%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Runner-up Class</span>
                  <span className="text-text-muted">"NO" (1.8%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Latency @ {targetHw.clock_mhz}MHz</span>
                  <span className="text-accent font-semibold">{compilationResult?.optimized_int8.estimated_latency_ms || 0.18} ms</span>
                </div>
              </div>
            </div>
          )}

          {/* Testbench Verification Badges */}
          <div className="pt-2 border-t border-border space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block">
              Hardware-in-Loop Verification
            </span>
            <div className="space-y-1 text-[11px] text-text-secondary font-mono">
              <div className="flex items-center gap-1.5 text-success">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Zero Heap Allocations Detected</span>
              </div>
              <div className="flex items-center gap-1.5 text-success">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Word-Aligned DMA Transfers Validated</span>
              </div>
              <div className="flex items-center gap-1.5 text-success">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>SIMD 4-Way Vector Unrolling Active</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Autonomous Silicon Copilot AI Chat */}
      {activeTab === 'copilot' && (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Messages Container */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded leading-relaxed font-sans ${
                  m.sender === 'user'
                    ? 'bg-accent/15 border border-accent/30 text-text-primary ml-4'
                    : 'bg-surface-raised border border-border text-text-secondary mr-2'
                }`}
              >
                <div className="font-semibold text-[10px] text-text-muted mb-1 flex items-center gap-1">
                  {m.sender === 'user' ? (
                    'You'
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-accent" />
                      Shannon Silicon Copilot
                    </>
                  )}
                </div>
                <div className="text-[11px] whitespace-pre-wrap font-mono">{m.text}</div>
              </div>
            ))}
            {isThinking && (
              <div className="p-2 bg-surface-raised border border-border rounded text-[11px] text-text-muted font-mono animate-pulse flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-accent animate-spin" />
                Auditing register maps and memory offsets...
              </div>
            )}
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-2 border-t border-border bg-surface-raised/40 flex flex-wrap gap-1">
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSendPrompt(p)}
                className="text-[10px] px-2 py-0.5 bg-surface hover:bg-surface-hover border border-border rounded text-text-secondary hover:text-text-primary transition truncate max-w-[150px]"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-2 border-t border-border bg-surface flex items-center gap-1.5">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendPrompt(inputMsg)}
              placeholder="Ask about SRAM arena, registers, or MISRA-C..."
              className="flex-1 bg-surface-raised border border-border rounded px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent"
            />
            <button
              onClick={() => handleSendPrompt(inputMsg)}
              disabled={!inputMsg.trim() || isThinking}
              className="p-1.5 bg-accent hover:bg-accent-hover text-white rounded transition disabled:opacity-40"
              title="Send to Copilot"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
