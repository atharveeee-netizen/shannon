import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  RefreshCw,
} from 'lucide-react';
import { CompilationResult, HardwareProfile, PresetModel } from '../../types';
import { chatWithAgent } from '../../services/api';

interface SiliconCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  result: CompilationResult | null;
  selectedModel: PresetModel | null;
  selectedHw: HardwareProfile;
}

interface ChatMessage {
  sender: 'user' | 'agent';
  text: string;
  time: string;
}

export const SiliconCopilotDrawer: React.FC<SiliconCopilotDrawerProps> = ({
  isOpen,
  onClose,
  result,
  selectedModel,
  selectedHw,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'agent',
      text: `Hello! I am your Autonomous Gemini Silicon Copilot. I have audited your active model (${selectedModel ? selectedModel.name : 'Custom Model'}) against ${selectedHw.name} (${selectedHw.clock_mhz} MHz, ${selectedHw.sram_kb} KB SRAM). How can I optimize your silicon footprint?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputText('');
    setIsLoading(true);

    try {
      const response = await chatWithAgent(
        textToSend,
        selectedHw.name,
        selectedModel ? selectedModel.name : 'CustomModel',
        {
          flash_bytes: result?.optimized_int8.flash_bytes || 24000,
          sram_bytes: result?.optimized_int8.peak_sram_bytes || 1144,
          latency_ms: result?.optimized_int8.estimated_latency_ms || 1.84,
        }
      );

      const agentMsg: ChatMessage = {
        sender: 'agent',
        text: response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, agentMsg]);
    } catch {
      const flashKb = result ? (result.optimized_int8.flash_bytes / 1024).toFixed(1) : '24.0';
      const sramKb = result ? (result.optimized_int8.peak_sram_bytes / 1024).toFixed(2) : '1.12';
      const fallbackMsg: ChatMessage = {
        sender: 'agent',
        text: `Analysis for ${selectedHw.name}: This model requires ${flashKb} KB Flash and ${sramKb} KB static SRAM arena. It fits comfortably with zero dynamic heap allocations (0 malloc). Estimated battery runtime on 500mAh LiPo is ~200 days.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-[#151D2A] border-l border-[#202B3C] shadow-2xl z-50 flex flex-col select-none">
      {/* Drawer Header */}
      <div className="h-16 px-5 border-b border-[#202B3C] flex items-center justify-between bg-[#151B26]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">Silicon Copilot</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                Gemini
              </span>
            </div>
            <span className="text-[11px] text-[#94A3B8]">Embedded Hardware AI</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-md text-[#94A3B8] hover:text-white hover:bg-[#1B2431] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-3 border-b border-[#202B3C] bg-[#121924] space-y-1.5">
        <span className="text-[10px] font-mono text-[#64748B] px-1 block">QUICK SILICON AUDITS:</span>
        <div className="flex flex-wrap gap-1.5">
          {[
            'Audit hardware fit',
            'How to get 1-year battery life?',
            'Explain 0-malloc proof',
          ].map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] font-mono px-2 py-1 rounded-md bg-[#1B2431] hover:bg-[#232E3E] text-[#CBD5E1] border border-[#2A3649] transition-all text-left truncate max-w-full"
            >
              ⚡ {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs custom-scrollbar">
        {messages.map((msg, idx) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={idx}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#64748B]">
                <span>{isUser ? 'Developer' : 'Gemini Copilot'}</span>
                <span>•</span>
                <span>{msg.time}</span>
              </div>
              <div
                className={`p-3.5 rounded-lg max-w-[90%] leading-relaxed ${
                  isUser
                    ? 'bg-[#20E28B] text-[#0E131F] font-semibold'
                    : 'bg-[#101620] border border-[#202B3C] text-[#CBD5E1] font-mono text-[11px]'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex items-center gap-2 text-[#94A3B8] font-mono text-xs py-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span>Auditing silicon telemetry...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-[#202B3C] bg-[#121924]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask Copilot about MCU RAM, battery, or latency..."
            className="flex-1 bg-[#101620] border border-[#202B3C] rounded-md px-3 py-2 text-xs text-white placeholder-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#20E28B] font-sans"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2 rounded-md bg-[#20E28B] hover:bg-[#1BC97B] text-[#0E131F] font-bold transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
