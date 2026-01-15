
import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Button, Paper, TextField, Grid,
    FormControlLabel, Checkbox, Divider, Switch, Card, CardContent
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { roleService, Role } from '../../services/roleService';
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
            // Handle not found or error
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
        // This is a naive implementation, checking if all prefix matches are in list
        // Better to collect actual full permission strings belonging to category
        // For now, we iterate PERMISSIONS_LIST and match prefix
        const permsInCategory = PERMISSIONS_LIST.filter(p =>
            categoryPerms.some(prefix => p.startsWith(prefix))
        );

        setFormData(prev => {
            let newPerms = [...prev.permissions];
            if (checked) {
                // Add all unique
                permsInCategory.forEach(p => {
                    if (!newPerms.includes(p)) newPerms.push(p);
                });
            } else {
                // Remove all
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

    return (
        <Box p={3}>
            <form onSubmit={handleSubmit}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4" fontWeight="bold">
                        {isEditMode ? 'Edit Role' : 'Create New Role'}
                    </Typography>
                    <Box>
                        <Button variant="outlined" sx={{ mr: 2 }} onClick={() => navigate('/roles')}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" color="primary">
                            Save Role
                        </Button>
                    </Box>
                </Box>

                <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Display Name"
                                value={formData.displayName}
                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="System Name (Unique ID)"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                                disabled={isEditMode}
                                helperText="Uppercase, underscores only. Cannot be changed later."
                                required
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
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                fullWidth
                                label="Platform"
                                value={formData.platform}
                                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                                SelectProps={{ native: true }}
                            >
                                <option value="ADMIN_PANEL">Admin Panel</option>
                                <option value="DISPATCH_PANEL">Dispatch Panel</option>
                                <option value="USER_PORTAL">User Portal</option>
                                <option value="MOBILE_APP">Mobile App</option>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        color="primary"
                                    />
                                }
                                label="Active Role"
                            />
                        </Grid>
                    </Grid>
                </Paper>

                <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>Permissions</Typography>

                <Grid container spacing={3}>
                    {Object.entries(PERMISSION_CATEGORIES).map(([category, prefixes]) => {
                        // Get exact permissions for this category
                        const categoryPerms = PERMISSIONS_LIST.filter(p =>
                            prefixes.some(prefix => p.startsWith(prefix))
                        );

                        const allChecked = categoryPerms.every(p => formData.permissions.includes(p));
                        const someChecked = categoryPerms.some(p => formData.permissions.includes(p));

                        if (categoryPerms.length === 0) return null;

                        return (
                            <Grid item xs={12} md={6} lg={4} key={category}>
                                <Card variant="outlined" sx={{ height: '100%' }}>
                                    <CardContent>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                            <Typography variant="h6">{category}</Typography>
                                            <Checkbox
                                                checked={allChecked}
                                                indeterminate={someChecked && !allChecked}
                                                onChange={(e) => handleCategoryToggle(prefixes, e.target.checked)}
                                            />
                                        </Box>
                                        <Divider sx={{ mb: 2 }} />
                                        <Grid container>
                                            {categoryPerms.map(perm => (
                                                <Grid item xs={12} key={perm}>
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                size="small"
                                                                checked={formData.permissions.includes(perm)}
                                                                onChange={(e) => handlePermissionChange(perm, e.target.checked)}
                                                            />
                                                        }
                                                        label={<Typography variant="body2">{perm.replace(/_/g, ' ')}</Typography>}
                                                    />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            </form>
        </Box>
    );
};

export default RoleEditor;
