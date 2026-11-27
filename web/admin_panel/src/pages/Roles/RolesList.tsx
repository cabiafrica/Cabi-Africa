import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { UserAccessTabs } from '../../components/management/UserAccessTabs';
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
    Dns as ApiIcon,
    People as PeopleIcon,
    SupervisorAccount as SupervisorAccountIcon,
    Person as PersonIcon,
    VpnKey as VpnKeyIcon,
    DirectionsCar as DirectionsCarIcon,
    HeadsetMic as HeadsetMicIcon,
    AccountBalance as AccountBalanceIcon,
    VerifiedUser as VerifiedUserIcon,
    Assessment as AssessmentIcon,
    LocalPolice as LocalPoliceIcon,
    Badge as BadgeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { roleService, Role } from '../../services/roleService';

const getRoleIconElement = (iconName?: string) => {
    switch (iconName) {
        case 'AdminPanelSettings': return <AdminIcon fontSize="small" />;
        case 'Security': return <SecurityIcon fontSize="small" />;
        case 'SupervisorAccount': return <SupervisorAccountIcon fontSize="small" />;
        case 'Person': return <PersonIcon fontSize="small" />;
        case 'VpnKey': return <VpnKeyIcon fontSize="small" />;
        case 'DirectionsCar': return <DirectionsCarIcon fontSize="small" />;
        case 'HeadsetMic': return <HeadsetMicIcon fontSize="small" />;
        case 'AccountBalance': return <AccountBalanceIcon fontSize="small" />;
        case 'VerifiedUser': return <VerifiedUserIcon fontSize="small" />;
        case 'Assessment': return <AssessmentIcon fontSize="small" />;
        case 'LocalPolice': return <LocalPoliceIcon fontSize="small" />;
        case 'Badge': return <BadgeIcon fontSize="small" />;
        default: return <SecurityIcon fontSize="small" />;
    }
};

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
            color: 'white'
        }}>
            {/* Header Section */}
            <PageHeader
                category="Growth & Platform"
                title="Roles & Permissions"
                subtitle="Manage system access levels and permissions across all operational platforms"
                icon={<SecurityIcon className="w-5 h-5 text-amber-500" />}
                actions={
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={() => navigate('/users')}
                            className="px-3.5 py-2 rounded-[4px] bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                            <AdminIcon fontSize="small" className="text-amber-500" />
                            <span>Admin Users</span>
                        </button>
                        <button
                            onClick={() => navigate('/platform-users')}
                            className="px-3.5 py-2 rounded-[4px] bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                            <PeopleIcon fontSize="small" className="text-amber-500" />
                            <span>Platform Users</span>
                        </button>
                        <button
                            onClick={() => navigate('/roles/new')}
                            className="btn-primary flex items-center gap-1.5 text-xs py-2 px-3.5 rounded-[4px] cursor-pointer"
                        >
                            <AddIcon fontSize="small" />
                            <span>+ Create New Role</span>
                        </button>
                    </div>
                }
            />

            <UserAccessTabs activeTab="roles" />

            {/* Search Bar */}
            <Box mb={3} mt={3}>
                <TextField
                    fullWidth
                    variant="filled"
                    placeholder="Search roles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94a3b8' }} /></InputAdornment>,
                        sx: {
                            background: '#0a0a0a',
                            borderRadius: '3px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: 'white',
                            fontSize: '0.8125rem',
                            '&:hover': { background: '#131722' }
                        }
                    }}
                />
            </Box>

            {/* Roles Table */}
            <TableContainer component={Paper} elevation={0} sx={{
                background: '#131722',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '3px'
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
                                                {getRoleIconElement(role.icon)}
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
