// ========================================
// Button Components
// ========================================

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

export function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
}: ButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-yellow-900 hover:from-yellow-300 hover:to-yellow-500',
    secondary: 'bg-gradient-to-br from-gray-600 to-gray-700 text-white hover:from-gray-500 hover:to-gray-600',
    danger: 'bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-400 hover:to-red-500',
    success: 'bg-gradient-to-br from-green-500 to-green-600 text-white hover:from-green-400 hover:to-green-500',
    ghost: 'bg-white/10 text-white hover:bg-white/20 border border-white/20',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        rounded-lg
        font-bold
        uppercase
        tracking-wide
        shadow-lg
        transition-all
        disabled:opacity-50
        disabled:cursor-not-allowed
        disabled:transform-none
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
}

// Action button with icon
interface ActionButtonProps extends ButtonProps {
  icon?: ReactNode;
  badge?: string | number;
}

export function ActionButton({
  children,
  icon,
  badge,
  ...props
}: ActionButtonProps) {
  return (
    <Button {...props}>
      <span className="flex items-center justify-center gap-2">
        {icon}
        {children}
        {badge !== undefined && (
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
            {badge}
          </span>
        )}
      </span>
    </Button>
  );
}

// Betting button group
interface BetButtonProps {
  label: string;
  amount?: number;
  onClick: () => void;
  disabled?: boolean;
  variant?: ButtonProps['variant'];
}

export function BetButton({
  label,
  amount,
  onClick,
  disabled = false,
  variant = 'secondary',
}: BetButtonProps) {
  return (
    <Button
      variant={variant}
      onClick={onClick}
      disabled={disabled}
      size="md"
    >
      <div className="flex flex-col items-center">
        <span>{label}</span>
        {amount !== undefined && amount > 0 && (
          <span className="text-xs opacity-80">{amount}</span>
        )}
      </div>
    </Button>
  );
}
