import { useState, useEffect } from 'react';
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
  Chip,
  Grid,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Visibility,
  LocationOn,
  Person,
  DirectionsCar,
  AttachMoney,
  Schedule,
  FilterList,
  Refresh,
  Download,
  Map as MapIcon,
} from '@mui/icons-material';

interface Ride {
  id: string;
  passengerId: string;
  passenger?: {
    fullName: string;
    phone: string;
  };
  driverId: string | null;
  driver?: {
    user: {
      fullName: string;
      phone: string;
    }
  } | null;
  status: RideStatus;
  pickupLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  dropoffLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  fare: string | number | null;
  distance: number | null;
  duration: number | null;
  createdAt: string;
  updatedAt: string;

  // Virtual fields for backward compatibility with existing UI code
  passengerName?: string;
  passengerPhone?: string;
  driverName?: string | null;
  driverPhone?: string | null;
}

type RideStatus =
  | 'REQUESTED'
  | 'MATCHING'
  | 'DRIVER_ASSIGNED'
  | 'DRIVER_ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

interface RideStats {
  total: number;
  requested: number;
  matching: number;
  assigned: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
  averageFare: number;
  averageDistance: number;
}

export function JobActivitiesDashboard() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [filteredRides, setFilteredRides] = useState<Ride[]>([]);
  const [stats, setStats] = useState<RideStats>({
    total: 0,
    requested: 0,
    matching: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0,
    averageFare: 0,
    averageDistance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchRides();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [rides, statusFilter, searchQuery, dateFilter]);

  const fetchRides = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/rides', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      const data = await response.json();

      const rawRides = Array.isArray(data) ? data : (data.rides || []);

      // Map raw data to UI friendly format
      const mappedRides = rawRides.map((r: any) => ({
        ...r,
        passengerName: r.passenger?.fullName || 'Unknown',
        passengerPhone: r.passenger?.phone || 'N/A',
        driverName: r.driver?.user?.fullName || null,
        driverPhone: r.driver?.user?.phone || null,
        fare: r.fare ? Number(r.fare) : null,
      }));

      setRides(mappedRides);
      calculateStats(mappedRides);
    } catch (error) {
      console.error('Error fetching rides:', error);
      // Mock data for development
      const mockRides = generateMockRides();
      setRides(mockRides);
      calculateStats(mockRides);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ridesData: Ride[]) => {
    const stats: RideStats = {
      total: ridesData.length,
      requested: ridesData.filter((r) => r.status === 'REQUESTED').length,
      matching: ridesData.filter((r) => r.status === 'MATCHING').length,
      assigned: ridesData.filter((r) => r.status === 'DRIVER_ASSIGNED').length,
      inProgress: ridesData.filter((r) => r.status === 'IN_PROGRESS').length,
      completed: ridesData.filter((r) => r.status === 'COMPLETED').length,
      cancelled: ridesData.filter((r) => r.status === 'CANCELLED').length,
      totalRevenue: ridesData
        .filter((r) => r.status === 'COMPLETED' && r.fare)
        .reduce((sum, r) => sum + Number(r.fare || 0), 0),
      averageFare:
        ridesData.filter((r) => r.fare).reduce((sum, r) => sum + Number(r.fare || 0), 0) /
        ridesData.filter((r) => r.fare).length || 0,
      averageDistance:
        ridesData.filter((r) => r.distance).reduce((sum, r) => sum + Number(r.distance || 0), 0) /
        ridesData.filter((r) => r.distance).length || 0,
    };
    setStats(stats);
  };

  const applyFilters = () => {
    let filtered = [...rides];

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((ride) => ride.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (ride) =>
          ride.passengerName.toLowerCase().includes(query) ||
          ride.passengerPhone.includes(query) ||
          ride.driverName?.toLowerCase().includes(query) ||
          ride.driverPhone?.includes(query) ||
          ride.id.toLowerCase().includes(query)
      );
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter((ride) => ride.createdAt.startsWith(dateFilter));
    }

    setFilteredRides(filtered);
  };

  const getStatusColor = (status: RideStatus): 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' => {
    const colors: Record<RideStatus, 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'> = {
      REQUESTED: 'warning',
      MATCHING: 'info',
      DRIVER_ASSIGNED: 'primary',
      DRIVER_ARRIVED: 'secondary',
      IN_PROGRESS: 'info',
      COMPLETED: 'success',
      CANCELLED: 'error',
    };
    return colors[status];
  };

  const formatStatus = (status: RideStatus): string => {
    return status.replace(/_/g, ' ');
  };

  const handleViewDetails = (ride: Ride) => {
    setSelectedRide(ride);
    setDetailsOpen(true);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    const csv = convertToCSV(filteredRides);
    downloadCSV(csv, 'job-activities.csv');
  };

  const convertToCSV = (data: Ride[]): string => {
    const headers = [
      'ID',
      'Passenger',
      'Driver',
      'Status',
      'Pickup',
      'Dropoff',
      'Fare',
      'Distance',
      'Duration',
      'Created At',
    ];
    const rows = data.map((ride) => [
      ride.id,
      ride.passengerName,
      ride.driverName || 'N/A',
      ride.status,
      ride.pickupLocation.address,
      ride.dropoffLocation.address,
      ride.fare || 'N/A',
      ride.distance || 'N/A',
      ride.duration || 'N/A',
      new Date(ride.createdAt).toLocaleString(),
    ]);
    return [headers, ...rows].map((row) => row.join(',')).join('\n');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold" className="text-slate-900 dark:text-white">
          Job Activities
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchRides} color="primary">
              <Refresh className="text-blue-600 dark:text-blue-400" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export to CSV">
            <IconButton onClick={handleExport} color="primary">
              <Download className="text-blue-600 dark:text-blue-400" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-4 border border-slate-200 dark:border-slate-700">
            <Typography className="text-slate-500 dark:text-slate-400" gutterBottom>
              Total Rides
            </Typography>
            <Typography variant="h4" fontWeight="bold" className="text-slate-900 dark:text-white">
              {stats.total}
            </Typography>
          </div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-4 border border-slate-200 dark:border-slate-700">
            <Typography className="text-slate-500 dark:text-slate-400" gutterBottom>
              Active Rides
            </Typography>
            <Typography variant="h4" fontWeight="bold" className="text-blue-600 dark:text-blue-400">
              {stats.inProgress + stats.assigned}
            </Typography>
          </div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-4 border border-slate-200 dark:border-slate-700">
            <Typography className="text-slate-500 dark:text-slate-400" gutterBottom>
              Completed
            </Typography>
            <Typography variant="h4" fontWeight="bold" className="text-green-600 dark:text-green-400">
              {stats.completed}
            </Typography>
          </div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-4 border border-slate-200 dark:border-slate-700">
            <Typography className="text-slate-500 dark:text-slate-400" gutterBottom>
              Total Revenue
            </Typography>
            <Typography variant="h4" fontWeight="bold" className="text-green-600 dark:text-green-400">
              KES {stats.totalRevenue.toLocaleString()}
            </Typography>
          </div>
        </Grid>
      </Grid>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow mb-6 border border-slate-200 dark:border-slate-700">
        <div className="p-4">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <input
                type="text"
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Search by passenger, driver, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <select
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="REQUESTED">Requested</option>
                <option value="MATCHING">Matching</option>
                <option value="DRIVER_ASSIGNED">Driver Assigned</option>
                <option value="DRIVER_ARRIVED">Driver Arrived</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </Grid>
            <Grid item xs={12} sm={3}>
              <input
                type="date"
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-400"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Typography variant="body2" className="text-slate-500 dark:text-slate-400">
                {filteredRides.length} results
              </Typography>
            </Grid>
          </Grid>
        </div>
      </div>

      {/* Rides Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
        <TableContainer>
          <Table>
            <TableHead className="bg-slate-50 dark:bg-slate-900">
              <TableRow>
                <TableCell className="text-slate-500 dark:text-slate-400 font-semibold">Ride ID</TableCell>
                <TableCell className="text-slate-500 dark:text-slate-400 font-semibold">Passenger</TableCell>
                <TableCell className="text-slate-500 dark:text-slate-400 font-semibold">Driver</TableCell>
                <TableCell className="text-slate-500 dark:text-slate-400 font-semibold">Status</TableCell>
                <TableCell className="text-slate-500 dark:text-slate-400 font-semibold">Pickup</TableCell>
                <TableCell className="text-slate-500 dark:text-slate-400 font-semibold">Dropoff</TableCell>
                <TableCell className="text-slate-500 dark:text-slate-400 font-semibold">Fare</TableCell>
                <TableCell className="text-slate-500 dark:text-slate-400 font-semibold">Distance</TableCell>
                <TableCell className="text-slate-500 dark:text-slate-400 font-semibold">Time</TableCell>
                <TableCell className="text-slate-500 dark:text-slate-400 font-semibold">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" className="text-slate-500 dark:text-slate-400 py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredRides.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" className="text-slate-500 dark:text-slate-400 py-8">
                    No rides found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRides.map((ride) => (
                  <TableRow key={ride.id} hover className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-200 dark:border-slate-700">
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace" className="text-slate-900 dark:text-slate-100">
                        {ride.id.substring(0, 8)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium" className="text-slate-900 dark:text-slate-100">
                          {ride.passengerName}
                        </Typography>
                        <Typography variant="caption" className="text-slate-500 dark:text-slate-400">
                          {ride.passengerPhone}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {ride.driverName ? (
                        <Box>
                          <Typography variant="body2" fontWeight="medium" className="text-slate-900 dark:text-slate-100">
                            {ride.driverName}
                          </Typography>
                          <Typography variant="caption" className="text-slate-500 dark:text-slate-400">
                            {ride.driverPhone}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" className="text-slate-400 italic">
                          Not assigned
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip label={formatStatus(ride.status)} color={getStatusColor(ride.status)} size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 150 }} className="text-slate-900 dark:text-slate-100">
                        {ride.pickupLocation.address}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 150 }} className="text-slate-900 dark:text-slate-100">
                        {ride.dropoffLocation.address}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {ride.fare ? (
                        <Typography variant="body2" fontWeight="medium" className="text-slate-900 dark:text-slate-100">
                          KES {ride.fare.toLocaleString()}
                        </Typography>
                      ) : (
                        <Typography variant="body2" className="text-slate-400">
                          N/A
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-900 dark:text-slate-100">
                      {ride.distance ? `${ride.distance.toFixed(1)} km` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" className="text-slate-500 dark:text-slate-400">
                        {new Date(ride.createdAt).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleViewDetails(ride)} className="text-blue-600 dark:text-blue-400">
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* Ride Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Ride Details</Typography>
            <Chip
              label={selectedRide ? formatStatus(selectedRide.status) : ''}
              color={selectedRide ? getStatusColor(selectedRide.status) : 'default'}
            />
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedRide && (
            <Box>
              <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 2 }}>
                <Tab label="Overview" />
                <Tab label="Location" />
                <Tab label="Timeline" />
              </Tabs>

              {activeTab === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Ride ID
                    </Typography>
                    <Typography variant="body1" fontFamily="monospace" gutterBottom>
                      {selectedRide.id}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Status
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formatStatus(selectedRide.status)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      <Person fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                      Passenger
                    </Typography>
                    <Typography variant="body1">{selectedRide.passengerName}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {selectedRide.passengerPhone}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      <DirectionsCar fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                      Driver
                    </Typography>
                    <Typography variant="body1">{selectedRide.driverName || 'Not assigned'}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {selectedRide.driverPhone || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="textSecondary">
                      <AttachMoney fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                      Fare
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {selectedRide.fare ? `KES ${selectedRide.fare.toLocaleString()}` : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Distance
                    </Typography>
                    <Typography variant="h6">
                      {selectedRide.distance ? `${selectedRide.distance.toFixed(1)} km` : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="textSecondary">
                      <Schedule fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                      Duration
                    </Typography>
                    <Typography variant="h6">
                      {selectedRide.duration ? `${selectedRide.duration} min` : 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              )}

              {activeTab === 1 && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      <LocationOn fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                      Pickup Location
                    </Typography>
                    <Typography variant="body1">{selectedRide.pickupLocation.address}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {selectedRide.pickupLocation.lat.toFixed(6)}, {selectedRide.pickupLocation.lng.toFixed(6)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      <LocationOn fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                      Dropoff Location
                    </Typography>
                    <Typography variant="body1">{selectedRide.dropoffLocation.address}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {selectedRide.dropoffLocation.lat.toFixed(6)}, {selectedRide.dropoffLocation.lng.toFixed(6)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        height: 300,
                        bgcolor: 'grey.200',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 1,
                      }}
                    >
                      <MapIcon sx={{ fontSize: 60, color: 'grey.400' }} />
                      <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
                        Map integration coming soon
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              )}

              {activeTab === 2 && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Created At
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {new Date(selectedRide.createdAt).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {new Date(selectedRide.updatedAt).toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// Mock data generator for development
function generateMockRides(): Ride[] {
  const statuses: RideStatus[] = [
    'REQUESTED',
    'MATCHING',
    'DRIVER_ASSIGNED',
    'DRIVER_ARRIVED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
  ];
  const names = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams', 'Charlie Brown'];
  const locations = [
    'Westlands, Nairobi',
    'CBD, Nairobi',
    'Karen, Nairobi',
    'Kilimani, Nairobi',
    'Parklands, Nairobi',
  ];

  return Array.from({ length: 50 }, (_, i) => ({
    id: `ride-${Math.random().toString(36).substring(2, 15)}`,
    passengerId: `passenger-${i}`,
    passengerName: names[Math.floor(Math.random() * names.length)],
    passengerPhone: `+254${Math.floor(Math.random() * 1000000000)}`,
    driverId: Math.random() > 0.2 ? `driver-${i}` : null,
    driverName: Math.random() > 0.2 ? names[Math.floor(Math.random() * names.length)] : null,
    driverPhone: Math.random() > 0.2 ? `+254${Math.floor(Math.random() * 1000000000)}` : null,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    pickupLocation: {
      lat: -1.286389 + (Math.random() - 0.5) * 0.1,
      lng: 36.817223 + (Math.random() - 0.5) * 0.1,
      address: locations[Math.floor(Math.random() * locations.length)],
    },
    dropoffLocation: {
      lat: -1.286389 + (Math.random() - 0.5) * 0.1,
      lng: 36.817223 + (Math.random() - 0.5) * 0.1,
      address: locations[Math.floor(Math.random() * locations.length)],
    },
    fare: Math.random() > 0.3 ? Math.floor(Math.random() * 2000) + 200 : null,
    distance: Math.random() > 0.3 ? Math.random() * 20 + 2 : null,
    duration: Math.random() > 0.3 ? Math.floor(Math.random() * 60) + 10 : null,
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
  }));
}
