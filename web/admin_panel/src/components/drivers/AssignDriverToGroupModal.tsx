import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import apiClient from '../../services/apiClient';

interface Group {
  id: string;
  name: string;
  memberCount: number;
  type: string;
}

interface Driver {
  id: string;
  name: string;
  phone?: string;
  licenseNumber?: string;
}

interface AssignDriverToGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverId?: string;
  driverName?: string;
  currentGroups?: string[];
  onAssign?: (groupIds: string[]) => Promise<void>;
  groupId?: string;
  groupName?: string;
  onSuccess?: () => void;
}

export const AssignDriverToGroupModal = ({
  isOpen,
  onClose,
  driverId,
  driverName,
  currentGroups = [],
  onAssign,
  groupId,
  groupName,
  onSuccess,
}: AssignDriverToGroupModalProps) => {
  const [selectedItems, setSelectedItems] = useState<string[]>(currentGroups);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Group-to-driver mode: fetch drivers from backend
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);

  // Driver-to-group mode: fetch groups from backend
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const isGroupToDriverMode = !!groupId;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load groups when modal opens in driver-to-group mode
  useEffect(() => {
    if (isOpen && !isGroupToDriverMode) {
      setLoadingGroups(true);
      apiClient
        .get<Group[]>('/sacco/groups')
        .then((res) => setGroups(res.data))
        .catch(() => setGroups([]))
        .finally(() => setLoadingGroups(false));
    }
  }, [isOpen, isGroupToDriverMode]);

  // Debounced driver search in group-to-driver mode
  const searchDrivers = useCallback((query: string) => {
    if (!isGroupToDriverMode || !query.trim()) {
      setDrivers([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoadingDrivers(true);
      try {
        const res = await apiClient.get<Driver[]>('/drivers/search', {
          params: { q: query, limit: 20 },
        });
        setDrivers(res.data);
      } catch {
        setDrivers([]);
      } finally {
        setLoadingDrivers(false);
      }
    }, 300);
  }, [isGroupToDriverMode]);

  useEffect(() => {
    searchDrivers(searchQuery);
  }, [searchQuery, searchDrivers]);

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const listItems = isGroupToDriverMode ? drivers : filteredGroups;
  const isLoading = isGroupToDriverMode ? loadingDrivers : loadingGroups;

  const toggleItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (isGroupToDriverMode && groupId) {
        // Assign selected drivers to this group
        await apiClient.post(`/sacco/groups/${groupId}/members`, {
          driverIds: selectedItems,
        });
        onSuccess?.();
      } else {
        await onAssign?.(selectedItems);
      }
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedItems(currentGroups);
    setError(null);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          bgcolor: '#131722',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'white',
          borderRadius: 3
        }
      }}
    >
      <DialogTitle sx={{ color: 'white', fontWeight: 600 }}>
        {isGroupToDriverMode
          ? `Add Drivers to "${groupName}"`
          : `Assign ${driverName} to Groups`}
      </DialogTitle>
      <DialogContent dividers sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder={isGroupToDriverMode ? 'Search drivers by name or phone...' : 'Search groups...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <SearchIcon fontSize="small" sx={{ mr: 1, color: '#94a3b8' }} />
            ),
            endAdornment: isLoading ? <CircularProgress size={16} sx={{ color: '#F59E0B' }} /> : null,
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
          sx={{ mb: 2 }}
        />

        <List sx={{ maxHeight: 320, overflow: 'auto' }}>
          {listItems.map((item: any) => (
            <React.Fragment key={item.id}>
              <ListItem
                dense
                button
                onClick={() => toggleItem(item.id)}
                sx={{ borderRadius: 1.5, '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.04)' } }}
              >
                <Checkbox
                  edge="start"
                  checked={selectedItems.includes(item.id)}
                  tabIndex={-1}
                  disableRipple
                  sx={{ color: '#64748b', '&.Mui-checked': { color: '#F59E0B' } }}
                />
                <ListItemText
                  primary={<Typography variant="body2" sx={{ color: '#f8fafc', fontWeight: 500 }}>{item.name}</Typography>}
                  secondary={
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                      {isGroupToDriverMode
                        ? item.phone ?? item.licenseNumber ?? 'Driver'
                        : `${item.memberCount} members • ${item.type}`}
                    </Typography>
                  }
                />
              </ListItem>
              <Divider component="li" sx={{ borderColor: 'rgba(255, 255, 255, 0.04)' }} />
            </React.Fragment>
          ))}

          {!isLoading && listItems.length === 0 && (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                {isGroupToDriverMode && !searchQuery.trim()
                  ? 'Type a name or phone number to search for drivers.'
                  : 'No results found.'}
              </Typography>
            </Box>
          )}
        </List>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderColor: 'rgba(255, 255, 255, 0.08)', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <Button onClick={handleClose} disabled={isSubmitting} sx={{ color: '#94a3b8' }}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={isSubmitting || selectedItems.length === 0}
          sx={{
            background: 'linear-gradient(45deg, #F59E0B 30%, #D4AF37 90%)',
            color: '#000000',
            fontWeight: 'bold',
            borderRadius: 2,
            px: 2.5,
            '&:hover': { background: 'linear-gradient(45deg, #D97706 30%, #B45309 90%)' },
            '&.Mui-disabled': { bgcolor: 'rgba(255, 255, 255, 0.1)', color: '#64748b' }
          }}
        >
          {isSubmitting ? 'Saving...' : `Save (${selectedItems.length})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};