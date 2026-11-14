import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Chip, TextField, InputAdornment, Grow, Avatar, Tooltip
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Search as SearchIcon,
    Security as SecurityIcon,
    AdminPanelSettings as AdminIcon,
    Smartphone as MobileIcon,
    Web as WebIcon,
    Dns as ApiIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { roleService, Role } from '../../services/roleService';

const RolesList: React.FC = () => {
    const navigate = useNavigate();
    const [roles, setRoles] = useState<Role[]>([]);
    const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadRoles();
    }, []);

    useEffect(() => {
        setFilteredRoles(
            roles.filter(role =>
                role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                role.displayName.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [searchTerm, roles]);

    const loadRoles = async () => {
        try {
            const data = await roleService.getAllRoles();
            setRoles(data);
        } catch (error) {
            console.error('Failed to load roles', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete role "${name}"?`)) {
            try {
                await roleService.deleteRole(id);
                loadRoles();
            } catch (error) {
                console.error('Failed to delete role', error);
                alert('Failed to delete role');
            }
        }
    };

    const getPlatformIcon = (platform: string) => {
        switch (platform) {
            case 'ADMIN_PANEL': return <AdminIcon fontSize="small" />;
            case 'DISPATCH_PANEL': return <WebIcon fontSize="small" />;
            case 'USER_PORTAL': return <WebIcon fontSize="small" />;
            case 'MOBILE_APP': return <MobileIcon fontSize="small" />;
            default: return <ApiIcon fontSize="small" />;
        }
    };

    const getPlatformColor = (platform: string) => {
        switch (platform) {
            case 'ADMIN_PANEL': return 'warning';
            case 'DISPATCH_PANEL': return 'warning';
            case 'USER_PORTAL': return 'success';
            case 'MOBILE_APP': return 'default';
            default: return 'default';
        }
    };

    return (
        <Box sx={{
            p: { xs: 2, md: 4 },
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #121212 0%, #000000 100%)',
            color: 'white'
        }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} sx={{
                background: 'rgba(255,255,255,0.03)',
                p: 3,
                borderRadius: 4,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.05)'
            }}>
                <Box>
                    <Typography variant="h4" fontWeight="800" sx={{
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 1
                    }}>
                        Roles & Permissions
                    </Typography>
                    <Typography variant="body2" color="gray">
                        Manage system access levels and permissions across all platforms
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/roles/new')}
                    sx={{
                        backgroundColor: '#F59E0B',
                        color: '#0a0a0a',
                        '&:hover': { backgroundColor: '#D97706' },
                        fontWeight: 'bold',
                        px: 3, py: 1
                    }}
                >
                    Create New Role
                </Button>
            </Box>

            {/* Search Bar */}
            <Box mb={3}>
                <TextField
                    fullWidth
                    variant="filled"
                    placeholder="Search roles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'gray' }} /></InputAdornment>,
                        sx: {
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: 2,
                            border: '1px solid rgba(255,255,255,0.05)',
                            color: 'white',
                            '&:hover': { background: 'rgba(255,255,255,0.08)' }
                        }
                    }}
                />
            </Box>

            {/* Roles Table */}
            <TableContainer component={Paper} elevation={0} sx={{
                background: 'rgba(30, 30, 30, 0.4)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 4
            }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ color: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Role Name</TableCell>
                            <TableCell sx={{ color: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Platform</TableCell>
                            <TableCell sx={{ color: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Permissions</TableCell>
                            <TableCell sx={{ color: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Status</TableCell>
                            <TableCell align="right" sx={{ color: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredRoles.map((role, index) => (
                            <Grow in={true} timeout={300 + (index * 50)} key={role.id}>
                                <TableRow hover sx={{
                                    '&:hover': { background: 'rgba(255,255,255,0.02) !important' },
                                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'white' }}>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Avatar sx={{ bgcolor: 'rgba(245, 158, 11, 0.18)', color: '#F59E0B' }}>
                                                <SecurityIcon fontSize="small" />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body1" fontWeight="bold">{role.displayName}</Typography>
                                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>{role.name}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Chip
                                            icon={getPlatformIcon(role.platform)}
                                            label={role.platform.replace('_', ' ')}
                                            size="small"
                                            color={getPlatformColor(role.platform) as any}
                                            variant="outlined"
                                            sx={{ border: '1px solid rgba(255,255,255,0.2)' }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Chip
                                            label={`${role.permissions.length} Access Points`}
                                            size="small"
                                            sx={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Chip
                                            label={role.isActive ? "Active" : "Inactive"}
                                            size="small"
                                            color={role.isActive ? "success" : "default"}
                                            sx={{ height: 24 }}
                                        />
                                    </TableCell>
                                    <TableCell align="right" sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Box>
                                            <Tooltip title="Edit Role">
                                                <IconButton
                                                    onClick={() => navigate(`/roles/${role.id}`)}
                                                    sx={{ color: '#F59E0B' }}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            {!role.isSystem && (
                                                <Tooltip title="Delete Role">
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => handleDelete(role.id, role.displayName)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            </Grow>
                        ))}
                        {filteredRoles.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 8, color: 'gray', borderBottom: 'none' }}>
                                    <SecurityIcon sx={{ fontSize: 60, mb: 2, opacity: 0.2 }} />
                                    <Typography>No roles found matching "{searchTerm}"</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default RolesList;
