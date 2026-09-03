import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'accent' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
}) => {
  const variantStyles = {
    success: 'bg-success-subtle text-success border-success/30',
    warning: 'bg-warning-subtle text-warning border-warning/30',
    danger: 'bg-danger-subtle text-danger border-danger/30',
    accent: 'bg-accent/15 text-accent border-accent/30',
    neutral: 'bg-surface-raised text-text-secondary border-border',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] border text-[11px] font-mono font-medium leading-none select-none ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};