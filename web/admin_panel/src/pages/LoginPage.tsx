import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Link,
  InputAdornment,
  IconButton,
  Container,
  Paper,
  Fade,
  Stack,
  alpha,
  Grid
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  PersonOutline as PersonIcon,
  LockOutlined as LockIcon,
  ArrowForward as ArrowIcon,
  Shield as ShieldIcon,
  Radar as RadarIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { useAuthContext } from '../AuthContext';
import { loginUser } from './api/authService';
import logo from '../assets/cabi_logo_white.png';

/* ─── Modern Aesthetics ────────────────────────────────────────────── */
const GOLD_GRADIENT = 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)';
const DEEP_NAVY = '#0F172A';
const GLASS_BG = 'rgba(15, 23, 42, 0.7)';
const BORDER_COLOR = 'rgba(255, 215, 0, 0.15)';

/* ─── Background Elements ───────────────────────────────────────────── */
const AnimatedOrb = ({ size, top, left, color, duration = 15, delay = 0 }: any) => (
  <Box
    sx={{
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: '50%',
      top,
      left,
      background: color,
      filter: `blur(${size / 2}px)`,
      opacity: 0.4,
      zIndex: 0,
      animation: `float ${duration}s ease-in-out ${delay}s infinite alternate`,
      '@keyframes float': {
        '0%': { transform: 'translate(0, 0) scale(1)' },
        '100%': { transform: 'translate(50px, 50px) scale(1.1)' },
      },
      pointerEvents: 'none',
    }}
  />
);

const FeatureItem = ({ icon, text }: { icon: any, text: string }) => (
  <Stack direction="row" spacing={2} alignItems="center">
    <Box sx={{ 
      p: 1, borderRadius: 1.5, 
      background: 'rgba(255, 215, 0, 0.1)', 
      color: '#FFD700',
      display: 'flex', alignItems: 'center'
    }}>
      {icon}
    </Box>
    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
      {text}
    </Typography>
  </Stack>
);

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
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
      setError(err.response?.data?.message || 'Invalid operational credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) return null;

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      bgcolor: DEEP_NAVY,
      overflow: 'hidden',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,215,0,0.05) 1px, transparent 0)`,
        backgroundSize: '40px 40px',
        zIndex: 1,
      }
    }}>
      {/* Background Ambience */}
      <AnimatedOrb size={600} top="-200px" left="-100px" color="radial-gradient(circle, #B8860B 0%, transparent 70%)" />
      <AnimatedOrb size={400} top="60%" left="70%" color="radial-gradient(circle, #0F172A 0%, transparent 70%)" duration={20} />
      <AnimatedOrb size={300} top="20%" left="80%" color="radial-gradient(circle, #FFD700 0%, transparent 70%)" delay={2} />

      <Container maxWidth="lg" sx={{ display: 'flex', position: 'relative', zIndex: 2, alignItems: 'center' }}>
        <Grid container spacing={8} alignItems="center">
          
          {/* Brand & Context Section */}
          <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Fade in timeout={1000}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 6 }}>
                  <Box 
                    component="img" 
                    src={logo} 
                    alt="Cabi Africa" 
                    sx={{ height: 48, width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.3))' }} 
                  />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: 'white', letterSpacing: -1 }}>
                      CABI <Box component="span" sx={{ color: '#FFD700' }}>AFRICA</Box>
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', letterSpacing: 3, fontWeight: 700 }}>
                      SECURITY & OPS COMMAND
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="h2" sx={{ fontWeight: 900, color: 'white', mb: 3, lineHeight: 1.1 }}>
                  The Pulse of <br />
                  <Box component="span" sx={{ background: GOLD_GRADIENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    African Mobility.
                  </Box>
                </Typography>

                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.5)', mb: 6, fontWeight: 400, maxWidth: 450 }}>
                  Enter the command center to monitor live operations, resolve incidents, and manage the future of transportation.
                </Typography>

                <Stack spacing={3}>
                  <FeatureItem icon={<RadarIcon />} text="Real-time Fleet Intelligence" />
                  <FeatureItem icon={<SecurityIcon />} text="Crisis Response Protocol" />
                  <FeatureItem icon={<ShieldIcon />} text="Fraud Detection Sentinel" />
                </Stack>
              </Box>
            </Fade>
          </Grid>

          {/* Login Interface Section */}
          <Grid item xs={12} md={6}>
            <Fade in timeout={1200}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' } }}>
                <Paper sx={{
                  p: 5,
                  width: '100%',
                  maxWidth: 440,
                  background: GLASS_BG,
                  backdropFilter: 'blur(40px)',
                  borderRadius: 6,
                  border: `1px solid ${BORDER_COLOR}`,
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Subtle Top Glow */}
                  <Box sx={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                    background: GOLD_GRADIENT, opacity: 0.5
                  }} />

                  <Box sx={{ mb: 5, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: 'white', mb: 1 }}>
                      Welcome Back
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                      Authenticate to access system controls
                    </Typography>
                  </Box>

                  {error && (
                    <Alert severity="error" sx={{ 
                      mb: 4, borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', 
                      color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.2)' 
                    }}>
                      {error}
                    </Alert>
                  )}

                  <Box component="form" onSubmit={handleSubmit}>
                    <Stack spacing={3}>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#FFD700', fontWeight: 800, mb: 1, display: 'block', letterSpacing: 1 }}>
                          IDENTIFICATION
                        </Typography>
                        <TextField
                          fullWidth required
                          placeholder="admin@cabi.africa"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonIcon sx={{ color: 'rgba(255,255,255,0.3)' }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              color: 'white',
                              bgcolor: 'rgba(0,0,0,0.2)',
                              borderRadius: 2,
                              '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                              '&:hover fieldset': { borderColor: 'rgba(255,215,0,0.3)' },
                              '&.Mui-focused fieldset': { borderColor: '#FFD700' },
                            }
                          }}
                        />
                      </Box>

                      <Box>
                        <Typography variant="caption" sx={{ color: '#FFD700', fontWeight: 800, mb: 1, display: 'block', letterSpacing: 1 }}>
                          ACCESS KEY
                        </Typography>
                        <TextField
                          fullWidth required
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockIcon sx={{ color: 'rgba(255,255,255,0.3)' }} />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: 'rgba(255,255,255,0.3)' }}>
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              color: 'white',
                              bgcolor: 'rgba(0,0,0,0.2)',
                              borderRadius: 2,
                              '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                              '&:hover fieldset': { borderColor: 'rgba(255,215,0,0.3)' },
                              '&.Mui-focused fieldset': { borderColor: '#FFD700' },
                            }
                          }}
                        />
                      </Box>

                      <Box display="flex" justifyContent="flex-end">
                        <Link 
                          component={RouterLink} to="/forgot-password" 
                          sx={{ color: 'rgba(255,215,0,0.6)', textDecoration: 'none', fontSize: '0.85rem', '&:hover': { color: '#FFD700' } }}
                        >
                          Credential Recovery?
                        </Link>
                      </Box>

                      <Button
                        type="submit"
                        fullWidth
                        disabled={loading}
                        variant="contained"
                        sx={{
                          py: 2,
                          borderRadius: 2,
                          background: GOLD_GRADIENT,
                          color: 'black',
                          fontWeight: 900,
                          fontSize: '1rem',
                          boxShadow: '0 8px 32px rgba(255,215,0,0.2)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #FFE033 0%, #FFB300 100%)',
                            boxShadow: '0 12px 40px rgba(255,215,0,0.3)',
                            transform: 'translateY(-2px)'
                          },
                          transition: 'all 0.3s'
                        }}
                      >
                        {loading ? <CircularProgress size={24} sx={{ color: 'black' }} /> : (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <span>INITIALIZE ACCESS</span>
                            <ArrowIcon />
                          </Stack>
                        )}
                      </Button>
                    </Stack>

                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.2)', mt: 6, display: 'block', textAlign: 'center' }}>
                      CABI AFRICA OPS · SECURE NODE {new Date().getFullYear()}
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </Fade>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};