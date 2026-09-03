import React from 'react';

interface PanelProps {
  title?: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const Panel: React.FC<PanelProps> = ({
  title,
  subtitle,
  icon: Icon,
  headerRight,
  children,
  className = '',
  noPadding = false,
}) => {
  return (
    <div className={`rounded-xl bg-surface border border-border overflow-hidden ${className}`}>
      {(title || headerRight) && (
        <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-surface-raised/50">
          <div className="flex items-center gap-2.5">
            {Icon && <Icon className="w-4 h-4 text-text-muted" />}
            <div>
              {title && <h3 className="text-sm font-semibold text-text-primary tracking-tight">{title}</h3>}
              {subtitle && <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {headerRight && <div className="flex items-center gap-2">{headerRight}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-4'}>{children}</div>
    </div>
  );
};
