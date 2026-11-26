import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
    Box,
    Typography,
    Paper,
    Grid,
    TextField,
    InputAdornment,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Tooltip,
    Card,
    CardContent,
    Avatar,
    useTheme,
    alpha
} from '@mui/material';
import {
    Event as EventIcon,
    AccessTime as AccessTimeIcon,
    Person as PersonIcon,
    LocationOn as LocationOnIcon,
    Search as SearchIcon,
    MoreVert as MoreVertIcon,
    Schedule as ScheduleIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    DirectionsCar as CarIcon,
    Timeline as TimelineIcon
} from '@mui/icons-material';

interface ScheduledRide {
    id: string;
    pickupTime: string;
    passengerName: string;
    passengerPhone: string;
    pickupLocation: string;
    dropoffLocation: string;
    estimatedFare: number;
    status: 'PENDING' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED';
    notes?: string;
}

export const ScheduledRideManagement: React.FC = () => {
    const theme = useTheme();
    console.log("ScheduledRideManagement: Component Rendering...");

    const [rides, setRides] = useState<ScheduledRide[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchScheduledRides();
    }, []);

    const fetchScheduledRides = async () => {
        setLoading(true);
        try {
            const data = await adminService.getScheduledRides();
            let mapped: ScheduledRide[] = [];

            if (Array.isArray(data) && data.length > 0) {
                mapped = data.map(d => ({
                    id: d.id || 'unknown',
                    pickupTime: d.pickupTime || new Date().toISOString(),
                    passengerName: d.passengerName || d.passenger || 'Unknown',
                    passengerPhone: d.passengerPhone || 'N/A',
                    pickupLocation: d.pickupLocation || d.pickup || 'Unknown',
                    dropoffLocation: d.dropoffLocation || d.dropoff || 'Unknown',
                    estimatedFare: d.estimatedFare || 0,
                    status: d.status || 'PENDING'
                }));
            } else {
                mapped = generateMockScheduledRides();
            }
            setRides(mapped);
        } catch (error: any) {
            console.error("Failed to fetch scheduled rides", error);
            setError(error.message || "Failed to load rides");
            setRides(generateMockScheduledRides());
        } finally {
            setLoading(false);
        }
    };

    const filteredRides = rides.filter(ride => {
        const matchesStatus = filterStatus === 'ALL' || ride.status === filterStatus;
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = ride.passengerName.toLowerCase().includes(searchLower) ||
            ride.pickupLocation.toLowerCase().includes(searchLower) ||
            ride.dropoffLocation.toLowerCase().includes(searchLower);
        return matchesStatus && matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'warning';
            case 'ASSIGNED': return 'info';
            case 'COMPLETED': return 'success';
            case 'CANCELLED': return 'error';
            default: return 'default';
        }
    };

    const stats = {
        total: rides.length,
        pending: rides.filter(r => r.status === 'PENDING').length,
        assigned: rides.filter(r => r.status === 'ASSIGNED').length,
        totalValue: rides.reduce((acc, curr) => acc + curr.estimatedFare, 0)
    };

    return (
        <Box sx={{ p: { xs: 2, md: 0 }, color: 'text.primary' }}>
            {/* Header Section */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight="800" sx={{
                        background: 'linear-gradient(45deg, #F59E0B 30%, #D4AF37 90%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 1
                    }}>
                        Scheduled Rides
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#94a3b8' }}>
                        Manage upcoming bookings and assignments
                    </Typography>
                </Box>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{
                        p: 3,
                        bgcolor: '#131722',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: 3
                    }}>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Box>
                                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 'bold', letterSpacing: '0.05em' }}>TOTAL SCHEDULED</Typography>
                                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, color: '#f8fafc' }}>{stats.total}</Typography>
                            </Box>
                            <Avatar sx={{ bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
                                <EventIcon />
                            </Avatar>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{
                        p: 3,
                        bgcolor: '#131722',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: 3
                    }}>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Box>
                                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 'bold', letterSpacing: '0.05em' }}>PENDING</Typography>
                                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, color: '#F59E0B' }}>{stats.pending}</Typography>
                            </Box>
                            <Avatar sx={{ bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
                                <ScheduleIcon />
                            </Avatar>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{
                        p: 3,
                        bgcolor: '#131722',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: 3
                    }}>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Box>
                                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 'bold', letterSpacing: '0.05em' }}>ASSIGNED</Typography>
                                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, color: '#38bdf8' }}>{stats.assigned}</Typography>
                            </Box>
                            <Avatar sx={{ bgcolor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                                <CarIcon />
                            </Avatar>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{
                        p: 3,
                        bgcolor: '#131722',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: 3
                    }}>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Box>
                                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 'bold', letterSpacing: '0.05em' }}>EST. VALUE</Typography>
                                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, color: '#10B981' }}>
                                    {stats.totalValue.toLocaleString()}
                                </Typography>
                            </Box>
                            <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
                                <TimelineIcon />
                            </Avatar>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Filters & Control */}
            <Paper sx={{
                p: 2.5,
                mb: 4,
                borderRadius: 3,
                bgcolor: '#131722',
                border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search passenger, location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: '#94a3b8' }} />
                                    </InputAdornment>
                                ),
                                sx: {
                                    borderRadius: 2,
                                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                                    color: 'white',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    '& input::placeholder': { color: '#64748b', opacity: 1 },
                                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                    '&.Mui-focused': { border: '1px solid #F59E0B' }
                                }
                            }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel sx={{ color: '#94a3b8', '&.Mui-focused': { color: '#F59E0B' } }}>Filter Status</InputLabel>
                            <Select
                                value={filterStatus}
                                label="Filter Status"
                                onChange={(e) => setFilterStatus(e.target.value)}
                                sx={{
                                    borderRadius: 2,
                                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                                    color: 'white',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                    '&.Mui-focused': { border: '1px solid #F59E0B' },
                                    '& .MuiSvgIcon-root': { color: '#94a3b8' }
                                }}
                                MenuProps={{
                                    PaperProps: {
                                        sx: {
                                            bgcolor: '#131722',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            color: 'white'
                                        }
                                    }
                                }}
                            >
                                <MenuItem value="ALL">All Statuses</MenuItem>
                                <MenuItem value="PENDING">Pending</MenuItem>
                                <MenuItem value="ASSIGNED">Assigned</MenuItem>
                                <MenuItem value="COMPLETED">Completed</MenuItem>
                                <MenuItem value="CANCELLED">Cancelled</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            {/* Main Data Table */}
            <TableContainer component={Paper} elevation={0} sx={{
                borderRadius: 3,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                bgcolor: '#131722',
                overflow: 'hidden'
            }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
                        <TableRow>
                            <TableCell sx={{ color: '#cbd5e1', fontWeight: 600, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Time</TableCell>
                            <TableCell sx={{ color: '#cbd5e1', fontWeight: 600, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Passenger</TableCell>
                            <TableCell sx={{ color: '#cbd5e1', fontWeight: 600, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Route Information</TableCell>
                            <TableCell sx={{ color: '#cbd5e1', fontWeight: 600, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Est. Fare</TableCell>
                            <TableCell sx={{ color: '#cbd5e1', fontWeight: 600, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Status</TableCell>
                            <TableCell align="right" sx={{ color: '#cbd5e1', fontWeight: 600, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 6, borderBottom: 'none' }}>
                                    <Typography sx={{ color: '#94a3b8' }}>Loading scheduled rides...</Typography>
                                </TableCell>
                            </TableRow>
                        ) : filteredRides.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 8, borderBottom: 'none' }}>
                                    <Box display="flex" flexDirection="column" alignItems="center">
                                        <EventIcon sx={{ fontSize: 44, color: '#475569', mb: 1.5 }} />
                                        <Typography variant="h6" sx={{ color: '#cbd5e1', fontWeight: 600 }}>No scheduled rides found</Typography>
                                        <Typography variant="body2" sx={{ color: '#64748b' }}>No bookings match the filter criteria.</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredRides.map((ride) => (
                                <TableRow key={ride.id} hover sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.03) !important' }, '& td': { borderBottom: '1px solid rgba(255, 255, 255, 0.04)' } }}>
                                    <TableCell>
                                        <Box display="flex" alignItems="center">
                                            <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: '#94a3b8' }} />
                                            <Box>
                                                <Typography variant="body2" fontWeight="medium" sx={{ color: '#f8fafc' }}>
                                                    {new Date(ride.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#64748b' }}>
                                                    {new Date(ride.pickupTime).toLocaleDateString()}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box display="flex" alignItems="center">
                                            <Avatar sx={{ width: 32, height: 32, mr: 1.5, bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
                                                <PersonIcon fontSize="small" />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" fontWeight="medium" sx={{ color: '#f8fafc' }}>{ride.passengerName}</Typography>
                                                <Typography variant="caption" sx={{ color: '#64748b' }}>{ride.passengerPhone}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ maxWidth: 350 }}>
                                            <Box display="flex" alignItems="center" mb={0.5}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10B981', mr: 1.5 }} />
                                                <Typography variant="body2" sx={{ color: '#cbd5e1' }} noWrap>{ride.pickupLocation}</Typography>
                                            </Box>
                                            <Box display="flex" alignItems="center">
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ef4444', mr: 1.5 }} />
                                                <Typography variant="body2" sx={{ color: '#94a3b8' }} noWrap>{ride.dropoffLocation}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="bold" sx={{ color: '#F59E0B' }}>
                                            KES {ride.estimatedFare.toLocaleString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={ride.status}
                                            size="small"
                                            sx={{
                                                fontWeight: 'bold',
                                                bgcolor: ride.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.15)' :
                                                         ride.status === 'ASSIGNED' ? 'rgba(56, 189, 248, 0.15)' :
                                                         ride.status === 'PENDING' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                                color: ride.status === 'COMPLETED' ? '#10B981' :
                                                       ride.status === 'ASSIGNED' ? '#38bdf8' :
                                                       ride.status === 'PENDING' ? '#F59E0B' : '#ef4444',
                                                border: `1px solid ${
                                                    ride.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.3)' :
                                                    ride.status === 'ASSIGNED' ? 'rgba(56, 189, 248, 0.3)' :
                                                    ride.status === 'PENDING' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'
                                                }`
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" sx={{ color: '#94a3b8' }}>
                                            <MoreVertIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

// Helper to generate mock data if API fails or returns empty in dev
function generateMockScheduledRides(): ScheduledRide[] {
    return [];
}
