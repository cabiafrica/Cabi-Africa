import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Visibility as EyeIcon,
  Edit as EditIcon,
  Delete as TrashIcon,
  Group as UsersIcon,
  Business as BuildingIcon,
} from '@mui/icons-material';
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
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedGroup, setSelectedGroup] = React.useState<DriverGroup | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, group: DriverGroup) => {
    setAnchorEl(event.currentTarget);
    setSelectedGroup(group);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedGroup(null);
  };

  const currentGroup = selectedGroup;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading driver groups...
        </Typography>
      </Box>
    );
  }

  if (groups.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <BuildingIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6">No driver groups found</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Get started by creating your first driver group.
        </Typography>
        <Button variant="outlined" onClick={onRefresh}>Refresh</Button>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: 'action.hover' }}>
            <TableCell>Group Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Parent Group</TableCell>
            <TableCell align="center">Members</TableCell>
            <TableCell align="center">Subgroups</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Created</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {groups.map((group) => (
            <TableRow key={group.id} hover>
              <TableCell sx={{ fontWeight: 500 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BuildingIcon color="disabled" fontSize="small" />
                  {group.name}
                  {group.parentGroupId && (
                    <Chip label="Subgroup" size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 20 }} />
                  )}
                </Box>
              </TableCell>
              <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {group.description || <Typography variant="caption" color="text.disabled">No description</Typography>}
              </TableCell>
              <TableCell>
                {group.parentGroup ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <BuildingIcon color="disabled" sx={{ fontSize: 14 }} />
                    <Typography variant="body2">{group.parentGroup.name}</Typography>
                  </Box>
                ) : (
                  <Chip label="Root" size="small" color="secondary" variant="outlined" sx={{ fontSize: '0.7rem', height: 20 }} />
                )}
              </TableCell>
              <TableCell align="center">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                  <UsersIcon color="disabled" sx={{ fontSize: 16 }} />
                  {group._count?.drivers || 0}
                </Box>
              </TableCell>
              <TableCell align="center">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                  <BuildingIcon color="disabled" sx={{ fontSize: 16 }} />
                  {group._count?.subgroups || 0}
                </Box>
              </TableCell>
              <TableCell>
                <Chip label="Active" size="small" color="success" />
              </TableCell>
              <TableCell>
                {new Date(group.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell align="right">
                <IconButton size="small" onClick={(e) => handleMenuOpen(e, group)}>
                  <MoreIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => { onView?.(currentGroup!); handleMenuClose(); }}>
          <ListItemIcon><EyeIcon fontSize="small" /></ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { onEdit?.(currentGroup!); handleMenuClose(); }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Edit Group</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { onDelete?.(currentGroup!); handleMenuClose(); }} sx={{ color: 'error.main' }}>
          <ListItemIcon><TrashIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Delete Group</ListItemText>
        </MenuItem>
      </Menu>
    </TableContainer>
  );
}