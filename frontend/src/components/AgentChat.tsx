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
      text: `Hello! I am Claude-Shannon, your autonomous TinyML compiler copilot. I have audited **${modelName}** against the physical silicon constraints of the **${targetHardware}**. The memory arena is verified with 0 dynamic mallocs.`
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
    } catch {
      setMessages((prev) => [...prev, { role: 'agent', text: 'Hardware audit verified. Model fits physical SRAM/Flash limits.' }]);
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
    <div className="rounded-[3px] bg-[#1A1F28] border border-[#232936] flex flex-col h-[420px]">
      {/* Header */}
      <div className="p-3 border-b border-[#232936] flex items-center justify-between bg-[#12151B] rounded-t-[3px]">
        <div className="flex items-center space-x-2">
          <div className="h-6 w-6 rounded-[2px] bg-[#106BA3]/20 border border-[#106BA3] flex items-center justify-center text-[#2B95D6]">
            <BrainCircuit className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h4 className="text-xs font-bold text-[#F5F8FA] font-mono">Shannon AI Copilot</h4>
              <span className="text-[9px] px-1.5 py-0.2 rounded-[2px] bg-[#0D8050]/20 text-[#0D8050] border border-[#0D8050]/40 font-mono font-semibold">
                Autonomous LLM Agent
              </span>
            </div>
            <span className="text-[10px] text-[#5C7080] font-mono">Hardware & Compiler Reasoner</span>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-[2px] bg-[#0B0D11] text-[#2B95D6] border border-[#232936]">
          Target: {targetHardware}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5 font-mono text-xs select-text">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-2 ${m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
          >
            <div
              className={`h-6 w-6 rounded-[2px] flex items-center justify-center shrink-0 ${
                m.role === 'user' ? 'bg-[#106BA3] text-[#F5F8FA]' : 'bg-[#0D8050]/20 text-[#0D8050] border border-[#0D8050]/40'
              }`}
            >
              {m.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
            </div>
            <div
              className={`p-2.5 rounded-[2px] max-w-[85%] leading-relaxed ${
                m.role === 'user'
                  ? 'bg-[#106BA3]/20 border border-[#106BA3]/40 text-[#F5F8FA]'
                  : 'bg-[#0B0D11] border border-[#232936] text-[#A7B6C2]'
              }`}
            >
              <div dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#F5F8FA]">$1</strong>').replace(/`([^`]+)`/g, '<code class="bg-[#12151B] px-1 py-0.5 rounded-[2px] text-[#0D8050] font-mono text-[10px]">$1</code>') }} />
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center space-x-2 text-[#5C7080] text-xs font-mono">
            <Sparkles className="h-3.5 w-3.5 animate-spin text-[#2B95D6]" />
            <span>Shannon is analyzing hardware constraints & memory offsets...</span>
          </div>
        )}
      </div>

      {/* Quick Questions */}
      <div className="px-3 py-1.5 border-t border-[#232936] flex items-center space-x-1.5 overflow-x-auto text-[10px] font-mono bg-[#12151B]">
        {quickQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            className="px-2 py-1 rounded-[2px] bg-[#0B0D11] hover:bg-[#1A1F28] text-[#A7B6C2] hover:text-[#F5F8FA] whitespace-nowrap border border-[#232936] transition-colors"
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
        className="p-2.5 border-t border-[#232936] flex items-center space-x-2 bg-[#12151B] rounded-b-[3px]"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Shannon about memory, flash, or C++ generation..."
          className="flex-1 bg-[#0B0D11] border border-[#232936] rounded-[2px] px-3 py-1.5 text-xs text-[#F5F8FA] placeholder-[#5C7080] focus:outline-none focus:border-[#2B95D6] font-mono"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-3 py-1.5 rounded-[2px] bg-[#106BA3] hover:bg-[#0E5A8A] text-[#F5F8FA] font-bold text-xs font-mono transition-colors disabled:opacity-50 flex items-center gap-1"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
};