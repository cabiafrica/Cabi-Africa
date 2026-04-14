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
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 1
                    }}>
                        Scheduled Rides
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage upcoming bookings and assignments
                    </Typography>
                </Box>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{
                        p: 3,
                        background: alpha(theme.palette.primary.main, 0.05),
                        border: '1px solid',
                        borderColor: alpha(theme.palette.primary.main, 0.1),
                        borderRadius: 4
                    }}>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold">TOTAL SCHEDULED</Typography>
                                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>{stats.total}</Typography>
                            </Box>
                            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.2), color: theme.palette.primary.main }}>
                                <EventIcon />
                            </Avatar>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{
                        p: 3,
                        background: alpha(theme.palette.warning.main, 0.05),
                        border: '1px solid',
                        borderColor: alpha(theme.palette.warning.main, 0.1),
                        borderRadius: 4
                    }}>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold">PENDING</Typography>
                                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, color: theme.palette.warning.main }}>{stats.pending}</Typography>
                            </Box>
                            <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.2), color: theme.palette.warning.main }}>
                                <ScheduleIcon />
                            </Avatar>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{
                        p: 3,
                        background: alpha(theme.palette.info.main, 0.05),
                        border: '1px solid',
                        borderColor: alpha(theme.palette.info.main, 0.1),
                        borderRadius: 4
                    }}>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold">ASSIGNED</Typography>
                                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, color: theme.palette.info.main }}>{stats.assigned}</Typography>
                            </Box>
                            <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.2), color: theme.palette.info.main }}>
                                <CarIcon />
                            </Avatar>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{
                        p: 3,
                        background: alpha(theme.palette.success.main, 0.05),
                        border: '1px solid',
                        borderColor: alpha(theme.palette.success.main, 0.1),
                        borderRadius: 4
                    }}>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold">EST. VALUE</Typography>
                                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, color: theme.palette.success.main }}>
                                    {stats.totalValue.toLocaleString()}
                                </Typography>
                            </Box>
                            <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.2), color: theme.palette.success.main }}>
                                <TimelineIcon />
                            </Avatar>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Filters & Control */}
            <Paper sx={{ p: 2, mb: 4, borderRadius: 3, backdropFilter: 'blur(20px)', background: alpha(theme.palette.background.paper, 0.8) }}>
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
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 2 }
                            }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Filter Status</InputLabel>
                            <Select
                                value={filterStatus}
                                label="Filter Status"
                                onChange={(e) => setFilterStatus(e.target.value)}
                                sx={{ borderRadius: 2 }}
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
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                background: alpha(theme.palette.background.paper, 0.5)
            }}>
                <Table>
                    <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Time</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Passenger</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Route Information</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Est. Fare</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                    <Typography color="text.secondary">Loading scheduled rides...</Typography>
                                </TableCell>
                            </TableRow>
                        ) : filteredRides.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                    <Box display="flex" flexDirection="column" alignItems="center">
                                        <EventIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                                        <Typography variant="h6" color="text.secondary">No scheduled rides found</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredRides.map((ride) => (
                                <TableRow key={ride.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell>
                                        <Box display="flex" alignItems="center">
                                            <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                                            <Box>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {new Date(ride.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(ride.pickupTime).toLocaleDateString()}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box display="flex" alignItems="center">
                                            <Avatar sx={{ width: 32, height: 32, mr: 1.5, bgcolor: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.main }}>
                                                <PersonIcon fontSize="small" />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" fontWeight="medium">{ride.passengerName}</Typography>
                                                <Typography variant="caption" color="text.secondary">{ride.passengerPhone}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ maxWidth: 350 }}>
                                            <Box display="flex" alignItems="center" mb={0.5}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main', mr: 2 }} />
                                                <Typography variant="body2" noWrap>{ride.pickupLocation}</Typography>
                                            </Box>
                                            <Box display="flex" alignItems="center">
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main', mr: 2 }} />
                                                <Typography variant="body2" noWrap>{ride.dropoffLocation}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="bold">
                                            KES {ride.estimatedFare.toLocaleString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={ride.status}
                                            size="small"
                                            color={getStatusColor(ride.status) as any}
                                            variant="outlined"
                                            sx={{ fontWeight: 'bold', borderWidth: 2 }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small">
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
