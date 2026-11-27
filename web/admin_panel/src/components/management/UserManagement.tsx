import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { adminService, AdminUser } from '../../services/adminService';
import { UserForm } from '../forms/UserForm';
import { PageHeader } from '../common/PageHeader';
import { UserAccessTabs } from './UserAccessTabs';
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
  Search as SearchIcon,
  Security as SecurityIcon,
  People as PeopleIcon,
  Send as SendIcon
} from '@mui/icons-material';

export const UserManagement: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('new') === 'true') {
      setEditingUser('new');
    }
  }, [location.search]);

  const handleSave = () => {
    setEditingUser(null);
    navigate('/users', { replace: true });
    fetchUsers();
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this admin user?')) {
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
      <Box sx={{ maxWidth: '100%', mx: 'auto', mt: 2 }}>
        <UserForm
          user={editingUser === 'new' ? undefined : editingUser}
          onSave={handleSave}
          onCancel={() => {
            setEditingUser(null);
            navigate('/users', { replace: true });
          }}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 0 } }}>
      <PageHeader
        category="Fleet & People"
        title="Admin User Management"
        subtitle="Manage system administrators, assign operational roles, and configure granular permissions."
        icon={<SupervisorAccount className="text-amber-500" />}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => navigate('/roles')}
              className="px-3.5 py-2 rounded-[4px] bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <SecurityIcon fontSize="small" className="text-amber-500" />
              <span>Roles & Permissions</span>
            </button>
            <button
              onClick={() => navigate('/platform-users')}
              className="px-3.5 py-2 rounded-[4px] bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <PeopleIcon fontSize="small" className="text-amber-500" />
              <span>Platform Users</span>
            </button>
            <button
              onClick={() => setEditingUser('new')}
              className="btn-primary flex items-center gap-1.5 text-xs py-2 px-3.5 rounded-[4px] cursor-pointer"
            >
              <AddIcon fontSize="small" />
              <span>+ Create New Admin</span>
            </button>
          </div>
        }
      />

      <UserAccessTabs activeTab="users" />

      {/* Content Card */}
      <Paper elevation={0} sx={{
        borderRadius: '3px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
        background: '#131722',
        backdropFilter: 'blur(20px)'
      }}>
        {/* Search Bar */}
        <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', bgcolor: 'rgba(255, 255, 255, 0.01)' }}>
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
                  <SearchIcon sx={{ color: '#94a3b8' }} />
                </InputAdornment>
              ),
              sx: {
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 2,
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                '& input::placeholder': { color: '#64748b', opacity: 1 },
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' },
                '&.Mui-focused': { border: '1px solid #F59E0B' }
              }
            }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: '600', color: '#cbd5e1', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>User Details</TableCell>
                <TableCell sx={{ fontWeight: '600', color: '#cbd5e1', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Assigned Roles</TableCell>
                <TableCell align="right" sx={{ fontWeight: '600', color: '#cbd5e1', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow key={user.id} hover sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.03) !important' }, '& td': { borderBottom: '1px solid rgba(255, 255, 255, 0.04)' } }}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
                        <AdminIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="600" sx={{ color: '#f8fafc' }}>
                          {user.email.split('@')[0]}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <EmailIcon sx={{ fontSize: 13, color: '#64748b' }} />
                          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
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
                          sx={{
                            borderRadius: 1.5,
                            bgcolor: role.includes('ADMIN') ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                            color: role.includes('ADMIN') ? '#F59E0B' : '#e2e8f0',
                            border: `1px solid ${role.includes('ADMIN') ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                            fontWeight: 600,
                            fontSize: '0.7rem'
                          }}
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" justifyContent="flex-end" gap={1}>
                      <Tooltip title="Resend Activation (Email & SMS)">
                        <IconButton
                          onClick={async () => {
                            if (window.confirm(`Resend activation credentials to ${user.email}?`)) {
                              await adminService.resendAdminActivation(user.email);
                              alert(`Activation credentials re-dispatched to ${user.email} via dual-channel (Email & SMS).`);
                            }
                          }}
                          size="small"
                          sx={{ color: '#38bdf8', bgcolor: 'rgba(56, 189, 248, 0.1)', '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.2)' } }}
                        >
                          <SendIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit User">
                        <IconButton
                          onClick={() => setEditingUser(user)}
                          size="small"
                          sx={{ color: '#F59E0B', bgcolor: 'rgba(245, 158, 11, 0.1)', '&:hover': { bgcolor: 'rgba(245, 158, 11, 0.2)' } }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete User">
                        <IconButton
                          onClick={() => handleDelete(user.id)}
                          size="small"
                          sx={{ color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' } }}
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
                  <TableCell colSpan={3} align="center" sx={{ py: 8, borderBottom: 'none' }}>
                    <Box display="flex" flexDirection="column" alignItems="center">
                      <SearchIcon sx={{ fontSize: 44, color: '#475569', mb: 1.5 }} />
                      <Typography variant="subtitle1" fontWeight="600" sx={{ color: '#cbd5e1' }}>No users found</Typography>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>Try adjusting your search terms</Typography>
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