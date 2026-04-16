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
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import SettingsIcon from '@mui/icons-material/Settings';
import DownloadIcon from '@mui/icons-material/Download';
import { fetchAuditEvents, AuditEvent } from './api/auditService';

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
      <TableRow sx={{ '& > *': { borderBottom: 'unset' }, bgcolor: event.isNew ? 'action.hover' : 'transparent', transition: 'background-color 1s ease-out' }}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => { setOpen(!open); if (open) { setShowRawJson(false); setDetailsSearch(''); } }}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{new Date(event.timestamp).toLocaleString()}</TableCell>
        <TableCell>{event.userFullName || event.userId}</TableCell>
        <TableCell>
          <Chip label={event.action.replace(/_/g, ' ')} color={getActionChipColor(event.action)} size="small" />
        </TableCell>
        <TableCell>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 250 }}>
            {event.details ? JSON.stringify(event.details) : '—'}
          </Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" component="div">
                  {showRawJson ? 'Raw Event JSON' : 'Full Details'}
                </Typography>
                <Box>
                  {showRawJson && <Button size="small" startIcon={<ContentCopyIcon />} onClick={handleCopyRawJson}>Copy</Button>}
                  <Button size="small" onClick={() => { setShowRawJson(!showRawJson); setDetailsSearch(''); }}>{showRawJson ? 'View Formatted' : 'View Raw JSON'}</Button>
                </Box>
              </Box>
              {showRawJson ? (
                <SyntaxHighlighter language="json" style={theme} customStyle={{ borderRadius: '4px', margin: 0 }}>
                  {JSON.stringify(event, null, 2)}
                </SyntaxHighlighter>
              ) : (
                <>
                  <TextField
                    size="small" variant="outlined" placeholder="Search details..."
                    value={detailsSearch} onChange={(e) => setDetailsSearch(e.target.value)}
                    sx={{ mb: 1, width: '100%', bgcolor: 'white' }}
                  />
                  {event.details ? (
                    Object.entries(event.details)
                      .filter(([key, value]) =>
                        key.toLowerCase().includes(detailsSearch.toLowerCase()) ||
                        String(value).toLowerCase().includes(detailsSearch.toLowerCase())
                      )
                      .map(([key, value]) => (
                        <DetailItem key={key} label={key} value={String(value)} onNotify={onNotify} />
                      ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">No details available.</Typography>
                  )}
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
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Audit Log</Typography>

      <Grid container spacing={3} mb={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            component={ButtonBase}
            onClick={handleClearAllFilters}
            sx={{ p: 2, textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            <Typography variant="h5">{summaryStats.total}</Typography>
            <Typography color="text.secondary">Total Events Displayed</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            component={ButtonBase}
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              setStartDate(today);
              setEndDate(today);
            }}
            sx={{ p: 2, textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            <Typography variant="h5">{summaryStats.today}</Typography>
            <Typography color="text.secondary">Events Today</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            component={ButtonBase}
            onClick={() => summaryStats.mostFrequent !== 'N/A' && setFilterText(summaryStats.mostFrequent)}
            disabled={summaryStats.mostFrequent === 'N/A'}
            sx={{ p: 2, textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            <Typography variant="h5" sx={{ textTransform: 'capitalize' }}>{summaryStats.mostFrequent.replace(/_/g, ' ').toLowerCase()}</Typography>
            <Typography color="text.secondary">Most Frequent Event</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            component={ButtonBase}
            onClick={() => summaryStats.mostActiveUser !== 'N/A' && setFilterText(summaryStats.mostActiveUser)}
            disabled={summaryStats.mostActiveUser === 'N/A'}
            sx={{ p: 2, textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            <Typography variant="h5">{summaryStats.mostActiveUser}</Typography>
            <Typography color="text.secondary">Most Active User</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 2, height: 300 }}>
        <Typography variant="h6" gutterBottom>Event Trends</Typography>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }} onClick={handleChartClick}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend onClick={handleLegendClick} />
            {actionTypes.map(action =>
              lineVisibility[action] ? (
                <Line key={action} type="monotone" dataKey={action} stroke={lineColors[action] || '#000000'} name={action.replace(/_/g, ' ')} />
              ) : null
            )}
          </LineChart>
        </ResponsiveContainer>
      </Paper>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              label="Filter by User ID, Name, or Action"
              variant="outlined"
              size="small"
              fullWidth
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl size="small" fullWidth>
              <InputLabel>Time Range</InputLabel>
              <Select value={quickFilter} label="Time Range" onChange={handleQuickFilterChange as any}>
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="24h">Last 24 hours</MenuItem>
                <MenuItem value="7d">Last 7 days</MenuItem>
                <MenuItem value="30d">Last 30 days</MenuItem>
                <MenuItem value="custom" disabled>Custom</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <TextField
              label="Start Date"
              type="date"
              size="small"
              fullWidth
              value={startDate || ''}
              onChange={(e) => { setStartDate(e.target.value); handleManualDateChange(); }}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <TextField
              label="End Date"
              type="date"
              size="small"
              fullWidth
              value={endDate || ''}
              onChange={(e) => { setEndDate(e.target.value); handleManualDateChange(); }}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={1} textAlign="center">
            <Button onClick={handleClearAllFilters} variant="text">Clear All Filters</Button>
          </Grid>
          <Grid item xs={12} sm={4} md={2} textAlign="center">
            <Button onClick={() => setIsResetConfirmOpen(true)} variant="text" color="secondary">Reset Preferences</Button>
          </Grid>
          <Grid item xs={12} sm={6} md={2} textAlign={{ xs: 'left', md: 'right' }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
            <FormControlLabel
              control={<Switch checked={isLive} onChange={(e) => setIsLive(e.target.checked)} />}
              label="Live Update"
            />
            {isLive && (
              <IconButton onClick={() => setIsSettingsModalOpen(true)} size="small">
                <SettingsIcon />
              </IconButton>
            )}
          </Grid>
          <Grid item xs={12} md={2} textAlign="right">
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportCsv} disabled={filteredEvents.length === 0}>
              Export as CSV
            </Button>
          </Grid>
        </Grid>
      </Paper>
      {loading ? <CircularProgress /> : error ? <Typography color="error">{error}</Typography> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell sortDirection={orderBy === 'timestamp' ? order : false}>
                  <TableSortLabel active={orderBy === 'timestamp'} direction={orderBy === 'timestamp' ? order : 'asc'} onClick={() => handleSortRequest('timestamp')}>
                    Timestamp
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={orderBy === 'userFullName' ? order : false}>
                  <TableSortLabel active={orderBy === 'userFullName'} direction={orderBy === 'userFullName' ? order : 'asc'} onClick={() => handleSortRequest('userFullName')}>
                    User
                  </TableSortLabel>
                </TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Details</TableCell>
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
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredEvents.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
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
  );
};