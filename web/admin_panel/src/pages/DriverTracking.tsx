import React, { useState, useEffect } from 'react';
import { CabiMap, MapMarker } from '../components/CabiMap';
import { 
  Box, 
  Typography, 
  Stack, 
  Avatar, 
  Chip, 
  IconButton, 
  InputBase, 
  Paper,
  Fade,
  Tooltip,
  Divider
} from '@mui/material';
import { 
  Search as SearchIcon,
  FilterList as FilterIcon,
  MyLocation as MyLocationIcon,
  Star as StarIcon,
  DirectionsCar as CarIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  Radar as RadarIcon,
  Map as MapIcon,
  List as ListIcon
} from '@mui/icons-material';

interface Driver {
    id: string;
    name: string;
    position: [number, number];
    status: 'online' | 'offline' | 'busy';
    rating: number;
    totalTrips: number;
    currentTrip?: {
        passengerId: string;
        passengerName: string;
        pickup: [number, number];
        dropoff: [number, number];
    };
}

// Mock driver data - Nairobi locations
const initialMockDrivers: Driver[] = [
  { id: 'DRV-001', name: 'James Mwangi', position: [-1.286389, 36.817223], status: 'online', rating: 4.9, totalTrips: 1240 },
  { id: 'DRV-002', name: 'Sarah Atieno', position: [-1.296389, 36.827223], status: 'busy', rating: 4.8, totalTrips: 850, currentTrip: { passengerId: 'P-101', passengerName: 'David K.', pickup: [-1.290, 36.820], dropoff: [-1.310, 36.840] } },
  { id: 'DRV-003', name: 'Robert Otieno', position: [-1.276389, 36.807223], status: 'online', rating: 4.7, totalTrips: 2100 },
  { id: 'DRV-004', name: 'Grace Wambui', position: [-1.306389, 36.837223], status: 'offline', rating: 5.0, totalTrips: 450 },
  { id: 'DRV-005', name: 'Peter Kamau', position: [-1.266389, 36.797223], status: 'online', rating: 4.6, totalTrips: 1580 },
];

const GOLD_GRADIENT = 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)';
const GLASS_BG = 'rgba(15, 23, 42, 0.7)';
const CARD_BORDER = 'rgba(255, 215, 0, 0.1)';

export default function DriverTracking() {
    const [drivers, setDrivers] = useState<Driver[]>(initialMockDrivers);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'busy' | 'offline'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Simulate real-time driver movement
    useEffect(() => {
        const interval = setInterval(() => {
            setDrivers((prevDrivers) =>
                prevDrivers.map((driver) => {
                    if (driver.status === 'offline') return driver;

                    const latOffset = (Math.random() - 0.5) * 0.0005;
                    const lngOffset = (Math.random() - 0.5) * 0.0005;

                    return {
                        ...driver,
                        position: [
                            driver.position[0] + latOffset,
                            driver.position[1] + lngOffset,
                        ] as [number, number],
                    };
                })
            );
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    const filteredDrivers = drivers.filter((d) => {
        const matchesStatus = filterStatus === 'all' ? true : d.status === filterStatus;
        const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.id.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const markers: MapMarker[] = filteredDrivers.map((driver) => ({
        id: driver.id,
        position: driver.position,
        type: 'driver',
        status: driver.status,
        popup: `
          <div style="padding: 8px; min-width: 150px; background: #0F172A; color: white;">
            <strong style="font-size: 14px; color: #FFD700;">${driver.name}</strong><br/>
            <span style="font-size: 12px; opacity: 0.8;">${driver.id}</span>
          </div>
        `,
        onClick: () => setSelectedDriver(driver),
    }));

    if (selectedDriver?.currentTrip) {
        markers.push({
            id: 'pickup',
            position: selectedDriver.currentTrip.pickup,
            type: 'pickup',
            popup: 'Pickup Location',
        });
        markers.push({
            id: 'dropoff',
            position: selectedDriver.currentTrip.dropoff,
            type: 'dropoff',
            popup: 'Dropoff Location',
        });
    }

    const route = selectedDriver?.currentTrip
        ? [
            selectedDriver.position,
            selectedDriver.currentTrip.pickup,
            selectedDriver.currentTrip.dropoff,
        ]
        : undefined;

    const stats = {
        total: drivers.length,
        online: drivers.filter((d) => d.status === 'online').length,
        busy: drivers.filter((d) => d.status === 'busy').length,
        offline: drivers.filter((d) => d.status === 'offline').length,
    };

    return (
        <Fade in={true} timeout={800}>
            <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', gap: 3, p: 3, overflow: 'hidden' }}>
                {/* Left Sidebar: Driver Intelligence */}
                <Box sx={{ 
                    width: '400px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 3,
                    height: '100%'
                }}>
                    {/* Header Card */}
                    <Paper sx={{ 
                        p: 3, 
                        background: GLASS_BG, 
                        backdropFilter: 'blur(20px)',
                        borderRadius: 4,
                        border: `1px solid ${CARD_BORDER}`,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                    }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, background: GOLD_GRADIENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Field Intelligence
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                            Real-time node tracking & status audit
                        </Typography>

                        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                            <Box sx={{ flex: 1, textAlign: 'center', p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFD700' }}>{stats.online}</Typography>
                                <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>Active</Typography>
                            </Box>
                            <Box sx={{ flex: 1, textAlign: 'center', p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: '#F59E0B' }}>{stats.busy}</Typography>
                                <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>On Trip</Typography>
                            </Box>
                            <Box sx={{ flex: 1, textAlign: 'center', p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: '#94a3b8' }}>{stats.total}</Typography>
                                <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>Total</Typography>
                            </Box>
                        </Stack>

                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            bgcolor: 'rgba(0,0,0,0.2)', 
                            borderRadius: '12px', 
                            px: 2, 
                            border: '1px solid rgba(255,255,255,0.1)',
                            mb: 2
                        }}>
                            <SearchIcon sx={{ color: 'text.secondary', fontSize: 20, mr: 1 }} />
                            <InputBase 
                                placeholder="Search by name or ID..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                sx={{ color: 'white', fontSize: '0.85rem', py: 1, width: '100%' }}
                            />
                        </Box>

                        <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
                            {(['all', 'online', 'busy', 'offline'] as const).map((status) => (
                                <Chip
                                    key={status}
                                    label={status.toUpperCase()}
                                    onClick={() => setFilterStatus(status)}
                                    sx={{ 
                                        height: 24,
                                        fontSize: '0.65rem',
                                        fontWeight: 800,
                                        bgcolor: filterStatus === status ? '#FFD700' : 'rgba(255,255,255,0.05)',
                                        color: filterStatus === status ? 'black' : 'text.secondary',
                                        border: filterStatus === status ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        '&:hover': { bgcolor: filterStatus === status ? '#E6C200' : 'rgba(255,255,255,0.1)' }
                                    }}
                                />
                            ))}
                        </Stack>
                    </Paper>

                    {/* Driver List Card */}
                    <Paper sx={{ 
                        flex: 1, 
                        background: GLASS_BG, 
                        backdropFilter: 'blur(20px)',
                        borderRadius: 4,
                        border: `1px solid ${CARD_BORDER}`,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ListIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'white' }}>Node Directory</Typography>
                        </Box>
                        <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
                            {filteredDrivers.map((driver) => (
                                <Box
                                    key={driver.id}
                                    onClick={() => setSelectedDriver(driver)}
                                    sx={{ 
                                        p: 2, 
                                        mb: 1,
                                        borderRadius: 3,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        bgcolor: selectedDriver?.id === driver.id ? 'rgba(255,215,0,0.08)' : 'transparent',
                                        border: `1px solid ${selectedDriver?.id === driver.id ? 'rgba(255,215,0,0.2)' : 'transparent'}`,
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                <CarIcon sx={{ fontSize: 18, color: '#FFD700' }} />
                                            </Avatar>
                                            <Box>
                                                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: 'white' }}>{driver.name}</Typography>
                                                <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>{driver.id}</Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
                                                <StarIcon sx={{ fontSize: 14, color: '#FFD700' }} />
                                                <Typography sx={{ fontWeight: 800, fontSize: '0.8rem', color: 'white' }}>{driver.rating}</Typography>
                                            </Box>
                                            <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>{driver.totalTrips} trips</Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ 
                                            width: 6, 
                                            height: 6, 
                                            borderRadius: '50%', 
                                            bgcolor: driver.status === 'online' ? '#FFD700' : driver.status === 'busy' ? '#F59E0B' : '#94a3b8',
                                            boxShadow: driver.status === 'online' ? '0 0 10px #FFD700' : 'none'
                                        }} />
                                        <Typography sx={{ 
                                            fontSize: '0.7rem', 
                                            fontWeight: 800, 
                                            color: driver.status === 'online' ? '#FFD700' : driver.status === 'busy' ? '#F59E0B' : '#94a3b8',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>
                                            {driver.status}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Box>

                {/* Right Area: Tactical Map */}
                <Box sx={{ flex: 1, position: 'relative' }}>
                    <Paper sx={{ 
                        height: '100%', 
                        width: '100%', 
                        background: GLASS_BG, 
                        borderRadius: 4, 
                        border: `1px solid ${CARD_BORDER}`,
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        <CabiMap
                            center={[-1.286389, 36.817223]}
                            zoom={13}
                            markers={markers}
                            route={route}
                            height="100%"
                        />

                        {/* Map Overlay: Floating Legend/Controls */}
                        <Box sx={{ position: 'absolute', top: 20, right: 20, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Paper sx={{ p: 1, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)' }}>
                                <Tooltip title="Tactical View">
                                    <IconButton size="small" sx={{ color: '#FFD700' }}><RadarIcon /></IconButton>
                                </Tooltip>
                            </Paper>
                            <Paper sx={{ p: 1, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)' }}>
                                <Tooltip title="Satellite Mode">
                                    <IconButton size="small" sx={{ color: 'white' }}><MapIcon /></IconButton>
                                </Tooltip>
                            </Paper>
                        </Box>

                        {/* Selected Node Details: Floating Glass Card */}
                        {selectedDriver && (
                            <Fade in={true}>
                                <Paper sx={{ 
                                    position: 'absolute', 
                                    bottom: 30, 
                                    left: '50%', 
                                    transform: 'translateX(-50%)', 
                                    width: '450px',
                                    p: 3, 
                                    background: 'rgba(15, 23, 42, 0.9)', 
                                    backdropFilter: 'blur(20px)',
                                    borderRadius: 4,
                                    border: `1px solid ${GOLD_GRADIENT}`,
                                    boxShadow: '0 30px 60px rgba(0,0,0,0.8)',
                                    zIndex: 1000
                                }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={3}>
                                        <Box display="flex" gap={2}>
                                            <Avatar sx={{ width: 50, height: 50, border: '2px solid #FFD700', p: 0.5, bgcolor: 'transparent' }}>
                                                <Avatar sx={{ width: '100%', height: '100%', bgcolor: 'rgba(255,215,0,0.1)' }}>
                                                    <PersonIcon sx={{ color: '#FFD700' }} />
                                                </Avatar>
                                            </Avatar>
                                            <Box>
                                                <Typography variant="h6" sx={{ color: 'white', fontWeight: 800 }}>{selectedDriver.name}</Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <MyLocationIcon sx={{ fontSize: 12 }} /> 
                                                    {selectedDriver.position[0].toFixed(5)}, {selectedDriver.position[1].toFixed(5)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <IconButton onClick={() => setSelectedDriver(null)} sx={{ color: 'text.secondary' }}>
                                            <CloseIcon />
                                        </IconButton>
                                    </Box>

                                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />

                                    <Box display="flex" justifyContent="space-between" mb={3}>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Operational Status</Typography>
                                            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: selectedDriver.status === 'online' ? '#FFD700' : '#F59E0B' }} />
                                                <Typography sx={{ fontWeight: 800, color: 'white', fontSize: '0.9rem' }}>{selectedDriver.status.toUpperCase()}</Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Performance Index</Typography>
                                            <Box display="flex" alignItems="center" gap={0.5} mt={0.5} justifyContent="flex-end">
                                                <StarIcon sx={{ color: '#FFD700', fontSize: 18 }} />
                                                <Typography sx={{ fontWeight: 800, color: 'white', fontSize: '1.1rem' }}>{selectedDriver.rating}</Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                    {selectedDriver.currentTrip ? (
                                        <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.1)' }}>
                                            <Typography variant="caption" sx={{ color: '#FFD700', fontWeight: 800, textTransform: 'uppercase' }}>Active Handshake</Typography>
                                            <Box display="flex" alignItems="center" gap={2} mt={1}>
                                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,215,0,0.1)' }}>
                                                    <PersonIcon sx={{ color: '#FFD700', fontSize: 18 }} />
                                                </Avatar>
                                                <Box>
                                                    <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>{selectedDriver.currentTrip.passengerName}</Typography>
                                                    <Typography sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>En route to drop-off</Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    ) : (
                                        <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                                            <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', fontStyle: 'italic' }}>Awaiting dispatch request...</Typography>
                                        </Box>
                                    )}

                                    <Stack direction="row" spacing={2} mt={3}>
                                        <Button fullWidth variant="contained" sx={{ bgcolor: '#FFD700', color: 'black', fontWeight: 800, '&:hover': { bgcolor: '#E6C200' }, borderRadius: 2 }}>
                                            Message Node
                                        </Button>
                                        <Button fullWidth variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)', '&:hover': { borderColor: 'white' }, borderRadius: 2 }}>
                                            Node History
                                        </Button>
                                    </Stack>
                                </Paper>
                            </Fade>
                        )}
                    </Paper>
                </Box>
            </Box>
        </Fade>
    );
}

