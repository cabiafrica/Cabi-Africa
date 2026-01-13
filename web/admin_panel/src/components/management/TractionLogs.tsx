import React, { useState, useEffect, useMemo } from 'react';
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
    TextField,
    Grid,
    Button,
    TablePagination,
    IconButton,
    InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FilterListIcon from '@mui/icons-material/FilterList';

interface TractionLog {
    id: string;
    date: string;
    userId: string;
    userName: string;
    type: 'RIDE' | 'COMMISSION' | 'PAYOUT' | 'REFUND';
    amount: number;
    status: 'COMPLETED' | 'PENDING' | 'FAILED';
    description: string;
}

export const TractionLogs: React.FC = () => {
    const [logs, setLogs] = useState<TractionLog[]>([]);
    const [filterText, setFilterText] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data fetching
        const mockLogs: TractionLog[] = [
            { id: 'TRX-9821', date: new Date().toISOString(), userId: 'USR-001', userName: 'John Doe', type: 'RIDE', amount: 450, status: 'COMPLETED', description: 'Nairobi to Westlands' },
            { id: 'TRX-9822', date: new Date(Date.now() - 3600000).toISOString(), userId: 'DRV-556', userName: 'Jane Smith', type: 'COMMISSION', amount: -45, status: 'COMPLETED', description: 'Platform fee for TRX-9821' },
            { id: 'TRX-9823', date: new Date(Date.now() - 7200000).toISOString(), userId: 'DRV-556', userName: 'Jane Smith', type: 'PAYOUT', amount: -1200, status: 'PENDING', description: 'Weekly earnings payout' },
            { id: 'TRX-9824', date: new Date(Date.now() - 86400000).toISOString(), userId: 'USR-088', userName: 'Bob Wilson', type: 'RIDE', amount: 820, status: 'FAILED', description: 'Airport Transfer' },
        ];

        setTimeout(() => {
            setLogs(mockLogs);
            setLoading(false);
        }, 1000);
    }, []);

    const filteredLogs = useMemo(() => {
        return logs.filter(log =>
            log.id.toLowerCase().includes(filterText.toLowerCase()) ||
            log.userName.toLowerCase().includes(filterText.toLowerCase()) ||
            log.description.toLowerCase().includes(filterText.toLowerCase()) ||
            log.type.toLowerCase().includes(filterText.toLowerCase())
        );
    }, [logs, filterText]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'success';
            case 'PENDING': return 'warning';
            case 'FAILED': return 'error';
            default: return 'default';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'RIDE': return 'primary';
            case 'COMMISSION': return 'secondary';
            case 'PAYOUT': return 'info';
            case 'REFUND': return 'error';
            default: return 'default';
        }
    };

    const handleExport = () => {
        alert('Exporting logs as CSV...');
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>Traction Logs</Typography>
                <Button
                    variant="contained"
                    startIcon={<FileDownloadIcon />}
                    onClick={handleExport}
                    sx={{ borderRadius: 2, textTransform: 'none', bgcolor: 'primary.main' }}
                >
                    Export CSV
                </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            placeholder="Search by ID, User, or Type..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 2 }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
                        <IconButton>
                            <FilterListIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            </Paper>

            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Log ID</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Amount (KES)</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}>Loading traction logs...</TableCell></TableRow>
                        ) : filteredLogs
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((log) => (
                                <TableRow key={log.id} hover>
                                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'primary.main' }}>{log.id}</TableCell>
                                    <TableCell>{new Date(log.date).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{log.userName}</Typography>
                                        <Typography variant="caption" color="text.secondary">{log.userId}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={log.type} size="small" color={getTypeColor(log.type)} sx={{ fontWeight: 700, borderRadius: 1.5 }} />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: log.amount < 0 ? 'error.main' : 'success.main' }}>
                                        {log.amount < 0 ? '-' : '+'} {Math.abs(log.amount).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={log.status} size="small" variant="outlined" color={getStatusColor(log.status)} sx={{ fontWeight: 700, borderRadius: 1.5 }} />
                                    </TableCell>
                                    <TableCell>{log.description}</TableCell>
                                </TableRow>
                            ))}
                        {!loading && filteredLogs.length === 0 && (
                            <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}>No records found matching your search.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredLogs.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                />
            </TableContainer>
        </Box>
    );
};
