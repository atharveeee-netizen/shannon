import React, { useRef, useEffect } from 'react';
import { HardwareProfile } from '../types';
import { Cpu, Activity, RotateCw } from 'lucide-react';

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
      const size = 105;

      const ax = angleRef.current.x + Math.sin(tick * 0.5) * 0.04;
      const ay = angleRef.current.y + tick * 0.25;

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

      // Base Silicon Substrate
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
      ctx.fillStyle = '#13171F';
      ctx.fill();
      ctx.strokeStyle = '#21262D';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Top Die Layer
      const topCorners = [
        project(-size * 0.72, -22, -size * 0.72),
        project(size * 0.72, -22, -size * 0.72),
        project(size * 0.72, -22, size * 0.72),
        project(-size * 0.72, -22, size * 0.72),
      ];

      ctx.beginPath();
      ctx.moveTo(topCorners[0].px, topCorners[0].py);
      for (let i = 1; i < 4; i++) ctx.lineTo(topCorners[i].px, topCorners[i].py);
      ctx.closePath();
      ctx.fillStyle = '#0A0D12';
      ctx.fill();
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Circuit Trace Grid
      const gridCount = 5;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1;
      for (let i = 1; i < gridCount; i++) {
        const t = (i / gridCount) * 2 - 1;
        const p1 = project(-size * 0.72, -22, t * size * 0.72);
        const p2 = project(size * 0.72, -22, t * size * 0.72);
        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.stroke();

        const p3 = project(t * size * 0.72, -22, -size * 0.72);
        const p4 = project(t * size * 0.72, -22, size * 0.72);
        ctx.beginPath();
        ctx.moveTo(p3.px, p3.py);
        ctx.lineTo(p4.px, p4.py);
        ctx.stroke();
      }

      // Silicon Core Activity Pulse
      const coreP = project(0, -26, 0);
      const pulseSize = 18 + Math.sin(tick * 4) * 4;
      const grad = ctx.createRadialGradient(coreP.px, coreP.py, 2, coreP.px, coreP.py, pulseSize);
      grad.addColorStop(0, '#00FFA3');
      grad.addColorStop(0.5, 'rgba(0, 255, 163, 0.35)');
      grad.addColorStop(1, 'rgba(0, 255, 163, 0)');

      ctx.beginPath();
      ctx.arc(coreP.px, coreP.py, pulseSize, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Core Text Label
      ctx.fillStyle = '#F0F6FC';
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
    <div className="bg-[#13171F] border border-[#21262D] rounded-[4px] p-4 flex flex-col justify-between relative overflow-hidden shadow-sm">
      <div className="flex items-center justify-between border-b border-[#21262D] pb-2 mb-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#38BDF8]" />
          <span className="text-xs font-mono font-bold text-[#F0F6FC] uppercase">
            3D SILICON DIE PROJECTION
          </span>
        </div>
        <span className="text-[9px] font-mono text-[#00FFA3] flex items-center gap-1">
          <Activity className="w-3 h-3 text-[#00FFA3] animate-pulse" />
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
        <span className="absolute bottom-1 text-[8px] font-mono text-[#484F58] pointer-events-none flex items-center gap-1">
          <RotateCw className="w-2.5 h-2.5" /> Drag to rotate silicon die
        </span>
      </div>

      <div className="pt-2 border-t border-[#21262D] grid grid-cols-2 gap-2 text-[10px] font-mono">
        <div className="bg-[#0A0D12] p-2 rounded-[3px] border border-[#21262D]">
          <span className="text-[#8B949E] block text-[8px] uppercase">SRAM ARENA</span>
          <span className="text-[#00FFA3] font-bold font-tabular">{peakSramKb} KB</span>
        </div>
        <div className="bg-[#0A0D12] p-2 rounded-[3px] border border-[#21262D]">
          <span className="text-[#8B949E] block text-[8px] uppercase">FLASH ROM</span>
          <span className="text-[#38BDF8] font-bold font-tabular">{flashKb} KB</span>
        </div>
      </div>
    </div>
  );
};