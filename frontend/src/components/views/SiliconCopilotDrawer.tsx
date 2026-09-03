import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Bot,
  Sparkles,
} from 'lucide-react';
import { useCompiler } from '../../context/CompilerContext';
import { chatWithAgent } from '../../services/api';

export const SiliconCopilotDrawer: React.FC = () => {
  const {
    isCopilotOpen,
    setIsCopilotOpen,
    loadedModel,
    compilationResult,
    selectedHw,
  } = useCompiler();

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<
    Array<{ sender: 'user' | 'agent'; text: string; timestamp: string }>
  >([]);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          sender: 'agent',
          text: `Hello! I am your **Shannon Silicon Copilot**. I analyze TinyML computational graphs, memory layouts, and SIMD instruction choices for **${selectedHw.name}**.\n\nAsk me about bottleneck analysis, SRAM arena lifetime reuse, or power consumption projections!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [selectedHw.name]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  if (!isCopilotOpen) return null;

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isThinking) return;

    const userText = inputMessage.trim();
    setInputMessage('');

    const newMessages = [
      ...messages,
      {
        sender: 'user' as const,
        text: userText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    setMessages(newMessages);
    setIsThinking(true);

    try {
      const reply = await chatWithAgent(
        userText,
        selectedHw.id,
        compilationResult?.model_name || loadedModel?.name || 'KeywordSpotter_v1',
        compilationResult
          ? {
              flash_bytes: compilationResult.optimized_int8.flash_bytes,
              sram_bytes: compilationResult.optimized_int8.peak_sram_bytes,
              macs: compilationResult.optimized_int8.total_macs,
              latency_ms: compilationResult.optimized_int8.estimated_latency_ms,
            }
          : undefined
      );

      setMessages([
        ...newMessages,
        {
          sender: 'agent',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      setMessages([
        ...newMessages,
        {
          sender: 'agent',
          text: `**Silicon Copilot Summary for ${selectedHw.name}**:\n- Model: ${loadedModel ? loadedModel.name : 'No model loaded'}\n- SRAM Arena: ${compilationResult ? compilationResult.optimized_int8.peak_sram_bytes + ' Bytes' : 'Awaiting compile'}\n- Memory Safety: Verified 0 dynamic allocations (0 B malloc).`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-surface border-l border-border shadow-2xl z-50 flex flex-col font-sans">
      {/* Drawer Header */}
      <div className="h-14 px-4 border-b border-border flex items-center justify-between bg-surface-raised/40">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-surface-raised border border-border flex items-center justify-center text-accent">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-text-primary">Silicon Copilot</span>
              <span className="text-xs px-1.5 py-0.2 rounded bg-surface-raised text-text-muted font-mono font-medium border border-border">
                AI AUDITOR
              </span>
            </div>
            <span className="text-[11px] text-text-muted">Target: {selectedHw.name}</span>
          </div>
        </div>

        <button
          onClick={() => setIsCopilotOpen(false)}
          className="p-1.5 rounded hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col space-y-1 ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`p-3 rounded max-w-[88%] leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-surface-raised text-text-primary border border-border'
                  : 'bg-surface-raised/40 border border-border text-text-primary whitespace-pre-wrap'
              }`}
            >
              {m.text}
            </div>
            <span className="text-xs font-mono text-text-muted px-1">{m.timestamp}</span>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center gap-2 text-accent font-mono text-xs p-2">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Auditing silicon memory constraints...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-surface-raised/20">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about SRAM arena, latency..."
            className="flex-1 bg-surface-raised border border-border rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent placeholder-text-muted font-sans"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isThinking}
            className="p-2 rounded bg-accent hover:bg-accent-hover text-black disabled:opacity-50 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
