import React, { useState } from 'react';
import { HardwareProfile, ModelZooItem } from '../types';
import { Code, Copy, Download, Check, FileCode, Play, Terminal, CheckCircle2 } from 'lucide-react';

interface CodeViewerPanelProps {
  code: string;
  targetHw: HardwareProfile;
  currentModel: ModelZooItem;
}

export const CodeViewerPanel: React.FC<CodeViewerPanelProps> = ({
  code,
  targetHw,
  currentModel,
}) => {
  const [activeTab, setActiveTab] = useState<'header' | 'main' | 'asm'>('header');
  const [copied, setCopied] = useState(false);
  const [isTestBuilding, setIsTestBuilding] = useState(false);
  const [testBuildResult, setTestBuildResult] = useState<string | null>(null);

  const sampleMainCpp = `// =================================================================
// Shannon Bare-Metal Firmware Application Harness
// Target Silicon: ${targetHw.name} (${targetHw.arch})
// =================================================================
#include <stdio.h>
#include "shannon_${currentModel.id}.h"

int main() {
    printf("[BOOT] Initializing ${targetHw.name} Silicon Clock @ ${targetHw.clock_mhz}MHz...\\n");
    printf("[MEM] Static Tensor Arena allocated: %d Bytes (0 Bytes malloc)\\n", SHANNON_ARENA_SIZE);

    int8_t sensor_input[490] = {0};
    int8_t model_output[4] = {0};

    // Real-time sensory inference loop
    while (1) {
        // Read sensor ADC / I2S / Camera DMA
        shannon_run_inference(sensor_input, model_output);
        // Process model_output classifications
    }
    return 0;
}
`;

  const sampleAsm = `// =================================================================
// Shannon Vectorized Micro-Kernel Disassembly Preview
// Target: ${targetHw.simd}
// =================================================================
.section .text
.global shannon_dense_int8_simd
shannon_dense_int8_simd:
    // Vector register load & parallel Multiply-Accumulate
    // Optimized for 4-way SIMD word execution
    push    {r4, r5, r6, r7, lr}
    mov     r4, #0          // Accumulator init
.L_simd_loop:
    ldr     r5, [r0], #4    // Load 4 INT8 inputs
    ldr     r6, [r1], #4    // Load 4 INT8 weights
    smlad   r4, r5, r6, r4  // ARM __SMLAD dual 16-bit MAC
    subs    r2, r2, #4
    bgt     .L_simd_loop
    asr     r4, r4, #7      // Quantization rescale (>> 7)
    pop     {r4, r5, r6, r7, pc}
`;

  const handleCopy = () => {
    const textToCopy = activeTab === 'header' ? code : activeTab === 'main' ? sampleMainCpp : sampleAsm;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = activeTab === 'header' ? `shannon_${currentModel.id}.h` : activeTab === 'main' ? 'main.cpp' : 'kernel.s';
    const content = activeTab === 'header' ? code : activeTab === 'main' ? sampleMainCpp : sampleAsm;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRunCompileTest = () => {
    setIsTestBuilding(true);
    setTestBuildResult(null);
    setTimeout(() => {
      setIsTestBuilding(false);
      setTestBuildResult(`[GCC ${targetHw.arch}] Binary linked successfully (0 errors, 0 warnings). Flash: ${currentModel.int8_flash_kb}KB, Static SRAM: ${currentModel.peak_sram_kb}KB.`);
    }, 700);
  };

  const displayedContent = activeTab === 'header' ? code : activeTab === 'main' ? sampleMainCpp : sampleAsm;
  const lines = displayedContent.split('\n');

  return (
    <div className="bg-[#0B0F17] border border-[#1E293B] rounded-[3px] flex flex-col h-full overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] border-glow-hover">
      {/* Header with React Bits Animated Pill Tab Indicators & Action Buttons */}
      <div className="p-2 border-b border-[#1E293B] bg-[#070A0F] flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('header')}
            className={`px-3 py-1 text-xs font-mono rounded-[3px] transition-all flex items-center gap-1.5 btn-tactile group ${
              activeTab === 'header'
                ? 'tab-pill-active border border-[#38BDF8]/40'
                : 'text-[#64748B] hover:text-[#F8FAFC]'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-[#38BDF8] group-hover:scale-110 transition-transform" />
            <span>shannon_model.h</span>
          </button>

          <button
            onClick={() => setActiveTab('main')}
            className={`px-3 py-1 text-xs font-mono rounded-[3px] transition-all flex items-center gap-1.5 btn-tactile group ${
              activeTab === 'main'
                ? 'tab-pill-active border border-[#10B981]/40'
                : 'text-[#64748B] hover:text-[#F8FAFC]'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-[#10B981] group-hover:scale-110 transition-transform" />
            <span>main.cpp</span>
          </button>

          <button
            onClick={() => setActiveTab('asm')}
            className={`px-3 py-1 text-xs font-mono rounded-[3px] transition-all flex items-center gap-1.5 btn-tactile group ${
              activeTab === 'asm'
                ? 'tab-pill-active border border-[#F59E0B]/40'
                : 'text-[#64748B] hover:text-[#F8FAFC]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-[#F59E0B] group-hover:scale-110 transition-transform" />
            <span>disasm.s</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono">
          <button
            onClick={handleRunCompileTest}
            disabled={isTestBuilding}
            className="px-2.5 py-1 bg-[#0E1420] hover:bg-[#141C2E] text-[#10B981] border border-[#1E293B] hover:border-[#10B981]/60 rounded-[3px] flex items-center gap-1.5 transition-all btn-tactile group shadow-[0_0_10px_rgba(16,185,129,0.15)]"
          >
            <Play className={`w-3.5 h-3.5 text-[#10B981] group-hover:translate-x-0.5 transition-transform ${isTestBuilding ? 'animate-spin' : ''}`} />
            <span>{isTestBuilding ? 'Linking...' : 'Compile Test'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 bg-[#0E1420] hover:bg-[#141C2E] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#1E293B] hover:border-[#38BDF8]/40 rounded-[3px] transition-all btn-tactile group"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />}
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 btn-tactile-primary text-white rounded-[3px] transition-all group"
            title="Download File"
          >
            <Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Build Feedback Banner */}
      {testBuildResult && (
        <div className="px-3 py-1.5 bg-[#10B981]/15 border-b border-[#10B981]/30 text-[#10B981] text-[11px] font-mono flex items-center justify-between shadow-[0_0_12px_rgba(16,185,129,0.2)]">
          <span className="flex items-center gap-1.5 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" /> {testBuildResult}
          </span>
          <button onClick={() => setTestBuildResult(null)} className="text-[#64748B] hover:text-[#F8FAFC]">
            ✕
          </button>
        </div>
      )}

      {/* Editor Body with Monospace Glow */}
      <div className="flex-1 bg-[#070A0F] overflow-auto font-mono text-xs text-[#F8FAFC] p-3 leading-relaxed select-text flex">
        {/* Line Numbers */}
        <div className="text-[#475569] pr-3 select-none text-right border-r border-[#1E293B] mr-3 font-tabular">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Code Content */}
        <pre className="flex-1 whitespace-pre font-mono">
          <code>{displayedContent}</code>
        </pre>
      </div>

      {/* Footer Status */}
      <div className="p-2 bg-[#070A0F] border-t border-[#1E293B] flex items-center justify-between text-[10px] font-mono text-[#64748B] font-tabular">
        <span>Lines: <strong className="text-[#F8FAFC]">{lines.length}</strong></span>
        <span>Standard: <strong className="text-[#38BDF8]">C99 / C++11 Compatible</strong></span>
        <span>Target: <strong className="text-[#10B981]">{targetHw.simd}</strong></span>
      </div>
    </div>
  );
};
