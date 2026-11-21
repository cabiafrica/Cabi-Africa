import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Alert,
  Box,
  CircularProgress,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import axios from 'axios';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3333/api';

interface Admin2FAStepUpModalProps {
  open?: boolean;
  onClose?: () => void;
  onVerified?: (stepUpToken: string) => void;
}

export const Admin2FAStepUpModal: React.FC<Admin2FAStepUpModalProps> = ({
  open: controlledOpen,
  onClose: controlledOnClose,
  onVerified,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (controlledOpen !== undefined) {
      setIsOpen(controlledOpen);
    }
  }, [controlledOpen]);

  // Listen for global custom event triggered by 403 step-up responses
  useEffect(() => {
    const handleGlobalTrigger = () => {
      setCode('');
      setError(null);
      setSuccess(false);
      setIsOpen(true);
    };

    window.addEventListener('cabi:admin:require-2fa', handleGlobalTrigger);
    return () => {
      window.removeEventListener('cabi:admin:require-2fa', handleGlobalTrigger);
    };
  }, []);

  const handleClose = () => {
    if (loading) return;
    setIsOpen(false);
    setError(null);
    setCode('');
    if (controlledOnClose) {
      controlledOnClose();
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code || code.trim().length === 0) {
      setError('Please enter your 6-digit TOTP code or backup code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await axios.post(
        `${API_URL}/admin/security/2fa/challenge`,
        { code: code.trim() },
        {
          headers: {
            Authorization: authToken ? `Bearer ${authToken}` : '',
          },
        }
      );

      const stepUpToken = response.data?.stepUpToken;
      if (!stepUpToken) {
        throw new Error('No MFA step-up token returned from server.');
      }

      // Persist in session storage and global axios defaults
      sessionStorage.setItem('adminMfaToken', stepUpToken);
      axios.defaults.headers.common['x-admin-mfa-token'] = stepUpToken;

      setSuccess(true);
      if (onVerified) {
        onVerified(stepUpToken);
      }

      // Dispatch event so any waiting requests can retry
      window.dispatchEvent(
        new CustomEvent('cabi:admin:mfa-verified', {
          detail: { stepUpToken },
        })
      );

      setTimeout(() => {
        handleClose();
      }, 700);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Verification failed. Please check your code and try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1,
        },
      }}
    >
      <form onSubmit={handleVerify}>
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Box
            sx={{
              display: 'inline-flex',
              p: 1.5,
              borderRadius: '50%',
              bgcolor: 'primary.light',
              color: 'primary.main',
              mb: 1,
            }}
          >
            <LockOutlinedIcon fontSize="large" />
          </Box>
          <Typography variant="h6" fontWeight="bold">
            Step-Up 2FA Required
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Mutating administrative actions require secondary authentication.
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Authorization verified! Applying changes...
            </Alert>
          )}

          <Typography variant="body2" sx={{ mb: 2 }}>
            Enter the 6-digit verification code from your authenticator app (or an 8-character single-use backup code):
          </Typography>

          <TextField
            autoFocus
            fullWidth
            label="Security Code"
            placeholder="123456 or BACKUP12"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            disabled={loading || success}
            inputProps={{
              maxLength: 12,
              style: {
                textAlign: 'center',
                letterSpacing: 4,
                fontSize: 20,
                fontWeight: 'bold',
              },
            }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={handleClose} disabled={loading} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || success || !code.trim()}
            sx={{ px: 3 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify & Authorize'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
