import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Chip, 
  IconButton, 
  Tooltip,
  Avatar,
  Stack,
  InputBase,
  useTheme,
  Fade,
  Skeleton,
  Menu,
  MenuItem,
  Divider,
  Badge,
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Warning as WarningIcon,
  History as HistoryIcon,
  Shield as ShieldIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { adminService, OccurrenceSummary } from '../services/adminService';

// Premium Color Tokens
const GOLD_GRADIENT = 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)';
const GLASS_BG = 'rgba(15, 23, 42, 0.6)';
const CARD_BORDER = 'rgba(255, 215, 0, 0.1)';

const MOCK_OCCURRENCE_RECORDS: OccurrenceSummary[] = [
  {
    id: 'occ-001',
    obNumber: 'OB-CAN-48192',
    category: 'DISPUTE',
    severity: 'MEDIUM',
    title: 'Disputed Wait Fee Cancellation (Wait: 5m, KES 50 charged)',
    status: 'DISPUTED',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    driverName: 'Samuel Mwangi (DRV-84192)',
    passengerName: 'Brian K. (PAX-84192)',
  },
  {
    id: 'occ-002',
    obNumber: 'OB-SOS-10492',
    category: 'SAFETY_VIOLATION',
    severity: 'CRITICAL',
    title: 'Panic SOS Trigger: Off-Route Telemetry Alert',
    status: 'OPEN',
    createdAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    driverName: 'John O. (DRV-39102)',
    passengerName: 'Faith N. (PAX-55104)',
  },
  {
    id: 'occ-003',
    obNumber: 'OB-TRAF-88219',
    category: 'TRAFFIC_OFFENSE',
    severity: 'HIGH',
    title: 'Expressway Speed Infraction (Radar: 118 km/h)',
    status: 'UNDER_INVESTIGATION',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    driverName: 'David K. (DRV-78190)',
    passengerName: 'Dispatch Radar',
  },
  {
    id: 'occ-004',
    obNumber: 'OB-FRD-44102',
    category: 'FRAUD',
    severity: 'MEDIUM',
    title: 'Off-App Fare Solicitation Dispute',
    status: 'RESOLVED',
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    driverName: 'Kevin M. (DRV-11029)',
    passengerName: 'Alice W. (PAX-90124)',
  },
  {
    id: 'occ-005',
    obNumber: 'OB-PROP-33190',
    category: 'PROPERTY_DAMAGE',
    severity: 'LOW',
    title: 'Left Item Report: Black Leather Bag in Trunk',
    status: 'RESOLVED',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    driverName: 'Peter N. (DRV-44910)',
    passengerName: 'James O. (PAX-23910)',
  },
];

export const OccurrenceList = () => {
  const [occurrences, setOccurrences] = useState<OccurrenceSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchOccurrences = async () => {
      try {
        setLoading(true);
        const data = await adminService.getIncidents();
        if (data && data.length > 0) {
          setOccurrences(data);
        } else {
          setOccurrences(MOCK_OCCURRENCE_RECORDS);
        }
        setError(null);
      } catch (err: any) {
        console.warn('Backend unavailable, loading local Occurrence Book ledger:', err);
        setOccurrences(MOCK_OCCURRENCE_RECORDS);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOccurrences();
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'OPEN':
        return { color: '#ef4444', label: 'OPEN', glow: 'rgba(239, 68, 68, 0.2)' };
      case 'UNDER_INVESTIGATION':
        return { color: '#f59e0b', label: 'INVESTIGATING', glow: 'rgba(245, 158, 11, 0.2)' };
      case 'RESOLVED':
        return { color: '#10b981', label: 'RESOLVED', glow: 'rgba(16, 185, 129, 0.2)' };
      case 'DISPUTED':
        return { color: '#D4AF37', label: 'DISPUTED', glow: 'rgba(139, 92, 246, 0.2)' };
      default:
        return { color: '#94a3b8', label: status, glow: 'rgba(148, 163, 184, 0.2)' };
    }
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'LOW':
        return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
      case 'MEDIUM':
        return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
      case 'HIGH':
      case 'CRITICAL':
        return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
      default:
        return { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)' };
    }
  };

  const filteredOccurrences = occurrences.filter(occ => {
    const matchesQuery = 
      occ.obNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      occ.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      occ.category?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesQuery) return false;
    if (selectedStatus !== 'ALL' && occ.status !== selectedStatus) return false;
    if (selectedSeverity !== 'ALL' && occ.severity !== selectedSeverity) return false;
    if (selectedCategory !== 'ALL' && occ.category !== selectedCategory) return false;
    return true;
  });

  const activeSecondaryFilters = (selectedSeverity !== 'ALL' ? 1 : 0) + (selectedCategory !== 'ALL' ? 1 : 0);

  const countByStatus = (status: string) => {
    if (status === 'ALL') return occurrences.length;
    return occurrences.filter(o => o.status === status).length;
  };

  if (loading) {
    return (
      <Box p={4}>
        <Skeleton variant="text" width="40%" height={60} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
        <Skeleton variant="rectangular" width="100%" height={400} sx={{ mt: 4, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.05)' }} />
      </Box>
    );
  }

  return (
    <Fade in={true} timeout={800}>
      <Box p={4} sx={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* Header Section */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-end" mb={6}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 1, background: GOLD_GRADIENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Occurrence Book
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400, opacity: 0.8 }}>
              Security Command & Incident Audit Trail
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              bgcolor: 'rgba(255,255,255,0.05)', 
              borderRadius: '12px', 
              px: 2, 
              border: '1px solid rgba(255,255,255,0.1)',
              width: '300px',
              transition: 'all 0.3s',
              '&:focus-within': { borderColor: '#FFD700', boxShadow: '0 0 15px rgba(255, 215, 0, 0.1)' }
            }}>
              <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
              <InputBase 
                placeholder="Search by OB#, Title..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ color: 'white', fontSize: '0.9rem', width: '100%' }}
              />
            </Box>
            <IconButton 
              onClick={(e) => setFilterAnchorEl(e.currentTarget)}
              sx={{ 
                bgcolor: activeSecondaryFilters > 0 ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.05)', 
                border: activeSecondaryFilters > 0 ? '1px solid #FFD700' : '1px solid rgba(255,255,255,0.1)', 
                color: activeSecondaryFilters > 0 ? '#FFD700' : 'white',
                transition: 'all 0.2s',
              }}
            >
              <Badge badgeContent={activeSecondaryFilters} color="warning">
                <FilterIcon />
              </Badge>
            </IconButton>

            {/* Filter Menu Popover */}
            <Menu
              anchorEl={filterAnchorEl}
              open={Boolean(filterAnchorEl)}
              onClose={() => setFilterAnchorEl(null)}
              PaperProps={{
                sx: {
                  bgcolor: '#0f172a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 3,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                  minWidth: 240,
                  p: 1,
                  color: 'white',
                }
              }}
            >
              <Typography variant="caption" sx={{ px: 2, py: 0.5, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Filter Severity
              </Typography>
              {[
                { id: 'ALL', label: 'All Severities' },
                { id: 'CRITICAL', label: 'Critical' },
                { id: 'HIGH', label: 'High' },
                { id: 'MEDIUM', label: 'Medium' },
                { id: 'LOW', label: 'Low' },
              ].map(sev => (
                <MenuItem
                  key={sev.id}
                  onClick={() => setSelectedSeverity(sev.id)}
                  selected={selectedSeverity === sev.id}
                  sx={{
                    borderRadius: 1.5,
                    fontSize: '0.85rem',
                    color: selectedSeverity === sev.id ? '#FFD700' : 'white',
                    fontWeight: selectedSeverity === sev.id ? 700 : 400,
                  }}
                >
                  {sev.label}
                </MenuItem>
              ))}

              <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.08)' }} />

              <Typography variant="caption" sx={{ px: 2, py: 0.5, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Filter Category
              </Typography>
              {[
                { id: 'ALL', label: 'All Categories' },
                { id: 'CRIME', label: 'Crime' },
                { id: 'HARASSMENT', label: 'Harassment' },
                { id: 'TRAFFIC_OFFENSE', label: 'Traffic Offense' },
                { id: 'SAFETY_VIOLATION', label: 'Safety Violation' },
                { id: 'FRAUD', label: 'Fraud / Overcharge' },
                { id: 'DISPUTE', label: 'Dispute / Route' },
                { id: 'PROPERTY_DAMAGE', label: 'Property / Lost Item' },
                { id: 'VEHICLE_ISSUE', label: 'Vehicle Issue' },
                { id: 'POLICY_VIOLATION', label: 'Policy Violation' },
              ].map(cat => (
                <MenuItem
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  selected={selectedCategory === cat.id}
                  sx={{
                    borderRadius: 1.5,
                    fontSize: '0.85rem',
                    color: selectedCategory === cat.id ? '#FFD700' : 'white',
                    fontWeight: selectedCategory === cat.id ? 700 : 400,
                  }}
                >
                  {cat.label}
                </MenuItem>
              ))}

              {(selectedSeverity !== 'ALL' || selectedCategory !== 'ALL' || selectedStatus !== 'ALL') && (
                <>
                  <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.08)' }} />
                  <MenuItem
                    onClick={() => {
                      setSelectedSeverity('ALL');
                      setSelectedCategory('ALL');
                      setSelectedStatus('ALL');
                      setFilterAnchorEl(null);
                    }}
                    sx={{
                      borderRadius: 1.5,
                      fontSize: '0.85rem',
                      color: '#ef4444',
                      fontWeight: 700,
                      justifyContent: 'center',
                    }}
                  >
                    Reset All Filters
                  </MenuItem>
                </>
              )}
            </Menu>
          </Box>
        </Box>

        {/* Status Quick Filter Chips */}
        <Stack direction="row" spacing={1.5} mb={3}>
          {[
            { id: 'ALL', label: 'All Incidents', count: countByStatus('ALL'), color: '#FFD700' },
            { id: 'OPEN', label: 'Open (Urgent)', count: countByStatus('OPEN'), color: '#ef4444' },
            { id: 'UNDER_INVESTIGATION', label: 'Investigating', count: countByStatus('UNDER_INVESTIGATION'), color: '#f59e0b' },
            { id: 'DISPUTED', label: 'Disputed', count: countByStatus('DISPUTED'), color: '#D4AF37' },
            { id: 'RESOLVED', label: 'Resolved', count: countByStatus('RESOLVED'), color: '#10b981' },
          ].map((tab) => (
            <Chip
              key={tab.id}
              label={`${tab.label} (${tab.count})`}
              onClick={() => setSelectedStatus(tab.id)}
              sx={{
                bgcolor: selectedStatus === tab.id ? `${tab.color}25` : 'rgba(255,255,255,0.05)',
                color: selectedStatus === tab.id ? tab.color : 'text.secondary',
                border: `1px solid ${selectedStatus === tab.id ? tab.color : 'rgba(255,255,255,0.1)'}`,
                fontWeight: selectedStatus === tab.id ? 800 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: `${tab.color}15`,
                  borderColor: tab.color,
                },
              }}
            />
          ))}
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </Alert>
        )}
        
        <TableContainer component={Paper} sx={{ 
          background: GLASS_BG, 
          backdropFilter: 'blur(20px)',
          borderRadius: 4, 
          border: `1px solid ${CARD_BORDER}`,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden'
        }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.3)' }}>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>OB Reference</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Timestamp</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Category / Title</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Involved Parties</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Priority</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Current Status</TableCell>
                <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOccurrences.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 10, opacity: 0.5 }}>
                    <Stack spacing={2} alignItems="center">
                      <ShieldIcon sx={{ fontSize: 60, color: 'rgba(255,255,255,0.1)' }} />
                      <Typography variant="h6">No occurrences recorded in this terminal</Typography>
                      <Typography variant="body2">Try adjusting your filters or search query</Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOccurrences.map((occurrence) => {
                  const status = getStatusStyle(occurrence.status);
                  const severity = getSeverityStyle(occurrence.severity);
                  
                  return (
                    <TableRow 
                      key={occurrence.id} 
                      hover 
                      sx={{ 
                        '&:hover': { bgcolor: 'rgba(255,215,0,0.02)' },
                        '& td': { borderBottom: '1px solid rgba(255,255,255,0.03)' }
                      }}
                    >
                      <TableCell>
                        <Typography sx={{ fontWeight: 700, color: '#FFD700', fontSize: '0.9rem' }}>
                          {occurrence.obNumber}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          {new Date(occurrence.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.5 }}>
                          {new Date(occurrence.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: 'white' }}>
                          {occurrence.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'rgba(255,215,0,0.5)' }} />
                          {occurrence.category.replace(/_/g, ' ')}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Stack spacing={1}>
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: 'rgba(255,215,0,0.1)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.2)' }}>D</Avatar>
                            <Typography variant="body2" sx={{ fontSize: '0.8rem', opacity: 0.9 }}>{occurrence.driverName || 'N/A'}</Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>P</Avatar>
                            <Typography variant="body2" sx={{ fontSize: '0.8rem', opacity: 0.9 }}>{occurrence.passengerName || 'N/A'}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Chip 
                          label={occurrence.severity} 
                          sx={{ 
                            height: 24,
                            bgcolor: severity.bg,
                            color: severity.color,
                            fontWeight: 800,
                            fontSize: '0.65rem',
                            borderRadius: '6px',
                            border: `1px solid ${severity.color}33`
                          }} 
                        />
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ 
                            width: 8, 
                            height: 8, 
                            borderRadius: '50%', 
                            bgcolor: status.color,
                            boxShadow: `0 0 10px ${status.color}` 
                          }} />
                          <Typography sx={{ color: status.color, fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                            {status.label}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell align="right">
                        <Box display="flex" justifyContent="flex-end" gap={1}>
                          <Tooltip title="Resolution Console">
                            <IconButton 
                              onClick={() => navigate(`/resolution-dashboard/${occurrence.id}`)}
                              sx={{ 
                                bgcolor: 'rgba(255,215,0,0.05)', 
                                color: '#FFD700',
                                border: '1px solid rgba(255,215,0,0.1)',
                                '&:hover': { bgcolor: '#FFD700', color: 'black' }
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View Logs">
                            <IconButton sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: 'white' } }}>
                              <HistoryIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Fade>
  );
};

