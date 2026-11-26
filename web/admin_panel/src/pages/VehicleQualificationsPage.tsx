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
  InputLabel,
  Checkbox,
  ListItemText,
  OutlinedInput
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  EmojiEvents as TrophyIcon,
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
  iconEmoji: string;
}

interface Qualification {
  id: string;
  name: string;
  description: string;
  rewardLabel: string;
  rewardIconEmoji: string;
  isActive: boolean;
  createdAt: string;
  requirements: { benefitId: string; benefit: Benefit }[];
}

export const VehicleQualificationsPage: React.FC = () => {
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [availableBenefits, setAvailableBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingQual, setEditingQual] = useState<Qualification | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rewardLabel, setRewardLabel] = useState('');
  const [rewardIconEmoji, setRewardIconEmoji] = useState('🏆');
  const [selectedBenefitIds, setSelectedBenefitIds] = useState<string[]>([]);
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [qualRes, benRes] = await Promise.all([
        axios.get(`${USER_PORTAL_API}/vehicles/qualifications`),
        axios.get(`${USER_PORTAL_API}/vehicles/benefits`)
      ]);
      setQualifications(qualRes.data.qualifications || []);
      setAvailableBenefits(benRes.data.benefits || []);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch vehicle qualifications data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenNew = () => {
    setEditingQual(null);
    setName('');
    setDescription('');
    setRewardLabel('');
    setRewardIconEmoji('🏆');
    setSelectedBenefitIds([]);
    setOpenModal(true);
  };

  const handleOpenEdit = (q: Qualification) => {
    setEditingQual(q);
    setName(q.name);
    setDescription(q.description || '');
    setRewardLabel(q.rewardLabel);
    setRewardIconEmoji(q.rewardIconEmoji || '🏆');
    setSelectedBenefitIds(q.requirements?.map(r => r.benefitId) || []);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !rewardLabel) {
      setError('Please provide name and reward label.');
      return;
    }
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (editingQual) {
        await axios.put(`${USER_PORTAL_API}/vehicles/qualifications/${editingQual.id}`, {
          name,
          description,
          rewardLabel,
          rewardIconEmoji,
          requiredBenefitIds: selectedBenefitIds
        });
        setSuccessMessage('Qualification updated successfully.');
      } else {
        await axios.post(`${USER_PORTAL_API}/vehicles/qualifications`, {
          name,
          description,
          rewardLabel,
          rewardIconEmoji,
          requiredBenefitIds: selectedBenefitIds
        });
        setSuccessMessage('New qualification created successfully.');
      }
      setOpenModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save qualification.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to deactivate this qualification?')) return;
    setError(null);
    setSuccessMessage(null);
    try {
      await axios.delete(`${USER_PORTAL_API}/vehicles/qualifications/${id}`);
      setSuccessMessage('Qualification deactivated successfully.');
      fetchData();
    } catch (err: any) {
      setError('Failed to delete qualification.');
    }
  };

  return (
    <Fade in={true} timeout={800}>
      <Box p={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 900, background: GOLD_GRADIENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 1 }}>
              Qualifications & Tier Matrix
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrophyIcon sx={{ fontSize: 18, color: '#FFD700' }} />
              Configure unlock requirements and dynamic reward statuses
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <IconButton onClick={fetchData} sx={{ color: '#FFD700', border: '1px solid rgba(255,215,0,0.3)' }}>
              <RefreshIcon />
            </IconButton>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenNew}
              sx={{ 
                background: 'linear-gradient(45deg, #F59E0B 30%, #D4AF37 90%)', 
                color: 'black', 
                fontWeight: 700, 
                px: 2,
                py: 0.75,
                borderRadius: 0.75,
                fontSize: '0.8125rem',
                textTransform: 'none',
                boxShadow: '0 2px 8px rgba(245,158,11,0.25)',
                '&:hover': { background: 'linear-gradient(45deg, #D97706 30%, #B45309 90%)' } 
              }}
            >
              Add Qualification
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
            {qualifications.map(q => (
              <Grid item xs={12} md={6} key={q.id}>
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
                      <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="h3" sx={{ p: 1.5, borderRadius: 3, background: 'rgba(255,215,0,0.1)' }}>
                          {q.rewardIconEmoji || '🏆'}
                        </Typography>
                        <Box>
                          <Typography variant="h5" sx={{ color: 'white', fontWeight: 800 }}>{q.name}</Typography>
                          <Chip 
                            size="small" 
                            icon={<span>{q.rewardIconEmoji}</span>}
                            label={q.rewardLabel} 
                            sx={{ bgcolor: 'rgba(255,215,0,0.2)', color: '#FFD700', fontWeight: 800, mt: 0.5 }} 
                          />
                        </Box>
                      </Box>
                      <Box>
                        <Tooltip title="Edit Qualification">
                          <IconButton size="small" onClick={() => handleOpenEdit(q)} sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Deactivate">
                          <IconButton size="small" onClick={() => handleDelete(q.id)} sx={{ color: 'rgba(239,68,68,0.7)' }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', my: 2 }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                      {q.description || 'No description provided.'}
                    </Typography>

                    <Typography variant="subtitle2" sx={{ color: '#FFD700', fontWeight: 700, mb: 1, textTransform: 'uppercase', fontSize: 11, letterSpacing: 1 }}>
                      Prerequisite Claimed Benefits ({q.requirements?.length || 0})
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                      {q.requirements?.map(req => (
                        <Chip
                          key={req.benefitId}
                          size="small"
                          label={`${req.benefit?.iconEmoji || '🔧'} ${req.benefit?.name || 'Unknown Benefit'}`}
                          sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: 'white', mb: 1 }}
                        />
                      ))}
                      {(!q.requirements || q.requirements.length === 0) && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                          No prerequisites required (unlocked by default).
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" pt={2} borderTop="1px solid rgba(255,255,255,0.05)">
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Configured: {new Date(q.createdAt).toLocaleDateString()}
                    </Typography>
                    <Chip size="small" label={q.isActive ? 'Active Status' : 'Inactive'} color={q.isActive ? 'success' : 'default'} />
                  </Box>
                </Paper>
              </Grid>
            ))}
            {qualifications.length === 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 6, textAlign: 'center', background: GLASS_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 4 }}>
                  <TrophyIcon sx={{ fontSize: 60, color: 'rgba(255,215,0,0.3)', mb: 2 }} />
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>No Qualifications Matrix Defined</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, mb: 3 }}>
                    Click "Add Qualification" to set up tier unlock rules.
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        )}

        {/* Create / Edit Modal */}
        <Dialog open={openModal} onClose={handleCloseModal} PaperProps={{ sx: { background: '#141416', border: '1px solid #FFD700', borderRadius: 4, minWidth: 450, color: 'white' } }}>
          <form onSubmit={handleSave}>
            <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 2, fontWeight: 800, color: '#FFD700' }}>
              {editingQual ? 'Edit Tier Qualification' : 'Create Tier Qualification'}
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Stack spacing={3} sx={{ mt: 1 }}>
                <TextField
                  fullWidth
                  label="Qualification Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { color: 'white' }, '& .MuiInputLabel-root': { color: 'text.secondary' } }}
                />
                <Grid container spacing={2}>
                  <Grid item xs={8}>
                    <TextField
                      fullWidth
                      label="Reward Status Label"
                      required
                      placeholder="e.g. Premium Dispatch Priority"
                      value={rewardLabel}
                      onChange={(e) => setRewardLabel(e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { color: 'white' }, '& .MuiInputLabel-root': { color: 'text.secondary' } }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="Badge Emoji"
                      value={rewardIconEmoji}
                      onChange={(e) => setRewardIconEmoji(e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { color: 'white' }, '& .MuiInputLabel-root': { color: 'text.secondary' } }}
                    />
                  </Grid>
                </Grid>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description / Terms"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { color: 'white' }, '& .MuiInputLabel-root': { color: 'text.secondary' } }}
                />

                <FormControl fullWidth sx={{ '& .MuiInputLabel-root': { color: 'text.secondary' } }}>
                  <InputLabel id="benefits-select-label">Required Claimed Benefits</InputLabel>
                  <Select
                    labelId="benefits-select-label"
                    multiple
                    value={selectedBenefitIds}
                    onChange={(e) => setSelectedBenefitIds(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                    input={<OutlinedInput label="Required Claimed Benefits" sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }} />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const ben = availableBenefits.find(b => b.id === value);
                          return <Chip key={value} label={ben ? `${ben.iconEmoji} ${ben.name}` : value} sx={{ bgcolor: 'rgba(255,215,0,0.2)', color: '#FFD700', fontWeight: 700 }} size="small" />;
                        })}
                      </Box>
                    )}
                  >
                    {availableBenefits.map((ben) => (
                      <MenuItem key={ben.id} value={ben.id} sx={{ color: 'white' }}>
                        <Checkbox checked={selectedBenefitIds.indexOf(ben.id) > -1} sx={{ color: '#FFD700', '&.Mui-checked': { color: '#FFD700' } }} />
                        <ListItemText primary={`${ben.iconEmoji} ${ben.name}`} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', p: 2 }}>
              <Button onClick={handleCloseModal} sx={{ color: 'text.secondary' }}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={saving} sx={{ bgcolor: '#FFD700', color: 'black', fontWeight: 800, '&:hover': { bgcolor: '#E6C200' } }}>
                {saving ? <CircularProgress size={20} /> : 'Save Qualification'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </Fade>
  );
};
