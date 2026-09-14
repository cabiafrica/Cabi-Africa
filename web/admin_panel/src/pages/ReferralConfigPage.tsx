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
  InputAdornment
} from '@mui/material';
import {
  Settings as SettingsIcon,
  AccountBalance as SaccoIcon,
  EmojiEvents as BadgeIcon,
  Savings as SavingsIcon,
  AccountBalanceWallet as WalletIcon,
  Percent as PercentIcon,
  Save as SaveIcon
} from '@mui/icons-material';

// Mock API functions
const fetchReferralConfig = async () => {
  const res = await fetch('/api/admin/referral/config');
  if (!res.ok) throw new Error('Failed to fetch config');
  const json = await res.json();
  return json.data;
};

const updateReferralConfig = async (config: any) => {
  const res = await fetch('/api/admin/referral/config', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!res.ok) {
     const json = await res.json();
     throw new Error(json.message || 'Failed to update config');
  }
  const json = await res.json();
  return json.data;
};

const initialConfigState = {
  registrationFee: 0,
  registrationFeeSplit: { system: 0, upline1: 0, upline2: 0 },
  fareCommissionSplit: { system: 0, upline1: 0, upline2: 0 },
  saccoSavingsRate: 0,
  earningBadgeIds: [],
};

const GOLD_GRADIENT = 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)';
const GLASS_BG = 'rgba(15, 23, 42, 0.7)';
const CARD_BORDER = 'rgba(255, 215, 0, 0.1)';

const ConfigCard = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <Paper sx={{ 
    p: 3, 
    background: GLASS_BG, 
    backdropFilter: 'blur(20px)',
    borderRadius: 4,
    border: `1px solid ${CARD_BORDER}`,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 3
  }}>
    <Box display="flex" alignItems="center" gap={1.5}>
      <Box sx={{ p: 1, borderRadius: 2, background: 'rgba(255,215,0,0.1)', color: '#FFD700' }}>
        {icon}
      </Box>
      <Typography variant="h6" sx={{ color: 'white', fontWeight: 800 }}>{title}</Typography>
    </Box>
    <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
    {children}
  </Paper>
);

const PremiumInput = (props: any) => (
  <TextField
    {...props}
    fullWidth
    variant="outlined"
    sx={{ 
      '& .MuiOutlinedInput-root': {
        color: 'white',
        bgcolor: 'rgba(0,0,0,0.2)',
        borderRadius: 2,
        '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
        '&.Mui-focused fieldset': { borderColor: '#FFD700' },
      },
      '& .MuiInputLabel-root': { color: 'text.secondary' },
      '& .MuiInputLabel-root.Mui-focused': { color: '#FFD700' }
    }}
  />
);

export const ReferralConfigPage = () => {
  const [config, setConfig] = useState(initialConfigState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await fetchReferralConfig();
        setConfig(data);
      } catch (err) {
        setError('Failed to load configuration.');
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  const handleChange = (path: string, value: string) => {
    const keys = path.split('.');
    setConfig(prev => {
      const newConfig = JSON.parse(JSON.stringify(prev));
      let current = newConfig;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = Number(value) || 0;
      return newConfig;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateReferralConfig(config);
      // TODO: Show success toast
    } catch (err: any) {
      setError(err.message || 'Failed to save configuration.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
      <CircularProgress sx={{ color: '#FFD700' }} />
    </Box>
  );

  return (
    <Fade in={true} timeout={800}>
      <Box p={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 900, background: GOLD_GRADIENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 1 }}>
              Referral Protocol
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
              <SettingsIcon sx={{ fontSize: 18, color: '#FFD700' }} />
              Economic yield & commission configuration
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={handleSave}
            disabled={saving}
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
            Commit Changes
          </Button>
        </Box>

        {error && (
          <Paper sx={{ p: 2, mb: 4, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 2 }}>
            <Typography color="error" variant="body2">{error}</Typography>
          </Paper>
        )}

        <Grid container spacing={4}>
          {/* Registration Section */}
          <Grid item xs={12} md={6}>
            <ConfigCard title="Onboarding Economics" icon={<WalletIcon />}>
              <PremiumInput
                label="Total Registration Fee"
                type="number"
                value={config.registrationFee}
                onChange={(e: any) => handleChange('registrationFee', e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><Typography sx={{ color: '#FFD700', fontWeight: 800 }}>KES</Typography></InputAdornment> }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>Fee Distribution Split</Typography>
              <Stack direction="row" spacing={2}>
                <PremiumInput 
                  label="System" 
                  type="number" 
                  value={config.registrationFeeSplit.system} 
                  onChange={(e: any) => handleChange('registrationFeeSplit.system', e.target.value)}
                  InputProps={{ endAdornment: <InputAdornment position="end"><PercentIcon sx={{ fontSize: 16, color: 'text.secondary' }} /></InputAdornment> }}
                />
                <PremiumInput 
                  label="Upline 1" 
                  type="number" 
                  value={config.registrationFeeSplit.upline1} 
                  onChange={(e: any) => handleChange('registrationFeeSplit.upline1', e.target.value)}
                  InputProps={{ endAdornment: <InputAdornment position="end"><PercentIcon sx={{ fontSize: 16, color: 'text.secondary' }} /></InputAdornment> }}
                />
                <PremiumInput 
                  label="Upline 2" 
                  type="number" 
                  value={config.registrationFeeSplit.upline2} 
                  onChange={(e: any) => handleChange('registrationFeeSplit.upline2', e.target.value)}
                  InputProps={{ endAdornment: <InputAdornment position="end"><PercentIcon sx={{ fontSize: 16, color: 'text.secondary' }} /></InputAdornment> }}
                />
              </Stack>
            </ConfigCard>
          </Grid>

          {/* Fare Commission Section */}
          <Grid item xs={12} md={6}>
            <ConfigCard title="Yield Distribution" icon={<PercentIcon />}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: -1 }}>Fare commission split across nodes</Typography>
              <Stack spacing={3}>
                <PremiumInput 
                  label="System Network Commission" 
                  type="number" 
                  value={config.fareCommissionSplit.system} 
                  onChange={(e: any) => handleChange('fareCommissionSplit.system', e.target.value)}
                  InputProps={{ endAdornment: <InputAdornment position="end"><PercentIcon sx={{ fontSize: 16, color: 'text.secondary' }} /></InputAdornment> }}
                />
                <PremiumInput 
                  label="Upline Tier 1 Yield" 
                  type="number" 
                  value={config.fareCommissionSplit.upline1} 
                  onChange={(e: any) => handleChange('fareCommissionSplit.upline1', e.target.value)}
                  InputProps={{ endAdornment: <InputAdornment position="end"><PercentIcon sx={{ fontSize: 16, color: 'text.secondary' }} /></InputAdornment> }}
                />
                <PremiumInput 
                  label="Upline Tier 2 Yield" 
                  type="number" 
                  value={config.fareCommissionSplit.upline2} 
                  onChange={(e: any) => handleChange('fareCommissionSplit.upline2', e.target.value)}
                  InputProps={{ endAdornment: <InputAdornment position="end"><PercentIcon sx={{ fontSize: 16, color: 'text.secondary' }} /></InputAdornment> }}
                />
              </Stack>
            </ConfigCard>
          </Grid>

          {/* SACCO & Badges Section */}
          <Grid item xs={12}>
            <ConfigCard title="Operational Overlays" icon={<SaccoIcon />}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      p: 2,
                      border: '1px solid rgba(255,215,0,0.3)',
                      borderRadius: 2,
                      background: 'rgba(255,215,0,0.05)',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#FFD700', fontWeight: 700, display: 'block', mb: 1 }}>
                      🏛️ Sacco Remittance Rate
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                      Sacco remittance rates (mandatory %, joining incentive, duration) are now managed in the{' '}
                      <a
                        href="/sacco-integration"
                        style={{ color: '#FFD700', fontWeight: 700, textDecoration: 'none' }}
                      >
                        Sacco Integration Hub →
                      </a>
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <PremiumInput
                    label="Entitlement Badge IDs"
                    placeholder="e.g. BDG-01, BDG-05"
                    value={config.earningBadgeIds.join(',')}
                    onChange={(e: any) => setConfig(prev => ({ ...prev, earningBadgeIds: e.target.value.split(',').map((s: string) => s.trim()) }))}
                    InputProps={{ 
                      startAdornment: <InputAdornment position="start"><BadgeIcon sx={{ color: '#FFD700' }} /></InputAdornment> 
                    }}
                  />
                  <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
                    Badge IDs required for referral yield eligibility
                  </Typography>
                </Grid>
              </Grid>
            </ConfigCard>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
};