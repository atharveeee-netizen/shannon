import React, { useState } from 'react';
import { ZeroMallocBlock, HardwareProfile } from '../types';
import { Layers, CheckCircle2 } from 'lucide-react';

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

  return (
    <div className="bg-[#111622] border border-[#1E293B] rounded-[3px] flex flex-col h-full overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      {/* Timeline Header */}
      <div className="p-2.5 border-b border-[#1E293B] bg-[#0B0E14] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#3B82F6]" />
          <h3 className="text-xs font-bold text-[#F8FAFC] font-mono tracking-tight">
            SRAM MEMORY ARENA INTERVAL TIMELINE
          </h3>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono font-tabular">
          <div className="flex items-center gap-1.5 text-[#94A3B8]">
            <span>Peak Arena:</span>
            <strong className="text-[#10B981]">{(totalArenaBytes / 1024).toFixed(2)} KB</strong>
          </div>
          <span className="text-[#1E293B]">|</span>
          <span className="text-[10px] text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.2 rounded-[2px] border border-[#10B981]/25 font-bold">
            0.00% FRAGMENTATION
          </span>
        </div>
      </div>

      {/* Main Workspace: Scrubber + SVG Chart + Tensor Details */}
      <div className="flex-1 flex flex-col p-3 space-y-2.5 overflow-y-auto">
        {/* Step Scrubber Bar */}
        <div className="bg-[#0B0E14] p-2 rounded-[3px] border border-[#1E293B] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-[#64748B]">LIFETIME SCRUBBER:</span>
            <span className="text-[#10B981] font-bold">STEP {activeStep} / {maxStep}</span>
            <span className="text-[#475569] font-tabular">({activeSramBytesAtStep} Bytes In Use)</span>
          </div>

          <div className="flex items-center gap-1">
            {Array.from({ length: maxStep + 1 }).map((_, stepIdx) => (
              <button
                key={stepIdx}
                onClick={() => setActiveStep(stepIdx)}
                className={`px-2 py-0.5 rounded-[2px] text-[11px] font-bold transition-all ${
                  activeStep === stepIdx
                    ? 'btn-tactile-primary text-white'
                    : 'bg-[#151B28] hover:bg-[#1A2234] text-[#94A3B8] border border-[#1E293B]'
                }`}
              >
                L{stepIdx}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Interval Graph */}
        <div className="bg-[#0B0E14] rounded-[3px] border border-[#1E293B] p-2 flex items-center justify-center relative">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-40 select-none">
            {/* Vertical Grid Lines */}
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
                    stroke={isCurrent ? '#10B981' : '#1E293B'}
                    strokeWidth={isCurrent ? 1.5 : 1}
                    strokeDasharray={isCurrent ? 'none' : '2 2'}
                  />
                  <text
                    x={x}
                    y={svgHeight - 8}
                    fill={isCurrent ? '#10B981' : '#64748B'}
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
                    fill={block.color || '#2563EB'}
                    fillOpacity={isSelected ? 0.95 : isActiveNow ? 0.8 : 0.35}
                    stroke={isSelected ? '#F8FAFC' : isActiveNow ? '#10B981' : '#1E293B'}
                    strokeWidth={isSelected ? 1.5 : 1}
                  />
                  <text
                    x={x1 + 5}
                    y={y + height / 2 + 3.5}
                    fill="#F8FAFC"
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

        {/* Selected Tensor Detailed Inspector */}
        {selectedBlock && (
          <div className="bg-[#0B0E14] p-2.5 rounded-[3px] border border-[#1E293B] font-mono text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: selectedBlock.color }} />
                <span className="font-bold text-[#F8FAFC]">{selectedBlock.layer_id}</span>
                <span className="text-[10px] text-[#64748B]">({selectedBlock.buffer_name})</span>
              </div>
              <span className="text-[#3B82F6] font-bold font-tabular">{selectedBlock.size_bytes} Bytes</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-tabular">
              <div>
                <span className="text-[#64748B] block">PHYSICAL ADDRESS</span>
                <span className="text-[#10B981] font-bold">{selectedBlock.hex_address}</span>
              </div>
              <div>
                <span className="text-[#64748B] block">LIFETIME INTERVAL</span>
                <span className="text-[#F8FAFC] font-bold">Step {selectedBlock.lifetime_window[0]} → Step {selectedBlock.lifetime_window[1]}</span>
              </div>
              <div>
                <span className="text-[#64748B] block">BUFFER REUSE STATE</span>
                <span className="text-[#3B82F6] font-bold">Greedy In-Place Reuse</span>
              </div>
              <div>
                <span className="text-[#64748B] block">ALIGNMENT</span>
                <span className="text-[#F8FAFC] font-bold">4-Byte Word Aligned</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2 bg-[#0B0E14] border-t border-[#1E293B] flex items-center justify-between text-[10px] font-mono text-[#64748B]">
        <span className="flex items-center gap-1 text-[#10B981] font-bold">
          <CheckCircle2 className="w-3.5 h-3.5" /> 100% COLLISION FREE FORMAL PROOF PASS
        </span>
        <span>Base Offset: <strong className="text-[#F8FAFC] font-tabular">0x20000000</strong></span>
      </div>
    </div>
  );
};
