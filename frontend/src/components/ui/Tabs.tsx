import React from 'react';

export interface TabItem<T extends string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps<T extends string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (id: T) => void;
  className?: string;
}

export function Tabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  className = '',
}: TabsProps<T>) {
  return (
    <div
      className={`flex items-center gap-1 border-b border-border select-none ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`px-3 py-2.5 text-xs font-mono flex items-center gap-1.5 border-b-2 transition-colors ${
              isActive
                ? 'border-text-primary text-text-primary font-medium'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
            }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}