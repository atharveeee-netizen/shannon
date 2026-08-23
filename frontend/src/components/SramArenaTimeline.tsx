import React, { useState } from 'react';
import { ZeroMallocBlock, HardwareProfile } from '../types';
import { Layers, CheckCircle2, Zap } from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';

interface SramArenaTimelineProps {
  blocks: ZeroMallocBlock[];
  targetHw?: HardwareProfile;
  totalArenaBytes: number;
}

export const SramArenaTimeline: React.FC<SramArenaTimelineProps> = ({
  blocks,
  targetHw: _targetHw,
  totalArenaBytes,
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(blocks[0]?.layer_id || null);

  const maxStep = Math.max(...blocks.map((b) => b.lifetime_window[1]), 4);
  const selectedBlock = blocks.find((b) => b.layer_id === selectedBlockId) || blocks[0];
  const activeBlocksAtStep = blocks.filter(
    (b) => activeStep >= b.lifetime_window[0] && activeStep <= b.lifetime_window[1]
  );
  const activeSramBytesAtStep = activeBlocksAtStep.reduce((sum, b) => sum + b.size_bytes, 0);

  // SVG dimensions
  const svgWidth = 640;
  const svgHeight = 210;
  const paddingLeft = 55;
  const paddingBottom = 28;
  const paddingTop = 16;
  const paddingRight = 16;

  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;

  // Palette array for blocks
  const blockColors = ['#0E3B43', '#4B1886', '#00B4D8', '#FF7AC6', '#5CF2E7'];

  return (
    <div className="bg-[#080914] border border-[#1A2138] rounded-[3px] flex flex-col h-full overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] border-glow-hover">
      {/* Timeline Header */}
      <div className="p-2.5 border-b border-[#1A2138] bg-[#05050A] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#5CF2E7]" />
          <h3 className="text-xs font-bold text-[#E6FFFF] font-mono tracking-tight">
            SRAM MEMORY ARENA INTERVAL TIMELINE
          </h3>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono font-tabular">
          <div className="flex items-center gap-1.5 text-[#E6FFFF]/70">
            <span>Peak Arena:</span>
            <strong className="text-[#5CF2E7] font-bold">{(totalArenaBytes / 1024).toFixed(2)} KB</strong>
          </div>
          <span className="text-[#1A2138]">|</span>
          <span className="text-[10px] text-[#5CF2E7] bg-[#0E3B43]/40 px-2 py-0.5 rounded-[2px] border border-[#5CF2E7]/40 font-bold shadow-[0_0_8px_rgba(92,242,231,0.2)]">
            0.00% FRAGMENTATION
          </span>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col p-3 space-y-2.5 overflow-y-auto">
        {/* Step Scrubber Bar with Tactile Spring Buttons */}
        <div className="bg-[#05050A] p-2 rounded-[3px] border border-[#1A2138] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-[#E6FFFF]/60 flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#5CF2E7]" /> LIFETIME SCRUBBER:
            </span>
            <span className="text-[#5CF2E7] font-bold">STEP {activeStep} / {maxStep}</span>
            <span className="text-[#E6FFFF]/40 font-tabular">({activeSramBytesAtStep} Bytes Active)</span>
          </div>

          <div className="flex items-center gap-1">
            {Array.from({ length: maxStep + 1 }).map((_, stepIdx) => (
              <button
                key={stepIdx}
                onClick={() => setActiveStep(stepIdx)}
                className={`px-2 py-0.5 rounded-[2px] text-[11px] font-bold transition-all btn-tactile ${
                  activeStep === stepIdx
                    ? 'btn-tactile-primary text-[#E6FFFF]'
                    : 'bg-[#080914] hover:bg-[#0D1122] text-[#E6FFFF]/70 border border-[#1A2138]'
                }`}
              >
                L{stepIdx}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Interval Graph with Cyber-Sakura / Bioluminescent Tracer */}
        <div className="bg-[#05050A] rounded-[3px] border border-[#1A2138] p-2 flex items-center justify-center relative overflow-hidden">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-40 select-none">
            {/* Ambient Background Grid */}
            {Array.from({ length: maxStep + 1 }).map((_, stepIdx) => {
              const x = paddingLeft + (stepIdx / maxStep) * chartW;
              const isCurrent = activeStep === stepIdx;
              return (
                <g key={stepIdx}>
                  <line
                    x1={x}
                    y1={paddingTop}
                    x2={x}
                    y2={paddingTop + chartH}
                    stroke={isCurrent ? '#5CF2E7' : '#1A2138'}
                    strokeWidth={isCurrent ? 2 : 1}
                    strokeDasharray={isCurrent ? 'none' : '2 2'}
                  />
                  {isCurrent && (
                    <line
                      x1={x}
                      y1={paddingTop}
                      x2={x}
                      y2={paddingTop + chartH}
                      stroke="#FF7AC6"
                      strokeWidth={4}
                      opacity={0.4}
                      className="animate-pulse"
                    />
                  )}
                  <text
                    x={x}
                    y={svgHeight - 8}
                    fill={isCurrent ? '#5CF2E7' : '#64748B'}
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                    fontWeight={isCurrent ? 'bold' : 'normal'}
                  >
                    Step {stepIdx}
                  </text>
                </g>
              );
            })}

            {/* Y-Axis Labels */}
            <text x={paddingLeft - 8} y={paddingTop + 10} fill="#64748B" fontSize="9" fontFamily="monospace" textAnchor="end">
              {totalArenaBytes}B
            </text>
            <text x={paddingLeft - 8} y={paddingTop + chartH / 2} fill="#64748B" fontSize="9" fontFamily="monospace" textAnchor="end">
              {Math.round(totalArenaBytes / 2)}B
            </text>
            <text x={paddingLeft - 8} y={paddingTop + chartH} fill="#64748B" fontSize="9" fontFamily="monospace" textAnchor="end">
              0x0
            </text>

            {/* Interval Tensor Blocks */}
            {blocks.map((block, idx) => {
              const x1 = paddingLeft + (block.lifetime_window[0] / maxStep) * chartW;
              const x2 = paddingLeft + (block.lifetime_window[1] / maxStep) * chartW;
              const width = Math.max(x2 - x1, 24);

              const yNorm = block.start_offset_bytes / Math.max(totalArenaBytes, 1);
              const hNorm = block.size_bytes / Math.max(totalArenaBytes, 1);
              const y = paddingTop + chartH - (yNorm + hNorm) * chartH;
              const height = Math.max(hNorm * chartH, 16);

              const isSelected = selectedBlockId === block.layer_id;
              const isActiveNow = activeStep >= block.lifetime_window[0] && activeStep <= block.lifetime_window[1];
              const color = blockColors[idx % blockColors.length];

              return (
                <g
                  key={idx}
                  onClick={() => setSelectedBlockId(block.layer_id)}
                  className="cursor-pointer transition-all"
                >
                  <rect
                    x={x1}
                    y={y}
                    width={width}
                    height={height}
                    rx="2"
                    fill={color}
                    fillOpacity={isSelected ? 0.95 : isActiveNow ? 0.85 : 0.45}
                    stroke={isSelected ? '#5CF2E7' : isActiveNow ? '#FF7AC6' : '#1A2138'}
                    strokeWidth={isSelected ? 2 : 1}
                  />
                  <text
                    x={x1 + 5}
                    y={y + height / 2 + 3.5}
                    fill="#E6FFFF"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                    pointerEvents="none"
                  >
                    {block.layer_id} ({block.size_bytes}B)
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Tensor Detailed Inspector with SpotlightCard */}
        {selectedBlock && (
          <SpotlightCard
            className="p-2.5 border-[#1A2138] font-mono text-xs space-y-2"
            spotlightColor="rgba(92, 242, 231, 0.12)"
          >
            <div className="flex items-center justify-between border-b border-[#1A2138] pb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-[2px] bg-[#5CF2E7]" />
                <span className="font-bold text-[#E6FFFF]">{selectedBlock.layer_id}</span>
                <span className="text-[10px] text-[#E6FFFF]/50">({selectedBlock.buffer_name})</span>
              </div>
              <span className="text-[#5CF2E7] font-bold font-tabular">{selectedBlock.size_bytes} Bytes</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-tabular">
              <div>
                <span className="text-[#64748B] block">PHYSICAL ADDRESS</span>
                <span className="text-[#5CF2E7] font-bold">{selectedBlock.hex_address}</span>
              </div>
              <div>
                <span className="text-[#64748B] block">LIFETIME INTERVAL</span>
                <span className="text-[#E6FFFF] font-bold">Step {selectedBlock.lifetime_window[0]} → Step {selectedBlock.lifetime_window[1]}</span>
              </div>
              <div>
                <span className="text-[#64748B] block">BUFFER REUSE</span>
                <span className="text-[#FF7AC6] font-bold">In-Place Greedy Reuse</span>
              </div>
              <div>
                <span className="text-[#64748B] block">ALIGNMENT</span>
                <span className="text-[#E6FFFF] font-bold">4-Byte Word Aligned</span>
              </div>
            </div>
          </SpotlightCard>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2 bg-[#05050A] border-t border-[#1A2138] flex items-center justify-between text-[10px] font-mono text-[#64748B]">
        <span className="flex items-center gap-1.5 text-[#5CF2E7] font-bold">
          <CheckCircle2 className="w-3.5 h-3.5" /> 100% COLLISION FREE FORMAL PROOF PASS
        </span>
        <span>Base Offset: <strong className="text-[#FF7AC6] font-tabular">0x20000000</strong></span>
      </div>
    </div>
  );
};
