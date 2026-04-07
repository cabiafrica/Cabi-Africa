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
      const response = await fetch(`/api/admin/driver-groups/${group.id}/members`);
      const data = await response.json();
      setDrivers(data.data || []);
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
            {hierarchyPath.map((name, index) => (
              <Typography key={index} color={index === hierarchyPath.length - 1 ? 'text.primary' : 'inherit'}>
                {name}
              </Typography>
            ))}
          </Breadcrumbs>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BuildingIcon color="primary" />
            <Typography variant="h4" component="h2" fontWeight="bold">
              {group.name}
            </Typography>
          </Box>
        </Box>
        <Button variant="outlined" startIcon={<BackIcon />} onClick={onClose}>
          Back to List
        </Button>
      </Box>

      {/* Main Content */}
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="driver group tabs">
            <Tab label="Overview" />
            <Tab label={`Members (${group._count?.drivers || 0})`} />
            <Tab label={`Subgroups (${group._count?.subgroups || 0})`} />
          </Tabs>
        </Box>

        {/* Overview Tab */}
        {activeTab === 0 && (
          <Stack spacing={4}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
              {/* Group Info */}
              <Card variant="outlined">
                <CardHeader title="Group Information" subheader="Details about this driver group" />
                <Divider />
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ display: 'block', mb: 0.5 }}>
                      DESCRIPTION
                    </Typography>
                    <Typography variant="body1">
                      {group.description || 'No description provided'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ display: 'block', mb: 0.5 }}>
                      CREATED
                    </Typography>
                    <Typography variant="body1">
                      {new Date(group.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ display: 'block', mb: 0.5 }}>
                      GROUP ID
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'action.hover', p: 1, borderRadius: 1 }}>
                      {group.id}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Statistics */}
              <Card variant="outlined">
                <CardHeader title="Statistics" subheader="Group performance metrics" />
                <Divider />
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body1" fontWeight="medium">Total Drivers</Typography>
                    <Chip label={group._count?.drivers || 0} color="primary" />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body1" fontWeight="medium">Total Subgroups</Typography>
                    <Chip label={group._count?.subgroups || 0} variant="outlined" />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body1" fontWeight="medium">Group Type</Typography>
                    <Chip 
                      label={group.parentGroupId ? 'Subgroup' : 'Root Group'} 
                      color={group.parentGroupId ? 'secondary' : 'default'}
                      variant={group.parentGroupId ? 'outlined' : 'filled'}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Subgroups Preview */}
            {group.subgroups && group.subgroups.length > 0 && (
              <Card variant="outlined">
                <CardHeader title="Direct Subgroups" />
                <Divider />
                <CardContent>
                  <Stack spacing={2}>
                    {group.subgroups.map((subgroup) => (
                      <Box key={subgroup.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <BuildingIcon color="disabled" />
                          <Box>
                            <Typography variant="subtitle2">{subgroup.name}</Typography>
                            {subgroup.description && <Typography variant="caption" color="text.secondary">{subgroup.description}</Typography>}
                          </Box>
                        </Box>
                        <Chip label={`${subgroup._count?.drivers || 0} drivers`} size="small" variant="outlined" />
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
              <Typography variant="h6">Group Members</Typography>
              <Button variant="contained" startIcon={<PlusIcon />} onClick={() => setShowAssignModal(true)}>
                Assign Driver
              </Button>
            </Box>

            {driversLoading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
                <CircularProgress size={32} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Loading drivers...
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell>Driver</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Performance</TableCell>
                      <TableCell>Joined</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {drivers.length > 0 ? drivers.map((driver) => (
                      <TableRow key={driver.id} hover>
                        <TableCell>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                              {driver.user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" component="div">
                                {driver.user.fullName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {driver.licenseNumber}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <MailIcon color="disabled" sx={{ fontSize: 14 }} />
                              <Typography variant="body2">{driver.user.email}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <PhoneIcon color="disabled" sx={{ fontSize: 14 }} />
                              <Typography variant="body2">{driver.user.phone}</Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={driver.isOnline ? 'Online' : 'Offline'} 
                            color={driver.isOnline ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <UsersIcon color="disabled" sx={{ fontSize: 14 }} />
                              <Typography variant="body2">{driver.totalRidesCompleted} rides</Typography>
                            </Box>
                            {driver.averageRating && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <StarIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                                <Typography variant="body2">{driver.averageRating.toFixed(1)}</Typography>
                              </Box>
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarIcon color="disabled" sx={{ fontSize: 14 }} />
                            <Typography variant="body2">
                              {new Date(driver.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">No drivers assigned to this group yet.</Typography>
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
            <Typography variant="h6">Subgroups</Typography>
            {group.subgroups && group.subgroups.length > 0 ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                {group.subgroups.map((subgroup) => (
                  <Card key={subgroup.id} variant="outlined">
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <BuildingIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">{subgroup.name}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {subgroup.description || 'No description'}
                            </Typography>
                            <Typography variant="caption" color="text.disabled" sx={{ display: 'block' }}>
                              Created: {new Date(subgroup.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip 
                          label={`${subgroup._count?.drivers || 0} drivers`}
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <BuildingIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6">No subgroups</Typography>
                <Typography variant="body2" color="text.secondary">
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
          groupId={group.id}
          groupName={group.name}
          onClose={() => setShowAssignModal(false)}
          onSuccess={handleDriverAssigned}
        />
      )}
    </Box>
  );
}