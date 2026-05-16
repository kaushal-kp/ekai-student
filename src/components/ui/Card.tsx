import React from 'react';
import MuiCard from '@mui/material/Card';
import MuiCardContent from '@mui/material/CardContent';
import MuiCardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  elevation?: number;
  children?: React.ReactNode;
}

const paddingMap = { none: 0, sm: 1.5, md: 2, lg: 3 };

export function Card({ hover, padding = 'md', children, style, ...props }: CardProps) {
  const p = paddingMap[padding];
  return (
    <MuiCard
      elevation={2}
      sx={{
        borderRadius: '16px',
        p,
        cursor: hover ? 'pointer' : undefined,
        '&:hover': hover ? { boxShadow: 4 } : undefined,
      }}
      {...(props as any)}
    >
      {children}
    </MuiCard>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <Typography variant="subtitle1" fontWeight={600} component="h3" {...(props as any)}>
      {children}
    </Typography>
  );
}

export function CardContent({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props}>{children}</div>;
}
