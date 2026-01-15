import React, { useEffect, useState, useMemo } from 'react';
import {
    Box, Typography, Button, Paper, TextField, Grid,
    FormControlLabel, Checkbox, Divider, Switch, Card, CardContent,
    InputAdornment, IconButton, Tooltip, Fade, Grow, Chip
} from '@mui/material';
import {
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon,
    Search as SearchIcon,
    CheckCircle as CheckAllIcon,
    Cancel as CancelIcon,
    Security as SecurityIcon,
    AdminPanelSettings as AdminIcon,
    Smartphone as MobileIcon,
    Web as WebIcon,
    Dns as ApiIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { roleService } from '../../services/roleService';
import { PERMISSION_CATEGORIES, PERMISSIONS_LIST } from '../../constants/permissions';

const RoleEditor: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = id && id !== 'new';

    const [formData, setFormData] = useState({
        name: '',
        displayName: '',
        description: '',
        type: 'ADMIN',
        platform: 'ADMIN_PANEL',
        permissions: [] as string[],
        isActive: true
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

    useEffect(() => {
        if (isEditMode) {
            loadRole(id!);
        }
    }, [id]);

    const loadRole = async (roleId: string) => {
        try {
            const role = await roleService.getRole(roleId);
            setFormData({
                name: role.name,
                displayName: role.displayName,
                description: role.description || '',
                type: role.type,
                platform: role.platform,
                permissions: role.permissions,
                isActive: role.isActive
            });
        } catch (error) {
            console.error('Failed to load role', error);
        }
    };

    const handlePermissionChange = (perm: string, checked: boolean) => {
        setFormData(prev => {
            const newPerms = checked
                ? [...prev.permissions, perm]
                : prev.permissions.filter(p => p !== perm);
            return { ...prev, permissions: newPerms };
        });
    };

    const handleCategoryToggle = (categoryPerms: string[], checked: boolean) => {
        // Collect actual full permission strings matching the prefixes for this category
        const permsInCategory = PERMISSIONS_LIST.filter(p =>
            categoryPerms.some(prefix => p.startsWith(prefix))
        );

        setFormData(prev => {
            let newPerms = [...prev.permissions];
            if (checked) {
                // Add all missing permissions from this category
                permsInCategory.forEach(p => {
                    if (!newPerms.includes(p)) newPerms.push(p);
                });
            } else {
                // Remove all permissions belonging to this category
                newPerms = newPerms.filter(p => !permsInCategory.includes(p));
            }
            return { ...prev, permissions: newPerms };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await roleService.updateRole(id!, formData);
            } else {
                await roleService.createRole(formData);
            }
            navigate('/roles');
        } catch (error) {
            console.error('Failed to save role', error);
            alert('Error saving role');
        }
    };

    const getPlatformIcon = (platform: string) => {
        switch (platform) {
            case 'ADMIN_PANEL': return <AdminIcon />;
            case 'DISPATCH_PANEL': return <WebIcon />;
            case 'USER_PORTAL': return <WebIcon />;
            case 'MOBILE_APP': return <MobileIcon />;
            default: return <ApiIcon />;
        }
    };

    // Filter permissions based on search
    const filteredCategories = useMemo(() => {
        if (!searchTerm) return Object.entries(PERMISSION_CATEGORIES);

        return Object.entries(PERMISSION_CATEGORIES).map(([category, prefixes]) => {
            const categoryPerms = PERMISSIONS_LIST.filter(p =>
                prefixes.some(prefix => p.startsWith(prefix))
            );
            // Check if category name matches OR if any child permission matches
            const hasMatch = category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                categoryPerms.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()));

            return hasMatch ? [category, prefixes] : null;
        }).filter(Boolean) as [string, string[]][];
    }, [searchTerm]);

    return (
        <Box sx={{
            p: { xs: 2, md: 4 },
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #121212 0%, #000000 100%)',
            color: 'white',
            pb: 10
        }}>
            <form onSubmit={handleSubmit}>
                {/* Header Section */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    background: 'rgba(18, 18, 18, 0.8)',
                    backdropFilter: 'blur(10px)',
                    py: 2,
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <IconButton onClick={() => navigate('/roles')} sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Box>
                            <Typography variant="h4" fontWeight="800" sx={{
                                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                {isEditMode ? 'Edit Role' : 'Create Access Role'}
                            </Typography>
                            <Typography variant="caption" color="gray">
                                {isEditMode ? `ID: ${id}` : 'Define new system access levels'}
                            </Typography>
                        </Box>
                    </Box>
                    <Box display="flex" gap={2}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/roles')}
                            sx={{
                                borderColor: 'rgba(255,255,255,0.2)',
                                color: 'rgba(255,255,255,0.8)',
                                '&:hover': { borderColor: 'white', background: 'rgba(255,255,255,0.05)' }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={<SaveIcon />}
                            sx={{
                                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                                fontWeight: 'bold'
                            }}
                        >
                            Save Configuration
                        </Button>
                    </Box>
                </Box>

                {/* Main Configuration Card */}
                <Grow in={true} timeout={500}>
                    <Paper elevation={0} sx={{
                        p: 4,
                        mb: 4,
                        background: 'rgba(30, 30, 30, 0.4)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 4
                    }}>
                        <Grid container spacing={4}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Display Name"
                                    placeholder="e.g. Super Administrator"
                                    value={formData.displayName}
                                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                    required
                                    variant="filled"
                                    InputProps={{
                                        sx: { color: 'white', background: 'rgba(0,0,0,0.2)' }
                                    }}
                                    InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="System Identifier (Immutable)"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                                    disabled={isEditMode}
                                    helperText={!isEditMode && "Uppercase, underscores only. Cannot be changed later."}
                                    required
                                    variant="filled"
                                    InputProps={{
                                        sx: { color: 'white', background: 'rgba(0,0,0,0.2)' },
                                        startAdornment: <InputAdornment position="start"><SecurityIcon sx={{ color: 'gray' }} /></InputAdornment>
                                    }}
                                    InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={2}
                                    label="Description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    variant="filled"
                                    InputProps={{
                                        sx: { color: 'white', background: 'rgba(0,0,0,0.2)' }
                                    }}
                                    InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }}
                                />
                            </Grid>

                            {/* Platform Selection - Visual Cards */}
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" sx={{ mb: 2, color: 'rgba(255,255,255,0.7)' }}>Target Platform</Typography>
                                <Grid container spacing={2}>
                                    {[
                                        { value: 'ADMIN_PANEL', label: 'Admin Panel', icon: <AdminIcon /> },
                                        { value: 'DISPATCH_PANEL', label: 'Dispatch', icon: <WebIcon /> },
                                        { value: 'USER_PORTAL', label: 'User Portal', icon: <WebIcon /> },
                                        { value: 'MOBILE_APP', label: 'Mobile App', icon: <MobileIcon /> }
                                    ].map((opt) => (
                                        <Grid item xs={6} md={3} key={opt.value}>
                                            <Paper
                                                onClick={() => setFormData({ ...formData, platform: opt.value })}
                                                sx={{
                                                    p: 2,
                                                    cursor: 'pointer',
                                                    textAlign: 'center',
                                                    background: formData.platform === opt.value ? 'rgba(33, 150, 243, 0.2)' : 'rgba(255,255,255,0.05)',
                                                    border: formData.platform === opt.value ? '2px solid #2196F3' : '1px solid rgba(255,255,255,0.1)',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': { transform: 'translateY(-2px)', background: 'rgba(255,255,255,0.1)' }
                                                }}
                                            >
                                                <Box sx={{ color: formData.platform === opt.value ? '#2196F3' : 'gray', mb: 1 }}>
                                                    {opt.icon}
                                                </Box>
                                                <Typography variant="body2" fontWeight={formData.platform === opt.value ? 'bold' : 'normal'}>
                                                    {opt.label}
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Grid>

                            <Grid item xs={12}>
                                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2 }} />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            color="success"
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography variant="body1">Active Status</Typography>
                                            <Typography variant="caption" color="gray">Disable to temporarily suspend all users with this role</Typography>
                                        </Box>
                                    }
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grow>

                {/* Permissions Section */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5" fontWeight="bold">Permissions Configuration</Typography>

                    <TextField
                        size="small"
                        placeholder="Search permissions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'gray' }} /></InputAdornment>,
                            sx: { color: 'white', background: 'rgba(255,255,255,0.05)', borderRadius: 2, width: 300 }
                        }}
                    />
                </Box>

                <Grid container spacing={3}>
                    {filteredCategories.map(([category, prefixes], index) => {
                        // Get permissions
                        const categoryPerms = PERMISSIONS_LIST.filter(p =>
                            prefixes.some(prefix => p.startsWith(prefix))
                        );

                        // If searching, we might want to filter the permissions display too
                        const displayPerms = searchTerm
                            ? categoryPerms.filter(p =>
                                p.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                category.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            : categoryPerms;

                        if (displayPerms.length === 0) return null;

                        const allChecked = displayPerms.every(p => formData.permissions.includes(p));
                        const someChecked = displayPerms.some(p => formData.permissions.includes(p));

                        return (
                            <Grid item xs={12} md={6} xl={4} key={category}>
                                <Grow in={true} timeout={500 + (index * 100)}>
                                    <Card
                                        onMouseEnter={() => setHoveredCategory(category)}
                                        onMouseLeave={() => setHoveredCategory(null)}
                                        sx={{
                                            height: '100%',
                                            background: 'rgba(255,255,255,0.03)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: 3,
                                            transition: 'all 0.3s ease',
                                            transform: hoveredCategory === category ? 'translateY(-5px)' : 'none',
                                            boxShadow: hoveredCategory === category ? '0 10px 30px rgba(0,0,0,0.5)' : 'none'
                                        }}
                                    >
                                        <CardContent>
                                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Box sx={{ width: 4, height: 24, background: '#2196F3', borderRadius: 2 }} />
                                                    <Typography variant="h6" fontWeight="bold">{category}</Typography>
                                                </Box>
                                                <Tooltip title={allChecked ? "Deselect All" : "Select All"}>
                                                    <Checkbox
                                                        checked={allChecked}
                                                        indeterminate={someChecked && !allChecked}
                                                        onChange={(e) => handleCategoryToggle(prefixes, e.target.checked)}
                                                        color="primary"
                                                        sx={{ color: 'rgba(255,255,255,0.3)' }}
                                                    />
                                                </Tooltip>
                                            </Box>

                                            <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.05)' }} />

                                            <Grid container spacing={1}>
                                                {displayPerms.map(perm => (
                                                    <Grid item xs={12} key={perm}>
                                                        <Box
                                                            onClick={() => handlePermissionChange(perm, !formData.permissions.includes(perm))}
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                p: 1,
                                                                borderRadius: 1,
                                                                cursor: 'pointer',
                                                                background: formData.permissions.includes(perm) ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
                                                                '&:hover': { background: 'rgba(255,255,255,0.05)' }
                                                            }}
                                                        >
                                                            <Checkbox
                                                                size="small"
                                                                checked={formData.permissions.includes(perm)}
                                                                onChange={(e) => handlePermissionChange(perm, e.target.checked)}
                                                                sx={{ p: 0.5, mr: 1 }}
                                                            />
                                                            <Typography variant="body2" sx={{
                                                                color: formData.permissions.includes(perm) ? '#90cbf9' : 'rgba(255,255,255,0.7)',
                                                                fontWeight: formData.permissions.includes(perm) ? 500 : 400
                                                            }}>
                                                                {perm.replace(prefixes[0] || '', '').replace(/_/g, ' ').toLowerCase()}
                                                                {/* Fallback to show full name if replacement looks weird, simpler logic below */}
                                                                <span style={{ opacity: 0.5, fontSize: '0.7em', display: 'block' }}>{perm}</span>
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                </Grow>
                            </Grid>
                        );
                    })}
                </Grid>
            </form>
        </Box>
    );
};

export default RoleEditor;
