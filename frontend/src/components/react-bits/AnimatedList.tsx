import React from 'react';

interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedList: React.FC<AnimatedListProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        return (
          <div
            key={child.key || index}
            className="transition-all duration-200 ease-out"
            style={{
              animationDelay: `${index * 40}ms`,
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
};
