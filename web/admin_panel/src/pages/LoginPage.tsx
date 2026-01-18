import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Link,
  InputAdornment,
  IconButton,
  Container,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useAuthContext } from '../AuthContext';
import { loginUser } from './api/authService';
import loginBg from '../assets/login_bg_red.png';
import logo from '../assets/cabi_logo_white.png';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await loginUser({ email, password });
      login(response.token, {
        id: response.user.id,
        email: response.user.email || email,
        fullName: response.user.fullName,
        role: response.user.role as 'admin' | 'user',
        permissions: response.user.permissions || ['*'],
        driverProfileId: response.user.driverProfileId,
      });
      navigate('/');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Invalid email or password.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `url(${loginBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker overlay for neon contrast
          backdropFilter: 'blur(3px)',
          zIndex: 0,
        }
      }}
    >
      <Container component="main" maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={24}
          sx={{
            p: 5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(20, 20, 20, 0.6)', // Deep dark transparent background
            backdropFilter: 'blur(20px)',
            borderRadius: '24px', // More rounded to match reference style
            border: '1px solid rgba(255, 255, 255, 0.1)',
            // The "lights" effect - glowing border and shadow
            boxShadow: `
              0 0 0 1px rgba(255, 255, 255, 0.05),
              0 4px 6px -1px rgba(0, 0, 0, 0.5),
              0 0 20px rgba(220, 38, 38, 0.2), 
              inset 0 0 20px rgba(255, 255, 255, 0.05)
            `,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top highlight "light" effect */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)',
            }}
          />

          {/* Left edge highlight effect */}
          <Box
            sx={{
              position: 'absolute',
              top: '20%',
              left: 0,
              bottom: '20%',
              width: '1px',
              background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(220, 38, 38, 0.3) 50%, rgba(255,255,255,0) 100%)',
            }}
          />

          <Box sx={{ mb: 5, textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Logo container with circle effect */}
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
                boxShadow: '0 0 15px rgba(0,0,0,0.3), 0 0 10px rgba(220, 38, 38, 0.5)', // Red glow inside
              }}
            >
              <Box
                component="img"
                src={logo}
                alt="Cabi Logo"
                sx={{
                  maxWidth: '65%',
                  maxHeight: '65%',
                  objectFit: 'contain',
                }}
              />
            </Box>

            <Typography component="h1" variant="h5" sx={{
              fontWeight: 700,
              color: 'white',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              mb: 1,
              textShadow: '0 0 20px rgba(220, 38, 38, 0.6)'
            }}>
              Cabi Africa
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>
              ADMIN PANEL
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  backgroundColor: 'rgba(220, 38, 38, 0.1)',
                  color: '#fca5a5',
                  border: '1px solid rgba(220, 38, 38, 0.2)'
                }}
              >
                {error}
              </Alert>
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              placeholder="Username"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  borderRadius: 1, // Standard slightly rounded corners
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: '1px',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#ef4444', // Red-500
                    boxShadow: '0 0 8px rgba(239, 68, 68, 0.3)',
                  },
                },
                '& .MuiInputBase-input::placeholder': {
                  color: 'rgba(255,255,255,0.5)',
                  opacity: 1,
                }
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              placeholder="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                      sx={{ color: 'rgba(255,255,255,0.5)' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 1,
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  borderRadius: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: '1px',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#ef4444', // Red-500
                    boxShadow: '0 0 8px rgba(239, 68, 68, 0.3)',
                  },
                },
                '& .MuiInputBase-input::placeholder': {
                  color: 'rgba(255,255,255,0.5)',
                  opacity: 1,
                }
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, mt: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    value="remember"
                    sx={{
                      color: 'rgba(255,255,255,0.5)',
                      '&.Mui-checked': {
                        color: '#ef4444',
                      },
                    }}
                  />
                }
                label={<Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Remember me</Typography>}
              />
              <Link
                component={RouterLink}
                to="/forgot-password"
                variant="body2"
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  textDecoration: 'none',
                  fontStyle: 'italic',
                  '&:hover': {
                    color: '#fff',
                    textDecoration: 'underline',
                  }
                }}
              >
                Forgot Password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5,
                borderRadius: 1,
                textTransform: 'uppercase',
                fontSize: '0.9rem',
                fontWeight: 600,
                letterSpacing: '1px',
                background: 'linear-gradient(to right, #0f172a, #1e293b)', // Dark gradient base
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(45deg, transparent 0%, rgba(239, 68, 68, 0.1) 50%, transparent 100%)',
                  transition: 'transform 0.5s',
                  transform: 'translateX(-100%)',
                },
                '&:hover': {
                  background: '#ef4444', // Red-500
                  boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)',
                  borderColor: '#ef4444',
                  '&::before': {
                    transform: 'translateX(100%)'
                  }
                }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};