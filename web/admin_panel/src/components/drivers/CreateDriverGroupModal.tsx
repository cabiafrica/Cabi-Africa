import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import BuildingIcon from '@mui/icons-material/Business';
import { DriverGroup } from '@/types/admin';

interface CreateDriverGroupModalProps {
  onClose: () => void;
  onSuccess: () => void;
  existingGroups?: DriverGroup[];
}

interface CreateGroupForm {
  name: string;
  description: string;
  parentGroupId: string | null;
}

export function CreateDriverGroupModal({
  onClose,
  onSuccess,
  existingGroups = [],
}: CreateDriverGroupModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateGroupForm>({
    name: '',
    description: '',
    parentGroupId: null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/admin/driver-groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create driver group');
      }

      onSuccess();
      setFormData({ name: '', description: '', parentGroupId: null });
    } catch (error) {
      console.error('Failed to create driver group:', error);
      alert(error instanceof Error ? error.message : 'Failed to create driver group');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof CreateGroupForm,
    value: string | null
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BuildingIcon color="primary" />
          Create Driver Group
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create a new driver group to organize your drivers hierarchically.
            You can optionally select a parent group to create a subgroup.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Group Name"
              required
              fullWidth
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={loading}
              autoFocus
            />

            <TextField
              label="Description"
              multiline
              rows={3}
              fullWidth
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={loading}
              placeholder="Enter group description (optional)"
            />

            <FormControl fullWidth>
              <InputLabel id="parent-group-label">Parent Group</InputLabel>
              <Select
                labelId="parent-group-label"
                id="parent-group-select"
                label="Parent Group"
                value={formData.parentGroupId || 'none'}
                onChange={(e) => 
                  handleInputChange('parentGroupId', e.target.value === 'none' ? null : e.target.value)
                }
                disabled={loading}
              >
                <MenuItem value="none">None (Root Group)</MenuItem>
                {existingGroups.map((group) => (
                  <MenuItem key={group.id} value={group.id}>
                    {group.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading || !formData.name.trim()}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Group'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}