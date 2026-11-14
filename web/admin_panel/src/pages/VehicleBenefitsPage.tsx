import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  CircularProgress, 
  Grid, 
  Paper, 
  TextField, 
  Typography,
  Fade,
  Divider,
  Stack,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  CardGiftcard as GiftIcon,
  Category as CategoryIcon,
  Description as DescIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';

const USER_PORTAL_API = 'http://localhost:3000/api';

const GOLD_GRADIENT = 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)';
const GLASS_BG = 'rgba(15, 23, 42, 0.7)';
const CARD_BORDER = 'rgba(255, 215, 0, 0.1)';

interface Benefit {
  id: string;
  name: string;
  description: string;
  category: string;
  iconEmoji: string;
  isActive: boolean;
  createdAt: string;
}

export const VehicleBenefitsPage: React.FC = () => {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingBenefit, setEditingBenefit] = useState<Benefit | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('INSURANCE');
  const [iconEmoji, setIconEmoji] = useState('🔧');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchBenefits = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${USER_PORTAL_API}/vehicles/benefits`);
      setBenefits(res.data.benefits || []);
    } catch (err: any) {
      console.error('Error fetching benefits:', err);
      setError('Failed to fetch vehicle benefits.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBenefits();
  }, []);

  const handleOpenNew = () => {
    setEditingBenefit(null);
    setName('');
    setDescription('');
    setCategory('INSURANCE');
    setIconEmoji('🔧');
    setOpenModal(true);
  };

  const handleOpenEdit = (b: Benefit) => {
    setEditingBenefit(b);
    setName(b.name);
    setDescription(b.description || '');
    setCategory(b.category);
    setIconEmoji(b.iconEmoji || '🔧');
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category) {
      setError('Please provide name and category.');
      return;
    }
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (editingBenefit) {
        await axios.put(`${USER_PORTAL_API}/vehicles/benefits/${editingBenefit.id}`, {
          name,
          description,
          category,
          iconEmoji
        });
        setSuccessMessage('Benefit updated successfully.');
      } else {
        await axios.post(`${USER_PORTAL_API}/vehicles/benefits`, {
          name,
          description,
          category,
          iconEmoji
        });
        setSuccessMessage('New benefit created successfully.');
      }
      setOpenModal(false);
      fetchBenefits();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save benefit.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to deactivate this benefit?')) return;
    setError(null);
    setSuccessMessage(null);
    try {
      await axios.delete(`${USER_PORTAL_API}/vehicles/benefits/${id}`);
      setSuccessMessage('Benefit deactivated successfully.');
      fetchBenefits();
    } catch (err: any) {
      setError('Failed to delete benefit.');
    }
  };

  return (
    <Fade in={true} timeout={800}>
      <Box p={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 900, background: GOLD_GRADIENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 1 }}>
              Vehicle Benefits Catalogue
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
              <GiftIcon sx={{ fontSize: 18, color: '#FFD700' }} />
              Manage available fleet benefits and incentive structures
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <IconButton onClick={fetchBenefits} sx={{ color: '#FFD700', border: '1px solid rgba(255,215,0,0.3)' }}>
              <RefreshIcon />
            </IconButton>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenNew}
              sx={{ 
                bgcolor: '#FFD700', 
                color: 'black', 
                fontWeight: 800, 
                px: 4,
                py: 1.5,
                borderRadius: 3,
                boxShadow: '0 10px 20px rgba(255,215,0,0.2)',
                '&:hover': { bgcolor: '#E6C200' } 
              }}
            >
              Add Benefit
            </Button>
          </Stack>
        </Box>

        {error && (
          <Paper sx={{ p: 2, mb: 4, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 2 }}>
            <Typography color="error" variant="body2">{error}</Typography>
          </Paper>
        )}

        {successMessage && (
          <Paper sx={{ p: 2, mb: 4, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 2 }}>
            <Typography sx={{ color: '#10B981' }} variant="body2">{successMessage}</Typography>
          </Paper>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
            <CircularProgress sx={{ color: '#FFD700' }} />
          </Box>
        ) : (
          <Grid container spacing={4}>
            {benefits.map(b => (
              <Grid item xs={12} sm={6} md={4} key={b.id}>
                <Paper sx={{ 
                  p: 3, 
                  background: GLASS_BG, 
                  backdropFilter: 'blur(20px)',
                  borderRadius: 4,
                  border: `1px solid ${CARD_BORDER}`,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'translateY(-5px)', border: '1px solid #FFD700' }
                }}>
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Typography variant="h4" sx={{ p: 1, borderRadius: 2, background: 'rgba(255,215,0,0.1)' }}>
                          {b.iconEmoji || '🔧'}
                        </Typography>
                        <Box>
                          <Typography variant="h6" sx={{ color: 'white', fontWeight: 800 }}>{b.name}</Typography>
                          <Chip 
                            size="small" 
                            label={b.category} 
                            sx={{ bgcolor: 'rgba(255,215,0,0.15)', color: '#FFD700', fontWeight: 700, mt: 0.5 }} 
                          />
                        </Box>
                      </Box>
                      <Box>
                        <Tooltip title="Edit Benefit">
                          <IconButton size="small" onClick={() => handleOpenEdit(b)} sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Deactivate">
                          <IconButton size="small" onClick={() => handleDelete(b.id)} sx={{ color: 'rgba(239,68,68,0.7)' }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', my: 1.5 }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                      {b.description || 'No description provided.'}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" pt={2} borderTop="1px solid rgba(255,255,255,0.05)">
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Created: {new Date(b.createdAt).toLocaleDateString()}
                    </Typography>
                    <Chip size="small" label={b.isActive ? 'Active' : 'Inactive'} color={b.isActive ? 'success' : 'default'} />
                  </Box>
                </Paper>
              </Grid>
            ))}
            {benefits.length === 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 6, textAlign: 'center', background: GLASS_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 4 }}>
                  <GiftIcon sx={{ fontSize: 60, color: 'rgba(255,215,0,0.3)', mb: 2 }} />
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>No Benefits Configured</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, mb: 3 }}>
                    Click "Add Benefit" to create the first catalogue entry.
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        )}

        {/* Create / Edit Modal */}
        <Dialog open={openModal} onClose={handleCloseModal} PaperProps={{ sx: { background: '#141416', border: '1px solid #FFD700', borderRadius: 4, minWidth: 400, color: 'white' } }}>
          <form onSubmit={handleSave}>
            <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 2, fontWeight: 800, color: '#FFD700' }}>
              {editingBenefit ? 'Edit Benefit' : 'Create New Benefit'}
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Stack spacing={3} sx={{ mt: 1 }}>
                <TextField
                  fullWidth
                  label="Benefit Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { color: 'white' }, '& .MuiInputLabel-root': { color: 'text.secondary' } }}
                />
                <FormControl fullWidth sx={{ '& .MuiInputLabel-root': { color: 'text.secondary' } }}>
                  <InputLabel id="category-select-label">Category</InputLabel>
                  <Select
                    labelId="category-select-label"
                    value={category}
                    label="Category"
                    onChange={(e) => setCategory(e.target.value)}
                    sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
                  >
                    <MenuItem value="INSURANCE">Insurance</MenuItem>
                    <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
                    <MenuItem value="FINANCIAL">Financial / Loan</MenuItem>
                    <MenuItem value="HEALTH">Health</MenuItem>
                    <MenuItem value="OTHER">Other</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Icon Emoji"
                  placeholder="e.g. 🛡️, 🔧, 💰"
                  value={iconEmoji}
                  onChange={(e) => setIconEmoji(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { color: 'white' }, '& .MuiInputLabel-root': { color: 'text.secondary' } }}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { color: 'white' }, '& .MuiInputLabel-root': { color: 'text.secondary' } }}
                />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', p: 2 }}>
              <Button onClick={handleCloseModal} sx={{ color: 'text.secondary' }}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={saving} sx={{ bgcolor: '#FFD700', color: 'black', fontWeight: 800, '&:hover': { bgcolor: '#E6C200' } }}>
                {saving ? <CircularProgress size={20} /> : 'Save Benefit'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </Fade>
  );
};
