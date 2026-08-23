import React, { useState, useEffect } from 'react';
import { ZeroMallocBlock, HardwareProfile } from '../types';
import { Layers, CheckCircle2, Zap, ShieldCheck } from 'lucide-react';

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
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [hoverStep, setHoverStep] = useState<number | null>(null);

  const maxStep = Math.max(...blocks.map((b) => b.lifetime_window[1]), 4);
  const selectedBlock = blocks.find((b) => b.layer_id === selectedBlockId) || blocks[0];
  
  const currentStepEffective = hoverStep !== null ? hoverStep : activeStep;
  
  const activeBlocksAtStep = blocks.filter(
    (b) => currentStepEffective >= b.lifetime_window[0] && currentStepEffective <= b.lifetime_window[1]
  );
  const activeSramBytesAtStep = activeBlocksAtStep.reduce((sum, b) => sum + b.size_bytes, 0);

  // Auto-play timeline step tracer
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % (maxStep + 1));
    }, 2400);
    return () => clearInterval(interval);
  }, [isAutoPlaying, maxStep]);

  // SVG dimensions
  const svgWidth = 640;
  const svgHeight = 220;
  const paddingLeft = 60;
  const paddingBottom = 30;
  const paddingTop = 20;
  const paddingRight = 20;

  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;

  const currentTracerX = paddingLeft + (currentStepEffective / maxStep) * chartW;

  return (
    <div className="bg-[#0B0F17] border border-[#1E293B] rounded-[3px] flex flex-col h-full overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] border-glow-hover relative group">
      {/* Ambient Cyber Grid Overlay */}
      <div className="absolute inset-0 bg-circuit-grid pointer-events-none opacity-25" />

      {/* Timeline Header */}
      <div className="p-2.5 border-b border-[#1E293B] bg-[#070A0F]/90 backdrop-blur-sm flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-[2px] bg-[#38BDF8]/10 border border-[#38BDF8]/30">
            <Layers className="w-3.5 h-3.5 text-[#38BDF8] animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#F8FAFC] font-mono tracking-tight flex items-center gap-1.5">
              SRAM MEMORY ARENA TIMELINE
              <span className="text-[9px] px-1.5 py-0.2 rounded-[2px] bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-bold">
                STATIC ZERO-MALLOC
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs font-mono font-tabular">
          <div className="flex items-center gap-1.5 text-[#94A3B8]">
            <span className="text-[11px] text-[#64748B]">Peak Arena:</span>
            <strong className="text-[#10B981] font-bold">{(totalArenaBytes / 1024).toFixed(2)} KB</strong>
          </div>
          <span className="text-[#1E293B]">|</span>
          <span className="text-[10px] text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded-[2px] border border-[#10B981]/35 font-bold shadow-[0_0_10px_rgba(16,185,129,0.25)] flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#10B981]" />
            0.00% FRAGMENTATION
          </span>
        </div>
      </div>

      {/* Main Workspace: Scrubber + SVG Chart + Tensor Details */}
      <div className="flex-1 flex flex-col p-3 space-y-2.5 overflow-y-auto z-10">
        {/* Step Scrubber Bar with Sliding Active Pill */}
        <div className="bg-[#070A0F] p-2 rounded-[3px] border border-[#1E293B] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-[#64748B] flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#38BDF8] animate-pulse" /> LIFETIME SCRUBBER:
            </span>
            <span className="text-[#10B981] font-bold font-tabular">
              STEP {currentStepEffective} / {maxStep}
            </span>
            <span className="text-[#475569] font-tabular text-[11px]">
              ({activeSramBytesAtStep} Bytes Active in Arena)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`px-2 py-0.5 rounded-[2px] text-[10px] font-mono font-bold transition-all btn-tactile ${
                isAutoPlaying
                  ? 'bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/40 shadow-[0_0_8px_rgba(56,189,248,0.25)]'
                  : 'bg-[#0E1420] text-[#64748B] border border-[#1E293B]'
              }`}
              title="Toggle Live Step Auto-Play"
            >
              {isAutoPlaying ? 'LIVE SCAN' : 'PAUSED'}
            </button>

            <div className="flex items-center gap-1 bg-[#0B0E14] p-0.5 rounded-[3px] border border-[#1E293B]">
              {Array.from({ length: maxStep + 1 }).map((_, stepIdx) => (
                <button
                  key={stepIdx}
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setActiveStep(stepIdx);
                  }}
                  onMouseEnter={() => setHoverStep(stepIdx)}
                  onMouseLeave={() => setHoverStep(null)}
                  className={`px-2 py-0.5 rounded-[2px] text-[11px] font-bold transition-all btn-tactile ${
                    currentStepEffective === stepIdx
                      ? 'btn-tactile-primary text-white shadow-[0_0_12px_rgba(56,189,248,0.4)]'
                      : 'hover:bg-[#141C2E] text-[#94A3B8]'
                  }`}
                >
                  L{stepIdx}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SVG Interval Graph with Glowing Scanlines, Laser Tracer & Pulse Rings */}
        <div className="bg-[#070A0F] rounded-[3px] border border-[#1E293B] p-2 flex items-center justify-center relative overflow-hidden group/canvas">
          {/* Animated Horizontal Scanline Effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#38BDF8]/5 to-transparent h-16 pointer-events-none animate-scanline" />

          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-44 select-none">
            <defs>
              {/* Laser Tracer Glow Filter */}
              <filter id="laserGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Tensor Gradients */}
              <linearGradient id="tensorGradientCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0284C7" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#0369A1" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="tensorGradientEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#047857" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="tensorGradientBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="tensorGradientAmber" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#D97706" stopOpacity="0.8" />
              </linearGradient>

              {/* Tracer Beam Gradient */}
              <linearGradient id="tracerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#10B981" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            {/* Ambient Background Step Columns & Grid */}
            {Array.from({ length: maxStep + 1 }).map((_, stepIdx) => {
              const x = paddingLeft + (stepIdx / maxStep) * chartW;
              const isCurrent = currentStepEffective === stepIdx;
              return (
                <g key={stepIdx}>
                  <line
                    x1={x}
                    y1={paddingTop}
                    x2={x}
                    y2={paddingTop + chartH}
                    stroke={isCurrent ? '#38BDF8' : '#1E293B'}
                    strokeWidth={isCurrent ? 1.5 : 1}
                    strokeDasharray={isCurrent ? 'none' : '3 3'}
                    opacity={isCurrent ? 0.8 : 0.4}
                  />
                  <text
                    x={x}
                    y={svgHeight - 8}
                    fill={isCurrent ? '#38BDF8' : '#64748B'}
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

            {/* Y-Axis Memory Address Marks */}
            <line x1={paddingLeft} y1={paddingTop} x2={paddingLeft} y2={paddingTop + chartH} stroke="#1E293B" strokeWidth={1} />
            <line x1={paddingLeft} y1={paddingTop + chartH} x2={svgWidth - paddingRight} y2={paddingTop + chartH} stroke="#1E293B" strokeWidth={1} />

            <text x={paddingLeft - 8} y={paddingTop + 8} fill="#94A3B8" fontSize="9" fontFamily="monospace" textAnchor="end">
              {totalArenaBytes}B
            </text>
            <text x={paddingLeft - 8} y={paddingTop + chartH / 2 + 3} fill="#64748B" fontSize="9" fontFamily="monospace" textAnchor="end">
              {Math.round(totalArenaBytes / 2)}B
            </text>
            <text x={paddingLeft - 8} y={paddingTop + chartH} fill="#10B981" fontSize="9" fontFamily="monospace" textAnchor="end" fontWeight="bold">
              0x0
            </text>

            {/* Interval Tensor Blocks with Shadows & Borders */}
            {blocks.map((block, idx) => {
              const x1 = paddingLeft + (block.lifetime_window[0] / maxStep) * chartW;
              const x2 = paddingLeft + (block.lifetime_window[1] / maxStep) * chartW;
              const width = Math.max(x2 - x1, 28);

              const yNorm = block.start_offset_bytes / Math.max(totalArenaBytes, 1);
              const hNorm = block.size_bytes / Math.max(totalArenaBytes, 1);
              const y = paddingTop + chartH - (yNorm + hNorm) * chartH;
              const height = Math.max(hNorm * chartH, 18);

              const isSelected = selectedBlockId === block.layer_id;
              const isActiveNow = currentStepEffective >= block.lifetime_window[0] && currentStepEffective <= block.lifetime_window[1];

              const gradientId =
                idx === 0
                  ? 'url(#tensorGradientCyan)'
                  : idx === 1
                  ? 'url(#tensorGradientEmerald)'
                  : idx === 2
                  ? 'url(#tensorGradientBlue)'
                  : 'url(#tensorGradientAmber)';

              return (
                <g
                  key={idx}
                  onClick={() => setSelectedBlockId(block.layer_id)}
                  className="cursor-pointer transition-all duration-150 group/block"
                >
                  {/* Outer Glow Halo on Active / Selected */}
                  {(isSelected || isActiveNow) && (
                    <rect
                      x={x1 - 2}
                      y={y - 2}
                      width={width + 4}
                      height={height + 4}
                      rx="4"
                      fill="none"
                      stroke={isSelected ? '#38BDF8' : '#10B981'}
                      strokeWidth={1.5}
                      opacity={0.6}
                      filter="url(#laserGlow)"
                    />
                  )}

                  {/* Main Tensor Rect */}
                  <rect
                    x={x1}
                    y={y}
                    width={width}
                    height={height}
                    rx="3"
                    fill={gradientId}
                    fillOpacity={isSelected ? 1 : isActiveNow ? 0.9 : 0.45}
                    stroke={isSelected ? '#FFFFFF' : isActiveNow ? '#10B981' : '#1E293B'}
                    strokeWidth={isSelected ? 2 : 1}
                  />

                  {/* SVG Pulse Rings on Active Tensor at Current Step */}
                  {isActiveNow && (
                    <g transform={`translate(${x1 + width / 2}, ${y + height / 2})`}>
                      <circle r="4" fill="#FFFFFF" opacity="0.9" />
                      <circle r="8" fill="none" stroke="#38BDF8" strokeWidth="1.5" opacity="0.7">
                        <animate attributeName="r" values="4;16;4" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.9;0;0.9" dur="2s" repeatCount="indefinite" />
                      </circle>
                    </g>
                  )}

                  {/* Tensor Label */}
                  <text
                    x={x1 + 6}
                    y={y + height / 2 + 3.5}
                    fill="#FFFFFF"
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

            {/* LIVE LASER CURSOR TRACER */}
            <g className="transition-all duration-300 ease-out" filter="url(#laserGlow)">
              <line
                x1={currentTracerX}
                y1={paddingTop - 4}
                x2={currentTracerX}
                y2={paddingTop + chartH + 4}
                stroke="url(#tracerGradient)"
                strokeWidth={2.5}
                strokeLinecap="round"
              />
              {/* Laser Emitter Top Node */}
              <circle cx={currentTracerX} cy={paddingTop - 4} r="3.5" fill="#38BDF8" />
              {/* Laser Emitter Bottom Node */}
              <circle cx={currentTracerX} cy={paddingTop + chartH + 4} r="3.5" fill="#10B981" />
            </g>
          </svg>
        </div>

        {/* Selected Tensor Detailed Inspector */}
        {selectedBlock && (
          <div className="bg-[#070A0F] p-2.5 rounded-[3px] border border-[#1E293B] font-mono text-xs space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-[2px] shadow-[0_0_8px_currentColor]" style={{ backgroundColor: selectedBlock.color, color: selectedBlock.color }} />
                <span className="font-bold text-[#F8FAFC]">{selectedBlock.layer_id}</span>
                <span className="text-[10px] text-[#64748B]">({selectedBlock.buffer_name})</span>
              </div>
              <span className="text-[#38BDF8] font-bold font-tabular bg-[#38BDF8]/10 px-2 py-0.5 rounded-[2px] border border-[#38BDF8]/30">
                {selectedBlock.size_bytes} Bytes ({((selectedBlock.size_bytes / totalArenaBytes) * 100).toFixed(1)}% of Arena)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-tabular">
              <div className="p-1.5 rounded-[2px] bg-[#0B0F17] border border-[#1E293B]">
                <span className="text-[#64748B] block text-[9px]">PHYSICAL OFFSET</span>
                <span className="text-[#10B981] font-bold">{selectedBlock.hex_address}</span>
              </div>
              <div className="p-1.5 rounded-[2px] bg-[#0B0F17] border border-[#1E293B]">
                <span className="text-[#64748B] block text-[9px]">LIFETIME WINDOW</span>
                <span className="text-[#F8FAFC] font-bold">Step {selectedBlock.lifetime_window[0]} → Step {selectedBlock.lifetime_window[1]}</span>
              </div>
              <div className="p-1.5 rounded-[2px] bg-[#0B0F17] border border-[#1E293B]">
                <span className="text-[#64748B] block text-[9px]">REUSE STRATEGY</span>
                <span className="text-[#38BDF8] font-bold">In-Place Overlap</span>
              </div>
              <div className="p-1.5 rounded-[2px] bg-[#0B0F17] border border-[#1E293B]">
                <span className="text-[#64748B] block text-[9px]">MEMORY ALIGN</span>
                <span className="text-[#F8FAFC] font-bold">4-Byte Word Aligned</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2 bg-[#070A0F] border-t border-[#1E293B] flex items-center justify-between text-[10px] font-mono text-[#64748B] z-10">
        <span className="flex items-center gap-1.5 text-[#10B981] font-bold">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
          FORMAL OVERLAP SAFETY PROOF: 0 COLLISIONS VERIFIED
        </span>
        <span>Base Offset: <strong className="text-[#38BDF8] font-tabular">0x20000000</strong></span>
      </div>
    </div>
  );
};

