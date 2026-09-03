import React, { useRef, useEffect } from 'react';

interface CanvasWaveformProps {
  data: number[];
  height?: number;
  color?: string;
  fillColor?: string;
  showGrid?: boolean;
  zeroLine?: boolean;
  label?: string;
}

export const CanvasWaveform: React.FC<CanvasWaveformProps> = ({
  data,
  height = 140,
  color = '#10B981',
  fillColor = 'rgba(16, 185, 129, 0.12)',
  showGrid = true,
  zeroLine = true,
  label,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = height;

    ctx.clearRect(0, 0, w, h);

    // Background Grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      const numLines = 5;
      for (let i = 1; i < numLines; i++) {
        const y = (h / numLines) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      for (let i = 1; i < 8; i++) {
        const x = (w / 8) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
    }

    // Zero baseline
    if (zeroLine) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (!data || data.length === 0) return;

    // Find min and max for scaling
    let maxVal = 0.001;
    for (let i = 0; i < data.length; i++) {
      const abs = Math.abs(data[i]);
      if (abs > maxVal) maxVal = abs;
    }

    const step = w / Math.max(1, data.length - 1);
    const midY = h / 2;
    const scaleY = (h * 0.42) / maxVal;

    // Filled area
    ctx.beginPath();
    ctx.moveTo(0, midY);
    for (let i = 0; i < data.length; i++) {
      const x = i * step;
      const y = midY - data[i] * scaleY;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, midY);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();

    // Line curve
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const x = i * step;
      const y = midY - data[i] * scaleY;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = color;
    ctx.shadowBlur = 4;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }, [data, height, color, fillColor, showGrid, zeroLine]);

  return (
    <div className="relative w-full overflow-hidden rounded bg-black/40 border border-border">
      {label && (
        <div className="absolute top-2 left-3 text-[11px] font-mono text-text-muted select-none z-10">
          {label}
        </div>
      )}
      <canvas ref={canvasRef} style={{ width: '100%', height }} />
    </div>
  );
};

interface CanvasSpectrumProps {
  magnitudes: number[];
  height?: number;
  color?: string;
  label?: string;
}

export const CanvasSpectrum: React.FC<CanvasSpectrumProps> = ({
  magnitudes,
  height = 140,
  color = '#06B6D4',
  label,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = height;

    ctx.clearRect(0, 0, w, h);

    if (!magnitudes || magnitudes.length === 0) return;

    let maxVal = 0.001;
    for (let i = 0; i < magnitudes.length; i++) {
      if (magnitudes[i] > maxVal) maxVal = magnitudes[i];
    }

    const barWidth = Math.max(2, w / magnitudes.length - 1.5);
    const gap = (w - barWidth * magnitudes.length) / Math.max(1, magnitudes.length - 1);

    for (let i = 0; i < magnitudes.length; i++) {
      const normalized = Math.min(1, Math.max(0, magnitudes[i] / maxVal));
      const barH = normalized * (h - 20);
      const x = i * (barWidth + gap);
      const y = h - barH - 4;

      const grad = ctx.createLinearGradient(0, y, 0, h);
      grad.addColorStop(0, color);
      grad.addColorStop(1, 'rgba(6, 182, 212, 0.15)');

      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barWidth, barH);
    }
  }, [magnitudes, height, color]);

  return (
    <div className="relative w-full overflow-hidden rounded bg-black/40 border border-border">
      {label && (
        <div className="absolute top-2 left-3 text-[11px] font-mono text-text-muted select-none z-10">
          {label}
        </div>
      )}
      <canvas ref={canvasRef} style={{ width: '100%', height }} />
    </div>
  );
};

interface BarItem {
  label: string;
  value: number;
  maxValue?: number;
  formattedValue?: string;
  color?: string;
}

interface CanvasBarChartProps {
  items: BarItem[];
  height?: number;
  unit?: string;
}

export const CanvasBarChart: React.FC<CanvasBarChartProps> = ({ items, height = 180, unit = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = height;

    ctx.clearRect(0, 0, w, h);

    if (!items || items.length === 0) return;

    let max = 0.001;
    for (const it of items) {
      const val = it.maxValue ?? it.value;
      if (val > max) max = val;
    }

    const rowHeight = (h - 10) / items.length;
    const labelWidth = Math.min(110, w * 0.28);
    const valueWidth = 65;
    const barAreaWidth = w - labelWidth - valueWidth - 20;

    items.forEach((item, idx) => {
      const y = 8 + idx * rowHeight;
      const barY = y + 4;
      const barH = Math.max(6, rowHeight - 12);

      // Label
      ctx.fillStyle = '#94A3B8';
      ctx.font = '11px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.label, 8, y + rowHeight / 2 - 2);

      // Bar Background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.fillRect(labelWidth, barY, barAreaWidth, barH);

      // Bar Foreground
      const barW = Math.max(2, (item.value / max) * barAreaWidth);
      const barColor = item.color || '#10B981';
      ctx.fillStyle = barColor;
      ctx.fillRect(labelWidth, barY, barW, barH);

      // Value text
      ctx.fillStyle = '#E2E8F0';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const valText = item.formattedValue || `${item.value}${unit}`;
      ctx.fillText(valText, w - 8, y + rowHeight / 2 - 2);
    });
  }, [items, height, unit]);

  return (
    <div className="w-full overflow-hidden rounded bg-surface border border-border p-2">
      <canvas ref={canvasRef} style={{ width: '100%', height }} />
    </div>
  );
};

interface CanvasDonutGaugeProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  sublabel?: string;
  color?: string;
}

export const CanvasDonutGauge: React.FC<CanvasDonutGaugeProps> = ({
  percent,
  size = 110,
  strokeWidth = 9,
  label,
  sublabel,
  color,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const autoColor = color
    ? color
    : percent > 95
    ? '#F43F5E'
    : percent > 80
    ? '#F59E0B'
    : '#10B981';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const center = size / 2;
    const radius = center - strokeWidth;

    ctx.clearRect(0, 0, size, size);

    // Background track ring
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = strokeWidth;
    ctx.stroke();

    // Foreground filled arc
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (Math.min(100, Math.max(0, percent)) / 100) * (2 * Math.PI);

    ctx.beginPath();
    ctx.arc(center, center, radius, startAngle, endAngle);
    ctx.strokeStyle = autoColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
  }, [percent, size, strokeWidth, autoColor]);

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded bg-surface border border-border">
      <div className="relative" style={{ width: size, height: size }}>
        <canvas ref={canvasRef} style={{ width: size, height: size }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-base font-bold font-mono text-text-primary">{percent.toFixed(1)}%</span>
        </div>
      </div>
      <span className="text-xs font-bold text-text-primary mt-2 font-mono uppercase">{label}</span>
      {sublabel && <span className="text-[11px] text-text-secondary font-mono">{sublabel}</span>}
    </div>
  );
};

interface CanvasDualCurveProps {
  fp32: number[];
  int8: number[];
  height?: number;
  label?: string;
}

export const CanvasDualCurve: React.FC<CanvasDualCurveProps> = ({
  fp32,
  int8,
  height = 180,
  label = 'FP32 Baseline vs INT8 Quantized Step Reconstruction',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = height;

    ctx.clearRect(0, 0, w, h);

    if (!fp32 || fp32.length === 0) return;

    let maxVal = 0.001;
    for (let i = 0; i < fp32.length; i++) {
      const a = Math.abs(fp32[i]);
      const b = int8[i] !== undefined ? Math.abs(int8[i]) : 0;
      if (a > maxVal) maxVal = a;
      if (b > maxVal) maxVal = b;
    }

    const step = w / Math.max(1, fp32.length - 1);
    const midY = h / 2;
    const scaleY = (h * 0.4) / maxVal;

    // Zero axis
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(w, midY);
    ctx.stroke();
    ctx.setLineDash([]);

    // 1. INT8 Step curve (cyan stepped)
    ctx.strokeStyle = '#06B6D4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < int8.length; i++) {
      const x = i * step;
      const y = midY - int8[i] * scaleY;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, midY - int8[i - 1] * scaleY);
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // 2. FP32 Smooth curve (emerald)
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < fp32.length; i++) {
      const x = i * step;
      const y = midY - fp32[i] * scaleY;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [fp32, int8, height]);

  return (
    <div className="w-full rounded bg-black/40 border border-border p-3 space-y-2">
      <div className="flex items-center justify-between text-xs font-mono text-text-secondary">
        <span className="font-semibold text-text-primary">{label}</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-0.5 bg-emerald-400 inline-block" />
            <span>FP32 Smooth Baseline</span>
          </span>
          <span className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-2.5 h-0.5 bg-cyan-400 inline-block" />
            <span>INT8 Quantized Steps</span>
          </span>
        </div>
      </div>
      <canvas ref={canvasRef} style={{ width: '100%', height }} />
    </div>
  );
};
