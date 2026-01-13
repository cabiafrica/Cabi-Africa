import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Card,
    Typography,
    Button,
    TextField,
    MenuItem,
    Grid,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { occurrenceApi } from '../../services/occurrence.service';
import type { Occurrence } from '../../types/occurrence.types';
import {
    OccurrenceCategory,
    OccurrenceSeverity,
    OccurrenceStatus,
    CATEGORY_LABELS,
    CATEGORY_COLORS,
    SEVERITY_COLORS,
} from '../../types/occurrence.types';

export default function OccurrenceList() {
    const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [total, setTotal] = useState(0);

    const [filters, setFilters] = useState({
        category: '',
        severity: '',
        status: '',
        city: '',
        search: '',
    });

    useEffect(() => {
        loadOccurrences();
    }, [page, rowsPerPage, filters]);

    const loadOccurrences = async () => {
        try {
            setLoading(true);
            const params: any = {
                page: page + 1,
                limit: rowsPerPage,
            };

            if (filters.category) params.category = filters.category;
            if (filters.severity) params.severity = filters.severity;
            if (filters.status) params.status = filters.status;
            if (filters.city) params.city = filters.city;

            const response = await occurrenceApi.getOccurrences(params);
            setOccurrences(response.data);
            setTotal(response.meta.total);
        } catch (error) {
            console.error('Failed to load occurrences:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field: string, value: string) => {
        setFilters({ ...filters, [field]: value });
        setPage(0);
    };

    const handleClearFilters = () => {
        setFilters({
            category: '',
            severity: '',
            status: '',
            city: '',
            search: '',
        });
        setPage(0);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString();
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold">
                    All Occurrences
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

            {/* Filters */}
            <Card sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                    Filters
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            select
                            label="Category"
                            value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                        >
                            <MenuItem value="">All Categories</MenuItem>
                            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                                <MenuItem key={value} value={value}>
                                    {label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            select
                            label="Severity"
                            value={filters.severity}
                            onChange={(e) => handleFilterChange('severity', e.target.value)}
                        >
                            <MenuItem value="">All Severities</MenuItem>
                            {Object.values(OccurrenceSeverity).map((severity) => (
                                <MenuItem key={severity} value={severity}>
                                    {severity}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            select
                            label="Status"
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <MenuItem value="">All Statuses</MenuItem>
                            {Object.values(OccurrenceStatus).map((status) => (
                                <MenuItem key={status} value={status}>
                                    {status}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            label="City"
                            placeholder="e.g., Nairobi"
                            value={filters.city}
                            onChange={(e) => handleFilterChange('city', e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Box display="flex" gap={2}>
                            <Button variant="outlined" onClick={handleClearFilters}>
                                Clear Filters
                            </Button>
                            <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
                                Showing {occurrences.length} of {total} occurrences
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Card>

            {/* Table */}
            <Card>
                {loading ? (
                    <Box display="flex" justifyContent="center" p={4}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                                        <TableCell><strong>OB Number</strong></TableCell>
                                        <TableCell><strong>Title</strong></TableCell>
                                        <TableCell><strong>Category</strong></TableCell>
                                        <TableCell><strong>Severity</strong></TableCell>
                                        <TableCell><strong>Date</strong></TableCell>
                                        <TableCell><strong>Location</strong></TableCell>
                                        <TableCell><strong>Status</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {occurrences.map((occurrence) => (
                                        <TableRow
                                            key={occurrence.id}
                                            component={Link}
                                            to={`/occurrences/${occurrence.id}`}
                                            sx={{
                                                textDecoration: 'none',
                                                '&:hover': { bgcolor: '#F9FAFB', cursor: 'pointer' },
                                            }}
                                        >
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="bold" color="primary">
                                                    {occurrence.obNumber}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" noWrap sx={{ maxWidth: 250 }}>
                                                    {occurrence.title}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={CATEGORY_LABELS[occurrence.category]}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: CATEGORY_COLORS[occurrence.category] + '20',
                                                        color: CATEGORY_COLORS[occurrence.category],
                                                        fontWeight: 'bold',
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={occurrence.severity}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: SEVERITY_COLORS[occurrence.severity] + '20',
                                                        color: SEVERITY_COLORS[occurrence.severity],
                                                        fontWeight: 'bold',
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {formatDate(occurrence.occurrenceDate)}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {occurrence.occurrenceTime}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                                                    {occurrence.locationPlaceName || occurrence.locationCity || 'N/A'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={occurrence.status}
                                                    size="small"
                                                    color={occurrence.status === 'RESOLVED' ? 'success' : 'warning'}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <TablePagination
                            component="div"
                            count={total}
                            page={page}
                            onPageChange={(_, newPage) => setPage(newPage)}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(e) => {
                                setRowsPerPage(parseInt(e.target.value, 10));
                                setPage(0);
                            }}
                            rowsPerPageOptions={[10, 20, 50, 100]}
                        />
                    </>
                )}
            </Card>
        </Box>
    );
}
