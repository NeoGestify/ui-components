import { type FC } from 'react';

interface LoadingProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars' | 'ring' | 'cube';
  size?: 'small' | 'medium' | 'large' | 'xl';
  color?: 'primary' | 'white' | 'gray' | 'success' | 'danger' | 'warning';
  label?: string;
  className?: string;
}

export const Loading: FC<LoadingProps> = ({
  variant = 'spinner',
  size = 'medium',
  color = 'primary',
  label,
  className = '',
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const colorClasses = {
    primary: 'text-indigo-600 dark:text-indigo-400',
    white: 'text-white',
    gray: 'text-gray-500 dark:text-gray-400',
    success: 'text-green-600 dark:text-green-400',
    danger: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
  };

  const renderIcon = () => {
    const commonClass = `${sizeClasses[size]} ${colorClasses[color]}`;

    switch (variant) {
      case 'dots':
        const dotSize = size === 'small' ? 'h-1 w-1' : size === 'medium' ? 'h-2 w-2' : size === 'large' ? 'h-3 w-3' : 'h-4 w-4';
        return (
          <div className={`flex space-x-1 ${colorClasses[color]}`}>
            <div className={`rounded-full bg-current animate-bounce ${dotSize}`} style={{ animationDelay: '0s' }}></div>
            <div className={`rounded-full bg-current animate-bounce ${dotSize}`} style={{ animationDelay: '0.15s' }}></div>
            <div className={`rounded-full bg-current animate-bounce ${dotSize}`} style={{ animationDelay: '0.3s' }}></div>
          </div>
        );
      
      case 'bars':
        return (
          <div className={`flex items-end space-x-1 ${sizeClasses[size]} ${colorClasses[color]}`}>
             <div className="w-1/4 bg-current animate-[pulse_1s_ease-in-out_infinite]" style={{ height: '60%', animationDelay: '0s' }}></div>
             <div className="w-1/4 bg-current animate-[pulse_1s_ease-in-out_infinite]" style={{ height: '100%', animationDelay: '0.2s' }}></div>
             <div className="w-1/4 bg-current animate-[pulse_1s_ease-in-out_infinite]" style={{ height: '60%', animationDelay: '0.4s' }}></div>
          </div>
        );

      case 'pulse':
        return (
          <span className={`relative flex ${commonClass}`}>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current"></span>
            <span className="relative inline-flex rounded-full h-full w-full bg-current"></span>
          </span>
        );

      case 'cube':
        return (
            <div className={`${commonClass} grid grid-cols-2 gap-1`}>
                <div className="bg-current animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay: '0s' }}></div>
                <div className="bg-current animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay: '0.5s' }}></div>
                <div className="bg-current animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay: '1.5s' }}></div>
                <div className="bg-current animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay: '1s' }}></div>
            </div>
        );

      case 'ring':
        return (
          <svg className={`${commonClass} animate-spin`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );

      case 'spinner':
      default:
        return (
          <svg className={`${commonClass} animate-spin`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        );
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center w-full h-full min-h-[inherit] ${className}`} role="status">
      {renderIcon()}
      {label && (
        <span className={`mt-3 text-sm font-medium ${colorClasses[color]}`}>
          {label}
        </span>
      )}
    </div>
  );
};
