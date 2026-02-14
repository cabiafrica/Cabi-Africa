import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Users,
  Building2,
  Mail,
  Phone,
  Calendar,
  Star,
  Plus,
  Search,
} from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('overview');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [driversLoading, setDriversLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const fetchGroupDrivers = async () => {
    try {
      setDriversLoading(true);
      const response = await fetch(`/api/admin/driver-groups/${group.id}/members`);
      const data = await response.json();
      setDrivers(data.data);
    } catch (error) {
      console.error('Failed to fetch group drivers:', error);
    } finally {
      setDriversLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'members') {
      fetchGroupDrivers();
    }
  }, [activeTab, group.id]);

  const handleDriverAssigned = () => {
    setShowAssignModal(false);
    if (activeTab === 'members') {
      fetchGroupDrivers();
    }
    onRefresh();
  };

  const getHierarchyPath = (currentGroup: DriverGroup): string[] => {
    const path: string[] = [currentGroup.name];
    if (currentGroup.parentGroup) {
      path.unshift(...getHierarchyPath(currentGroup.parentGroup));
    }
    return path;
  };

  const hierarchyPath = getHierarchyPath(group);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-5 w-5" />
            <h2 className="text-2xl font-bold">{group.name}</h2>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            {hierarchyPath.map((name, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span> / </span>}
                <span>{name}</span>
              </React.Fragment>
            ))}
          </div>
        </div>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members ({group._count?.drivers || 0})</TabsTrigger>
          <TabsTrigger value="subgroups">Subgroups ({group._count?.subgroups || 0})</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Group Info */}
            <Card>
              <CardHeader>
                <CardTitle>Group Information</CardTitle>
                <CardDescription>Details about this driver group</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {group.description || 'No description provided'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Created</label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(group.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Group ID</label>
                  <p className="mt-1 text-sm font-mono text-muted-foreground">
                    {group.id}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
                <CardDescription>Group performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Drivers</span>
                  <Badge variant="secondary">
                    {group._count?.drivers || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Subgroups</span>
                  <Badge variant="secondary">
                    {group._count?.subgroups || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Group Type</span>
                  <Badge variant={group.parentGroupId ? 'outline' : 'default'}>
                    {group.parentGroupId ? 'Subgroup' : 'Root Group'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subgroups */}
          {group.subgroups && group.subgroups.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Subgroups</CardTitle>
                <CardDescription>Direct subgroups under this group</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {group.subgroups.map((subgroup) => (
                    <div key={subgroup.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{subgroup.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {subgroup.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">
                          {subgroup._count?.drivers || 0} drivers
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Group Members</h3>
            <Button onClick={() => setShowAssignModal(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Assign Driver
            </Button>
          </div>

          {driversLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading drivers...</span>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Driver</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drivers.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {driver.user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{driver.user.fullName}</p>
                            <p className="text-sm text-muted-foreground">
                              {driver.licenseNumber}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {driver.user.email}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {driver.user.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={driver.isOnline ? 'default' : 'secondary'}>
                          {driver.isOnline ? 'Online' : 'Offline'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            {driver.totalRidesCompleted} rides
                          </div>
                          {driver.averageRating && (
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="h-3 w-3 text-yellow-500" />
                              {driver.averageRating.toFixed(1)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(driver.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Subgroups Tab */}
        <TabsContent value="subgroups" className="space-y-4">
          <h3 className="text-lg font-semibold">Subgroups</h3>
          {group.subgroups && group.subgroups.length > 0 ? (
            <div className="grid gap-4">
              {group.subgroups.map((subgroup) => (
                <Card key={subgroup.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{subgroup.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {subgroup.description || 'No description'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Created: {new Date(subgroup.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {subgroup._count?.drivers || 0} drivers
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h4 className="text-lg font-semibold mb-2">No subgroups</h4>
              <p className="text-muted-foreground">
                This group doesn't have any subgroups yet.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Assign Driver Modal */}
      {showAssignModal && (
        <AssignDriverToGroupModal
          groupId={group.id}
          groupName={group.name}
          onClose={() => setShowAssignModal(false)}
          onSuccess={handleDriverAssigned}
        />
      )}
    </div>
  );
}