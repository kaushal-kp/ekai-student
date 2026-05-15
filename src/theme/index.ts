import { createTheme, alpha } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    subject: {
      math: string;
      science: string;
      english: string;
      hindi: string;
      sst: string;
      cs: string;
      pe: string;
    };
  }
  interface PaletteOptions {
    subject?: {
      math?: string;
      science?: string;
      english?: string;
      hindi?: string;
      sst?: string;
      cs?: string;
      pe?: string;
    };
  }
}

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6366F1',
      light: '#818CF8',
      dark: '#4338CA',
      contrastText: '#fff',
    },
    secondary: {
      main: '#F59E0B',
      light: '#FCD34D',
      dark: '#D97706',
    },
    success: { main: '#10B981', light: '#34D399', dark: '#059669' },
    error: { main: '#EF4444', light: '#F87171', dark: '#DC2626' },
    warning: { main: '#F59E0B', light: '#FCD34D', dark: '#D97706' },
    info: { main: '#3B82F6', light: '#60A5FA', dark: '#2563EB' },
    background: {
      default: '#EDEEF5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#475569',
      disabled: '#94A3B8',
    },
    divider: '#E2E8F0',
    subject: {
      math: '#3B82F6',
      science: '#10B981',
      english: '#8B5CF6',
      hindi: '#F59E0B',
      sst: '#EF4444',
      cs: '#6366F1',
      pe: '#F97316',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.2 },
    h2: { fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.3 },
    h3: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 },
    h4: { fontSize: '1.0625rem', fontWeight: 600, lineHeight: 1.4 },
    h5: { fontSize: '0.9375rem', fontWeight: 600, lineHeight: 1.5 },
    h6: { fontSize: '0.8125rem', fontWeight: 600, lineHeight: 1.5 },
    body1: { fontSize: '0.875rem', lineHeight: 1.6 },
    body2: { fontSize: '0.8125rem', lineHeight: 1.5 },
    caption: { fontSize: '0.75rem', lineHeight: 1.5 },
    overline: { fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' },
    button: { fontSize: '0.875rem', fontWeight: 600, textTransform: 'none' },
  },
  shape: { borderRadius: 12 },
  shadows: [
    'none',
    '0 1px 2px rgba(15,23,42,0.04)',
    '0 0 0 1px rgba(17,24,39,0.06), 0 2px 6px rgba(17,24,39,0.06)',
    '0 0 0 1px rgba(17,24,39,0.06), 0 4px 12px rgba(17,24,39,0.08)',
    '0 0 0 1px rgba(17,24,39,0.06), 0 8px 24px rgba(17,24,39,0.10)',
    '0 0 0 1px rgba(17,24,39,0.06), 0 12px 32px rgba(17,24,39,0.12)',
    '0 4px 16px rgba(17,24,39,0.10)', '0 6px 20px rgba(17,24,39,0.12)',
    '0 8px 24px rgba(17,24,39,0.12)', '0 10px 28px rgba(17,24,39,0.14)',
    '0 12px 32px rgba(17,24,39,0.14)', '0 14px 36px rgba(17,24,39,0.16)',
    '0 16px 40px rgba(17,24,39,0.16)', '0 18px 44px rgba(17,24,39,0.18)',
    '0 20px 48px rgba(17,24,39,0.18)', '0 22px 52px rgba(17,24,39,0.20)',
    '0 24px 56px rgba(17,24,39,0.20)', '0 26px 60px rgba(17,24,39,0.22)',
    '0 28px 64px rgba(17,24,39,0.22)', '0 30px 68px rgba(17,24,39,0.24)',
    '0 32px 72px rgba(17,24,39,0.24)', '0 34px 76px rgba(17,24,39,0.26)',
    '0 36px 80px rgba(17,24,39,0.26)', '0 38px 84px rgba(17,24,39,0.28)',
    '0 40px 88px rgba(17,24,39,0.30)',
  ] as any,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#EDEEF5',
          scrollbarWidth: 'thin',
          scrollbarColor: '#CBD5E1 transparent',
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { background: '#CBD5E1', borderRadius: 99 },
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 2 },
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        contained: {
          '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' },
          transition: 'all 0.15s ease',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600 },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 99, height: 8, backgroundColor: '#F1F5F9' },
        bar: { borderRadius: 99 },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '2px 8px',
          padding: '9px 12px',
          '&.Mui-selected': {
            backgroundColor: alpha('#6366F1', 0.12),
            color: '#6366F1',
            '&:hover': { backgroundColor: alpha('#6366F1', 0.16) },
          },
          '&:hover': { backgroundColor: alpha('#F8FAFC', 0.08) },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
          boxShadow: '1px 0 0 #E2E8F0',
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: '#F8FAFC',
            '&:hover fieldset': { borderColor: '#6366F1' },
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#0F172A',
          fontSize: '0.75rem',
          borderRadius: 8,
          padding: '6px 10px',
        },
        arrow: { color: '#0F172A' },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: '#E2E8F0' },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: { fontWeight: 700, fontSize: '0.875rem' },
      },
    },
  },
});

export default theme;
