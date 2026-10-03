import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, hoverable, children, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white text-foreground rounded-lg border border-border p-5 shadow-[0_1px_2px_rgba(33,36,36,0.04)] transition-all duration-200',
        hoverable && 'hover:border-border-strong hover:shadow-[0_8px_24px_rgba(33,36,36,0.08)] hover:-translate-y-0.5 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
