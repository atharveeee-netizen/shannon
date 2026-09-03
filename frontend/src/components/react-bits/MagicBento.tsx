import React from 'react';

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export const BentoGrid: React.FC<BentoGridProps> = ({ children, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 ${className}`}>
      {children}
    </div>
  );
};

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  colSpan?: string;
}

export const BentoCard: React.FC<BentoCardProps> = ({
  children,
  className = '',
  colSpan = '',
  ...props
}) => {
  return (
    <div
      className={`rounded-xl border border-border bg-surface hover:border-border-strong transition-all duration-200 p-4 relative overflow-hidden ${colSpan} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
