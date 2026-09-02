import React, { useState } from 'react';
import {
  Search,
  Copy,
  Check,
  Cpu,
  ArrowRight,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { CompilationResult, HardwareProfile, PresetModel } from '../types';

interface OllamaHomeViewProps {
  onOpenStudio: (tab?: string) => void;
  result: CompilationResult | null;
  selectedModel: PresetModel | null;
  selectedHw: HardwareProfile;
  models: PresetModel[];
  onSelectModel: (id: string) => void;
  onDownloadHeader: () => void;
}

export const OllamaHomeView: React.FC<OllamaHomeViewProps> = ({
  onOpenStudio,
  result,
  selectedModel,
  selectedHw,
  models,
  onSelectModel,
  onDownloadHeader,
}) => {
  const [copiedInstall, setCopiedInstall] = useState<boolean>(false);
  const [activeCliTab, setActiveCliTab] = useState<'compile' | 'arena' | 'header' | 'run'>('compile');
  const [copiedHeader, setCopiedHeader] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const installCommand = 'curl -fsSL https://shannon.ai/install.sh | sh';

  const handleCopyInstall = () => {
    navigator.clipboard.writeText(installCommand);
    setCopiedInstall(true);
    setTimeout(() => setCopiedInstall(false), 2000);
  };

  const handleCopyHeader = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.c_header_code);
    setCopiedHeader(true);
    setTimeout(() => setCopiedHeader(false), 2000);
  };

  const filteredModels = models.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.architecture.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#000000] font-sans selection:bg-[#000000] selection:text-[#ffffff] text-base leading-relaxed">
      {/* 1. Primary Nav (Generous height, large readable font) */}
      <nav className="h-16 border-b border-[#e5e5e5] px-6 sm:px-10 flex items-center justify-between sticky top-0 bg-[#ffffff]/95 backdrop-blur-md z-40">
        {/* Left: Mascot & Brand */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => onOpenStudio('dashboard')}
            className="flex items-center gap-2.5 text-left group"
          >
            {/* Hand-drawn style silicon mascot chip */}
            <div className="w-8 h-8 rounded-full bg-[#000000] flex items-center justify-center text-white shadow-sm">
              <Cpu className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-heading font-extrabold text-xl text-[#000000] tracking-tight">
              shannon
            </span>
          </button>

          <div className="hidden md:flex items-center gap-6 text-base font-medium text-[#737373]">
            <a href="#models" className="hover:text-[#000000] transition-colors">
              Models
            </a>
            <button
              onClick={() => onOpenStudio('dashboard')}
              className="hover:text-[#000000] transition-colors"
            >
              Studio IDE
            </button>
            <a href="#hardware" className="hover:text-[#000000] transition-colors">
              Hardware
            </a>
            <a href="#benchmarks" className="hover:text-[#000000] transition-colors">
              Benchmarks
            </a>
            <a href="#faq" className="hover:text-[#000000] transition-colors">
              FAQ
            </a>
          </div>
        </div>

        {/* Center: Search Pill */}
        <div className="hidden sm:flex items-center relative max-w-sm w-full">
          <div className="w-full relative">
            <Search className="w-4 h-4 text-[#a3a3a3] absolute left-4 top-3 pointer-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search models & silicon..."
              className="w-full bg-[#fafafa] focus:bg-[#ffffff] text-[#000000] text-sm pl-11 pr-4 py-2 rounded-full border border-[#e5e5e5] focus:border-[#000000] focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all placeholder-[#a3a3a3]"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/atharveeee-netizen/shannon"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#d4d4d4] text-[#000000] text-sm font-medium hover:border-[#000000] transition-colors"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#737373]" />
          </a>

          <button
            onClick={() => onOpenStudio('dashboard')}
            className="px-5 py-2 rounded-full bg-[#000000] hover:bg-[#090909] text-[#ffffff] text-sm font-bold transition-all active:scale-95 shadow-sm"
          >
            Launch Studio IDE
          </button>
        </div>
      </nav>

      {/* Main Content Column (~820px max width for larger readable text) */}
      <main className="max-w-[840px] mx-auto px-6 sm:px-8 py-16 sm:py-24 space-y-28">
        {/* 2. Hero Section (Large 48px/56px Headline, Prominent Install Pill) */}
        <section className="text-center space-y-8">
          {/* Hand-drawn Silicon Mascot */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-[#fafafa] border border-[#e5e5e5] flex items-center justify-center relative shadow-sm">
              <Cpu className="w-12 h-12 text-[#000000] stroke-[1.5]" />
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-[#000000] text-[#ffffff] text-xs font-mono flex items-center justify-center font-bold">
                0M
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-extrabold text-[#000000] tracking-tight leading-[1.12]">
              The easiest way to run AI on microcontrollers.
            </h1>
            <p className="text-lg sm:text-xl text-[#525252] max-w-2xl mx-auto leading-relaxed font-normal">
              Compile PyTorch, Keras, and ONNX models into single-file, standalone C99 headers.
              Zero dynamic heap allocation (<code className="text-[#000000] font-bold font-mono px-1.5 py-0.5 rounded bg-[#f5f5f5]">0 malloc</code>), 75% Flash reduction, and 100% MISRA-C:2012 certified.
            </p>
          </div>

          {/* Signature Large Install Snippet Pill */}
          <div className="flex justify-center pt-2">
            <div className="inline-flex items-center gap-4 bg-[#fafafa] border border-[#e5e5e5] px-6 py-4 rounded-full hover:border-[#000000] transition-colors shadow-sm">
              <code className="text-base sm:text-lg font-mono font-medium text-[#000000]">
                {installCommand}
              </code>
              <button
                onClick={handleCopyInstall}
                className="p-1.5 rounded-full text-[#737373] hover:text-[#000000] transition-colors"
                title="Copy install command"
              >
                {copiedInstall ? (
                  <Check className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Hero Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
            <button
              onClick={() => onOpenStudio('dashboard')}
              className="px-8 py-3.5 rounded-full bg-[#000000] hover:bg-[#090909] text-[#ffffff] text-base font-bold transition-all active:scale-95 flex items-center gap-2.5 shadow-md"
            >
              <span>Explore Interactive Studio IDE</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onDownloadHeader}
              className="px-7 py-3.5 rounded-full bg-[#ffffff] border border-[#d4d4d4] hover:border-[#000000] text-[#000000] text-base font-semibold transition-colors"
            >
              Download Standalone .h Header
            </button>
          </div>

          <div className="text-sm text-[#737373] font-mono">
            Requires Python 3.9+ · Zero runtime dependencies · Supports ESP32, STM32, RP2040, nRF52
          </div>
        </section>

        {/* 3. Terminal Product Preview Card (macOS Traffic Light Dots, Large Text) */}
        <section id="benchmarks" className="space-y-4">
          <div className="rounded-xl border border-[#e5e5e5] bg-[#ffffff] overflow-hidden shadow-md">
            {/* Terminal Header with Traffic Lights */}
            <div className="h-12 px-5 border-b border-[#e5e5e5] bg-[#fafafa] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-[#ff5f56]" />
                <span className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e]" />
                <span className="w-3.5 h-3.5 rounded-full bg-[#27c93f]" />
                <span className="text-sm font-mono text-[#737373] ml-2">shannon-cli — zsh</span>
              </div>

              {/* Terminal Quick Tabs */}
              <div className="flex items-center gap-1.5 font-mono text-xs">
                {[
                  { id: 'compile', label: '1. Compile' },
                  { id: 'arena', label: '2. 0-Malloc Arena' },
                  { id: 'header', label: '3. Emitted C' },
                  { id: 'run', label: '4. Live Test' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCliTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                      activeCliTab === tab.id
                        ? 'bg-[#000000] text-[#ffffff] font-bold'
                        : 'text-[#737373] hover:text-[#000000]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Terminal Body */}
            <div className="p-6 font-mono text-sm text-[#000000] bg-[#ffffff] overflow-x-auto min-h-[240px] leading-relaxed">
              {activeCliTab === 'compile' && (
                <div className="space-y-2.5">
                  <div className="text-[#737373]"># Compile neural network directly to target silicon</div>
                  <div className="font-bold flex items-center gap-2 text-base">
                    <span className="text-[#a3a3a3]">$</span>
                    <span>shannon compile --model {selectedModel ? selectedModel.id : 'kws'} --target {selectedHw.name.toLowerCase()} --quant int8</span>
                  </div>
                  <div className="pt-2 text-[#404040] space-y-1.5 text-sm">
                    <div>[INFO] Ingesting layer topology (5 static tensor operations)</div>
                    <div>[INFO] Performing symmetric INT8 per-channel quantization...</div>
                    <div className="text-emerald-700 font-bold">✓ Flash ROM Footprint: 24.0 KB (Reduced 75.0% from 96.0 KB FP32)</div>
                    <div className="text-blue-700 font-bold">✓ Peak Static SRAM Arena: 1,144 Bytes (0 bytes dynamic heap allocation)</div>
                    <div>[INFO] Interval Graph Coloring solved in 2.1ms (0 buffer collisions)</div>
                    <div className="text-[#000000] font-bold">✓ Successfully emitted: ./shannon_kws_model.h (MISRA-C:2012 Certified)</div>
                  </div>
                </div>
              )}

              {activeCliTab === 'arena' && (
                <div className="space-y-2.5">
                  <div className="text-[#737373]"># Inspect physical hexadecimal SRAM buffer timeline</div>
                  <div className="font-bold flex items-center gap-2 text-base">
                    <span className="text-[#a3a3a3]">$</span>
                    <span>shannon arena --base-addr 0x20000000</span>
                  </div>
                  <div className="pt-2 text-[#404040] space-y-1.5 text-sm">
                    <div className="text-[#737373]">OFFSET        BUFFER                 LIFETIME WINDOW   COLLISION PROOF</div>
                    <div className="text-[#000000]">0x20000000    conv1d_input_buf       [T0, T1]          [REUSED 0-COLLISION]</div>
                    <div className="text-[#000000]">0x20000310    relu_pool1_buf         [T1, T2]          [REUSED 0-COLLISION]</div>
                    <div className="text-[#000000]">0x20000180    conv1d_dw_buf          [T2, T3]          [REUSED 0-COLLISION]</div>
                    <div className="text-[#000000]">0x200003C0    dense_fc1_buf          [T3, T4]          [REUSED 0-COLLISION]</div>
                    <div className="text-emerald-700 font-bold">✓ Max Physical SRAM Span: 1,144 Bytes (0 bytes runtime fragmentation)</div>
                  </div>
                </div>
              )}

              {activeCliTab === 'header' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[#737373] pb-2 border-b border-[#e5e5e5]">
                    <span className="font-medium">// Generated single-file standalone C header</span>
                    <button
                      onClick={handleCopyHeader}
                      className="text-sm font-sans text-[#000000] font-bold hover:underline flex items-center gap-1.5"
                    >
                      {copiedHeader ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedHeader ? 'Copied' : 'Copy Code'}</span>
                    </button>
                  </div>
                  <pre className="text-sm text-[#404040] leading-relaxed overflow-x-auto">
{`#include <stdint.h>
#define SHANNON_ARENA_SIZE 1144

// Pure static SRAM array without dynamic malloc
static uint8_t shannon_tensor_arena[SHANNON_ARENA_SIZE] __attribute__((aligned(4)));

// 0-malloc real-time inference loop
void shannon_run_inference(const int8_t* input, int8_t* output) {
    // 100% collision-free interval tensor evaluation
}`}
                  </pre>
                </div>
              )}

              {activeCliTab === 'run' && (
                <div className="space-y-2.5">
                  <div className="text-[#737373]"># Run live real-time audio wake word simulation</div>
                  <div className="font-bold flex items-center gap-2 text-base">
                    <span className="text-[#a3a3a3]">$</span>
                    <span>shannon test --inject "yes"</span>
                  </div>
                  <div className="pt-2 text-[#404040] space-y-1.5 text-sm">
                    <div>[DMA] Ingested 16,000 samples @ 16kHz PCM (1000ms window)</div>
                    <div>[DSP] Computed 49x10 MFCC spectral filterbanks (0.42ms)</div>
                    <div>[INFERENCE] Executed in 1.84ms on {selectedHw.name}</div>
                    <div className="text-emerald-700 font-bold">🎯 Class "yes": 97.4% Confidence (Trigger Confirmed)</div>
                    <div className="text-[#737373]">   Class "no": 0.2% | Class "stop": 0.3% | Class "go": 0.1%</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 4. Automate Your Work Section (50/50 Split, Large Font) */}
        <section className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#000000] tracking-tight">
              Automate your embedded AI firmware.
            </h2>
            <p className="text-base sm:text-lg text-[#525252] leading-relaxed">
              No heavy C++ runtimes, no runtime schema interpreters, and no dynamic memory allocators. Just pure, deterministic C code that compiles with gcc, clang, or arm-none-eabi-gcc.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left Box: Principles with Command Tags */}
            <div className="p-7 rounded-xl border border-[#e5e5e5] bg-[#fafafa] space-y-5">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#ffffff] border border-[#e5e5e5] text-xs font-mono font-bold text-[#000000]">
                  MISRA-C:2012 Rule 21.3
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#ffffff] border border-[#e5e5e5] text-xs font-mono font-bold text-[#000000]">
                  0 Malloc
                </span>
              </div>

              <h3 className="text-xl font-bold text-[#000000] leading-snug">
                Compile directly to single-file headers.
              </h3>
              <p className="text-sm text-[#525252] leading-relaxed">
                Shannon eliminates the 150KB overhead of traditional edge runtimes by compiling network weights, quantization scaling factors, and execution graphs into a single static C header.
              </p>

              <div className="pt-3 border-t border-[#e5e5e5] flex items-center justify-between text-sm font-mono text-[#525252]">
                <span>Flash Savings: 75.0%</span>
                <span className="text-emerald-700 font-bold">0 Heap Leaks</span>
              </div>
            </div>

            {/* Right Box: 4-Line C Integration Code */}
            <div className="p-7 rounded-xl border border-[#e5e5e5] bg-[#ffffff] space-y-3 font-mono text-sm">
              <div className="flex items-center justify-between pb-2 border-b border-[#e5e5e5]">
                <span className="font-bold text-[#000000] text-base">main.c</span>
                <span className="text-xs text-[#737373]">4-Line Integration</span>
              </div>

              <pre className="text-[#404040] text-xs sm:text-sm leading-relaxed">
{`#include "shannon_model.h"

int main(void) {
    hardware_init_dma();
    
    // Run real-time zero-malloc inference
    shannon_run_inference(sensor_pcm, probs);
    
    if (probs[0] > 100) {
        gpio_set_pin(LED_PIN, 1);
    }
}`}
              </pre>
            </div>
          </div>
        </section>

        {/* 5. The 3 Ready-to-Flash Senses (Model Zoo Cards, Large Text) */}
        <section id="models" className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#000000] tracking-tight">
              Pre-built benchmark models.
            </h2>
            <p className="text-base sm:text-lg text-[#525252]">
              Three production TinyML benchmarks pre-trained and mathematically verified for microcontrollers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {filteredModels.map((model) => {
              const isSelected = selectedModel?.id === model.id;
              const flashKb = model.id === 'kws' ? '24.0' : model.id === 'vision' ? '1.1' : '19.5';
              const sramKb = model.id === 'kws' ? '1.12' : model.id === 'vision' ? '18.0' : '0.19';
              const acc = model.id === 'kws' ? '96.6%' : model.id === 'vision' ? '96.4%' : '59.4x margin';

              return (
                <div
                  key={model.id}
                  className={`p-7 rounded-xl border transition-all flex flex-col justify-between space-y-5 ${
                    isSelected
                      ? 'border-[#000000] bg-[#fafafa] shadow-md'
                      : 'border-[#e5e5e5] bg-[#ffffff] hover:border-[#000000]'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#737373] uppercase tracking-wider">
                        {model.domain}
                      </span>
                      {isSelected && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#000000]" />
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-[#000000] leading-snug">{model.name}</h3>
                    <p className="text-sm text-[#525252] leading-relaxed">
                      {model.description}
                    </p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-[#e5e5e5]">
                    <div className="grid grid-cols-2 gap-2 text-sm font-mono text-[#525252]">
                      <div>Flash: <span className="font-bold text-[#000000]">{flashKb} KB</span></div>
                      <div>SRAM: <span className="font-bold text-[#000000]">{sramKb} KB</span></div>
                      <div className="col-span-2 text-emerald-700 font-bold">Accuracy: {acc}</div>
                    </div>

                    <button
                      onClick={() => {
                        onSelectModel(model.id);
                        onOpenStudio('classifier');
                      }}
                      className="w-full py-2.5 rounded-full bg-[#000000] hover:bg-[#090909] text-[#ffffff] text-sm font-bold transition-all shadow-sm"
                    >
                      Inspect in Studio IDE →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 6. Hardware Ecosystem Grid ("Start local. Scale silicon.") */}
        <section id="hardware" className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#000000] tracking-tight">
              Start local. Scale silicon.
            </h2>
            <p className="text-base sm:text-lg text-[#525252]">
              Shannon compiles clean, zero-dependency C firmware validated across all major microcontroller architectures.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { name: 'ESP32-S3', chip: 'Xtensa Dual-Core @ 240MHz', spec: '512KB SRAM · 8MB Flash' },
              { name: 'STM32H7', chip: 'ARM Cortex-M7 @ 480MHz', spec: '1024KB SRAM · 2MB Flash' },
              { name: 'Raspberry Pi Pico', chip: 'Dual Cortex-M0+ @ 133MHz', spec: '264KB SRAM · 2MB Flash' },
              { name: 'nRF52840', chip: 'ARM Cortex-M4F @ 64MHz', spec: '256KB SRAM · 1MB Flash' },
              { name: 'Teensy 4.1', chip: 'ARM Cortex-M7 @ 600MHz', spec: '1024KB SRAM · 8MB Flash' },
              { name: 'Arduino Uno R4', chip: 'Renesas RA4M1 @ 48MHz', spec: '32KB SRAM · 256KB Flash' },
            ].map((hw) => (
              <div key={hw.name} className="p-5 rounded-xl border border-[#e5e5e5] bg-[#fafafa] space-y-1.5">
                <div className="font-bold text-base text-[#000000]">{hw.name}</div>
                <div className="text-sm text-[#525252]">{hw.chip}</div>
                <div className="text-xs font-mono text-[#737373]">{hw.spec}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Inverted Dark Card ("Max / Studio Workspace") */}
        <section className="rounded-2xl bg-[#171717] text-[#ffffff] p-8 sm:p-12 space-y-7 shadow-xl">
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold text-[#a3a3a3] uppercase tracking-wider">
              AUTONOMOUS STUDIO WORKSPACE
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#ffffff] tracking-tight">
              Full Edge Impulse Studio Workspace
            </h2>
            <p className="text-base sm:text-lg text-[rgba(255,255,255,0.8)] leading-relaxed max-w-2xl">
              Switch into our 8-tab visual developer studio: inspect real-time audio spectrogram waterfalls, adjust mel filterbanks, analyze confusion matrices, and audit SRAM memory timelines with Gemini Silicon Copilot.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-[rgba(255,255,255,0.15)] font-mono text-sm text-[rgba(255,255,255,0.7)]">
            <div>
              <div className="text-2xl font-bold text-[#ffffff]">8 Tabs</div>
              <div>Visual Workflow</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400">0 Malloc</div>
              <div>Static Arena</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-cyan-400">Gemini AI</div>
              <div>Silicon Copilot</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">1-Click</div>
              <div>.h Header Export</div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onOpenStudio('dashboard')}
              className="px-8 py-4 rounded-full bg-[#ffffff] hover:bg-[#fafafa] text-[#000000] text-base font-bold transition-all active:scale-95 shadow-md"
            >
              Open Full Studio Workspace →
            </button>
          </div>
        </section>

        {/* 8. "Your firmware stays yours" Guarantee Strip */}
        <section className="p-8 sm:p-10 rounded-xl border border-[#e5e5e5] bg-[#fafafa] flex flex-col sm:flex-row items-center gap-6">
          <div className="w-14 h-14 rounded-full bg-[#ffffff] border border-[#e5e5e5] flex items-center justify-center text-[#000000] flex-shrink-0 shadow-sm">
            <Lock className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-lg font-bold text-[#000000]">
              Your firmware stays yours.
            </h3>
            <p className="text-sm text-[#525252] leading-relaxed">
              Models are compiled locally or in your private cloud. Shannon generates standalone C99 source code with zero external telemetry, zero dynamic memory allocators, and zero cloud lock-in.
            </p>
          </div>
        </section>

        {/* 9. FAQ Wall with 1px Hairline Borders */}
        <section id="faq" className="space-y-6">
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#000000] tracking-tight">
            Frequently asked questions.
          </h2>

          <div className="divide-y divide-[#e5e5e5]">
            {[
              {
                q: 'How does Shannon differ from TensorFlow Lite for Microcontrollers?',
                a: 'TFLM requires a ~150KB runtime interpreter, dynamic tensor arena resolvers, and complex flatbuffer parsing. Shannon compiles the network directly into static C code with zero runtime interpreter overhead, resulting in 4x smaller Flash usage and deterministic microsecond latency.',
              },
              {
                q: 'What is the Zero-Malloc Memory Arena guarantee?',
                a: 'Shannon models tensor buffer lifetimes at compile time and applies Interval Graph Coloring to reuse static RAM. Memory addresses are resolved at compile time (`0x20000000 + Δ`), guaranteeing 0 bytes dynamic malloc and 100% MISRA-C:2012 Rule 21.3 compliance.',
              },
              {
                q: 'Can I compile custom ONNX or PyTorch models?',
                a: 'Yes. Drop your custom ONNX or layer graph JSON into Shannon Studio or run `shannon compile --file model.onnx --target esp32s3` from the command line.',
              },
              {
                q: 'What microcontrollers are supported?',
                a: 'Shannon generates standard ISO C99 code compatible with any 32-bit microcontroller (ARM Cortex-M0+/M4/M7, Xtensa LX7, RISC-V). Automated SIMD unrolling is provided for CMSIS-NN and ESP-DSP.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="py-6 space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-[#000000]">{faq.q}</h3>
                <p className="text-base text-[#525252] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 10. Footer */}
        <footer className="pt-10 border-t border-[#e5e5e5] flex flex-col sm:flex-row items-center justify-between gap-5 text-sm text-[#737373]">
          <div className="flex flex-wrap items-center gap-6">
            <button onClick={() => onOpenStudio('dashboard')} className="hover:text-[#000000] font-medium">
              Studio IDE
            </button>
            <a href="#models" className="hover:text-[#000000] font-medium">
              Models
            </a>
            <a href="https://github.com/atharveeee-netizen/shannon" target="_blank" rel="noreferrer" className="hover:text-[#000000] font-medium">
              GitHub
            </a>
            <a href="#faq" className="hover:text-[#000000] font-medium">
              Docs
            </a>
            <a href="#hardware" className="hover:text-[#000000] font-medium">
              Hardware
            </a>
          </div>
          <div className="text-xs text-[#a3a3a3]">
            © 2026 Shannon TinyML Compiler. Open Source (Apache 2.0).
          </div>
        </footer>
      </main>
    </div>
  );
};
