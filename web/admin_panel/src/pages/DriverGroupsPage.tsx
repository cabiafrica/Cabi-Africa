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
  CardActions,
  Chip,
  CircularProgress,
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

// Separate components
import { DriverGroupsList } from '../components/drivers/DriverGroupsList';
import { CreateDriverGroupModal } from '../components/drivers/CreateDriverGroupModal';

interface DriverGroupsResponse {
  data: DriverGroup[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const StatCard = ({ title, value, subtitle, icon: Icon }: any) => (
  <Card sx={{ height: '100%' }}>
    <CardHeader
      title={title}
      titleTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
      action={<Icon color="disabled" />}
      sx={{ pb: 0 }}
    />
    <CardContent>
      <Typography variant="h4" component="div" fontWeight="bold">
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
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
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const fetchDriverGroups = async (page = 1, search = searchTerm) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
      });

      const response = await fetch(`/api/admin/driver-groups?${params}`);
      if (!response.ok) throw new Error('Failed to fetch groups');
      
      const data: DriverGroupsResponse = await response.json();
      setGroups(data.data || []);
      setPagination(data.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 });
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

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Driver Groups</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage driver groups and hierarchical organization structure
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PlusIcon />}
          onClick={handleCreateGroup}
        >
          Create Group
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title="Total Groups"
            value={stats.totalGroups}
            subtitle="Active driver groups"
            icon={BuildingIcon}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title="Total Drivers"
            value={stats.totalDrivers}
            subtitle="Drivers in all groups"
            icon={UsersIcon}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title="Subgroups"
            value={stats.totalSubgroups}
            subtitle="Nested groups"
            icon={BuildingIcon}
          />
        </Grid>
      </Grid>

      {/* Search and List */}
      <Card sx={{ mb: 4 }}>
        <CardHeader
          title="Management"
          action={
            <IconButton onClick={() => fetchDriverGroups()} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          }
        />
        <Divider />
        <CardContent>
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
                  <SearchIcon color="disabled" />
                </InputAdornment>
              ),
            }}
          />

          <DriverGroupsList
            groups={groups}
            loading={loading}
            onRefresh={() => fetchDriverGroups()}
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