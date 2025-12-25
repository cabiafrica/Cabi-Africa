import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  InputAdornment,
  IconButton,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { resetPassword } from './api/authService';

export const ResetPasswordPage = () => {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validation, setValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const isPasswordValid = useMemo(() => Object.values(validation).every(Boolean), [validation]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!isPasswordValid) {
      setError('Password does not meet all requirements.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (!token) {
        throw new Error('Reset token is missing from the URL.');
      }
      // In a real app, this would call the backend.
      // await resetPassword(token, password);
      console.log(`[Mock] Password reset submitted for token ${token}`);
      setSuccessMessage('Your password has been reset successfully. You will be redirected to login shortly.');
      
      setTimeout(() => navigate('/login'), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. The link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setValidation({
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2, width: '100%', maxWidth: '400px' }}
      >
        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
          Create New Password
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {successMessage ? (
          <Alert severity="success">{successMessage}</Alert>
        ) : (
          <>
            <TextField
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              required
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
              error={!!error && password !== confirmPassword}
              helperText={!!error && password !== confirmPassword ? 'Passwords do not match.' : ''}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <List dense sx={{ mt: 1 }}>
              <PasswordRequirement valid={validation.length} text="At least 8 characters long" />
              <PasswordRequirement valid={validation.uppercase} text="Contains an uppercase letter" />
              <PasswordRequirement valid={validation.lowercase} text="Contains a lowercase letter" />
              <PasswordRequirement valid={validation.number} text="Contains a number" />
              <PasswordRequirement valid={validation.special} text="Contains a special character (!@#$...)" />
            </List>
          </>
        )}
        <Button type="submit" variant="contained" fullWidth disabled={loading || !!successMessage} sx={{ mt: 2 }}>
          {loading ? <CircularProgress size={24} /> : 'Reset Password'}
        </Button>
        {successMessage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Link component={RouterLink} to="/login" variant="body2">Go to Login</Link>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

const PasswordRequirement = ({ valid, text }: { valid: boolean; text: string }) => (
  <ListItem sx={{ py: 0 }}>
    <ListItemIcon sx={{ minWidth: 32 }}>
      {valid ? <CheckCircleIcon color="success" fontSize="small" /> : <CancelIcon color="error" fontSize="small" />}
    </ListItemIcon>
    <ListItemText
      primary={text}
      primaryTypographyProps={{ variant: 'body2', color: valid ? 'text.secondary' : 'error' }}
    />
  </ListItem>
);