import React from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

interface InputProps extends Omit<TextFieldProps, 'variant'> {
  label?: string;
  error?: boolean;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, fullWidth = true, ...props }, ref) => {
    return (
      <TextField
        inputRef={ref}
        label={label}
        error={error}
        helperText={helperText}
        fullWidth={fullWidth}
        variant="outlined"
        size="small"
        slotProps={{
          input: {
            startAdornment: leftIcon ? <InputAdornment position="start">{leftIcon}</InputAdornment> : undefined,
            endAdornment: rightIcon ? <InputAdornment position="end">{rightIcon}</InputAdornment> : undefined,
          }
        }}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
