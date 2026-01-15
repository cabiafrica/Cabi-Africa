
import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { roleService, Role } from '../../services/roleService';

const RolesList: React.FC = () => {
    const navigate = useNavigate();
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRoles();
    }, []);

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

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold">Roles & Permissions</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/roles/new')}
                >
                    Create New Role
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Role Name</strong></TableCell>
                            <TableCell><strong>Type</strong></TableCell>
                            <TableCell><strong>Platform</strong></TableCell>
                            <TableCell><strong>Description</strong></TableCell>
                            <TableCell><strong>Permissions Count</strong></TableCell>
                            <TableCell align="center"><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {roles.map((role) => (
                            <TableRow key={role.id} hover>
                                <TableCell>
                                    <Typography variant="body1" fontWeight="medium">{role.displayName}</Typography>
                                    <Typography variant="caption" color="textSecondary">{role.name}</Typography>
                                </TableCell>
                                <TableCell>{role.type}</TableCell>
                                <TableCell>
                                    <Chip label={role.platform} size="small" variant="outlined" />
                                </TableCell>
                                <TableCell>{role.description}</TableCell>
                                <TableCell>
                                    <Chip label={role.permissions.length} color="primary" size="small" />
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton
                                        color="primary"
                                        onClick={() => navigate(`/roles/${role.id}`)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    {!role.isSystem && (
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDelete(role.id, role.displayName)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default RolesList;
