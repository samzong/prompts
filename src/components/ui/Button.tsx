import React from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  tooltip?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled,
  className,
  tooltip,
  ...props
}) => {
  const baseClasses = cn(
    'inline-flex items-center justify-center font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-background',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    {
      // Size variants
      'h-7 px-2 text-xs gap-1.5': size === 'sm',
      'h-9 px-3 text-sm gap-2': size === 'md', 
      'h-11 px-4 text-base gap-2.5': size === 'lg',
      
      // Style variants
      'bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 focus:ring-blue-500 shadow-sm': variant === 'primary',
      'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 focus:ring-gray-500': variant === 'secondary',
      'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-gray-500': variant === 'ghost',
      'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-gray-500': variant === 'outline',
      'bg-red-600 hover:bg-red-700 text-white border border-red-600 focus:ring-red-500 shadow-sm': variant === 'danger',
    },
    'rounded-md',
    className
  );

  const IconComponent = () => {
    if (loading) {
      return (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      );
    }
    return icon ? <span className="flex-shrink-0">{icon}</span> : null;
  };

  const button = (
    <button
      className={baseClasses}
      disabled={disabled || loading}
      {...props}
    >
      {iconPosition === 'left' && <IconComponent />}
      {children && <span className="truncate">{children}</span>}
      {iconPosition === 'right' && <IconComponent />}
    </button>
  );

  if (tooltip) {
    return (
      <div className="group relative">
        {button}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {tooltip}
        </div>
      </div>
    );
  }

  return button;
};

// Icon Button 组件 - 专门用于图标按钮
export const IconButton: React.FC<ButtonProps> = ({ 
  icon, 
  size = 'md', 
  variant = 'ghost',
  className,
  ...props 
}) => {
  const iconSizeClasses = cn({
    'w-7 h-7': size === 'sm',
    'w-9 h-9': size === 'md',
    'w-11 h-11': size === 'lg',
  });

  return (
    <Button
      variant={variant}
      size={size}
      icon={icon}
      className={cn(iconSizeClasses, 'p-0', className)}
      {...props}
    />
  );
};

// Button Group 组件
export interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({ children, className }) => {
  return (
    <div className={cn('flex', className)}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          const isFirst = index === 0;
          const isLast = index === React.Children.count(children) - 1;
          
          return React.cloneElement(child, {
            className: cn(
              child.props.className,
              {
                'rounded-r-none border-r-0': !isLast,
                'rounded-l-none': !isFirst,
              }
            ),
          });
        }
        return child;
      })}
    </div>
  );
}; 