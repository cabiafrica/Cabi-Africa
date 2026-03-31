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
  driverId: string;
  driverName: string;
  currentGroups: string[];
  onAssign: (groupIds: string[]) => Promise<void>;
}

const MOCK_GROUPS: Group[] = [
  { id: '1', name: 'Waitingi Drivers', memberCount: 15, type: 'OPERATIONAL' },
  { id: '2', name: 'Nairobi CBD Sector', memberCount: 42, type: 'GEOGRAPHIC' },
  { id: '3', name: 'Night Shift Elite', memberCount: 8, type: 'PERFORMANCE' },
  { id: '4', name: 'New Recruits', memberCount: 120, type: 'ONBOARDING' },
];

export const AssignDriverToGroupModal = ({
  isOpen,
  onClose,
  driverId,
  driverName,
  currentGroups,
  onAssign,
}: AssignDriverToGroupModalProps) => {
  const [selectedGroups, setSelectedGroups] = useState<string[]>(currentGroups);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredGroups = MOCK_GROUPS.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleGroup = (groupId: string) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await onAssign(selectedGroups);
      onClose();
    } catch (error) {
      console.error('Failed to assign groups:', error);
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
          {filteredGroups.map((group) => (
            <React.Fragment key={group.id}>
              <ListItem
                dense
                onClick={() => toggleGroup(group.id)}
                sx={{ borderRadius: 1 }}
              >
                <Checkbox
                  edge="start"
                  checked={selectedGroups.includes(group.id)}
                  tabIndex={-1}
                  disableRipple
                />
                <ListItemText
                  primary={group.name}
                  secondary={`${group.memberCount} members • ${group.type}`}
                />
                <Badge
                  label={group.type}
                  size="small"
                  variant="outlined"
                  sx={{ ml: 1, fontSize: '0.7rem' }}
                />
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
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