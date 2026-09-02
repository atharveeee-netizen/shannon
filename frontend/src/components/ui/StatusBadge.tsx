import React from 'react';

interface StatusBadgeProps {
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped' | 'EMPTY' | 'READY' | 'COMPILING' | 'SUCCESS' | 'FAILED' | 'UNAVAILABLE';
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'sm' }) => {
  const norm = status.toLowerCase();

  let colorClasses = 'bg-surface-raised text-text-muted border-border';
  let dotColor = 'bg-text-muted';

  if (norm === 'success') {
    colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    dotColor = 'bg-emerald-400';
  } else if (norm === 'running' || norm === 'compiling') {
    colorClasses = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 animate-pulse';
    dotColor = 'bg-cyan-400';
  } else if (norm === 'failed') {
    colorClasses = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    dotColor = 'bg-rose-400';
  } else if (norm === 'ready') {
    colorClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    dotColor = 'bg-amber-400';
  }

  const text = label || status.toUpperCase();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border font-mono font-medium ${
        size === 'sm' ? 'text-[10px]' : 'text-xs px-2.5 py-1'
      } ${colorClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{text}</span>
    </span>
  );
};
