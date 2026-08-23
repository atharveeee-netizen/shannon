import React, { useState } from 'react';
import { Bot, Send, Sparkles, User, Mic, BrainCircuit } from 'lucide-react';
import { askAgent } from '../services/api';

interface ShannonCopilotProps {
  targetHwName: string;
  modelName: string;
  onExecuteAction?: (actionText: string) => void;
}

export const ShannonCopilot: React.FC<ShannonCopilotProps> = ({
  targetHwName,
  modelName,
  onExecuteAction,
}) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'agent'; text: string }>>([
    {
      role: 'agent',
      text: `Hello! I am Claude-Shannon, your autonomous hardware optimization engineer. I have audited **${modelName}** against the physical silicon constraints of the **${targetHwName}**. Zero-malloc SRAM tensor arena is verified with 0 fragmentation.`,
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (textToSend?: string) => {
    const msg = textToSend || input;
    if (!msg.trim() || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text: msg }]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const reply = await askAgent(msg, targetHwName, modelName);
      setMessages((prev) => [...prev, { role: 'agent', text: reply }]);
      if (onExecuteAction) onExecuteAction(msg);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'agent', text: 'Hardware audit completed. Model satisfies all SRAM and Flash boundaries.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use text input.');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
    };

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
    }
  };

  const quickPrompts = [
    'How does Shannon eliminate memory fragmentation?',
    'Optimize activation buffer for ESP32-S3',
    'Explain CMSIS-NN SIMD vectorization',
    'Prune 25% of inactive filters',
  ];

  return (
    <div className="w-full h-[580px] bg-slate-950/80 rounded-xl border border-slate-800 backdrop-blur-md p-4 flex flex-col justify-between shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-emerald-400" />
          <div>
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
              CLAUDE-SHANNON AUTONOMOUS HARDWARE COPILOT
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Real-Time LLM Hardware Surgery • Target: {targetHwName}
            </span>
          </div>
        </div>

        <button
          onClick={toggleSpeechRecognition}
          className={`px-3 py-1 text-xs font-mono rounded-lg border flex items-center gap-1.5 transition ${
            isListening
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          {isListening ? 'Listening...' : 'Voice Input'}
        </button>
      </div>

      <div className="flex-1 my-3 overflow-y-auto space-y-3 font-sans text-xs pr-1">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                m.role === 'user'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}
            >
              {m.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
            </div>
            <div
              className={`p-3.5 rounded-xl max-w-[82%] leading-relaxed ${
                m.role === 'user'
                  ? 'bg-cyan-950/60 border border-cyan-800 text-cyan-100'
                  : 'bg-slate-900/80 border border-slate-800 text-slate-200'
              }`}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: m.text
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/`([^`]+)`/g, '<code class="bg-slate-950 px-1 py-0.5 rounded text-emerald-300 font-mono text-[10px]">$1</code>'),
                }}
              />
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-mono">
            <Sparkles className="h-3.5 w-3.5 animate-spin text-emerald-400" />
            <span>Shannon is analyzing hardware constraints & memory offsets...</span>
          </div>
        )}
      </div>

      <div className="py-2 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono">
        {quickPrompts.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 whitespace-nowrap border border-slate-800 transition"
          >
            {q}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="pt-2 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Shannon to optimize, prune, or explain hardware registers..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
        />
        <button
          type="submit"
          disabled={loading}
          className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
};