import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-mono rounded-[3px] transition-colors focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-xs gap-1.5',
  };

  const variantStyles = {
    primary:
      'bg-text-primary text-canvas font-medium hover:opacity-90 border border-transparent shadow-xs',
    secondary:
      'bg-surface-raised hover:bg-surface-hover text-text-primary border border-border',
    ghost:
      'bg-transparent hover:bg-surface-hover text-text-secondary hover:text-text-primary',
  };

  return (
    <button
      className={`${base} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};