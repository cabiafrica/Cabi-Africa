import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    TextField,
    Button,
    MenuItem,
    Grid,
    Typography,
    Chip,
    Alert,
    CircularProgress,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { occurrenceApi } from '../../services/occurrence.service';
import {
    OccurrenceCategory,
    OccurrenceSeverity,
    CATEGORY_LABELS,
    CATEGORY_COLORS,
    SEVERITY_COLORS,
} from '../../types/occurrence.types';

export default function RegisterOccurrence() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        category: '' as OccurrenceCategory,
        severity: '' as OccurrenceSeverity,
        title: '',
        description: '',
        occurrenceDate: new Date().toISOString().split('T')[0],
        occurrenceTime: new Date().toTimeString().slice(0, 5),
        locationLat: '',
        locationLng: '',
        locationAddress: '',
        locationPlaceName: '',
        locationCity: 'Nairobi',
        driverId: '',
        passengerId: '',
        vehicleId: '',
        rideId: '',
        tags: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = {
                category: formData.category,
                severity: formData.severity,
                title: formData.title,
                description: formData.description,
                occurrenceDate: formData.occurrenceDate,
                occurrenceTime: formData.occurrenceTime,
                location: {
                    lat: formData.locationLat ? parseFloat(formData.locationLat) : undefined,
                    lng: formData.locationLng ? parseFloat(formData.locationLng) : undefined,
                    address: formData.locationAddress,
                    placeName: formData.locationPlaceName,
                    city: formData.locationCity,
                },
                driverId: formData.driverId || undefined,
                passengerId: formData.passengerId || undefined,
                vehicleId: formData.vehicleId || undefined,
                rideId: formData.rideId || undefined,
                source: 'MANUAL',
                registeredById: localStorage.getItem('userId') || 'admin',
                tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
            };

            const occurrence = await occurrenceApi.createOccurrence(data);
            navigate(`/occurrences/${occurrence.id}`);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create occurrence');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            <Typography variant="h4" fontWeight="bold" mb={3}>
                Register New Occurrence
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <form onSubmit={handleSubmit}>
                <Card sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold" mb={2} sx={{ color: '#DC2626' }}>
                        📅 TIME, DATE & PLACE (Required)
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                required
                                type="date"
                                label="Date"
                                value={formData.occurrenceDate}
                                onChange={(e) => setFormData({ ...formData, occurrenceDate: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                required
                                type="time"
                                label="Time"
                                value={formData.occurrenceTime}
                                onChange={(e) => setFormData({ ...formData, occurrenceTime: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                                📍 Location
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Place/Landmark Name"
                                placeholder="e.g., Westlands Roundabout"
                                value={formData.locationPlaceName}
                                onChange={(e) => setFormData({ ...formData, locationPlaceName: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="City"
                                value={formData.locationCity}
                                onChange={(e) => setFormData({ ...formData, locationCity: e.target.value })}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Address"
                                placeholder="e.g., Waiyaki Way, Westlands"
                                value={formData.locationAddress}
                                onChange={(e) => setFormData({ ...formData, locationAddress: e.target.value })}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Latitude"
                                type="number"
                                placeholder="-1.2634"
                                value={formData.locationLat}
                                onChange={(e) => setFormData({ ...formData, locationLat: e.target.value })}
                                inputProps={{ step: 'any' }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Longitude"
                                type="number"
                                placeholder="36.8047"
                                value={formData.locationLng}
                                onChange={(e) => setFormData({ ...formData, locationLng: e.target.value })}
                                inputProps={{ step: 'any' }}
                            />
                        </Grid>
                    </Grid>
                </Card>

                <Card sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                        Categorization
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                required
                                select
                                label="Category"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value as OccurrenceCategory })}
                            >
                                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                                    <MenuItem key={value} value={value}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Box
                                                sx={{
                                                    width: 12,
                                                    height: 12,
                                                    borderRadius: '50%',
                                                    bgcolor: CATEGORY_COLORS[value as OccurrenceCategory],
                                                }}
                                            />
                                            {label}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                required
                                select
                                label="Severity"
                                value={formData.severity}
                                onChange={(e) => setFormData({ ...formData, severity: e.target.value as OccurrenceSeverity })}
                            >
                                {Object.values(OccurrenceSeverity).map((severity) => (
                                    <MenuItem key={severity} value={severity}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Box
                                                sx={{
                                                    width: 12,
                                                    height: 12,
                                                    borderRadius: '50%',
                                                    bgcolor: SEVERITY_COLORS[severity],
                                                }}
                                            />
                                            {severity}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                required
                                label="Title"
                                placeholder="Brief description of the incident"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                required
                                multiline
                                rows={4}
                                label="Description"
                                placeholder="Detailed description of what happened..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                </Card>

                <Card sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                        Involved Parties (At least one required)
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Driver ID"
                                placeholder="UUID of driver"
                                value={formData.driverId}
                                onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Passenger ID"
                                placeholder="UUID of passenger"
                                value={formData.passengerId}
                                onChange={(e) => setFormData({ ...formData, passengerId: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Vehicle ID"
                                placeholder="UUID of vehicle"
                                value={formData.vehicleId}
                                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Ride ID"
                                placeholder="UUID of ride"
                                value={formData.rideId}
                                onChange={(e) => setFormData({ ...formData, rideId: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                </Card>

                <Card sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                        Additional Information
                    </Typography>

                    <TextField
                        fullWidth
                        label="Tags"
                        placeholder="Comma-separated tags (e.g., urgent, follow-up, police-report)"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        helperText="Separate tags with commas"
                    />
                </Card>

                <Box display="flex" gap={2} justifyContent="flex-end">
                    <Button
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        onClick={() => navigate('/occurrences')}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                        disabled={loading}
                        sx={{ bgcolor: '#DC2626', '&:hover': { bgcolor: '#B91C1C' } }}
                    >
                        {loading ? 'Creating...' : 'Register Occurrence'}
                    </Button>
                </Box>
            </form>
        </Box>
    );
}
