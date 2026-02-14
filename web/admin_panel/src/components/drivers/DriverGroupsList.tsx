import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Users,
  Building2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DriverGroup } from '@/types/admin';

interface DriverGroupsListProps {
  groups: DriverGroup[];
  loading?: boolean;
  onRefresh?: () => void;
  onView?: (group: DriverGroup) => void;
  onEdit?: (group: DriverGroup) => void;
  onDelete?: (group: DriverGroup) => void;
}

export function DriverGroupsList({
  groups,
  loading = false,
  onRefresh,
  onView,
  onEdit,
  onDelete,
}: DriverGroupsListProps) {
  const handleView = (group: DriverGroup) => {
    onView?.(group);
  };

  const handleEdit = (group: DriverGroup) => {
    onEdit?.(group);
  };

  const handleDelete = (group: DriverGroup) => {
    if (window.confirm(`Are you sure you want to delete "${group.name}"?`)) {
      onDelete?.(group);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading driver groups...</span>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-8">
        <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No driver groups found</h3>
        <p className="text-muted-foreground mb-4">
          Get started by creating your first driver group.
        </p>
        <Button onClick={onRefresh}>Refresh</Button>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Group Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Parent Group</TableHead>
            <TableHead>Members</TableHead>
            <TableHead>Subgroups</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group) => (
            <TableRow key={group.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  {group.name}
                  {group.parentGroupId && (
                    <Badge variant="secondary" className="text-xs">
                      Subgroup
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {group.description || (
                  <span className="text-muted-foreground">No description</span>
                )}
              </TableCell>
              <TableCell>
                {group.parentGroup ? (
                  <div className="flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-muted-foreground" />
                    {group.parentGroup.name}
                  </div>
                ) : (
                  <Badge variant="outline">Root Group</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  {group._count?.drivers || 0}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  {group._count?.subgroups || 0}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(group.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleView(group)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEdit(group)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDelete(group)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}