import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    InputAdornment,
    TextField,
    Avatar,
    alpha,
    useTheme,
    Tooltip,
    Tabs,
    Tab
} from '@mui/material';
import {
    Policy,
    Download,
    DeleteForever,
    MoreVert,
    Search,
    History,
    AssignmentTurnedIn,
    HourglassEmpty,
    PrivacyTip,
    FilterList
} from '@mui/icons-material';

interface Request {
    id: string;
    type: 'DATA_EXPORT' | 'ACCOUNT_DELETION';
    userId: string;
    userName: string;
    userEmail: string;
    status: 'COMPLETED' | 'PENDING' | 'PROCESSING' | 'FAILED';
    requestedAt: string;
    completedAt?: string;
    scheduledFor?: string;
}

export default function PrivacyCompliancePage() {
    const theme = useTheme();
    const [requests, setRequests] = useState<Request[]>([
        {
            id: 'export_1',
            type: 'DATA_EXPORT',
            userId: 'user_123',
            userName: 'Alice Johnson',
            userEmail: 'alice@example.com',
            status: 'COMPLETED',
            requestedAt: '2024-12-10',
            completedAt: '2024-12-11',
        },
        {
            id: 'deletion_1',
            type: 'ACCOUNT_DELETION',
            userId: 'user_456',
            userName: 'Bob Smith',
            userEmail: 'bob@example.com',
            status: 'PENDING',
            requestedAt: '2024-12-12',
            scheduledFor: '2025-01-11',
        },
        {
            id: 'export_2',
            type: 'DATA_EXPORT',
            userId: 'user_789',
            userName: 'Charlie Brown',
            userEmail: 'charlie@example.com',
            status: 'PROCESSING',
            requestedAt: '2024-12-13',
        },
    ]);

    const [tabValue, setTabValue] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredRequests = requests.filter(r => {
        const matchesTab = tabValue === 0 ? true :
            tabValue === 1 ? r.type === 'DATA_EXPORT' :
                r.type === 'ACCOUNT_DELETION';
        const matchesSearch = r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const getStatusChip = (status: Request['status']) => {
        const config = {
            COMPLETED: { color: 'success', icon: <AssignmentTurnedIn fontSize="small" /> },
            PENDING: { color: 'warning', icon: <HourglassEmpty fontSize="small" /> },
            PROCESSING: { color: 'info', icon: <History fontSize="small" /> },
            FAILED: { color: 'error', icon: <MoreVert fontSize="small" /> }
        };
        const { color, icon } = config[status] || { color: 'default', icon: null };
        return <Chip icon={icon} label={status} color={color as any} size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />;
    };

    const stats = [
        { label: 'Total Requests', value: requests.length, color: theme.palette.primary.main, icon: <Policy /> },
        { label: 'Data Exports', value: requests.filter(r => r.type === 'DATA_EXPORT').length, color: theme.palette.info.main, icon: <Download /> },
        { label: 'Deletions', value: requests.filter(r => r.type === 'ACCOUNT_DELETION').length, color: theme.palette.error.main, icon: <DeleteForever /> },
        { label: 'Pending', value: requests.filter(r => r.status === 'PENDING').length, color: theme.palette.warning.main, icon: <HourglassEmpty /> }
    ];

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Header */}
            <Box mb={4}>
                <Typography variant="h4" fontWeight="800" sx={{
                    background: 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                }}>
                    Privacy & Compliance
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Monitor and manage GDPR/CCPA data privacy requests from users.
                </Typography>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} mb={4}>
                {stats.map((stat) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.label}>
                        <Paper sx={{
                            p: 3,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: alpha(theme.palette.background.paper, 0.4),
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2
                        }}>
                            <Avatar sx={{ bgcolor: alpha(stat.color, 0.1), color: stat.color }}>
                                {stat.icon}
                            </Avatar>
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ textTransform: 'uppercase' }}>
                                    {stat.label}
                                </Typography>
                                <Typography variant="h5" fontWeight="bold">
                                    {stat.value}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* Main Content Area */}
            <Paper sx={{
                borderRadius: 4,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: alpha(theme.palette.background.paper, 0.6),
                backdropFilter: 'blur(20px)'
            }}>
                <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 3, pt: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} textColor="primary" indicatorColor="primary">
                            <Tab label="All Requests" />
                            <Tab label="Data Exports" />
                            <Tab label="Account Deletions" />
                        </Tabs>

                        <TextField
                            size="small"
                            placeholder="Search user..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search fontSize="small" color="action" />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 2, width: 250, bgcolor: 'background.paper' }
                            }}
                        />
                    </Box>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>User Details</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Requested At</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Fulfillment Info</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredRequests.map((request) => (
                                <TableRow key={request.id} hover>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1.5}>
                                            <Avatar sx={{
                                                width: 32,
                                                height: 32,
                                                bgcolor: alpha(request.type === 'DATA_EXPORT' ? theme.palette.info.main : theme.palette.error.main, 0.1),
                                                color: request.type === 'DATA_EXPORT' ? theme.palette.info.main : theme.palette.error.main
                                            }}>
                                                {request.type === 'DATA_EXPORT' ? <Download fontSize="small" /> : <DeleteForever fontSize="small" />}
                                            </Avatar>
                                            <Typography variant="body2" fontWeight="bold">
                                                {request.type === 'DATA_EXPORT' ? 'Data Export' : 'Deletion'}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="medium">{request.userName}</Typography>
                                        <Typography variant="caption" color="text.secondary">{request.userEmail}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{new Date(request.requestedAt).toLocaleDateString()}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusChip(request.status)}
                                    </TableCell>
                                    <TableCell>
                                        {request.completedAt && (
                                            <Typography variant="caption" display="block" color="success.main">
                                                <b>Completed:</b> {request.completedAt}
                                            </Typography>
                                        )}
                                        {request.scheduledFor && (
                                            <Typography variant="caption" display="block" color="warning.main">
                                                <b>Scheduled:</b> {request.scheduledFor}
                                            </Typography>
                                        )}
                                        {!request.completedAt && !request.scheduledFor && (
                                            <Typography variant="caption" color="text.disabled italic">Processing...</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="View Details">
                                            <IconButton size="small"><MoreVert fontSize="small" /></IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Compliance Info Note */}
            <Paper sx={{
                mt: 4,
                p: 3,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.info.main, 0.05),
                border: '1px solid',
                borderColor: alpha(theme.palette.info.main, 0.2),
                display: 'flex',
                gap: 2
            }}>
                <PrivacyTip color="info" />
                <Box>
                    <Typography variant="subtitle2" fontWeight="bold" color="info.main" mb={1}>
                        Compliance Requirements Summary
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="caption" component="div">• GDPR/CCPA: Data export must be fulfilled within 30-45 days.</Typography>
                            <Typography variant="caption" component="div">• Account Deletions: 30-day grace period before permanent erasure.</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="caption" component="div">• Data Minimization: Only retain financial records as legally required.</Typography>
                            <Typography variant="caption" component="div">• Audit Trail: Every compliance action is logged in the System Audit.</Typography>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Box>
    );
}
