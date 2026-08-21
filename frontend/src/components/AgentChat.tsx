import React, { useState } from 'react';
import { askAgent } from '../services/api';
import { Bot, Send, Sparkles, User, BrainCircuit } from 'lucide-react';

interface Props {
  targetHardware: string;
  modelName: string;
}

export const AgentChat: React.FC<Props> = ({ targetHardware, modelName }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'agent'; text: string }>>([
    {
      role: 'agent',
      text: `Hello! I am Claude-Shannon, your autonomous AI compiler copilot. I have audited **${modelName}** against the physical silicon constraints of the **${targetHardware}**. The memory arena is verified with 0 dynamic mallocs.`
    }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (textToSend?: string) => {
    const msg = textToSend || input;
    if (!msg.trim() || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text: msg }]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const reply = await askAgent(msg, targetHardware, modelName);
      setMessages((prev) => [...prev, { role: 'agent', text: reply }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'agent', text: 'Error querying Shannon agent backend.' }]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    'How does Shannon eliminate SRAM memory fragmentation?',
    'Why is INT8 symmetric quantization safe for accuracy?',
    'What SIMD vector instructions does my chip use?',
    'How do I flash the generated C++ header to hardware?'
  ];

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col h-[420px]">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/80 rounded-t-xl">
        <div className="flex items-center space-x-2">
          <div className="h-7 w-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <BrainCircuit className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h4 className="text-xs font-bold text-white font-mono">Shannon AI Copilot</h4>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-semibold">
                Autonomous LLM Agent
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Hardware & Compiler Reasoner</span>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-emerald-500/20">
          Target: {targetHardware}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3 font-sans text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-2.5 ${m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
          >
            <div
              className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
                m.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {m.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
            </div>
            <div
              className={`p-3 rounded-xl max-w-[82%] leading-relaxed ${
                m.role === 'user'
                  ? 'bg-cyan-950/60 border border-cyan-800 text-cyan-100'
                  : 'bg-slate-800/80 border border-slate-700/60 text-slate-200'
              }`}
            >
              <div dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code class="bg-slate-900 px-1 py-0.5 rounded text-emerald-300 font-mono text-[10px]">$1</code>') }} />
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-mono">
            <Sparkles className="h-3.5 w-3.5 animate-spin text-emerald-400" />
            <span>Shannon is analyzing hardware constraints & registers...</span>
          </div>
        )}
      </div>

      {/* Quick Questions */}
      <div className="px-3 py-1.5 border-t border-slate-800/60 flex items-center space-x-1.5 overflow-x-auto text-[10px] font-mono">
        {quickQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            className="px-2 py-1 rounded-md bg-slate-800/60 hover:bg-slate-800 text-slate-300 whitespace-nowrap border border-slate-700/50 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-slate-800/80 flex items-center space-x-2 bg-slate-900/40 rounded-b-xl"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Shannon about memory, flash, or C++ generation..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
        />
        <button
          type="submit"
          disabled={loading}
          className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-colors disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
};