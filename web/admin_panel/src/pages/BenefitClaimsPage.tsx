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
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import { 
  CheckCircle as ApproveIcon, 
  Cancel as RejectIcon, 
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Description as FileIcon,
  DirectionsCar as CarIcon,
  Person as DriverIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

const USER_PORTAL_API = 'http://localhost:3000/api';

const GOLD_GRADIENT = 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)';
const GLASS_BG = 'rgba(15, 23, 42, 0.7)';
const CARD_BORDER = 'rgba(255, 215, 0, 0.1)';

interface Claim {
  id: string;
  vehicleId: string;
  driverId: string;
  benefitId: string;
  evidenceFileUrl: string;
  notes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  reportedAt: string;
  reviewedAt?: string;
  benefit: { name: string; iconEmoji: string; category: string };
  vehicle: { plateNumber: string; make: string; model: string };
  driver: { user: { firstName: string; lastName: string; phone?: string } };
}

export const BenefitClaimsPage: React.FC = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  
  // Review Modal State
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [unlockedQuals, setUnlockedQuals] = useState<any[]>([]);

  const fetchClaims = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = statusFilter === 'ALL' 
        ? `${USER_PORTAL_API}/admin/vehicles/claims` 
        : `${USER_PORTAL_API}/admin/vehicles/claims?status=${statusFilter}`;
      const res = await axios.get(url);
      setClaims(res.data.claims || []);
    } catch (err: any) {
      console.error('Error fetching claims queue:', err);
      setError('Failed to load benefit claims review queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [statusFilter]);

  const handleOpenReview = (claim: Claim, action: 'APPROVED' | 'REJECTED') => {
    setSelectedClaim(claim);
    setReviewAction(action);
    setRejectionReason('');
    setUnlockedQuals([]);
  };

  const handleCloseReview = () => {
    setSelectedClaim(null);
    setReviewAction(null);
  };

  const handleConfirmReview = async () => {
    if (!selectedClaim || !reviewAction) return;
    if (reviewAction === 'REJECTED' && !rejectionReason.trim()) {
      setError('Please provide a reason for rejecting this claim.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await axios.post(`${USER_PORTAL_API}/admin/vehicles/claims/${selectedClaim.id}/review`, {
        status: reviewAction,
        rejectionReason: reviewAction === 'REJECTED' ? rejectionReason : undefined,
        adminId: user?.id || 'admin-dashboard'
      });

      setSuccessMessage(`Claim successfully ${reviewAction.toLowerCase()}.`);
      if (res.data.unlockedQualifications && res.data.unlockedQualifications.length > 0) {
        setUnlockedQuals(res.data.unlockedQualifications);
      }
      setSelectedClaim(null);
      setReviewAction(null);
      fetchClaims();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit review decision.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Fade in={true} timeout={800}>
      <Box p={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 900, background: GOLD_GRADIENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 1 }}>
              Operator Benefit Claims Review
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
              <FileIcon sx={{ fontSize: 18, color: '#FFD700' }} />
              Audit and authorize self-reported driver benefits & unlocking milestones
            </Typography>
          </Box>
          <IconButton onClick={fetchClaims} sx={{ color: '#FFD700', border: '1px solid rgba(255,215,0,0.3)' }}>
            <RefreshIcon />
          </IconButton>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)', mb: 4 }}>
          <Tabs 
            value={statusFilter} 
            onChange={(_, newValue) => setStatusFilter(newValue)}
            sx={{ 
              '& .MuiTab-root': { color: 'text.secondary', fontWeight: 700, fontSize: 13, textTransform: 'uppercase' },
              '& .Mui-selected': { color: '#FFD700' },
              '& .MuiTabs-indicator': { backgroundColor: '#FFD700' }
            }}
          >
            <Tab label="All Submissions" value="ALL" />
            <Tab label="Pending Review Queue" value="PENDING" />
            <Tab label="Approved Milestones" value="APPROVED" />
            <Tab label="Rejected Claims" value="REJECTED" />
          </Tabs>
        </Box>

        {error && (
          <Paper sx={{ p: 2, mb: 4, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 2 }}>
            <Typography color="error" variant="body2">{error}</Typography>
          </Paper>
        )}

        {successMessage && (
          <Paper sx={{ p: 2, mb: 4, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 2 }}>
            <Typography sx={{ color: '#10B981', fontWeight: 700 }} variant="body2">{successMessage}</Typography>
            {unlockedQuals.length > 0 && (
              <Alert severity="success" sx={{ mt: 2, bgcolor: 'rgba(16, 185, 129, 0.2)', color: '#10B981', '& .MuiAlert-icon': { color: '#10B981' } }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>🎉 New Qualification Unlocked for this Vehicle!</Typography>
                <Stack spacing={0.5} sx={{ mt: 1 }}>
                  {unlockedQuals.map((q: any) => (
                    <Typography key={q.id} variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {q.rewardIconEmoji} <strong>{q.name}:</strong> {q.rewardLabel}
                    </Typography>
                  ))}
                </Stack>
              </Alert>
            )}
          </Paper>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
            <CircularProgress sx={{ color: '#FFD700' }} />
          </Box>
        ) : (
          <Grid container spacing={4}>
            {claims.map(c => (
              <Grid item xs={12} key={c.id}>
                <Paper sx={{ 
                  p: 3, 
                  background: GLASS_BG, 
                  backdropFilter: 'blur(20px)',
                  borderRadius: 4,
                  border: `1px solid ${c.status === 'PENDING' ? '#FFD700' : c.status === 'APPROVED' ? '#10B981' : '#EF4444'}`,
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }
                }}>
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="h3" sx={{ p: 1.5, borderRadius: 3, background: 'rgba(255,215,0,0.1)' }}>
                          {c.benefit?.iconEmoji || '🔧'}
                        </Typography>
                        <Box>
                          <Typography variant="h6" sx={{ color: 'white', fontWeight: 800 }}>
                            {c.benefit?.name || 'Unknown Benefit'}
                          </Typography>
                          <Chip size="small" label={c.benefit?.category || 'General'} sx={{ bgcolor: 'rgba(255,215,0,0.15)', color: '#FFD700', fontWeight: 700, mt: 0.5 }} />
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={5}>
                      <Stack spacing={1}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <DriverIcon sx={{ color: '#FFD700', fontSize: 18 }} />
                          <Typography variant="body2" sx={{ color: 'white', fontWeight: 700 }}>
                            {c.driver?.user?.firstName || ''} {c.driver?.user?.lastName || 'Authorized Operator'}
                            {c.driver?.user?.phone && <span style={{ opacity: 0.6, fontWeight: 400 }}> ({c.driver.user.phone})</span>}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <CarIcon sx={{ color: '#FFD700', fontSize: 18 }} />
                          <Typography variant="body2" sx={{ color: 'white', fontWeight: 700 }}>
                            {c.vehicle?.plateNumber || 'N/A'} <span style={{ opacity: 0.6, fontWeight: 400 }}>({c.vehicle?.make || ''} {c.vehicle?.model || ''})</span>
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Reported on {new Date(c.reportedAt).toLocaleString()}
                        </Typography>
                      </Stack>
                    </Grid>

                    <Grid item xs={12} md={3} textAlign={{ xs: 'left', md: 'right' }}>
                      <Box display="flex" flexDirection="column" alignItems={{ xs: 'flex-start', md: 'flex-end' }} gap={1.5}>
                        <Chip
                          label={c.status}
                          sx={{
                            fontWeight: 800,
                            px: 1.5,
                            py: 2,
                            borderRadius: 2,
                            bgcolor: c.status === 'PENDING' ? 'rgba(255,215,0,0.2)' : c.status === 'APPROVED' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                            color: c.status === 'PENDING' ? '#FFD700' : c.status === 'APPROVED' ? '#10B981' : '#EF4444'
                          }}
                        />
                        {c.status === 'PENDING' && (
                          <Stack direction="row" spacing={1}>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<ApproveIcon />}
                              onClick={() => handleOpenReview(c, 'APPROVED')}
                              sx={{ bgcolor: '#10B981', color: 'white', fontWeight: 800, '&:hover': { bgcolor: '#059669' } }}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<RejectIcon />}
                              onClick={() => handleOpenReview(c, 'REJECTED')}
                              sx={{ color: '#EF4444', borderColor: '#EF4444', fontWeight: 800, '&:hover': { bgcolor: 'rgba(239,68,68,0.1)' } }}
                            >
                              Reject
                            </Button>
                          </Stack>
                        )}
                        {c.evidenceFileUrl && (
                          <Button
                            variant="text"
                            size="small"
                            startIcon={<ViewIcon />}
                            href={c.evidenceFileUrl}
                            target="_blank"
                            sx={{ color: '#FFD700', textTransform: 'none', fontWeight: 700 }}
                          >
                            View Evidence File
                          </Button>
                        )}
                      </Box>
                    </Grid>
                  </Grid>

                  {c.notes && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2, borderLeft: '3px solid #FFD700' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', mb: 0.5 }}>Operator Notes</Typography>
                      <Typography variant="body2" sx={{ color: 'white' }}>{c.notes}</Typography>
                    </Box>
                  )}

                  {c.rejectionReason && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(239,68,68,0.1)', borderRadius: 2, borderLeft: '3px solid #EF4444' }}>
                      <Typography variant="caption" sx={{ color: '#EF4444', fontWeight: 700, display: 'block', mb: 0.5 }}>Rejection Rationale</Typography>
                      <Typography variant="body2" sx={{ color: 'white' }}>{c.rejectionReason}</Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            ))}
            {claims.length === 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 6, textAlign: 'center', background: GLASS_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 4 }}>
                  <FileIcon sx={{ fontSize: 60, color: 'rgba(255,215,0,0.3)', mb: 2 }} />
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>No Claims Matching Filter</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, mb: 3 }}>
                    The current queue is empty for the selected review status.
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        )}

        {/* Review Authorization Modal */}
        <Dialog open={!!selectedClaim} onClose={handleCloseReview} PaperProps={{ sx: { background: '#0F172A', border: `1px solid ${reviewAction === 'APPROVED' ? '#10B981' : '#EF4444'}`, borderRadius: 4, minWidth: 450, color: 'white' } }}>
          <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 2, fontWeight: 800, color: reviewAction === 'APPROVED' ? '#10B981' : '#EF4444' }}>
            {reviewAction === 'APPROVED' ? 'Confirm Claim Approval' : 'Decline Benefit Claim'}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Typography variant="body1" sx={{ mb: 2, color: 'white' }}>
              Are you sure you want to <strong>{reviewAction?.toLowerCase()}</strong> the benefit claim for <strong>{selectedClaim?.benefit?.name}</strong> reported by <strong>{selectedClaim?.driver?.user?.firstName || 'this operator'}</strong>?
            </Typography>

            {reviewAction === 'REJECTED' && (
              <TextField
                fullWidth
                multiline
                required
                rows={3}
                label="Rejection Reason (Required for Audit Log)"
                placeholder="Explain why this claim does not meet verification requirements..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                sx={{ mt: 2, '& .MuiOutlinedInput-root': { color: 'white', '&.Mui-focused fieldset': { borderColor: '#EF4444' } }, '& .MuiInputLabel-root': { color: 'text.secondary' } }}
              />
            )}

            {reviewAction === 'APPROVED' && (
              <Paper sx={{ p: 2, mt: 2, bgcolor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 2 }}>
                <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 800, textTransform: 'uppercase' }}>Audit Compliance Notice</Typography>
                <Typography variant="body2" sx={{ mt: 0.5, color: 'rgba(255,255,255,0.8)' }}>
                  Approving this claim records verified evidence in the vehicle account ledger and recalculates unlocked tier qualifications instantly.
                </Typography>
              </Paper>
            )}
          </DialogContent>
          <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', p: 2 }}>
            <Button onClick={handleCloseReview} sx={{ color: 'text.secondary' }}>Cancel</Button>
            <Button 
              variant="contained" 
              disabled={submitting} 
              onClick={handleConfirmReview}
              sx={{ bgcolor: reviewAction === 'APPROVED' ? '#10B981' : '#EF4444', color: 'white', fontWeight: 800, '&:hover': { bgcolor: reviewAction === 'APPROVED' ? '#059669' : '#DC2626' } }}
            >
              {submitting ? <CircularProgress size={20} /> : `Confirm ${reviewAction === 'APPROVED' ? 'Approval' : 'Rejection'}`}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
};
