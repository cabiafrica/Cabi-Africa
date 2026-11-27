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

export const formatHumanGroupId = (group: DriverGroup): string => {
  if (group.id && group.id.startsWith('GRP-')) return group.id;
  const prefix = group.name ? group.name.replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase() : 'NAI';
  const suffix = group.id ? group.id.replace(/[^A-Za-z0-9]/g, '').slice(-3).toUpperCase() : '01';
  return `GRP-${prefix || 'NAI'}-${suffix || '01'}`;
};

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
        <CircularProgress sx={{ color: '#F59E0B' }} />
        <Typography variant="body2" sx={{ color: '#94a3b8', mt: 2 }}>
          Loading driver groups...
        </Typography>
      </Box>
    );
  }

  if (groups.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <BuildingIcon sx={{ fontSize: 44, color: '#475569', mb: 1.5 }} />
        <Typography variant="h6" sx={{ color: '#cbd5e1', fontWeight: 600 }}>No driver groups found</Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
          Get started by creating your first driver group.
        </Typography>
        <Button
          variant="outlined"
          onClick={onRefresh}
          sx={{
            borderColor: 'rgba(245, 158, 11, 0.4)',
            color: '#F59E0B',
            textTransform: 'uppercase',
            fontWeight: 600,
            fontSize: '0.75rem',
            letterSpacing: '0.5px',
            '&:hover': { borderColor: '#F59E0B', bgcolor: 'rgba(245, 158, 11, 0.1)' }
          }}
        >
          Refresh
        </Button>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent', border: 'none' }}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
            <TableCell sx={{ color: '#cbd5e1', fontWeight: 600, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Group ID</TableCell>
            <TableCell sx={{ color: '#cbd5e1', fontWeight: 600, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Group Name</TableCell>
            <TableCell sx={{ color: '#cbd5e1', fontWeight: 600, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Description</TableCell>
            <TableCell sx={{ color: '#cbd5e1', fontWeight: 600, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Parent Group</TableCell>
            <TableCell align="center" sx={{ color: '#cbd5e1', fontWeight: 600, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Members</TableCell>
            <TableCell align="center" sx={{ color: '#cbd5e1', fontWeight: 600, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Subgroups</TableCell>
            <TableCell sx={{ color: '#cbd5e1', fontWeight: 600, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Status</TableCell>
            <TableCell sx={{ color: '#cbd5e1', fontWeight: 600, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Created</TableCell>
            <TableCell align="right" sx={{ color: '#cbd5e1', fontWeight: 600, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {groups.map((group) => (
            <TableRow key={group.id} hover sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.03) !important' }, '& td': { borderBottom: '1px solid rgba(255, 255, 255, 0.04)' } }}>
              <TableCell sx={{ fontWeight: 600 }}>
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {formatHumanGroupId(group)}
                </span>
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#f8fafc' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BuildingIcon sx={{ color: '#F59E0B', fontSize: 18 }} />
                  {group.name}
                  {group.parentGroupId && (
                    <Chip label="Subgroup" size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 20, color: '#94a3b8', borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                  )}
                </Box>
              </TableCell>
              <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#94a3b8' }}>
                {group.description || <Typography variant="caption" sx={{ color: '#64748b' }}>No description</Typography>}
              </TableCell>
              <TableCell sx={{ color: '#94a3b8' }}>
                {group.parentGroup ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <BuildingIcon sx={{ color: '#64748b', fontSize: 14 }} />
                    <Typography variant="body2" sx={{ color: '#e2e8f0' }}>{group.parentGroup.name}</Typography>
                  </Box>
                ) : (
                  <Chip label="Root" size="small" sx={{ fontSize: '0.7rem', height: 20, bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.3)' }} />
                )}
              </TableCell>
              <TableCell align="center" sx={{ color: '#cbd5e1' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                  <UsersIcon sx={{ color: '#64748b', fontSize: 16 }} />
                  {group._count?.drivers || 0}
                </Box>
              </TableCell>
              <TableCell align="center" sx={{ color: '#cbd5e1' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                  <BuildingIcon sx={{ color: '#64748b', fontSize: 16 }} />
                  {group._count?.subgroups || 0}
                </Box>
              </TableCell>
              <TableCell>
                <Chip label="Active" size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 600, fontSize: '0.7rem' }} />
              </TableCell>
              <TableCell sx={{ color: '#94a3b8' }}>
                {new Date(group.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell align="right">
                <IconButton size="small" onClick={(e) => handleMenuOpen(e, group)} sx={{ color: '#94a3b8' }}>
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
        PaperProps={{
          sx: {
            bgcolor: '#131722',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white',
            borderRadius: 2
          }
        }}
      >
        <MenuItem onClick={() => { onView?.(currentGroup!); handleMenuClose(); }} sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' } }}>
          <ListItemIcon><EyeIcon fontSize="small" sx={{ color: '#94a3b8' }} /></ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { onEdit?.(currentGroup!); handleMenuClose(); }} sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' } }}>
          <ListItemIcon><EditIcon fontSize="small" sx={{ color: '#F59E0B' }} /></ListItemIcon>
          <ListItemText>Edit Group</ListItemText>
        </MenuItem>
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.06)' }} />
        <MenuItem onClick={() => { onDelete?.(currentGroup!); handleMenuClose(); }} sx={{ color: '#ef4444', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}>
          <ListItemIcon><TrashIcon fontSize="small" sx={{ color: '#ef4444' }} /></ListItemIcon>
          <ListItemText>Delete Group</ListItemText>
        </MenuItem>
      </Menu>
    </TableContainer>
  );
}