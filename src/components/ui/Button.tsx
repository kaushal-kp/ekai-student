import React from 'react';
import MuiButton, { ButtonProps as MuiButtonProps } from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'size'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';
  loading?: boolean;
  asChild?: boolean;
}

const variantMap: Record<string, { color: MuiButtonProps['color']; variant: MuiButtonProps['variant'] }> = {
  primary: { color: 'primary', variant: 'contained' },
  secondary: { color: 'inherit', variant: 'outlined' },
  outline: { color: 'primary', variant: 'outlined' },
  ghost: { color: 'inherit', variant: 'text' },
  danger: { color: 'error', variant: 'contained' },
  success: { color: 'success', variant: 'contained' },
  link: { color: 'primary', variant: 'text' },
};

const sizeMap: Record<string, MuiButtonProps['size']> = {
  sm: 'small',
  md: 'medium',
  lg: 'large',
  icon: 'medium',
  'icon-sm': 'small',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, disabled, onClick, type, sx, ...rest }, ref) => {
    const isIcon = size === 'icon' || size === 'icon-sm';
    const mapped = variantMap[variant] || variantMap.primary;
    const muiSize = sizeMap[size] || 'medium';

    if (isIcon) {
      return (
        <IconButton
          ref={ref}
          color={mapped.color as any}
          size={muiSize}
          disabled={disabled || loading}
          onClick={onClick}
          type={type}
          sx={sx}
        >
          {loading ? <CircularProgress size={16} color="inherit" /> : children}
        </IconButton>
      );
    }

    return (
      <MuiButton
        ref={ref}
        color={mapped.color}
        variant={mapped.variant}
        size={muiSize}
        disabled={disabled || loading}
        onClick={onClick}
        type={type}
        sx={sx}
        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
        {...(rest as any)}
      >
        {children}
      </MuiButton>
    );
  }
);

Button.displayName = 'Button';

export const buttonVariants = () => '';
