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
import apiClient from '../../services/apiClient';

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
      await apiClient.post('/admin/driver-groups', formData);
      onSuccess();
      setFormData({ name: '', description: '', parentGroupId: null });
    } catch (error: any) {
      console.error('Failed to create driver group:', error);
      alert(error.response?.data?.message || error.message || 'Failed to create driver group');
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

  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      bgcolor: 'rgba(255, 255, 255, 0.03)',
      borderRadius: 2,
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      '& fieldset': { border: 'none' },
      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' },
      '&.Mui-focused': { border: '1px solid #F59E0B' }
    },
    '& .MuiInputLabel-root': { color: '#94a3b8' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#F59E0B' }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          bgcolor: '#131722',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'white',
          borderRadius: 3,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
        }
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1, color: 'white' }}>
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
            <BuildingIcon fontSize="small" />
          </Box>
          <Typography variant="h6" fontWeight="bold">Create Driver Group</Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
          <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
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
              sx={inputStyles}
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
              sx={inputStyles}
            />

            <FormControl fullWidth sx={inputStyles}>
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
                sx={{
                  color: 'white',
                  '& .MuiSelect-icon': { color: '#94a3b8' }
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: '#131722',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'white'
                    }
                  }
                }}
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
        <DialogActions sx={{ px: 3, py: 2, borderColor: 'rgba(255, 255, 255, 0.08)', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <Button onClick={onClose} disabled={loading} sx={{ color: '#94a3b8' }}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading || !formData.name.trim()}
            sx={{
              background: 'linear-gradient(45deg, #F59E0B 30%, #D4AF37 90%)',
              color: '#000000',
              fontWeight: 'bold',
              px: 3,
              borderRadius: 2,
              '&:hover': { background: 'linear-gradient(45deg, #D97706 30%, #B45309 90%)' },
              '&.Mui-disabled': { bgcolor: 'rgba(255, 255, 255, 0.1)', color: '#64748b' }
            }}
          >
            {loading ? <CircularProgress size={20} sx={{ color: '#000' }} /> : 'Create Group'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}