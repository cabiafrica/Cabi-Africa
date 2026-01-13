import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Card,
    Grid,
    Typography,
    Box,
    Button,
    Chip,
    CircularProgress,
} from '@mui/material';
import {
    Add as AddIcon,
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    Gavel as GavelIcon,
    Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { occurrenceApi } from '../../services/occurrence.service';
import type { OccurrenceStats, Occurrence } from '../../types/occurrence.types';
import { CATEGORY_COLORS, CATEGORY_LABELS, SEVERITY_COLORS } from '../../types/occurrence.types';

export default function OccurrenceDashboard() {
    const [stats, setStats] = useState<OccurrenceStats | null>(null);
    const [recentOccurrences, setRecentOccurrences] = useState<Occurrence[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [statsData, occurrencesData] = await Promise.all([
                occurrenceApi.getStatistics(),
                occurrenceApi.getOccurrences({ limit: 10, page: 1 }),
            ]);
            setStats(statsData);
            setRecentOccurrences(occurrencesData.data);
        } catch (error) {
            console.error('Failed to load occurrence data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold">
                    Occurrence Book
                </Typography>
                <Button
                    component={Link}
                    to="/occurrences/register"
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{ bgcolor: '#DC2626', '&:hover': { bgcolor: '#B91C1C' } }}
                >
                    Register Occurrence
                </Button>
            </Box>

            {/* Statistics Cards */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ p: 3, bgcolor: '#FEF2F2', border: '1px solid #FEE2E2' }}>
                        <Box display="flex" alignItems="center" gap={2}>
                            <AssignmentIcon sx={{ fontSize: 40, color: '#DC2626' }} />
                            <Box>
                                <Typography variant="h4" fontWeight="bold">
                                    {stats?.total || 0}
                                </Typography>
                                <Typography color="text.secondary">Total Occurrences</Typography>
                            </Box>
                        </Box>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ p: 3, bgcolor: '#FEF3C7', border: '1px solid #FDE68A' }}>
                        <Box display="flex" alignItems="center" gap={2}>
                            <WarningIcon sx={{ fontSize: 40, color: '#F59E0B' }} />
                            <Box>
                                <Typography variant="h4" fontWeight="bold">
                                    {stats?.byStatus.open || 0}
                                </Typography>
                                <Typography color="text.secondary">Open Cases</Typography>
                            </Box>
                        </Box>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ p: 3, bgcolor: '#DCFCE7', border: '1px solid #BBF7D0' }}>
                        <Box display="flex" alignItems="center" gap={2}>
                            <CheckCircleIcon sx={{ fontSize: 40, color: '#10B981' }} />
                            <Box>
                                <Typography variant="h4" fontWeight="bold">
                                    {stats?.byStatus.resolved || 0}
                                </Typography>
                                <Typography color="text.secondary">Resolved</Typography>
                            </Box>
                        </Box>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ p: 3, bgcolor: '#EDE9FE', border: '1px solid #DDD6FE' }}>
                        <Box display="flex" alignItems="center" gap={2}>
                            <GavelIcon sx={{ fontSize: 40, color: '#9333EA' }} />
                            <Box>
                                <Typography variant="h4" fontWeight="bold">
                                    {stats?.byStatus.disputed || 0}
                                </Typography>
                                <Typography color="text.secondary">Disputed</Typography>
                            </Box>
                        </Box>
                    </Card>
                </Grid>
            </Grid>

            {/* Category Breakdown */}
            <Card sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                    By Category
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                    {stats && Object.entries(stats.byCategory).map(([category, count]) => (
                        <Chip
                            key={category}
                            label={`${CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}: ${count}`}
                            sx={{
                                bgcolor: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] + '20',
                                color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS],
                                fontWeight: 'bold',
                                borderColor: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS],
                                borderWidth: 1,
                                borderStyle: 'solid',
                            }}
                        />
                    ))}
                </Box>
            </Card>

            {/* Recent Occurrences */}
            <Card sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight="bold">
                        Recent Occurrences
                    </Typography>
                    <Button component={Link} to="/occurrences" variant="text">
                        View All
                    </Button>
                </Box>

                <Box>
                    {recentOccurrences.map((occurrence) => (
                        <Box
                            key={occurrence.id}
                            component={Link}
                            to={`/occurrences/${occurrence.id}`}
                            sx={{
                                display: 'block',
                                p: 2,
                                mb: 2,
                                border: '1px solid #E5E7EB',
                                borderRadius: 1,
                                textDecoration: 'none',
                                '&:hover': { bgcolor: '#F9FAFB' },
                            }}
                        >
                            <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                                        {occurrence.obNumber}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {occurrence.title}
                                    </Typography>
                                </Box>
                                <Box display="flex" gap={1}>
                                    <Chip
                                        label={CATEGORY_LABELS[occurrence.category]}
                                        size="small"
                                        sx={{
                                            bgcolor: CATEGORY_COLORS[occurrence.category] + '20',
                                            color: CATEGORY_COLORS[occurrence.category],
                                            fontWeight: 'bold',
                                        }}
                                    />
                                    <Chip
                                        label={occurrence.severity}
                                        size="small"
                                        sx={{
                                            bgcolor: SEVERITY_COLORS[occurrence.severity] + '20',
                                            color: SEVERITY_COLORS[occurrence.severity],
                                            fontWeight: 'bold',
                                        }}
                                    />
                                </Box>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                                📅 {new Date(occurrence.occurrenceDate).toLocaleDateString()} at {occurrence.occurrenceTime}
                                {occurrence.locationPlaceName && ` • 📍 ${occurrence.locationPlaceName}`}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Card>
        </Box>
    );
}
