import React, { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, Grid, Paper, TextField, Typography } from '@mui/material';

// Mock API functions
const fetchReferralConfig = async () => {
  console.log('[Mock] Fetching Referral config for UI');
  // In a real app: await axios.get('/api/admin/referral/config');
  return {
    registrationFee: 1000,
    registrationFeeSplit: { system: 60, upline1: 30, upline2: 10 },
    fareCommissionSplit: { system: 70, upline1: 20, upline2: 10 },
    saccoSavingsRate: 5,
    earningBadgeIds: ['badge-pro-driver'],
  };
};

const updateReferralConfig = async (config: any) => {
  console.log('[Mock] Updating Referral config from UI', config);
  // In a real app: await axios.put('/api/admin/referral/config', config);
  const regSplit = config.registrationFeeSplit;
  if (regSplit.system + regSplit.upline1 + regSplit.upline2 !== 100) {
    throw new Error('Registration fee splits must sum to 100.');
  }
  const fareSplit = config.fareCommissionSplit;
  if (fareSplit.system + fareSplit.upline1 + fareSplit.upline2 !== 100) {
    throw new Error('Fare commission splits must sum to 100.');
  }
  return config;
};

const initialConfigState = {
  registrationFee: 0,
  registrationFeeSplit: { system: 0, upline1: 0, upline2: 0 },
  fareCommissionSplit: { system: 0, upline1: 0, upline2: 0 },
  saccoSavingsRate: 0,
  earningBadgeIds: [],
};

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

  if (loading) return <CircularProgress />;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Referral Configuration</Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Paper sx={{ p: 3, mt: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6">Registration Fee</Typography>
            <TextField
              label="Total Fee (KES)"
              type="number"
              value={config.registrationFee}
              onChange={(e) => handleChange('registrationFee', e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={4}><TextField label="System Split (%)" type="number" value={config.registrationFeeSplit.system} onChange={(e) => handleChange('registrationFeeSplit.system', e.target.value)} /></Grid>
          <Grid item xs={4}><TextField label="Upline 1 Split (%)" type="number" value={config.registrationFeeSplit.upline1} onChange={(e) => handleChange('registrationFeeSplit.upline1', e.target.value)} /></Grid>
          <Grid item xs={4}><TextField label="Upline 2 Split (%)" type="number" value={config.registrationFeeSplit.upline2} onChange={(e) => handleChange('registrationFeeSplit.upline2', e.target.value)} /></Grid>

          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mt: 3 }}>Fare Commission</Typography>
          </Grid>
          <Grid item xs={4}><TextField label="System Split (%)" type="number" value={config.fareCommissionSplit.system} onChange={(e) => handleChange('fareCommissionSplit.system', e.target.value)} /></Grid>
          <Grid item xs={4}><TextField label="Upline 1 Split (%)" type="number" value={config.fareCommissionSplit.upline1} onChange={(e) => handleChange('fareCommissionSplit.upline1', e.target.value)} /></Grid>
          <Grid item xs={4}><TextField label="Upline 2 Split (%)" type="number" value={config.fareCommissionSplit.upline2} onChange={(e) => handleChange('fareCommissionSplit.upline2', e.target.value)} /></Grid>

          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mt: 3 }}>Other Settings</Typography>
            <TextField
              label="SACCO Savings Rate (%)"
              type="number"
              value={config.saccoSavingsRate}
              onChange={(e) => handleChange('saccoSavingsRate', e.target.value)}
              fullWidth
            />
          </Grid>

          {/* TODO: Replace with a multi-select dropdown populated from a badge API */}
          <Grid item xs={12}>
            <TextField
              label="Earning Badge IDs (comma-separated)"
              value={config.earningBadgeIds.join(',')}
              onChange={(e) => setConfig(prev => ({ ...prev, earningBadgeIds: e.target.value.split(',').map(s => s.trim()) }))}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sx={{ mt: 3, textAlign: 'right' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <CircularProgress size={24} /> : 'Save Configuration'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};