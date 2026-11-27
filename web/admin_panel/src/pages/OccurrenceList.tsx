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
const GOLD_GRADIENT = 'linear-gradient(45deg, #F59E0B 30%, #D4AF37 90%)';
const GLASS_BG = '#131722';
const CARD_BORDER = 'rgba(255, 255, 255, 0.08)';

export interface OccurrenceMediaItem {
  type: 'image' | 'audio' | 'video';
  url: string;
  title: string;
  duration?: string;
  size?: string;
}

export interface DetailedOccurrence extends OccurrenceSummary {
  description?: string;
  location?: string;
  media?: OccurrenceMediaItem[];
  actionsTaken?: string[];
  investigatingOfficer?: string;
}

const MOCK_OCCURRENCE_RECORDS: DetailedOccurrence[] = [
  {
    id: 'occ-001',
    obNumber: 'OB-CAN-48192',
    category: 'DISPUTE',
    severity: 'MEDIUM',
    title: 'Disputed Wait Fee Cancellation (Wait: 5m, KES 50 charged)',
    description: 'Rider contends driver did not arrive at the pin location before triggering the 5-minute wait timer. Driver telemetry confirms vehicle was stationary within 35 meters of pickup for 5m 22s.',
    location: 'Westlands Square, Nairobi',
    status: 'DISPUTED',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    driverName: 'Samuel Mwangi (DRV-84192)',
    passengerName: 'Brian K. (PAX-84192)',
    investigatingOfficer: 'Sgt. J. Kimani (Badge #819)',
    actionsTaken: ['Fare hold placed', 'GPS trace exported', 'Driver statement recorded'],
    media: [
      {
        type: 'image',
        title: 'Telemetry Route Pin Capture',
        url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80',
        size: '1.2 MB'
      },
      {
        type: 'audio',
        title: 'Passenger Dispatch Voice Complaint',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        duration: '0:45'
      }
    ]
  },
  {
    id: 'occ-002',
    obNumber: 'OB-SOS-10492',
    category: 'SAFETY_VIOLATION',
    severity: 'CRITICAL',
    title: 'Panic SOS Trigger: Off-Route Telemetry Alert',
    description: 'In-cabin panic button triggered by rider along Southern Bypass. Dispatch operations contacted driver immediately. Vehicle deviated from route towards industrial road.',
    location: 'Southern Bypass Interchange, Nairobi',
    status: 'OPEN',
    createdAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    driverName: 'John O. (DRV-39102)',
    passengerName: 'Faith N. (PAX-55104)',
    investigatingOfficer: 'Insp. A. Mutua (Rapid Response)',
    actionsTaken: ['Emergency patrol dispatched', 'Vehicle engine remote cut-off enabled', 'Audio listen-in initiated'],
    media: [
      {
        type: 'video',
        title: 'Front Dashcam Stream (SOS Snapshot)',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        duration: '0:15'
      },
      {
        type: 'audio',
        title: 'Cabin Audio Listen-in Stream',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        duration: '1:12'
      },
      {
        type: 'image',
        title: 'Route Deviation Geofence Alarm',
        url: 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=800&q=80',
        size: '850 KB'
      }
    ]
  },
  {
    id: 'occ-003',
    obNumber: 'OB-TRAF-88219',
    category: 'TRAFFIC_OFFENSE',
    severity: 'HIGH',
    title: 'Expressway Speed Infraction (Radar: 118 km/h)',
    description: 'Automated expressway speed sensor clocked vehicle at 118 km/h in an 80 km/h zone. Safety threshold exceeded.',
    location: 'Nairobi Expressway, JKIA Tollgate Exit',
    status: 'UNDER_INVESTIGATION',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    driverName: 'David K. (DRV-78190)',
    passengerName: 'Dispatch Radar',
    investigatingOfficer: 'Traffic Fleet Desk',
    media: [
      {
        type: 'image',
        title: 'High-Speed Automated Camera Capture',
        url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
        size: '2.1 MB'
      }
    ]
  },
  {
    id: 'occ-004',
    obNumber: 'OB-FRD-44102',
    category: 'FRAUD',
    severity: 'MEDIUM',
    title: 'Off-App Fare Solicitation Dispute',
    description: 'Rider reported driver requested direct cash transfer outside Cabi wallet system to evade platform commission.',
    location: 'Kilimani, Argwings Kodhek Rd',
    status: 'RESOLVED',
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    driverName: 'Kevin M. (DRV-11029)',
    passengerName: 'Alice W. (PAX-90124)',
    investigatingOfficer: 'Audit & Compliance Officer Ochieng',
    actionsTaken: ['Driver fined KES 1,000', 'Account put on 7-day probation'],
    media: [
      {
        type: 'image',
        title: 'M-PESA Screenshot Submitted by Passenger',
        url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
        size: '450 KB'
      }
    ]
  },
  {
    id: 'occ-005',
    obNumber: 'OB-PROP-33190',
    category: 'PROPERTY_DAMAGE',
    severity: 'LOW',
    title: 'Left Item Report: Black Leather Bag in Trunk',
    description: 'Passenger left laptop bag in vehicle trunk after airport dropoff. Driver confirmed custody and surrendered item to Nairobi Central Station.',
    location: 'JKIA Terminal 1D Dropoff',
    status: 'RESOLVED',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    driverName: 'Peter N. (DRV-44910)',
    passengerName: 'James O. (PAX-23910)',
    investigatingOfficer: 'Lost & Found Support Rep Sarah',
    actionsTaken: ['Item verified', 'Handover signed', 'Case closed'],
    media: [
      {
        type: 'image',
        title: 'Photo of Recovered Leather Bag in Custody',
        url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
        size: '1.8 MB'
      }
    ]
  },
];

export const OccurrenceList = () => {
  const [occurrences, setOccurrences] = useState<DetailedOccurrence[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOccurrence, setSelectedOccurrence] = useState<DetailedOccurrence | null>(null);
  const [colWidths, setColWidths] = useState({
    ob: 140,
    time: 120,
    title: 320,
    parties: 200,
    priority: 110,
    status: 140,
    actions: 100,
  });
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
      <Box p={{ xs: 2, md: 4 }} sx={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* Header Section */}
        <Box mb={3}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-end">
            <Box>
              <Typography variant="overline" sx={{ color: '#F59E0B', fontWeight: 700, letterSpacing: '0.1em', display: 'block', mb: 0.5 }}>
                TRIPS & SAFETY
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5, color: '#ffffff' }}>
                Occurrence Book
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 400 }}>
                Security Command & Incident Audit Trail
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                bgcolor: '#0a0a0a', 
                borderRadius: '3px', 
                px: 2, 
                border: '1px solid rgba(255,255,255,0.08)',
                width: '300px',
                transition: 'all 0.3s',
                '&:focus-within': { borderColor: '#F59E0B', boxShadow: '0 0 15px rgba(245, 158, 11, 0.15)' }
              }}>
                <SearchIcon sx={{ color: '#94a3b8', mr: 1.5, fontSize: 18 }} />
                <InputBase 
                  placeholder="Search by OB#, Title..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{
                    color: 'white',
                    fontSize: '0.8125rem',
                    width: '100%',
                    '& input::placeholder': { color: '#64748b', opacity: 1 }
                  }}
                />
              </Box>
              <IconButton 
                onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                sx={{ 
                  bgcolor: activeSecondaryFilters > 0 ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)', 
                  border: activeSecondaryFilters > 0 ? '1px solid #F59E0B' : '1px solid rgba(255,255,255,0.1)', 
                  color: activeSecondaryFilters > 0 ? '#F59E0B' : 'white',
                  borderRadius: '3px',
                  transition: 'all 0.2s',
                }}
              >
                <Badge badgeContent={activeSecondaryFilters} color="warning">
                  <FilterIcon />
                </Badge>
              </IconButton>
            </Box>
          </Box>
        {/* Golden Gradient Separator and Column Width Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', my: 2 }}>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold uppercase text-[10px] tracking-wider text-amber-500">Column Layout:</span>
            <button
              type="button"
              onClick={() => setColWidths({ ob: 120, time: 100, title: 260, parties: 180, priority: 90, status: 120, actions: 90 })}
              className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[11px]"
            >
              Compact
            </button>
            <button
              type="button"
              onClick={() => setColWidths({ ob: 150, time: 130, title: 340, parties: 210, priority: 110, status: 140, actions: 100 })}
              className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-semibold"
            >
              Standard
            </button>
            <button
              type="button"
              onClick={() => setColWidths({ ob: 190, time: 160, title: 450, parties: 260, priority: 130, status: 160, actions: 120 })}
              className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[11px]"
            >
              Wide / Expanded
            </button>
          </div>
          <span className="text-[11px] text-slate-500">Click any record to inspect narrative & play multimedia evidence</span>
        </Box>
        <Box sx={{ height: '2px', width: '100%', background: 'linear-gradient(to right, rgba(245, 158, 11, 0.8), rgba(245, 158, 11, 0.2), transparent)', mb: 2.5 }} />
      </Box>

            {/* Filter Menu Popover */}
            <Menu
              anchorEl={filterAnchorEl}
              open={Boolean(filterAnchorEl)}
              onClose={() => setFilterAnchorEl(null)}
              PaperProps={{
                sx: {
                  bgcolor: '#131722',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '3px',
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
                    borderRadius: '3px',
                    fontSize: '0.85rem',
                    color: selectedSeverity === sev.id ? '#F59E0B' : 'white',
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
                    borderRadius: '3px',
                    fontSize: '0.85rem',
                    color: selectedCategory === cat.id ? '#F59E0B' : 'white',
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
                      borderRadius: '3px',
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

        {/* Status Quick Filter Tabs - Gamification Gold Pill style */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-4 overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Incidents', count: countByStatus('ALL') },
            { id: 'OPEN', label: 'Open (Urgent)', count: countByStatus('OPEN') },
            { id: 'UNDER_INVESTIGATION', label: 'Investigating', count: countByStatus('UNDER_INVESTIGATION') },
            { id: 'DISPUTED', label: 'Disputed', count: countByStatus('DISPUTED') },
            { id: 'RESOLVED', label: 'Resolved', count: countByStatus('RESOLVED') },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`transition-all cursor-pointer whitespace-nowrap ${
                selectedStatus === tab.id
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-sm shadow-amber-500/20 font-bold border-amber-500 rounded-[3px] px-3.5 py-1.5 text-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-white/10 rounded-[3px] px-3.5 py-1.5 text-xs font-semibold'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: '3px', bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </Alert>
        )}
        
        <TableContainer component={Paper} sx={{ 
          background: GLASS_BG, 
          backdropFilter: 'blur(20px)',
          borderRadius: '3px', 
          border: `1px solid ${CARD_BORDER}`,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden'
        }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.3)' }}>
                <TableCell sx={{ width: colWidths.ob, color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>OB Reference</TableCell>
                <TableCell sx={{ width: colWidths.time, color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Timestamp</TableCell>
                <TableCell sx={{ width: colWidths.title, color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Category / Title</TableCell>
                <TableCell sx={{ width: colWidths.parties, color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Involved Parties</TableCell>
                <TableCell sx={{ width: colWidths.priority, color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Priority</TableCell>
                <TableCell sx={{ width: colWidths.status, color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Current Status</TableCell>
                <TableCell align="right" sx={{ width: colWidths.actions, color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Actions</TableCell>
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
                      onClick={() => setSelectedOccurrence(occurrence)}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'rgba(245,158,11,0.06) !important' },
                        '& td': { borderBottom: '1px solid rgba(255,255,255,0.04)' }
                      }}
                    >
                      <TableCell>
                        <Typography sx={{ fontWeight: 700, color: '#F59E0B', fontSize: '0.875rem' }}>
                          {occurrence.obNumber}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#e2e8f0', fontWeight: 500 }}>
                          {new Date(occurrence.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          {new Date(occurrence.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc' }}>
                          {occurrence.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                          {occurrence.category.replace(/_/g, ' ')}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Stack spacing={1}>
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Avatar sx={{ width: 22, height: 22, fontSize: '0.7rem', bgcolor: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>D</Avatar>
                            <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{occurrence.driverName || 'N/A'}</Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Avatar sx={{ width: 22, height: 22, fontSize: '0.7rem', bgcolor: 'rgba(255,255,255,0.06)', color: 'white', border: '1px solid rgba(255,255,255,0.12)' }}>P</Avatar>
                            <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{occurrence.passengerName || 'N/A'}</Typography>
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
                                bgcolor: 'rgba(245,158,11,0.1)', 
                                color: '#F59E0B',
                                border: '1px solid rgba(245,158,11,0.25)',
                                '&:hover': { bgcolor: '#F59E0B', color: 'black' }
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View Logs">
                            <IconButton sx={{ color: '#94a3b8', '&:hover': { color: 'white' } }}>
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
        {/* Multimedia OB Record Detail Modal */}
        {selectedOccurrence && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="bg-[#131722] border border-white/10 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
              {/* Modal Header */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
                    <ShieldIcon />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {selectedOccurrence.obNumber}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded font-bold uppercase" style={{
                        backgroundColor: getSeverityStyle(selectedOccurrence.severity).bg,
                        color: getSeverityStyle(selectedOccurrence.severity).color,
                        border: `1px solid ${getSeverityStyle(selectedOccurrence.severity).color}33`
                      }}>
                        {selectedOccurrence.severity}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-1">{selectedOccurrence.title}</h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOccurrence(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Meta details grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-[#0a0a0a] border border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Incident Time</span>
                    <span className="text-xs text-white font-medium">{new Date(selectedOccurrence.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0a0a0a] border border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Category</span>
                    <span className="text-xs text-amber-400 font-semibold">{selectedOccurrence.category.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0a0a0a] border border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Location</span>
                    <span className="text-xs text-white font-medium">{selectedOccurrence.location || 'Nairobi Central Sector'}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0a0a0a] border border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Investigating Officer</span>
                    <span className="text-xs text-slate-200">{selectedOccurrence.investigatingOfficer || 'Command Desk'}</span>
                  </div>
                </div>

                {/* Narrative Statement */}
                <div className="p-4 rounded-lg bg-[#0a0a0a] border border-white/5 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Official Incident Narrative</h4>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {selectedOccurrence.description || 'No detailed narrative entered at time of log.'}
                  </p>
                </div>

                {/* Parties Involved */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-[#0a0a0a] border border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase">
                      <Avatar sx={{ width: 22, height: 22, fontSize: '0.7rem', bgcolor: 'rgba(245,158,11,0.2)', color: '#F59E0B' }}>D</Avatar>
                      Driver Involved
                    </div>
                    <div className="text-sm font-semibold text-white">{selectedOccurrence.driverName || 'N/A'}</div>
                    <div className="text-xs text-slate-400">Telemetry Status: Active on Fleet Matrix</div>
                  </div>
                  <div className="p-4 rounded-lg bg-[#0a0a0a] border border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase">
                      <Avatar sx={{ width: 22, height: 22, fontSize: '0.7rem', bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}>P</Avatar>
                      Passenger / Complainant
                    </div>
                    <div className="text-sm font-semibold text-white">{selectedOccurrence.passengerName || 'N/A'}</div>
                    <div className="text-xs text-slate-400">Account Status: Verified Mobile Passenger</div>
                  </div>
                </div>

                {/* Multimedia Evidence Section */}
                <div className="p-4 rounded-lg bg-[#0a0a0a] border border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500">
                      Uploaded Media Evidence ({selectedOccurrence.media?.length || 0})
                    </h4>
                    <span className="text-[11px] text-slate-500">Audio, Video, Dashcam & Photo Evidence</span>
                  </div>

                  {(!selectedOccurrence.media || selectedOccurrence.media.length === 0) ? (
                    <div className="py-6 text-center text-xs text-slate-500">No multimedia evidence attached to this OB entry.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedOccurrence.media.map((item, idx) => (
                        <div key={idx} className="p-3 rounded bg-white/[0.02] border border-white/10 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-white truncate max-w-[200px]">{item.title}</span>
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                              {item.type}
                            </span>
                          </div>

                          {/* Image Player */}
                          {item.type === 'image' && (
                            <div className="relative group overflow-hidden rounded border border-white/10">
                              <img
                                src={item.url}
                                alt={item.title}
                                className="w-full h-44 object-cover transition-transform group-hover:scale-105"
                              />
                              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 text-[10px] text-white rounded">
                                {item.size || 'Image'}
                              </div>
                            </div>
                          )}

                          {/* Audio Player */}
                          {item.type === 'audio' && (
                            <div className="p-3 rounded bg-[#131722] border border-white/10 space-y-2">
                              <div className="flex items-center justify-between text-xs text-slate-400">
                                <span>Voice / Dispatch Recording</span>
                                <span className="font-mono text-amber-400">{item.duration || '0:30'}</span>
                              </div>
                              <audio controls className="w-full h-8" src={item.url}>
                                Your browser does not support audio playback.
                              </audio>
                            </div>
                          )}

                          {/* Video Player */}
                          {item.type === 'video' && (
                            <div className="rounded border border-white/10 overflow-hidden bg-black">
                              <video controls className="w-full max-h-48" src={item.url}>
                                Your browser does not support video playback.
                              </video>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigate(`/resolution-dashboard/${selectedOccurrence.id}`)}
                  className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors"
                >
                  Open in Resolution Console
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOccurrence(null)}
                  className="px-4 py-2 rounded bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        )}
      </Box>
    </Fade>
  );
};

