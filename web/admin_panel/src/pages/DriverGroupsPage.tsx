import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Users, Building2 } from 'lucide-react';
import { DriverGroupsList } from './DriverGroupsList';
import { CreateDriverGroupModal } from './CreateDriverGroupModal';
import { DriverGroup } from '@/types/admin';

interface DriverGroupsResponse {
  data: DriverGroup[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

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
      const data: DriverGroupsResponse = await response.json();
      
      setGroups(data.data);
      setPagination(data.pagination);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Driver Groups</h1>
          <p className="text-muted-foreground">
            Manage driver groups and hierarchical organization structure
          </p>
        </div>
        <Button onClick={handleCreateGroup} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Group
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGroups}</div>
            <p className="text-xs text-muted-foreground">
              Active driver groups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDrivers}</div>
            <p className="text-xs text-muted-foreground">
              Drivers in all groups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subgroups</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubgroups}</div>
            <p className="text-xs text-muted-foreground">
              Nested groups
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search driver groups..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Groups List */}
      <Card>
        <CardHeader>
          <CardTitle>Driver Groups</CardTitle>
          <CardDescription>
            Manage your driver groups and hierarchical structure
          </CardDescription>
        </CardHeader>
        <CardContent>
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
    </div>
  );
}