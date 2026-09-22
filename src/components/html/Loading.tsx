import { type FC } from 'react';
import { QuarterSpinnerIcon, RingSpinnerIcon } from '../icons/icons';
import { text } from '../../theme/tokens';
import { cn } from '../../internal/cn';

type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';
type LoadingSizeAntiguo = 'small' | 'medium' | 'large';

const EQUIVALENCIAS: Record<LoadingSizeAntiguo, LoadingSize> = {
  small: 'sm', medium: 'md', large: 'lg',
};

/** `large` y `lg` son el mismo tamaño: esto traduce el nombre viejo al nuevo. */
export const normalizarTamanoDeCarga = (size: LoadingSize | LoadingSizeAntiguo): LoadingSize =>
  size in EQUIVALENCIAS ? EQUIVALENCIAS[size as LoadingSizeAntiguo] : size as LoadingSize;

export interface LoadingProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars' | 'ring' | 'cube';
  /**
   * `sm | md | lg | xl`, como el resto de la librería. Los nombres largos
   * —`small`, `medium`, `large`— son los que tenía antes y siguen valiendo:
   * son el mismo tamaño con otro nombre.
   */
  size?: LoadingSize | LoadingSizeAntiguo;
  color?: 'primary' | 'white' | 'gray' | 'success' | 'danger' | 'warning';
  label?: string;
  className?: string;
  /** Renders over the nearest positioned ancestor (parent needs position: relative) */
  overlay?: boolean;
  /** Renders as a fixed full-page overlay */
  fullPage?: boolean;
}

export const Loading: FC<LoadingProps> = ({
  variant = 'spinner',
  size: sizePedido = 'md',
  color = 'primary',
  label,
  className = '',
  overlay = false,
  fullPage = false,
}) => {
  const size = normalizarTamanoDeCarga(sizePedido);

  const sizeClasses: Record<LoadingSize, string> = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const colorClasses = {
    primary: text.accent,
    white:   'text-white',
    gray:    text.subtle,
    success: text.success,
    danger:  text.danger,
    warning: text.warning,
  };

  const renderIcon = () => {
    const commonClass = `${sizeClasses[size]} ${colorClasses[color]}`;

    switch (variant) {
      case 'dots': {
        const dotSize = size === 'sm' ? 'h-1 w-1' : size === 'md' ? 'h-2 w-2' : size === 'lg' ? 'h-3 w-3' : 'h-4 w-4';
        return (
          <div className={`flex space-x-1 ${colorClasses[color]}`}>
            <div className={`rounded-full bg-current animate-bounce ${dotSize}`} style={{ animationDelay: '0s' }} />
            <div className={`rounded-full bg-current animate-bounce ${dotSize}`} style={{ animationDelay: '0.15s' }} />
            <div className={`rounded-full bg-current animate-bounce ${dotSize}`} style={{ animationDelay: '0.3s' }} />
          </div>
        );
      }
      case 'bars':
        return (
          <div className={`flex items-end space-x-1 ${sizeClasses[size]} ${colorClasses[color]}`}>
            <div className="w-1/4 bg-current animate-[pulse_1s_ease-in-out_infinite]" style={{ height: '60%', animationDelay: '0s' }} />
            <div className="w-1/4 bg-current animate-[pulse_1s_ease-in-out_infinite]" style={{ height: '100%', animationDelay: '0.2s' }} />
            <div className="w-1/4 bg-current animate-[pulse_1s_ease-in-out_infinite]" style={{ height: '60%', animationDelay: '0.4s' }} />
          </div>
        );
      case 'pulse':
        return (
          <span className={`relative flex ${commonClass}`}>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current" />
            <span className="relative inline-flex rounded-full h-full w-full bg-current" />
          </span>
        );
      case 'cube':
        return (
          <div className={`${commonClass} grid grid-cols-2 gap-1`}>
            <div className="bg-current animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay: '0s' }} />
            <div className="bg-current animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay: '0.5s' }} />
            <div className="bg-current animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay: '1.5s' }} />
            <div className="bg-current animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay: '1s' }} />
          </div>
        );
      case 'ring':
        return (
          <RingSpinnerIcon className={`${commonClass} animate-spin`} />
        );
      case 'spinner':
      default:
        return (
          <QuarterSpinnerIcon className={`${commonClass} animate-spin`} />
        );
    }
  };

  const inner = (
    <div className={cn('flex flex-col items-center justify-center', className)} role="status">
      {renderIcon()}
      {label && (
        <span className={`mt-3 text-sm font-medium ${colorClasses[color]}`}>{label}</span>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color-mix(in_oklab,var(--nui-scrim,oklch(21%_.034_264.665))_50%,transparent)] backdrop-blur-[var(--nui-blur,8px)]">
        {inner}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-[color-mix(in_oklab,var(--nui-scrim,oklch(21%_.034_264.665))_40%,transparent)] backdrop-blur-[var(--nui-blur,8px)] rounded-[inherit]">
        {inner}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center justify-center w-full h-full min-h-[inherit]', className)} role="status">
      {renderIcon()}
      {label && (
        <span className={`mt-3 text-sm font-medium ${colorClasses[color]}`}>{label}</span>
      )}
    </div>
  );
};
