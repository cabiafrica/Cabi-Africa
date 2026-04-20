import React, { useState } from 'react';
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
  Chip as Badge,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface Group {
  id: string;
  name: string;
  memberCount: number;
  type: string;
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

const MOCK_GROUPS: Group[] = [];

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
  const isGroupToDriverMode = !!groupId;

  const filteredGroups = MOCK_GROUPS.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      if (isGroupToDriverMode) {
        // Mock assigning drivers to group
        await new Promise(resolve => setTimeout(resolve, 1000));
        onSuccess?.();
      } else {
        await onAssign?.(selectedItems);
      }
      onClose();
    } catch (error) {
      console.error('Failed to assign:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Assign Driver to Groups</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Managing groups for: <strong>{driverName}</strong>
          </Typography>
        </Box>

        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Search groups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ mb: 2 }}
        />

        <List sx={{ maxHeight: 300, overflow: 'auto' }}>
          {(isGroupToDriverMode ? [] : filteredGroups).map((item: any) => (
            <React.Fragment key={item.id}>
              <ListItem
                dense
                onClick={() => toggleItem(item.id)}
                sx={{ borderRadius: 1 }}
              >
                <Checkbox
                  edge="start"
                  checked={selectedItems.includes(item.id)}
                  tabIndex={-1}
                  disableRipple
                />
                <ListItemText
                  primary={item.name}
                  secondary={isGroupToDriverMode ? 'Driver' : `${item.memberCount} members • ${item.type}`}
                />
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
          {isGroupToDriverMode && (
             <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                Driver search not implemented yet.
             </Typography>
          )}
          {filteredGroups.length === 0 && (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
              No groups found matching your search.
            </Typography>
          )}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};