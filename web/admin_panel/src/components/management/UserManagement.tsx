import React, { useState, useEffect, useCallback } from 'react';
import { adminService, AdminUser } from '../../services/adminService';
import { UserForm } from '../forms/UserForm';
import {
  Box,
  Paper,
  Typography,
  Button,
  InputAdornment,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  IconButton,
  Chip,
  alpha,
  useTheme,
  Tooltip
} from '@mui/material';
import {
  SupervisorAccount,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AdminPanelSettings as AdminIcon,
  Email as EmailIcon,
  Search as SearchIcon
} from '@mui/icons-material';

export const UserManagement: React.FC = () => {
  const theme = useTheme();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [editingUser, setEditingUser] = useState<AdminUser | 'new' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = useCallback(async () => {
    const data = await adminService.getAdminUsers();
    setUsers(data);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSave = () => {
    setEditingUser(null);
    fetchUsers();
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this admin user?')) {
      // In a real app, await adminService.deleteUser(userId);
      alert(`User ${userId} deleted.`);
      fetchUsers();
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.roles.some(r => r.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (editingUser) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
        <Paper sx={{ p: 4, borderRadius: 4, bgcolor: alpha(theme.palette.background.paper, 0.8), backdropFilter: 'blur(20px)' }}>
          <Typography variant="h5" fontWeight="bold" mb={3}>
            {editingUser === 'new' ? 'Create New Admin' : 'Edit Admin User'}
          </Typography>
          <UserForm user={editingUser === 'new' ? undefined : editingUser} onSave={handleSave} onCancel={() => setEditingUser(null)} />
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 0 } }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="800" sx={{
            background: 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}>
            Admin User Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage system administrators and their access roles.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setEditingUser('new')}
          sx={{
            background: 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
            boxShadow: '0 3px 5px 2px rgba(99, 102, 241, .3)',
            fontWeight: 'bold',
            px: 3,
            py: 1.5,
            borderRadius: 2
          }}
        >
          Create New User
        </Button>
      </Box>

      {/* Content Card */}
      <Paper elevation={0} sx={{
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        background: alpha(theme.palette.background.paper, 0.5)
      }}>
        {/* Search Bar */}
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
          <TextField
            fullWidth
            placeholder="Search by email or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: { bgcolor: 'background.paper', borderRadius: 2 }
            }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>User Details</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Assigned Roles</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow key={user.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                        <AdminIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {user.email.split('@')[0]}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {user.roles.map(role => (
                        <Chip
                          key={role}
                          label={role}
                          size="small"
                          variant="outlined"
                          sx={{ borderRadius: 1, borderColor: 'divider' }}
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" justifyContent="flex-end" gap={1}>
                      <Tooltip title="Edit User">
                        <IconButton
                          onClick={() => setEditingUser(user)}
                          size="small"
                          sx={{ color: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete User">
                        <IconButton
                          onClick={() => handleDelete(user.id)}
                          size="small"
                          sx={{ color: theme.palette.error.main, bgcolor: alpha(theme.palette.error.main, 0.1) }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                    <Box display="flex" flexDirection="column" alignItems="center">
                      <SearchIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">No users found</Typography>
                      <Typography variant="body2" color="text.disabled">Try adjusting your search terms</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};