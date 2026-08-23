import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const SkeletonBox: React.FC<SkeletonProps> = ({ className = 'h-4 w-full' }) => (
  <div className={`bg-palantir-border/40 animate-pulse rounded-[2px] ${className}`} />
);

export const BentoTableSkeleton: React.FC = () => (
  <div className="bg-palantir-card border border-palantir-border rounded-[3px] p-4 space-y-3 font-mono">
    <div className="flex items-center justify-between">
      <SkeletonBox className="h-4 w-48" />
      <SkeletonBox className="h-3 w-24" />
    </div>
    <div className="space-y-2 pt-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <SkeletonBox className="h-6 w-24" />
          <SkeletonBox className="h-6 w-20" />
          <SkeletonBox className="h-6 w-28" />
          <SkeletonBox className="h-6 w-16" />
          <SkeletonBox className="h-6 flex-1" />
        </div>
      ))}
    </div>
  </div>
);

export const MetricCardSkeleton: React.FC = () => (
  <div className="bg-palantir-card border border-palantir-border rounded-[3px] p-4 space-y-2 font-mono">
    <SkeletonBox className="h-3 w-32" />
    <SkeletonBox className="h-7 w-24" />
    <SkeletonBox className="h-2 w-full mt-2" />
  </div>
);