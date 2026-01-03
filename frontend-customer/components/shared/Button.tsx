/**
 * Button Component
 * Reusable button with variants
 */

'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-lg transition-colors inline-flex items-center justify-center';

  const variantStyles = {
    primary: 'bg-orange-500 hover:bg-orange-600 text-white disabled:bg-gray-300',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 disabled:bg-gray-100',
    outline: 'border-2 border-orange-500 text-orange-500 hover:bg-orange-50 disabled:border-gray-300 disabled:text-gray-300',
    ghost: 'text-gray-700 hover:bg-gray-100 disabled:text-gray-300',
  };

  const sizeStyles = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2.5',
    lg: 'text-lg px-6 py-3',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
}

