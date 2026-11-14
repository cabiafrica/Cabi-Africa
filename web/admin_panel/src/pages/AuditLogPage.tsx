import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TablePagination,
  TextField,
  Chip,
  Grid,
  TableSortLabel,
  Button,
  Collapse,
  IconButton,
  FormControl,
  DialogContentText,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ButtonBase,
  FormControlLabel,
  Switch,
  Fade,
  Stack,
  Tooltip as MuiTooltip,
} from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, solarizedlight, atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  ContentCopy as ContentCopyIcon,
  VolumeOff as VolumeOffIcon,
  VolumeUp as VolumeUpIcon,
  Settings as SettingsIcon,
  FileDownload as DownloadIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  LiveTv as LiveIcon,
} from '@mui/icons-material';
import { fetchAuditEvents, AuditEvent } from './api/auditService';

const GOLD_GRADIENT = 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)';
const GLASS_BG = 'rgba(15, 23, 42, 0.7)';
const CARD_BORDER = 'rgba(255, 215, 0, 0.1)';

const getActionChipColor = (action: string) => {
  switch (action) {
    case 'ACCOUNT_DELETED':
      return 'error';
    case '2FA_DISABLED':
      return 'warning';
    case '2FA_ENABLED':
    case 'PASSWORD_CHANGED':
      return 'info';
    case 'DRIVER_APPROVED':
    case 'VEHICLE_VERIFIED':
      return 'success';
    case 'TRIP_CANCELLED_BY_ADMIN':
    case 'USER_SUSPENDED':
      return 'error';
    case 'SETTINGS_UPDATED':
      return 'secondary';
    default:
      return 'default';
  }
};

const DetailItem = ({ label, value, onNotify }: { label: string; value: string; onNotify: (message: string, severity: 'success' | 'error') => void; }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      onNotify(`'${label}' copied to clipboard!`, 'success');
    }, (err) => {
      onNotify(`Failed to copy '${label}'.`, 'error');
      console.error('Could not copy text: ', err);
    });
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', my: 0.5, gap: 1 }}>
      <Typography variant="body1" sx={{ whiteSpace: 'nowrap' }}><strong>{label}:</strong></Typography>
      <Typography variant="body1" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</Typography>
      <IconButton onClick={handleCopy} size="small">
        <ContentCopyIcon fontSize="inherit" />
      </IconButton>
    </Box>
  );
};

interface DisplayAuditEvent extends AuditEvent {
  isNew?: boolean;
}

function Row(props: {
  event: DisplayAuditEvent;
  onNotify: (message: string, severity: 'success' | 'error') => void;
  theme: any;
}) {
  const { event, onNotify, theme } = props;
  const [open, setOpen] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [detailsSearch, setDetailsSearch] = useState('');

  const handleCopyRawJson = () => {
    const jsonString = JSON.stringify(event, null, 2);
    navigator.clipboard.writeText(jsonString).then(() => {
      onNotify('Raw JSON copied to clipboard!', 'success');
    }, (err) => {
      onNotify('Failed to copy JSON.', 'error');
      console.error('Could not copy text: ', err);
    });
  };

  return (
    <React.Fragment>
      <TableRow sx={{ 
        '& > *': { borderBottom: 'unset !important' }, 
        bgcolor: event.isNew ? 'rgba(255,215,0,0.1)' : 'transparent', 
        transition: 'background-color 1s ease-out',
        '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' }
      }}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => { setOpen(!open); if (open) { setShowRawJson(false); setDetailsSearch(''); } }} sx={{ color: '#FFD700' }}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{new Date(event.timestamp).toLocaleString()}</TableCell>
        <TableCell sx={{ color: 'white', fontWeight: 600 }}>{event.userFullName || event.userId}</TableCell>
        <TableCell>
          <Chip 
            label={event.action.replace(/_/g, ' ')} 
            sx={{ 
              bgcolor: 'rgba(255,215,0,0.1)', 
              color: '#FFD700', 
              fontWeight: 800, 
              fontSize: '0.7rem',
              border: '1px solid rgba(255,215,0,0.2)',
              borderRadius: '6px'
            }} 
            size="small" 
          />
        </TableCell>
        <TableCell>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.secondary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 250 }}>
            {event.details ? JSON.stringify(event.details) : '—'}
          </Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, p: 3, background: 'rgba(0,0,0,0.2)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFD700' }}>
                  {showRawJson ? 'Forensic JSON Trace' : 'Extended Event Payload'}
                </Typography>
                <Box>
                  {showRawJson && <Button size="small" startIcon={<ContentCopyIcon />} onClick={handleCopyRawJson} sx={{ color: '#FFD700' }}>Copy</Button>}
                  <Button size="small" onClick={() => { setShowRawJson(!showRawJson); setDetailsSearch(''); }} sx={{ color: 'text.secondary' }}>
                    {showRawJson ? 'View Formatted' : 'Inspect Raw JSON'}
                  </Button>
                </Box>
              </Box>
              {showRawJson ? (
                <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <SyntaxHighlighter language="json" style={theme} customStyle={{ borderRadius: '8px', margin: 0, padding: '20px', fontSize: '0.85rem' }}>
                    {JSON.stringify(event, null, 2)}
                  </SyntaxHighlighter>
                </Box>
              ) : (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.03)', px: 2, borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)', mb: 2 }}>
                    <TextField
                      size="small" variant="standard" placeholder="Search parameters..."
                      value={detailsSearch} onChange={(e) => setDetailsSearch(e.target.value)}
                      sx={{ width: '100%', py: 1 }}
                      InputProps={{ disableUnderline: true, sx: { color: 'white', fontSize: '0.85rem' } }}
                    />
                  </Box>
                  <Grid container spacing={1}>
                    {event.details ? (
                      Object.entries(event.details)
                        .filter(([key, value]) =>
                          key.toLowerCase().includes(detailsSearch.toLowerCase()) ||
                          String(value).toLowerCase().includes(detailsSearch.toLowerCase())
                        )
                        .map(([key, value]) => (
                          <Grid item xs={12} key={key}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.03)' }}>
                              <Typography sx={{ color: '#FFD700', fontWeight: 700, fontSize: '0.85rem' }}>{key}</Typography>
                              <Typography sx={{ color: 'white', fontSize: '0.85rem', wordBreak: 'break-all', textAlign: 'right', pl: 2 }}>{String(value)}</Typography>
                            </Box>
                          </Grid>
                        ))
                    ) : (
                      <Typography variant="body2" sx={{ color: 'text.secondary', p: 2 }}>No payload data available.</Typography>
                    )}
                  </Grid>
                </>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export const AuditLogPage = () => {
  const [events, setEvents] = useState<DisplayAuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(() => parseInt(localStorage.getItem('auditLog_rowsPerPage') || '10', 10));
  const [filterText, setFilterText] = useState(() => localStorage.getItem('auditLog_filterText') || '');
  const [startDate, setStartDate] = useState(() => localStorage.getItem('auditLog_startDate') || null);
  const [endDate, setEndDate] = useState(() => localStorage.getItem('auditLog_endDate') || null);
  const [order, setOrder] = useState<'asc' | 'desc'>(() => (localStorage.getItem('auditLog_order') as 'asc' | 'desc') || 'desc');
  const [orderBy, setOrderBy] = useState<keyof AuditEvent>(() => (localStorage.getItem('auditLog_orderBy') as keyof AuditEvent) || 'timestamp');
  const [quickFilter, setQuickFilter] = useState(() => localStorage.getItem('auditLog_quickFilter') || 'all');
  const [searchParams] = useSearchParams();
  const [isLive, setIsLive] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);
  const [lineVisibility, setLineVisibility] = useState<Record<string, boolean>>({});
  const [isMuted, setIsMuted] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState(true);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [syntaxTheme, setSyntaxTheme] = useState(() => localStorage.getItem('auditLog_syntaxTheme') || 'vscDarkPlus');
  const [isPageVisible, setIsPageVisible] = useState(!document.hidden);
  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        setEvents([]);
      } catch (err) {
        setError('Failed to load audit logs.');
      } finally {
        setLoading(false);
      }
    };
    loadEvents();

    // Pre-load the audio file for notifications
    // The sound file should be placed in the `public` directory of your React app.
    notificationSoundRef.current = new Audio('/sounds/notification.mp3');

    const handleVisibilityChange = () => setIsPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Persist filters and sorting to localStorage
  useEffect(() => { localStorage.setItem('auditLog_rowsPerPage', String(rowsPerPage)); }, [rowsPerPage]);
  useEffect(() => { localStorage.setItem('auditLog_filterText', filterText); }, [filterText]);
  useEffect(() => {
    if (startDate) localStorage.setItem('auditLog_startDate', startDate);
    else localStorage.removeItem('auditLog_startDate');
  }, [startDate]);
  useEffect(() => {
    if (endDate) localStorage.setItem('auditLog_endDate', endDate);
    else localStorage.removeItem('auditLog_endDate');
  }, [endDate]);
  useEffect(() => { localStorage.setItem('auditLog_order', order); }, [order]);
  useEffect(() => { localStorage.setItem('auditLog_orderBy', orderBy); }, [orderBy]);
  useEffect(() => { localStorage.setItem('auditLog_quickFilter', quickFilter); }, [quickFilter]);
  useEffect(() => { localStorage.setItem('auditLog_syntaxTheme', syntaxTheme); }, [syntaxTheme]);

  useEffect(() => {
    const userIdFromParams = searchParams.get('userId');
    if (userIdFromParams) {
      setFilterText(userIdFromParams);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isLive) {
      // Request notification permission when live mode is enabled
      if (notificationPermission !== 'granted') {
        Notification.requestPermission().then(permission => {
          setNotificationPermission(permission);
        });
      }

      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'https://auth-gateway-746659778850.us-central1.run.app';
      socketRef.current = io(socketUrl, { path: '/audit-stream' });

      socketRef.current.on('connect', () => {
        console.log('[WebSocket] Connected to audit stream.');
      });

      socketRef.current.on('newAuditEvent', (newEvent: AuditEvent) => {
        console.log('[WebSocket] Received new audit event:', newEvent);

        // Show browser tab notification if page is not visible
        if (!isPageVisible && notificationPermission === 'granted' && browserNotificationsEnabled) {
          new Notification('New Audit Event', {
            body: `${newEvent.action.replace(/_/g, ' ')} by ${newEvent.userFullName || newEvent.userId}`,
            icon: '/favicon.ico', // Assuming a favicon exists in the public folder
          });
        }

        // Play sound notification if not muted
        if (!notificationSoundRef.current?.muted) {
          notificationSoundRef.current?.play().catch(error => {
            // Autoplay can be blocked by the browser, log error if it fails.
            console.error("Error playing notification sound:", error);
          });
        }
        setEvents(prevEvents => [{ ...newEvent, isNew: true }, ...prevEvents]);

        // Remove the highlight after a delay
        setTimeout(() => {
          setEvents(prev => prev.map(e => e.id === newEvent.id ? { ...e, isNew: false } : e));
        }, 2500);
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [isLive]);

  useEffect(() => {
    // Sync the muted state with the audio element
    if (notificationSoundRef.current) {
      notificationSoundRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleSortRequest = (property: keyof AuditEvent) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const actionTypes = useMemo(() => {
    const types = new Set(events.map(e => e.action));
    return Array.from(types);
  }, [events]);

  useEffect(() => {
    // Initialize visibility state when action types are determined
    const initialVisibility = actionTypes.reduce((acc, action) => {
      acc[action] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setLineVisibility(initialVisibility);
  }, [actionTypes]);

  const filteredEvents = useMemo(() => {
    const sortableEvents = [...events];
    sortableEvents.sort((a, b) => {
      const aValue = a[orderBy] || '';
      const bValue = b[orderBy] || '';
      if (bValue < aValue) return order === 'asc' ? 1 : -1;
      if (bValue > aValue) return order === 'asc' ? -1 : 1;
      return 0;
    });
    return sortableEvents.filter(event => {
      const matchesText =
        filterText.trim() === '' ||
        event.userId.toLowerCase().includes(filterText.toLowerCase()) ||
        event.action.toLowerCase().includes(filterText.toLowerCase()) ||
        (event.userFullName && event.userFullName.toLowerCase().includes(filterText.toLowerCase()));

      if (!matchesText) return false;

      const eventDate = new Date(event.timestamp);
      if (startDate && new Date(startDate) > eventDate) {
        return false;
      }
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (endOfDay < eventDate) return false;
      }

      return true;
    });
  }, [events, filterText, startDate, endDate, order, orderBy]);

  const summaryStats = useMemo(() => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    const eventsToday = filteredEvents.filter(event => {
      const eventDateString = new Date(event.timestamp).toISOString().split('T')[0];
      return eventDateString === todayString;
    }).length;

    const mostFrequentAction = filteredEvents.reduce(
      (acc, event) => {
        acc.counts[event.action] = (acc.counts[event.action] || 0) + 1;
        if (acc.counts[event.action] > acc.maxCount) {
          acc.maxCount = acc.counts[event.action];
          acc.action = event.action;
        }
        return acc;
      },
      { counts: {} as Record<string, number>, maxCount: 0, action: 'N/A' }
    ).action;

    const mostActiveUser = filteredEvents.reduce(
      (acc, event) => {
        const userName = event.userFullName || event.userId;
        acc.counts[userName] = (acc.counts[userName] || 0) + 1;
        if (acc.counts[userName] > acc.maxCount) {
          acc.maxCount = acc.counts[userName];
          acc.user = userName;
        }
        return acc;
      },
      { counts: {} as Record<string, number>, maxCount: 0, user: 'N/A' }
    ).user;

    return {
      total: filteredEvents.length,
      today: eventsToday,
      mostFrequent: mostFrequentAction,
      mostActiveUser: mostActiveUser,
    };
  }, [filteredEvents]);

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExportCsv = () => {
    if (!filteredEvents.length) return;

    const headers = ['Timestamp', 'User ID', 'User Full Name', 'Action', 'Details'];

    const escapeCsvField = (field: string | undefined) => {
      if (field === undefined || field === null) return '';
      const stringField = String(field);
      if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    };

    const csvRows = [
      headers.join(','),
      ...filteredEvents.map(event => [
        escapeCsvField(new Date(event.timestamp).toLocaleString()),
        escapeCsvField(event.userId),
        escapeCsvField(event.userFullName),
        escapeCsvField(event.action),
        escapeCsvField(event.details ? JSON.stringify(event.details) : ''),
      ].join(','))
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `audit-log-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const date = data.activePayload[0].payload.date;
      setStartDate(date);
      setEndDate(date);
    }
  };

  const handleClearAllFilters = () => {
    setFilterText('');
    setStartDate(null);
    setEndDate(null);
    setQuickFilter('all');
  };

  const executeResetPreferences = () => {
    // Clear state to defaults
    handleClearAllFilters();
    setRowsPerPage(10);
    setOrder('desc');
    setOrderBy('timestamp');
    setPage(0);

    // Clear localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('auditLog_')) {
        localStorage.removeItem(key);
      }
    });
    setIsResetConfirmOpen(false);
  };

  const handleQuickFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string;
    setQuickFilter(value);

    const now = new Date();
    const start = new Date();

    switch (value) {
      case '24h':
        start.setDate(now.getDate() - 1);
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(now.toISOString().split('T')[0]);
        break;
      case '7d':
        start.setDate(now.getDate() - 7);
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(now.toISOString().split('T')[0]);
        break;
      case '30d':
        start.setMonth(now.getMonth() - 1);
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(now.toISOString().split('T')[0]);
        break;
      case 'all':
      default:
        setStartDate(null);
        setEndDate(null);
        break;
    }
  };

  const handleManualDateChange = () => {
    setQuickFilter('custom');
  };

  const handleLegendClick = (data: any) => {
    const { dataKey } = data;
    setLineVisibility(prev => ({ ...prev, [dataKey]: !prev[dataKey] }));
  };

  const handleBrowserNotificationToggle = () => {
    if (notificationPermission === 'default') {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
        if (permission === 'granted') {
          setBrowserNotificationsEnabled(true);
        }
      });
    } else {
      setBrowserNotificationsEnabled(prev => !prev);
    }
  };

  const handleNotify = (message: string, severity: 'success' | 'error') => {
    setNotification({ open: true, message, severity });
  };

  // filteredEvents is now defined earlier (before summaryStats)


  const chartData = useMemo(() => {
    const dataByDate = filteredEvents.reduce((acc, event) => {
      const date = new Date(event.timestamp).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date };
      }
      acc[date][event.action] = (acc[date][event.action] || 0) + 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(dataByDate).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredEvents]);

  const lineColors: { [key: string]: string } = {
    PASSWORD_CHANGED: '#8884d8',
    '2FA_ENABLED': '#82ca9d',
    '2FA_DISABLED': '#ffc658',
    ACCOUNT_DELETED: '#ff7300',
  };

  const themeMap: { [key: string]: any } = {
    vscDarkPlus,
    solarizedlight,
    atomDark,
  };

  return (
    <Fade in={true} timeout={800}>
      <Box p={4} sx={{ background: 'transparent', minHeight: '100vh' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 900, background: GOLD_GRADIENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 1 }}>
              Audit Console
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
              <SecurityIcon sx={{ fontSize: 18, color: '#FFD700' }} />
              High-integrity forensic trace monitoring
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button 
              variant="outlined" 
              startIcon={<DownloadIcon />} 
              onClick={handleExportCsv} 
              disabled={filteredEvents.length === 0}
              sx={{ borderColor: 'rgba(255,255,255,0.1)', color: 'white', '&:hover': { borderColor: '#FFD700', background: 'rgba(255,215,0,0.05)' } }}
            >
              Export Forensics
            </Button>
            <Button 
              variant="contained" 
              startIcon={<RefreshIcon />} 
              onClick={handleClearAllFilters}
              sx={{ bgcolor: '#FFD700', color: 'black', fontWeight: 800, '&:hover': { bgcolor: '#E6C200' } }}
            >
              Reset View
            </Button>
          </Stack>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} mb={4}>
          {[
            { label: 'Total Events', value: summaryStats.total, icon: <HistoryIcon />, onClick: handleClearAllFilters },
            { label: 'Today\'s Audit', value: summaryStats.today, icon: <SecurityIcon />, onClick: () => {
              const today = new Date().toISOString().split('T')[0];
              setStartDate(today);
              setEndDate(today);
            }},
            { label: 'Key Activity', value: summaryStats.mostFrequent.replace(/_/g, ' ').toLowerCase(), icon: <RefreshIcon />, onClick: () => summaryStats.mostFrequent !== 'N/A' && setFilterText(summaryStats.mostFrequent) },
            { label: 'Primary Actor', value: summaryStats.mostActiveUser, icon: <LiveIcon />, onClick: () => summaryStats.mostActiveUser !== 'N/A' && setFilterText(summaryStats.mostActiveUser) },
          ].map((stat, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Paper
                component={ButtonBase}
                onClick={stat.onClick}
                sx={{ 
                  p: 3, 
                  width: '100%', 
                  textAlign: 'left',
                  background: GLASS_BG,
                  backdropFilter: 'blur(20px)',
                  borderRadius: 4,
                  border: `1px solid ${CARD_BORDER}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)', borderColor: '#FFD700' }
                }}
              >
                <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(255,215,0,0.1)', color: '#FFD700' }}>
                  {stat.icon}
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', textTransform: i === 2 ? 'capitalize' : 'none' }}>{stat.value}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{stat.label}</Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Chart Section */}
        <Paper sx={{ 
          p: 4, 
          mb: 4, 
          height: 400, 
          background: GLASS_BG, 
          backdropFilter: 'blur(20px)',
          borderRadius: 4,
          border: `1px solid ${CARD_BORDER}`
        }}>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 4, height: 16, bgcolor: '#FFD700', borderRadius: 1 }} />
            Temporal Activity Trace
          </Typography>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }} onClick={handleChartClick}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.3)" 
                fontSize={12}
                tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                allowDecimals={false} 
                stroke="rgba(255,255,255,0.3)" 
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{ background: '#141416', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '12px' }}
                itemStyle={{ color: '#FFD700' }}
              />
              <Legend 
                onClick={handleLegendClick} 
                wrapperStyle={{ paddingTop: '20px' }}
              />
              {actionTypes.map(action =>
                lineVisibility[action] ? (
                  <Line 
                    key={action} 
                    type="monotone" 
                    dataKey={action} 
                    stroke={lineColors[action] || '#FFD700'} 
                    strokeWidth={3}
                    dot={{ fill: lineColors[action] || '#FFD700', r: 4 }}
                    activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
                    name={action.replace(/_/g, ' ')} 
                  />
                ) : null
              )}
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        {/* Filter Controls */}
        <Paper sx={{ 
          p: 3, 
          mb: 4, 
          background: GLASS_BG, 
          backdropFilter: 'blur(20px)',
          borderRadius: 4,
          border: `1px solid ${CARD_BORDER}`
        }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(0,0,0,0.2)', p: 1, borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)' }}>
                <FilterIcon sx={{ color: 'text.secondary', ml: 1 }} />
                <TextField
                  placeholder="Identity or Action filter..."
                  variant="standard"
                  fullWidth
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  InputProps={{ disableUnderline: true, sx: { color: 'white', fontSize: '0.9rem' } }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <FormControl size="small" fullWidth>
                <InputLabel sx={{ color: 'text.secondary' }}>Timeline</InputLabel>
                <Select 
                  value={quickFilter} 
                  label="Timeline" 
                  onChange={handleQuickFilterChange as any}
                  sx={{ color: 'white', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' } }}
                >
                  <MenuItem value="all">Infinity Scope</MenuItem>
                  <MenuItem value="24h">T-24 Hours</MenuItem>
                  <MenuItem value="7d">T-7 Days</MenuItem>
                  <MenuItem value="30d">T-30 Days</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <TextField
                label="Start"
                type="date"
                size="small"
                fullWidth
                value={startDate || ''}
                onChange={(e) => { setStartDate(e.target.value); handleManualDateChange(); }}
                InputLabelProps={{ shrink: true, sx: { color: 'text.secondary' } }}
                sx={{ input: { color: 'white' }, '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' } }}
              />
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <TextField
                label="End"
                type="date"
                size="small"
                fullWidth
                value={endDate || ''}
                onChange={(e) => { setEndDate(e.target.value); handleManualDateChange(); }}
                InputLabelProps={{ shrink: true, sx: { color: 'text.secondary' } }}
                sx={{ input: { color: 'white' }, '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' } }}
              />
            </Grid>
            <Grid item xs={12} md={2} display="flex" justifyContent="flex-end">
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="caption" sx={{ color: isLive ? '#FFD700' : 'text.secondary', fontWeight: 800 }}>LIVE</Typography>
                <Switch 
                  checked={isLive} 
                  onChange={(e) => setIsLive(e.target.checked)} 
                  sx={{ 
                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#FFD700' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#FFD700' }
                  }}
                />
                <IconButton onClick={() => setIsSettingsModalOpen(true)} sx={{ color: 'text.secondary' }}>
                  <SettingsIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {loading ? (
          <Box display="flex" justifyContent="center" p={10}><CircularProgress sx={{ color: '#FFD700' }} /></Box>
        ) : error ? (
          <Paper sx={{ p: 4, textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 4 }}>
            <Typography color="error" sx={{ fontWeight: 700 }}>{error}</Typography>
          </Paper>
        ) : (
          <Paper sx={{ 
            background: GLASS_BG, 
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            border: `1px solid ${CARD_BORDER}`,
            overflow: 'hidden'
          }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                  <TableRow>
                    <TableCell width={60} />
                    <TableCell sortDirection={orderBy === 'timestamp' ? order : false}>
                      <TableSortLabel 
                        active={orderBy === 'timestamp'} 
                        direction={orderBy === 'timestamp' ? order : 'asc'} 
                        onClick={() => handleSortRequest('timestamp')}
                        sx={{ color: 'white !important', '.MuiTableSortLabel-icon': { color: '#FFD700 !important' } }}
                      >
                        Temporal Index
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sortDirection={orderBy === 'userFullName' ? order : false}>
                      <TableSortLabel 
                        active={orderBy === 'userFullName'} 
                        direction={orderBy === 'userFullName' ? order : 'asc'} 
                        onClick={() => handleSortRequest('userFullName')}
                        sx={{ color: 'white !important', '.MuiTableSortLabel-icon': { color: '#FFD700 !important' } }}
                      >
                        Actor
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 800 }}>Protocol Action</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 800 }}>Payload Trace</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEvents
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((event) => (
                      <Row key={event.id} event={event} onNotify={handleNotify} theme={themeMap[syntaxTheme]} />
                    ))
                  }
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={filteredEvents.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ color: 'text.secondary', borderTop: '1px solid rgba(255,255,255,0.05)' }}
            />
          </Paper>
        )}

      <Dialog open={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)}>
        <DialogTitle>Notification Settings</DialogTitle>
        <DialogContent sx={{ minWidth: 300 }}>
          <FormControlLabel
            control={
              <Switch
                checked={!isMuted}
                onChange={(e) => setIsMuted(!e.target.checked)}
              />
            }
            label="Sound Notifications"
          />
          <FormControlLabel
            control={
              <Switch
                checked={browserNotificationsEnabled && notificationPermission === 'granted'}
                onChange={handleBrowserNotificationToggle}
                disabled={notificationPermission === 'denied'}
              />
            }
            label="Browser Tab Notifications"
          />
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Syntax Highlighting Theme</InputLabel>
            <Select
              value={syntaxTheme}
              label="Syntax Highlighting Theme"
              onChange={(e) => setSyntaxTheme(e.target.value)}
            >
              <MenuItem value="vscDarkPlus">VS Code Dark+</MenuItem>
              <MenuItem value="solarizedlight">Solarized Light</MenuItem>
              <MenuItem value="atomDark">Atom Dark</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
      </Dialog>
      <Dialog open={isResetConfirmOpen} onClose={() => setIsResetConfirmOpen(false)}>
        <DialogTitle>Reset Preferences?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reset all saved preferences for the audit log? This will clear your current filters, sorting, and other view settings.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsResetConfirmOpen(false)}>Cancel</Button>
          <Button onClick={executeResetPreferences} color="secondary" autoFocus>
            Reset
          </Button>
        </DialogActions>
      </Dialog>

      {/* This notification Snackbar was also outside the component return */}
      {/* {notification && (
        <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification(null)}>
          <Alert onClose={() => setNotification(null)} severity={notification.severity} sx={{ width: '100%' }}>{notification.message}</Alert>
        </Snackbar>
      )} */}
      </Box>
    </Fade>
  );
};