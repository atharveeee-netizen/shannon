import React, { useRef, useEffect } from 'react';
import { HardwareProfile } from '../types';
import { Cpu, Activity } from 'lucide-react';

interface Silicon3DCanvasProps {
  targetHw: HardwareProfile;
  peakSramKb: number;
  flashKb: number;
}

export const Silicon3DCanvas: React.FC<Silicon3DCanvasProps> = ({
  targetHw,
  peakSramKb,
  flashKb,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const angleRef = useRef({ x: 0.5, y: 0.6 });
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let tick = 0;

    const render = () => {
      tick += 0.015;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const size = 110;

      const ax = angleRef.current.x + Math.sin(tick * 0.5) * 0.05;
      const ay = angleRef.current.y + tick * 0.3;

      const project = (x: number, y: number, z: number) => {
        const cosY = Math.cos(ay);
        const sinY = Math.sin(ay);
        const x1 = x * cosY + z * sinY;
        const z1 = -x * sinY + z * cosY;

        const cosX = Math.cos(ax);
        const sinX = Math.sin(ax);
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        const distance = 400;
        const scale = distance / (distance + z2);
        return {
          px: cx + x1 * scale,
          py: cy + y2 * scale,
          z: z2,
        };
      };

      const corners = [
        project(-size, -8, -size),
        project(size, -8, -size),
        project(size, -8, size),
        project(-size, -8, size),
      ];

      ctx.beginPath();
      ctx.moveTo(corners[0].px, corners[0].py);
      for (let i = 1; i < 4; i++) ctx.lineTo(corners[i].px, corners[i].py);
      ctx.closePath();
      ctx.fillStyle = 'rgba(26, 31, 40, 0.9)';
      ctx.fill();
      ctx.strokeStyle = '#232936';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const topCorners = [
        project(-size * 0.7, -24, -size * 0.7),
        project(size * 0.7, -24, -size * 0.7),
        project(size * 0.7, -24, size * 0.7),
        project(-size * 0.7, -24, size * 0.7),
      ];

      ctx.beginPath();
      ctx.moveTo(topCorners[0].px, topCorners[0].py);
      for (let i = 1; i < 4; i++) ctx.lineTo(topCorners[i].px, topCorners[i].py);
      ctx.closePath();
      ctx.fillStyle = 'rgba(11, 13, 17, 0.95)';
      ctx.fill();
      ctx.strokeStyle = '#106BA3';
      ctx.lineWidth = 2;
      ctx.stroke();

      const gridCount = 5;
      ctx.strokeStyle = 'rgba(43, 149, 214, 0.35)';
      ctx.lineWidth = 1;
      for (let i = 1; i < gridCount; i++) {
        const t = (i / gridCount) * 2 - 1;
        const p1 = project(-size * 0.7, -24, t * size * 0.7);
        const p2 = project(size * 0.7, -24, t * size * 0.7);
        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.stroke();

        const p3 = project(t * size * 0.7, -24, -size * 0.7);
        const p4 = project(t * size * 0.7, -24, size * 0.7);
        ctx.beginPath();
        ctx.moveTo(p3.px, p3.py);
        ctx.lineTo(p4.px, p4.py);
        ctx.stroke();
      }

      const coreP = project(0, -28, 0);
      const pulseSize = 18 + Math.sin(tick * 4) * 4;
      const grad = ctx.createRadialGradient(coreP.px, coreP.py, 2, coreP.px, coreP.py, pulseSize);
      grad.addColorStop(0, '#0D8050');
      grad.addColorStop(0.5, 'rgba(13, 128, 80, 0.4)');
      grad.addColorStop(1, 'rgba(13, 128, 80, 0)');

      ctx.beginPath();
      ctx.arc(coreP.px, coreP.py, pulseSize, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.fillStyle = '#F5F8FA';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(targetHw.name, coreP.px, coreP.py - 16);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      angleRef.current.y += dx * 0.01;
      angleRef.current.x += dy * 0.01;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [targetHw]);

  return (
    <div className="bg-[#1A1F28] border border-[#232936] rounded-[3px] p-4 flex flex-col justify-between relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#232936] pb-2 mb-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#2B95D6]" />
          <span className="text-xs font-mono font-semibold text-[#F5F8FA] uppercase">
            3D SILICON DIE PROJECTION
          </span>
        </div>
        <span className="text-[9px] font-mono text-[#5C7080] flex items-center gap-1">
          <Activity className="w-3 h-3 text-[#0D8050] animate-pulse" />
          INTERACTIVE
        </span>
      </div>

      <div className="relative h-44 flex items-center justify-center cursor-grab active:cursor-grabbing">
        <canvas
          ref={canvasRef}
          width={340}
          height={176}
          className="w-full h-full object-contain"
        />
        <span className="absolute bottom-1 text-[8px] font-mono text-[#5C7080] pointer-events-none">
          Click and drag to rotate silicon projection
        </span>
      </div>

      <div className="pt-2 border-t border-[#232936] grid grid-cols-2 gap-2 text-[10px] font-mono">
        <div className="bg-[#0B0D11] p-1.5 rounded-[2px] border border-[#232936]">
          <span className="text-[#5C7080] block text-[8px]">SRAM ARENA</span>
          <span className="text-[#0D8050] font-bold">{peakSramKb} KB</span>
        </div>
        <div className="bg-[#0B0D11] p-1.5 rounded-[2px] border border-[#232936]">
          <span className="text-[#5C7080] block text-[8px]">FLASH ROM</span>
          <span className="text-[#2B95D6] font-bold">{flashKb} KB</span>
        </div>
      </div>
    </div>
  );
};