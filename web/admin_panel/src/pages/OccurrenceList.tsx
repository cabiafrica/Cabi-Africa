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
  Skeleton
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

export const OccurrenceList = () => {
  const [occurrences, setOccurrences] = useState<OccurrenceSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchOccurrences = async () => {
      try {
        setLoading(true);
        const data = await adminService.getIncidents();
        setOccurrences(data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch occurrences:', err);
        setError(err.message || 'Failed to fetch occurrences from the server.');
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
        return { color: '#8b5cf6', label: 'DISPUTED', glow: 'rgba(139, 92, 246, 0.2)' };
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

  const filteredOccurrences = occurrences.filter(occ => 
    occ.obNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    occ.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    occ.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <IconButton sx={{ bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
              <FilterIcon />
            </IconButton>
          </Box>
        </Box>

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

