import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Breadcrumbs,
  Link,
  CircularProgress,
  Stack,
  Divider,
} from '@mui/material';
import {
  Groups as UsersIcon,
  Business as BuildingIcon,
  Email as MailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  Add as PlusIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { DriverGroup } from '@/types/admin';
import apiClient from '../../services/apiClient';
import { AssignDriverToGroupModal } from './AssignDriverToGroupModal';

interface DriverGroupDetailViewProps {
  group: DriverGroup;
  onClose: () => void;
  onRefresh: () => void;
}

interface Driver {
  id: string;
  licenseNumber: string;
  user: {
    fullName: string;
    email: string;
    phone: string;
  };
  isOnline: boolean;
  totalRidesCompleted: number;
  averageRating: number;
  createdAt: string;
}

export function DriverGroupDetailView({ group, onClose, onRefresh }: DriverGroupDetailViewProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [driversLoading, setDriversLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const fetchGroupDrivers = async () => {
    try {
      setDriversLoading(true);
      const response = await apiClient.get(`/admin/driver-groups/${group.id}/members`);
      const data = response.data;
      setDrivers(data?.data || (Array.isArray(data) ? data : []));
    } catch (error) {
      console.error('Failed to fetch group drivers:', error);
    } finally {
      setDriversLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 1) {
      fetchGroupDrivers();
    }
  }, [activeTab, group.id]);

  const handleDriverAssigned = () => {
    setShowAssignModal(false);
    if (activeTab === 1) {
      fetchGroupDrivers();
    }
    onRefresh();
  };

  const getHierarchyPath = (currentGroup: any): string[] => {
    const path: string[] = [currentGroup.name];
    if (currentGroup.parentGroup) {
      path.unshift(...getHierarchyPath(currentGroup.parentGroup));
    }
    return path;
  };

  const hierarchyPath = getHierarchyPath(group);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1, '& ol': { color: '#64748b' } }}>
            {hierarchyPath.map((name, index) => (
              <Typography
                key={index}
                sx={{
                  color: index === hierarchyPath.length - 1 ? '#F59E0B' : '#94a3b8',
                  fontSize: '0.875rem',
                  fontWeight: index === hierarchyPath.length - 1 ? 600 : 400
                }}
              >
                {name}
              </Typography>
            ))}
          </Breadcrumbs>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
              <BuildingIcon />
            </Box>
            <Typography variant="h4" component="h2" fontWeight="800" sx={{ color: '#f8fafc' }}>
              {group.name}
            </Typography>
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={onClose}
          sx={{
            borderColor: 'rgba(255, 255, 255, 0.15)',
            color: '#cbd5e1',
            borderRadius: 2,
            px: 2.5,
            py: 1,
            fontWeight: 600,
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            letterSpacing: '0.5px',
            '&:hover': {
              borderColor: '#F59E0B',
              color: '#F59E0B',
              bgcolor: 'rgba(245, 158, 11, 0.05)'
            }
          }}
        >
          Back to List
        </Button>
      </Box>

      {/* Main Content */}
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.08)', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="driver group tabs"
            sx={{
              '& .MuiTabs-indicator': { bgcolor: '#F59E0B', height: 3 },
              '& .MuiTab-root': {
                color: '#94a3b8',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.95rem',
                '&.Mui-selected': { color: '#F59E0B' }
              }
            }}
          >
            <Tab label="Overview" />
            <Tab label={`Members (${group._count?.drivers || 0})`} />
            <Tab label={`Subgroups (${group._count?.subgroups || 0})`} />
          </Tabs>
        </Box>

        {/* Overview Tab */}
        {activeTab === 0 && (
          <Stack spacing={4}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              {/* Group Info */}
              <Card sx={{
                bgcolor: '#131722',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 3,
                color: 'white'
              }}>
                <CardHeader
                  title="Group Information"
                  subheader="Details about this driver group"
                  titleTypographyProps={{ variant: 'subtitle1', sx: { color: '#f8fafc', fontWeight: 600 } }}
                  subheaderTypographyProps={{ variant: 'caption', sx: { color: '#64748b' } }}
                  sx={{ py: 2, px: 3, bgcolor: 'rgba(255, 255, 255, 0.02)' }}
                />
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.06)' }} />
                <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>
                      DESCRIPTION
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#e2e8f0' }}>
                      {group.description || 'No description provided'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>
                      CREATED
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#e2e8f0' }}>
                      {new Date(group.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>
                      GROUP ID
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'rgba(255, 255, 255, 0.04)', color: '#F59E0B', p: 1.5, borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      {group.id}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Statistics */}
              <Card sx={{
                bgcolor: '#131722',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 3,
                color: 'white'
              }}>
                <CardHeader
                  title="Statistics"
                  subheader="Group performance metrics"
                  titleTypographyProps={{ variant: 'subtitle1', sx: { color: '#f8fafc', fontWeight: 600 } }}
                  subheaderTypographyProps={{ variant: 'caption', sx: { color: '#64748b' } }}
                  sx={{ py: 2, px: 3, bgcolor: 'rgba(255, 255, 255, 0.02)' }}
                />
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.06)' }} />
                <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body1" sx={{ color: '#cbd5e1', fontWeight: 500 }}>Total Drivers</Typography>
                    <Chip label={group._count?.drivers || 0} sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', fontWeight: 700, border: '1px solid rgba(16, 185, 129, 0.3)' }} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body1" sx={{ color: '#cbd5e1', fontWeight: 500 }}>Total Subgroups</Typography>
                    <Chip label={group._count?.subgroups || 0} sx={{ bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', fontWeight: 700, border: '1px solid rgba(245, 158, 11, 0.3)' }} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body1" sx={{ color: '#cbd5e1', fontWeight: 500 }}>Group Type</Typography>
                    <Chip 
                      label={group.parentGroupId ? 'Subgroup' : 'Root Group'} 
                      sx={{
                        bgcolor: group.parentGroupId ? 'rgba(255, 255, 255, 0.05)' : 'rgba(245, 158, 11, 0.2)',
                        color: group.parentGroupId ? '#94a3b8' : '#F59E0B',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontWeight: 600
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Subgroups Preview */}
            {group.subgroups && group.subgroups.length > 0 && (
              <Card sx={{
                bgcolor: '#131722',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 3,
                color: 'white'
              }}>
                <CardHeader title="Direct Subgroups" titleTypographyProps={{ variant: 'subtitle1', sx: { color: '#f8fafc', fontWeight: 600 } }} sx={{ py: 2, px: 3, bgcolor: 'rgba(255, 255, 255, 0.02)' }} />
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.06)' }} />
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    {group.subgroups.map((subgroup) => (
                      <Box key={subgroup.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <BuildingIcon sx={{ color: '#F59E0B' }} />
                          <Box>
                            <Typography variant="subtitle2" sx={{ color: '#f8fafc', fontWeight: 600 }}>{subgroup.name}</Typography>
                            {subgroup.description && <Typography variant="caption" sx={{ color: '#94a3b8' }}>{subgroup.description}</Typography>}
                          </Box>
                        </Box>
                        <Chip label={`${subgroup._count?.drivers || 0} drivers`} size="small" sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.25)' }} />
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Stack>
        )}

        {/* Members Tab */}
        {activeTab === 1 && (
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 700 }}>Group Members</Typography>
              <Button
                variant="contained"
                startIcon={<PlusIcon />}
                onClick={() => setShowAssignModal(true)}
                sx={{
                  background: 'linear-gradient(45deg, #F59E0B 30%, #D4AF37 90%)',
                  color: '#000000',
                  fontWeight: 'bold',
                  px: 2.5,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  letterSpacing: '0.5px',
                  boxShadow: '0 4px 14px 0 rgba(245, 158, 11, 0.25)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #D97706 30%, #B45309 90%)',
                  }
                }}
              >
                Assign Driver
              </Button>
            </Box>

            {driversLoading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
                <CircularProgress size={32} sx={{ color: '#F59E0B' }} />
                <Typography variant="body2" sx={{ color: '#94a3b8', mt: 2 }}>
                  Loading drivers...
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ bgcolor: '#131722', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 3, overflow: 'hidden' }}>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
                      <TableCell sx={{ color: '#cbd5e1', fontWeight: 600, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Driver</TableCell>
                      <TableCell sx={{ color: '#cbd5e1', fontWeight: 600, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Contact</TableCell>
                      <TableCell sx={{ color: '#cbd5e1', fontWeight: 600, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Status</TableCell>
                      <TableCell sx={{ color: '#cbd5e1', fontWeight: 600, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Performance</TableCell>
                      <TableCell sx={{ color: '#cbd5e1', fontWeight: 600, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Joined</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {drivers.length > 0 ? drivers.map((driver) => (
                      <TableRow key={driver.id} hover sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.03) !important' }, '& td': { borderBottom: '1px solid rgba(255, 255, 255, 0.04)' } }}>
                        <TableCell>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ width: 34, height: 34, fontSize: '0.875rem', bgcolor: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                              {driver.user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ color: '#f8fafc', fontWeight: 600 }}>
                                {driver.user.fullName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                {driver.licenseNumber}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <MailIcon sx={{ fontSize: 14, color: '#64748b' }} />
                              <Typography variant="body2" sx={{ color: '#cbd5e1' }}>{driver.user.email}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <PhoneIcon sx={{ fontSize: 14, color: '#64748b' }} />
                              <Typography variant="body2" sx={{ color: '#cbd5e1' }}>{driver.user.phone}</Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={driver.isOnline ? 'Online' : 'Offline'} 
                            sx={{
                              bgcolor: driver.isOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                              color: driver.isOnline ? '#10B981' : '#94a3b8',
                              border: driver.isOnline ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                              fontWeight: 600,
                              fontSize: '0.7rem'
                            }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <UsersIcon sx={{ fontSize: 14, color: '#64748b' }} />
                              <Typography variant="body2" sx={{ color: '#cbd5e1' }}>{driver.totalRidesCompleted} rides</Typography>
                            </Box>
                            {driver.averageRating && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <StarIcon sx={{ fontSize: 14, color: '#F59E0B' }} />
                                <Typography variant="body2" sx={{ color: '#F59E0B', fontWeight: 600 }}>{driver.averageRating.toFixed(1)}</Typography>
                              </Box>
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarIcon sx={{ fontSize: 14, color: '#64748b' }} />
                            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                              {new Date(driver.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                          <Typography sx={{ color: '#64748b' }}>No drivers assigned to this group yet.</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Stack>
        )}

        {/* Subgroups Tab */}
        {activeTab === 2 && (
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 700 }}>Subgroups</Typography>
            {group.subgroups && group.subgroups.length > 0 ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                {group.subgroups.map((subgroup) => (
                  <Card key={subgroup.id} sx={{
                    bgcolor: '#131722',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 3,
                    color: 'white'
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
                            <BuildingIcon sx={{ fontSize: 28 }} />
                          </Box>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="700" sx={{ color: '#f8fafc' }}>{subgroup.name}</Typography>
                            <Typography variant="body2" sx={{ color: '#94a3b8', mb: 0.5 }}>
                              {subgroup.description || 'No description'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                              Created: {new Date(subgroup.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip 
                          label={`${subgroup._count?.drivers || 0} drivers`}
                          sx={{ bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.3)', fontWeight: 600 }}
                          size="small"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8, bgcolor: '#131722', borderRadius: 3, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <BuildingIcon sx={{ fontSize: 44, color: '#475569', mb: 1.5 }} />
                <Typography variant="h6" sx={{ color: '#cbd5e1', fontWeight: 600 }}>No subgroups</Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  This group doesn't have any subgroups yet.
                </Typography>
              </Box>
            )}
          </Stack>
        )}
      </Box>

      {/* Assign Driver Modal */}
      {showAssignModal && (
        <AssignDriverToGroupModal
          isOpen={showAssignModal}
          groupId={group.id}
          groupName={group.name}
          onClose={() => setShowAssignModal(false)}
          onSuccess={handleDriverAssigned}
        />
      )}
    </Box>
  );
}