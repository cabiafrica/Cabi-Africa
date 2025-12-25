import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Link,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { requestPasswordReset } from './api/authService';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // In a real app, for security, the backend should always return success
      // to prevent email enumeration attacks.
      // await requestPasswordReset(email);
      console.log(`[Mock] Password reset requested for ${email}`);
      setSuccessMessage('If an account with that email exists, a password reset link has been sent.');
    } catch (err: any) {
      // This generic message is better for security.
      setSuccessMessage('If an account with that email exists, a password reset link has been sent.');
    } finally {
      setLoading(false);
    }
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
          Reset Password
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {successMessage ? (
          <Alert severity="success">{successMessage}</Alert>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Enter your email address and we will send you a link to reset your password.
            </Typography>
            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />
          </>
        )}
        <Button type="submit" variant="contained" fullWidth disabled={loading || !!successMessage} sx={{ mt: 2 }}>
          {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
        </Button>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Link component={RouterLink} to="/login" variant="body2">
            Back to Login
          </Link>
        </Box>
      </Paper>
    </Box>
  );
};