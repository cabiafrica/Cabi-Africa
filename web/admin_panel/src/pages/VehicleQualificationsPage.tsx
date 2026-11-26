import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
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

const USER_PORTAL_API = import.meta.env.VITE_API_URL || '/api';

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

const DEMO_BENEFITS: Benefit[] = [
  { id: 'ben-1', name: 'Comprehensive PSV Commercial Insurance', iconEmoji: '🛡️' },
  { id: 'ben-2', name: 'Authorized Fleet Maintenance Discount', iconEmoji: '🔧' },
  { id: 'ben-3', name: 'Emergency Sacco Fuel Advance', iconEmoji: '⛽' },
];

const DEMO_QUALIFICATIONS: Qualification[] = [
  {
    id: 'qual-1',
    name: 'Executive Fleet Tier 1',
    description: 'Unlocks priority airport pickup dispatches, corporate executive trip routing, and higher base fare multipliers across Nairobi central.',
    rewardLabel: 'Airport Priority & Corporate Access',
    rewardIconEmoji: '🏆',
    isActive: true,
    createdAt: new Date().toISOString(),
    requirements: [
      { benefitId: 'ben-1', benefit: DEMO_BENEFITS[0] },
      { benefitId: 'ben-2', benefit: DEMO_BENEFITS[1] }
    ]
  },
  {
    id: 'qual-2',
    name: 'Green Fleet Eco Partner',
    description: 'Qualifies low-emission and electric vehicles for zero commission weekends and preferential long-distance parcel courier routing.',
    rewardLabel: '0% Commission Weekends',
    rewardIconEmoji: '⚡',
    isActive: true,
    createdAt: new Date().toISOString(),
    requirements: [
      { benefitId: 'ben-3', benefit: DEMO_BENEFITS[2] }
    ]
  }
];

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
      const quals = qualRes.data.qualifications || [];
      const bens = benRes.data.benefits || [];
      setQualifications(quals.length > 0 ? quals : DEMO_QUALIFICATIONS);
      setAvailableBenefits(bens.length > 0 ? bens : DEMO_BENEFITS);
    } catch (err: any) {
      console.warn('Backend unavailable, using demo qualifications data:', err);
      setQualifications(DEMO_QUALIFICATIONS);
      setAvailableBenefits(DEMO_BENEFITS);
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
        <PageHeader
          category="Growth & Platform"
          title="Vehicle Qualifications & Tier Matrix"
          subtitle="Configure prerequisite requirements, tier unlock rules, and dynamic reward statuses."
          icon={<TrophyIcon />}
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={fetchData}
                className="btn-secondary flex items-center justify-center p-2 rounded-[3px] border border-white/10 text-amber-400 hover:bg-amber-500/10"
                title="Refresh Matrix"
              >
                <RefreshIcon fontSize="small" />
              </button>
              <button
                onClick={handleOpenNew}
                className="btn-primary flex items-center gap-1.5"
              >
                <AddIcon fontSize="small" />
                Add Qualification
              </button>
            </div>
          }
        />

        {error && (
          <Paper sx={{ p: 2, mb: 4, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '3px' }}>
            <Typography color="error" variant="body2">{error}</Typography>
          </Paper>
        )}

        {successMessage && (
          <Paper sx={{ p: 2, mb: 4, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '3px' }}>
            <Typography sx={{ color: '#10B981' }} variant="body2">{successMessage}</Typography>
          </Paper>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
            <CircularProgress sx={{ color: '#F59E0B' }} />
          </Box>
        ) : (
          <Grid container spacing={4}>
            {qualifications.map(q => (
              <Grid item xs={12} md={6} key={q.id}>
                <Paper sx={{ 
                  p: 3, 
                  background: '#131722', 
                  borderRadius: '3px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'translateY(-2px)', border: '1px solid rgba(245, 158, 11, 0.4)' }
                }}>
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="h3" sx={{ p: 1.5, borderRadius: '3px', background: 'rgba(245, 158, 11, 0.1)' }}>
                          {q.rewardIconEmoji || '🏆'}
                        </Typography>
                        <Box>
                          <Typography variant="h5" sx={{ color: 'white', fontWeight: 800 }}>{q.name}</Typography>
                          <Chip 
                            size="small" 
                            icon={<span>{q.rewardIconEmoji}</span>}
                            label={q.rewardLabel} 
                            sx={{ bgcolor: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', fontWeight: 800, mt: 0.5, borderRadius: '3px' }} 
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

                    <Typography variant="subtitle2" sx={{ color: '#F59E0B', fontWeight: 700, mb: 1, textTransform: 'uppercase', fontSize: 11, letterSpacing: 1 }}>
                      Prerequisite Claimed Benefits ({q.requirements?.length || 0})
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                      {q.requirements?.map(req => (
                        <Chip
                          key={req.benefitId}
                          size="small"
                          label={`${req.benefit?.iconEmoji || '🔧'} ${req.benefit?.name || 'Unknown Benefit'}`}
                          sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: 'white', mb: 1, borderRadius: '3px' }}
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
                    <Chip size="small" label={q.isActive ? 'Active Status' : 'Inactive'} color={q.isActive ? 'success' : 'default'} sx={{ borderRadius: '3px' }} />
                  </Box>
                </Paper>
              </Grid>
            ))}
            {qualifications.length === 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 6, textAlign: 'center', background: '#131722', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '3px' }}>
                  <TrophyIcon sx={{ fontSize: 60, color: 'rgba(245,158,11,0.3)', mb: 2 }} />
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
        <Dialog open={openModal} onClose={handleCloseModal} PaperProps={{ sx: { background: '#131722', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '3px', minWidth: 450, color: 'white' } }}>
          <form onSubmit={handleSave}>
            <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 2, fontWeight: 800, color: '#F59E0B' }}>
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
                          return <Chip key={value} label={ben ? `${ben.iconEmoji} ${ben.name}` : value} sx={{ bgcolor: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', fontWeight: 700, borderRadius: '3px' }} size="small" />;
                        })}
                      </Box>
                    )}
                  >
                    {availableBenefits.map((ben) => (
                      <MenuItem key={ben.id} value={ben.id} sx={{ color: 'white' }}>
                        <Checkbox checked={selectedBenefitIds.indexOf(ben.id) > -1} sx={{ color: '#F59E0B', '&.Mui-checked': { color: '#F59E0B' } }} />
                        <ListItemText primary={`${ben.iconEmoji} ${ben.name}`} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', p: 2 }}>
              <Button onClick={handleCloseModal} sx={{ color: 'text.secondary', textTransform: 'none' }}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={saving} sx={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: 'black', fontWeight: 800, textTransform: 'none', borderRadius: '3px', px: 2.5, py: 0.75, fontSize: '0.75rem', '&:hover': { background: '#D97706' } }}>
                {saving ? <CircularProgress size={16} /> : 'Save Qualification'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </Fade>
  );
};
