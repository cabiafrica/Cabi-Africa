import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardHeader,
  CardContent,
  IconButton,
  InputAdornment,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as PlusIcon,
  Groups as UsersIcon,
  Business as BuildingIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { DriverGroup } from '@/types/admin';
import apiClient from '../services/apiClient';
import { PageHeader } from '../components/common/PageHeader';

// Separate components
import { DriverGroupsList } from '../components/drivers/DriverGroupsList';
import { CreateDriverGroupModal } from '../components/drivers/CreateDriverGroupModal';
import { DriverGroupDetailView } from '../components/drivers/DriverGroupDetailView';

interface DriverGroupsResponse {
  data: DriverGroup[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const StatCard = ({ title, value, subtitle, icon: Icon, accentColor = '#F59E0B' }: any) => (
  <Card sx={{
    height: '100%',
    bgcolor: '#131722',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 1,
    color: 'white',
    backdropFilter: 'blur(20px)'
  }}>
    <CardHeader
      title={title}
      titleTypographyProps={{ variant: 'caption', sx: { color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' } }}
      action={<Box sx={{ p: 1, borderRadius: 2, bgcolor: `${accentColor}15`, color: accentColor }}><Icon fontSize="small" /></Box>}
      sx={{ pb: 0 }}
    />
    <CardContent sx={{ pt: 1 }}>
      <Typography variant="h4" component="div" fontWeight="800" sx={{ color: 'white' }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: '#64748b' }}>
        {subtitle}
      </Typography>
    </CardContent>
  </Card>
);

export function DriverGroupsPage() {
  const [groups, setGroups] = useState<DriverGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<DriverGroup | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const fetchDriverGroups = async (page = 1, search = searchTerm) => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/driver-groups', {
        params: {
          page: page.toString(),
          limit: '10',
          ...(search && { search }),
        }
      });
      const data = response.data;
      const groupsList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setGroups(groupsList);
      setPagination(data?.pagination || { total: groupsList.length, page: 1, limit: 10, totalPages: 1 });
    } catch (error) {
      console.error('Failed to fetch driver groups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverGroups();
  }, []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    fetchDriverGroups(1, value);
  };

  const handleCreateGroup = () => {
    setShowCreateModal(true);
  };

  const handleGroupCreated = () => {
    setShowCreateModal(false);
    fetchDriverGroups();
  };

  const stats = {
    totalGroups: pagination.total,
    totalDrivers: groups.reduce((sum, group) => sum + (group._count?.drivers || 0), 0),
    totalSubgroups: groups.reduce((sum, group) => sum + (group._count?.subgroups || 0), 0),
  };

  if (selectedGroup) {
    return (
      <Box sx={{ p: { xs: 2, md: 0 } }}>
        <DriverGroupDetailView
          group={selectedGroup}
          onClose={() => setSelectedGroup(null)}
          onRefresh={() => fetchDriverGroups()}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 0 } }}>
      <PageHeader
        category="Fleet & People"
        title="Driver Operating Groups"
        subtitle="Manage driver groups, SACCO fleets, and hierarchical organization structures."
        icon={<UsersIcon className="text-amber-500" />}
        actions={
          <button
            onClick={handleCreateGroup}
            className="btn-primary flex items-center gap-1.5"
          >
            <PlusIcon fontSize="small" />
            Create Group
          </button>
        }
      />

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total Groups"
            value={stats.totalGroups}
            subtitle="Active driver groups"
            icon={BuildingIcon}
            accentColor="#F59E0B"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total Drivers"
            value={stats.totalDrivers}
            subtitle="Drivers in all groups"
            icon={UsersIcon}
            accentColor="#10B981"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Subgroups"
            value={stats.totalSubgroups}
            subtitle="Nested groups"
            icon={BuildingIcon}
            accentColor="#F59E0B"
          />
        </Grid>
      </Grid>

      {/* Search and List */}
      <Card sx={{
        mb: 4,
        bgcolor: '#131722',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 3,
        color: 'white',
        overflow: 'hidden'
      }}>
        <CardHeader
          title="Management"
          titleTypographyProps={{ variant: 'subtitle1', sx: { color: '#f8fafc', fontWeight: 600 } }}
          action={
            <IconButton onClick={() => fetchDriverGroups()} disabled={loading} sx={{ color: '#94a3b8' }}>
              <RefreshIcon />
            </IconButton>
          }
          sx={{ bgcolor: 'rgba(255, 255, 255, 0.02)', py: 2, px: 3 }}
        />
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.06)' }} />
        <CardContent sx={{ p: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Search driver groups..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            sx={{ mb: 3 }}
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

          <DriverGroupsList
            groups={groups}
            loading={loading}
            onRefresh={() => fetchDriverGroups()}
            onView={(group) => setSelectedGroup(group)}
          />
        </CardContent>
      </Card>

      {/* Create Group Modal */}
      {showCreateModal && (
        <CreateDriverGroupModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleGroupCreated}
          existingGroups={groups}
        />
      )}
    </Box>
  );
}