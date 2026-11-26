import { createTheme } from '@mui/material/styles';

export const cabiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#F59E0B', // Brand Amber/Gold
      light: '#FBBF24',
      dark: '#D97706',
      contrastText: '#000000',
    },
    secondary: {
      main: '#D4AF37', // Executive Gold
      light: '#FDE047',
      dark: '#B45309',
      contrastText: '#000000',
    },
    background: {
      default: '#0a0a0a',
      paper: '#131722',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
      disabled: '#64748b',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
    action: {
      hover: 'rgba(255, 255, 255, 0.04)',
      selected: 'rgba(245, 158, 11, 0.15)',
      disabled: 'rgba(255, 255, 255, 0.3)',
      disabledBackground: 'rgba(255, 255, 255, 0.08)',
    },
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
      contrastText: '#000000',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
      contrastText: '#ffffff',
    },
    info: {
      main: '#38BDF8',
      light: '#7DD3FC',
      dark: '#0284C7',
      contrastText: '#ffffff',
    },
  },
  typography: {
    fontFamily: ['Inter', 'system-ui', '-apple-system', 'sans-serif'].join(','),
  },
  shape: {
    borderRadius: 3,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0a0a0a',
          color: '#f8fafc',
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundColor: '#131722',
          backgroundImage: 'none',
          borderColor: 'rgba(255, 255, 255, 0.08)',
          color: '#f8fafc',
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundColor: '#131722',
          backgroundImage: 'none',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 4,
          color: '#f8fafc',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          backgroundColor: '#131722',
          backgroundImage: 'none',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 3,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(255, 255, 255, 0.06)',
          color: '#cbd5e1',
          padding: '12px 16px',
        },
        head: {
          color: '#94a3b8',
          fontWeight: 700,
          fontSize: '0.75rem',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          borderColor: 'rgba(255, 255, 255, 0.08)',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.03) !important',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 3,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.8125rem',
          padding: '5px 14px',
          fontFamily: ['Inter', 'system-ui', '-apple-system', 'sans-serif'].join(','),
          boxShadow: 'none',
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #F59E0B 30%, #D4AF37 90%)',
          color: '#000000',
          fontWeight: 700,
          boxShadow: '0 4px 14px 0 rgba(245, 158, 11, 0.25)',
          '&:hover': {
            background: 'linear-gradient(45deg, #D97706 30%, #B45309 90%)',
            boxShadow: '0 6px 20px 0 rgba(245, 158, 11, 0.35)',
          },
        },
        outlinedPrimary: {
          borderColor: 'rgba(245, 158, 11, 0.4)',
          color: '#F59E0B',
          '&:hover': {
            borderColor: '#F59E0B',
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#F59E0B',
          height: 3,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: '#94a3b8',
          fontWeight: 600,
          textTransform: 'none',
          '&.Mui-selected': {
            color: '#F59E0B',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#131722',
          backgroundImage: 'none',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 4,
          color: '#f8fafc',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#131722',
          backgroundImage: 'none',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 3,
          color: '#f8fafc',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: '#cbd5e1',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            color: '#F59E0B',
            '&:hover': {
              backgroundColor: 'rgba(245, 158, 11, 0.18)',
            },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          borderRadius: 3,
          color: '#f8fafc',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.08)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.18)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#F59E0B',
          },
        },
        input: {
          '&::placeholder': {
            color: '#64748b',
            opacity: 1,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 3,
          fontWeight: 600,
        },
      },
    },
  },
});
