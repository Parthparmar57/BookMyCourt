import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'hero';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] select-none';

    const variants = {
      primary: 'bg-primary text-white hover:bg-primary-hover active:bg-primary-active shadow-sm',
      secondary: 'bg-white text-foreground border border-border hover:bg-surface active:bg-surface-muted shadow-sm',
      ghost: 'bg-transparent text-primary hover:bg-primary/10 active:bg-primary/20',
      danger: 'bg-danger text-white hover:bg-danger/90 active:bg-danger/80 shadow-sm',
      outline: 'bg-transparent text-foreground border border-border-strong hover:bg-surface'
    };

    const sizes = {
      sm: 'h-9 px-3 text-xs gap-1.5',
      md: 'h-10 px-4 text-sm gap-2 min-h-[40px]', // Default 40px
      lg: 'h-12 px-6 text-base gap-2.5 min-h-[48px]', // Touch target 48px
      hero: 'h-14 px-8 text-lg gap-3 min-h-[56px] rounded-lg font-bold'
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
