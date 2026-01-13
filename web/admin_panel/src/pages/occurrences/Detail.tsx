import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Box,
    Card,
    Typography,
    Chip,
    Button,
    Grid,
    CircularProgress,
    Alert,
    Divider,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    CheckCircle as ResolveIcon,
    Flag as FlagIcon,
} from '@mui/icons-material';
import { occurrenceApi } from '../../services/occurrence.service';
import type { Occurrence } from '../../types/occurrence.types';
import {
    CATEGORY_LABELS,
    CATEGORY_COLORS,
    SEVERITY_COLORS,
} from '../../types/occurrence.types';

export default function OccurrenceDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [occurrence, setOccurrence] = useState<Occurrence | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
    const [resolutionNotes, setResolutionNotes] = useState('');
    const [resolving, setResolving] = useState(false);

    useEffect(() => {
        if (id) loadOccurrence();
    }, [id]);

    const loadOccurrence = async () => {
        try {
            setLoading(true);
            const data = await occurrenceApi.getOccurrence(id!);
            setOccurrence(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load occurrence');
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async () => {
        if (!resolutionNotes.trim()) {
            alert('Please provide resolution notes');
            return;
        }

        try {
            setResolving(true);
            await occurrenceApi.resolveOccurrence(id!, {
                resolvedById: localStorage.getItem('userId') || 'admin',
                resolutionNotes,
            });
            setResolveDialogOpen(false);
            loadOccurrence();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to resolve occurrence');
        } finally {
            setResolving(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (error || !occurrence) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error || 'Occurrence not found'}</Alert>
                <Button component={Link} to="/occurrences" sx={{ mt: 2 }}>
                    Back to List
                </Button>
            </Box>
        );
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Button
                        startIcon={<BackIcon />}
                        onClick={() => navigate('/occurrences')}
                        variant="outlined"
                    >
                        Back
                    </Button>
                    <Typography variant="h4" fontWeight="bold">
                        {occurrence.obNumber}
                    </Typography>
                </Box>
                {occurrence.status !== 'RESOLVED' && (
                    <Button
                        variant="contained"
                        startIcon={<ResolveIcon />}
                        onClick={() => setResolveDialogOpen(true)}
                        sx={{ bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' } }}
                    >
                        Resolve
                    </Button>
                )}
            </Box>

            {/* Main Info Card */}
            <Card sx={{ p: 3, mb: 3, bgcolor: '#F9FAFB', border: '2px solid #E5E7EB' }}>
                <Box display="flex" gap={2} mb={2}>
                    <Chip
                        label={CATEGORY_LABELS[occurrence.category]}
                        sx={{
                            bgcolor: CATEGORY_COLORS[occurrence.category] + '20',
                            color: CATEGORY_COLORS[occurrence.category],
                            fontWeight: 'bold',
                            borderColor: CATEGORY_COLORS[occurrence.category],
                            borderWidth: 1,
                            borderStyle: 'solid',
                        }}
                    />
                    <Chip
                        label={`${occurrence.severity} SEVERITY`}
                        sx={{
                            bgcolor: SEVERITY_COLORS[occurrence.severity] + '20',
                            color: SEVERITY_COLORS[occurrence.severity],
                            fontWeight: 'bold',
                        }}
                    />
                    <Chip
                        label={occurrence.status}
                        color={occurrence.status === 'RESOLVED' ? 'success' : 'warning'}
                    />
                </Box>

                <Typography variant="h5" fontWeight="bold" mb={2}>
                    {occurrence.title}
                </Typography>

                <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 1, mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" mb={1}>
                        📅 Date & Time
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                        {formatDate(occurrence.occurrenceDate)} at {occurrence.occurrenceTime}
                    </Typography>
                </Box>

                {(occurrence.locationPlaceName || occurrence.locationAddress) && (
                    <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary" mb={1}>
                            📍 Location
                        </Typography>
                        {occurrence.locationPlaceName && (
                            <Typography variant="body1" fontWeight="bold">
                                {occurrence.locationPlaceName}
                            </Typography>
                        )}
                        {occurrence.locationAddress && (
                            <Typography variant="body2" color="text.secondary">
                                {occurrence.locationAddress}
                            </Typography>
                        )}
                        {occurrence.locationCity && (
                            <Typography variant="body2" color="text.secondary">
                                {occurrence.locationCity}, {occurrence.locationCountry}
                            </Typography>
                        )}
                        {occurrence.locationLat && occurrence.locationLng && (
                            <Typography variant="caption" color="text.secondary">
                                {occurrence.locationLat}°, {occurrence.locationLng}°
                            </Typography>
                        )}
                    </Box>
                )}
            </Card>

            {/* Description */}
            <Card sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                    Description
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {occurrence.description}
                </Typography>
            </Card>

            {/* Involved Parties */}
            <Card sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                    Involved Parties
                </Typography>
                <Grid container spacing={2}>
                    {occurrence.passenger && (
                        <Grid item xs={12} md={4}>
                            <Box sx={{ p: 2, bgcolor: '#F3F4F6', borderRadius: 1 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Passenger
                                </Typography>
                                <Typography variant="body1" fontWeight="bold">
                                    {occurrence.passenger.fullName || 'N/A'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    ID: {occurrence.passengerId}
                                </Typography>
                            </Box>
                        </Grid>
                    )}
                    {occurrence.driver && (
                        <Grid item xs={12} md={4}>
                            <Box sx={{ p: 2, bgcolor: '#F3F4F6', borderRadius: 1 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Driver
                                </Typography>
                                <Typography variant="body1" fontWeight="bold">
                                    {occurrence.driver.user?.fullName || 'N/A'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    ID: {occurrence.driverId}
                                </Typography>
                            </Box>
                        </Grid>
                    )}
                    {occurrence.vehicle && (
                        <Grid item xs={12} md={4}>
                            <Box sx={{ p: 2, bgcolor: '#F3F4F6', borderRadius: 1 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Vehicle
                                </Typography>
                                <Typography variant="body1" fontWeight="bold">
                                    {occurrence.vehicle.plateNumber || 'N/A'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {occurrence.vehicle.make} {occurrence.vehicle.model}
                                </Typography>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            </Card>

            {/* Source Info */}
            <Card sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                    Source Information
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Source
                        </Typography>
                        <Chip label={occurrence.source} size="small" />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Registered By
                        </Typography>
                        <Typography variant="body1">
                            {occurrence.registeredBy?.fullName || 'System'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {new Date(occurrence.registeredAt).toLocaleString()}
                        </Typography>
                    </Grid>
                </Grid>
            </Card>

            {/* Resolution Info */}
            {occurrence.status === 'RESOLVED' && (
                <Card sx={{ p: 3, mb: 3, bgcolor: '#DCFCE7', border: '1px solid #BBF7D0' }}>
                    <Typography variant="h6" fontWeight="bold" mb={2} color="#059669">
                        ✓ Resolved
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                        Resolved by: {occurrence.resolvedBy?.fullName || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        Date: {occurrence.resolvedAt && new Date(occurrence.resolvedAt).toLocaleString()}
                    </Typography>
                    <Typography variant="body1">{occurrence.resolutionNotes}</Typography>
                </Card>
            )}

            {/* Tags */}
            {occurrence.tags && occurrence.tags.length > 0 && (
                <Card sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                        Tags
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                        {occurrence.tags.map((tag, index) => (
                            <Chip key={index} label={tag} size="small" variant="outlined" />
                        ))}
                    </Box>
                </Card>
            )}

            {/* Resolve Dialog */}
            <Dialog open={resolveDialogOpen} onClose={() => setResolveDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Resolve Occurrence</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Resolution Notes"
                        placeholder="Describe how this occurrence was resolved..."
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setResolveDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleResolve}
                        variant="contained"
                        disabled={resolving}
                        sx={{ bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' } }}
                    >
                        {resolving ? 'Resolving...' : 'Resolve'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
