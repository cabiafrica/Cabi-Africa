import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Button, CircularProgress, Grid, TextField, Typography, Alert, Paper,
  Chip, Avatar, Rating, Stack, Divider, Tooltip, IconButton, Fade, Modal, Snackbar
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { 
  Mic as MicIcon, Launch as LaunchIcon, 
  History as HistoryIcon, Gavel as GavelIcon, Security as SecurityIcon,
  Verified as VerifiedIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon,
  HourglassEmpty as PendingIcon, Flag as FlagIcon,
  Warning as WarningIcon, Radio as RadioIcon,
  Sensors as SensorsIcon, Description as DescriptionIcon
} from '@mui/icons-material';
import { adminService, SOSIncidentDetails, SOSIncidentLogEntry, IncidentStatement } from '../services/adminService';
import CabiMap from '../components/CabiMap';
import 'leaflet/dist/leaflet.css';

const GOLD_GRADIENT = 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)';
const GLASS_BG = 'rgba(15, 23, 42, 0.7)';
const CARD_BORDER = 'rgba(255, 215, 0, 0.1)';

const PulseDot = ({ color = '#FFD700' }) => (
  <Box sx={{ position: 'relative', width: 8, height: 8 }}>
    <Box sx={{
      position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', bgcolor: color,
      animation: 'pulse 2s infinite ease-in-out',
      '@keyframes pulse': { '0%': { transform: 'scale(1)', opacity: 0.8 }, '100%': { transform: 'scale(3)', opacity: 0 } }
    }} />
    <Box sx={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', bgcolor: color }} />
  </Box>
);

const CrisisCard = ({ title, icon, children, color = '#FFD700', sx = {} }: any) => (
  <Paper sx={{ 
    p: 2.5, background: GLASS_BG, backdropFilter: 'blur(20px)',
    borderRadius: 4, border: `1px solid ${CARD_BORDER}`,
    height: '100%', display: 'flex', flexDirection: 'column', gap: 2,
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)', ...sx
  }}>
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Box display="flex" alignItems="center" gap={1.5}>
        <Box sx={{ p: 0.8, borderRadius: 1.5, background: `${color}15`, color }}>{icon}</Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'white', letterSpacing: 1, textTransform: 'uppercase', fontSize: 11 }}>{title}</Typography>
      </Box>
    </Box>
    <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
    {children}
  </Paper>
);

export const SosIncidentDashboard = () => {
  const { incidentId } = useParams<{ incidentId: string }>();
  const [incident, setIncident] = useState<SOSIncidentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [newLog, setNewLog] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [isResolved, setIsResolved] = useState(false);
  const [reviewingStatement, setReviewingStatement] = useState<IncidentStatement | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSocketRef = useRef<WebSocket | null>(null);
  const audioQueueRef = useRef<ArrayBuffer[]>([]);
  const isPlayingAudioRef = useRef(false);

  useEffect(() => {
    const loadIncident = async () => {
      if (!incidentId) return;
      try {
        setLoading(true);
        const data = await adminService.getSosIncidentDetails(incidentId);
        setIncident(data);
        setIsResolved((data as any).status === 'RESOLVED');
      } catch (err) {
        setNotification({ open: true, message: 'Failed to load incident details.', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };
    loadIncident();
  }, [incidentId]);

  useEffect(() => {
    if (!incidentId || isResolved) return;
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'https://auth-gateway-746659778850.us-central1.run.app';
    const socket: Socket = io(socketUrl, { query: { incidentId } });
    socket.on('locationUpdate', (newLocation: { lat: number; lng: number }) => {
      setIncident(prev => prev ? { ...prev, liveLocation: { lat: newLocation.lat, lng: newLocation.lng } } : null);
    });
    return () => { socket.disconnect(); };
  }, [incidentId, isResolved]);

  const handleLogAction = async () => {
    if (!newLog.trim() || !incidentId) return;
    try {
      await adminService.logSosIncidentAction(incidentId, newLog);
      const logEntry: SOSIncidentLogEntry = { timestamp: new Date().toISOString(), notes: newLog };
      setIncident(prev => prev ? { ...prev, logs: [...prev.logs, logEntry] } : null);
      setNewLog('');
      setNotification({ open: true, message: 'Log entry added successfully.', severity: 'success' });
    } catch (err) {
      setNotification({ open: true, message: 'Failed to save log entry.', severity: 'error' });
    }
  };

  const playNextAudioChunk = () => {
    if (!isPlayingAudioRef.current || audioQueueRef.current.length === 0 || !audioContextRef.current) return;
    const audioData = audioQueueRef.current.shift();
    if (!audioData) return;
    audioContextRef.current.decodeAudioData(audioData).then(buffer => {
      const source = audioContextRef.current!.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current!.destination);
      source.onended = playNextAudioChunk;
      source.start();
    });
  };

  const handleListenIn = async () => {
    if (isListening) {
      isPlayingAudioRef.current = false;
      if (audioSocketRef.current) audioSocketRef.current.close();
      if (audioContextRef.current) await audioContextRef.current.close();
      audioQueueRef.current = [];
    } else {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        const socketUrl = import.meta.env.VITE_SOCKET_URL || 'https://auth-gateway-746659778850.us-central1.run.app';
        const wsUrl = socketUrl.replace('https://', 'wss://').replace('http://', 'ws://');
        const socket = new WebSocket(`${wsUrl}/audio?incidentId=${incidentId}`);
        socket.binaryType = 'arraybuffer';
        socket.onmessage = (event) => {
          audioQueueRef.current.push(event.data);
          if (!isPlayingAudioRef.current) { isPlayingAudioRef.current = true; playNextAudioChunk(); }
        };
        audioSocketRef.current = socket;
        socket.onopen = () => {
          setNotification({ open: true, message: 'Live Audio Stream Established', severity: 'success' });
          setIsListening(true);
        };
        socket.onerror = () => {
          setNotification({ open: true, message: 'Audio Stream Service Unavailable. Check backend connectivity.', severity: 'error' });
          setIsListening(false);
          socket.close();
        };
      } catch (err) {
        setNotification({ open: true, message: 'Audio stream failed.', severity: 'error' });
      }
    }
  };

  const handleConfirmResolution = async () => {
    if (!resolutionNote.trim() || !incidentId) return;
    setIsResolving(true);
    try {
      await adminService.resolveSosIncident(incidentId, resolutionNote);
      setIsResolved(true);
      setIsResolveModalOpen(false);
      setNotification({ open: true, message: 'Incident resolved successfully.', severity: 'success' });
    } catch (err: any) {
      setNotification({ open: true, message: err.message || 'Failed to resolve incident.', severity: 'error' });
    } finally {
      setIsResolving(false);
    }
  };

  const handleReviewStatement = async (status: 'ACCEPTED' | 'REJECTED' | 'UNDER_REVIEW') => {
    if (!reviewingStatement) return;
    setIsSubmittingReview(true);
    try {
      const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
      await adminService.reviewStatement(reviewingStatement.id, adminUser?.id || 'system', status, reviewNote);
      setIncident(prev => {
        if (!prev) return prev;
        const updated = (prev.statements || []).map(s => s.id === reviewingStatement.id ? { ...s, status, reviewNotes: reviewNote } : s);
        return { ...prev, statements: updated };
      });
      setReviewingStatement(null);
      setNotification({ open: true, message: `Statement marked as ${status.toLowerCase()}.`, severity: 'success' });
    } catch (err: any) {
      setNotification({ open: true, message: err.message || 'Review failed.', severity: 'error' });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor="#141416">
      <CircularProgress sx={{ color: '#FFD700' }} />
    </Box>
  );

  if (!incident) return <Alert severity="warning">Incident not found.</Alert>;

  const severityColor = (incident.severity === 'CRITICAL' || incident.severity === 'HIGH') ? '#EF4444' : '#FFD700';

  return (
    <Fade in={true} timeout={800}>
      <Box sx={{ minHeight: '100vh', bgcolor: '#141416', color: 'white' }}>
        
        {/* Header Console */}
        <Box sx={{ 
          p: 3, borderBottom: `1px solid ${CARD_BORDER}`, 
          background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', top: 0, zIndex: 1000
        }}>
          <Stack spacing={0.5}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box sx={{ 
                px: 1.5, py: 0.5, borderRadius: 1, 
                bgcolor: severityColor, color: 'black', 
                fontWeight: 900, fontSize: 11, letterSpacing: 1
              }}>
                {incident.severity}
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
                {incident.title || `Incident ${incident.obNumber}`}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
              <PulseDot color={severityColor} />
              LIVE MONITORING · {incident.category} · OB# {incident.obNumber}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2}>
            <Button
              variant={isListening ? 'contained' : 'outlined'}
              startIcon={<MicIcon />}
              onClick={handleListenIn}
              disabled={isResolved}
              sx={{ 
                borderRadius: 2, px: 3, fontWeight: 800,
                bgcolor: isListening ? '#EF4444' : 'transparent',
                borderColor: isListening ? '#EF4444' : CARD_BORDER,
                color: 'white',
                '&:hover': { bgcolor: isListening ? '#DC2626' : 'rgba(255,255,255,0.05)' }
              }}
            >
              {isListening ? 'LIVE AUDIO ACTIVE' : 'MONITOR AUDIO'}
            </Button>
            <Button
              variant="contained"
              onClick={() => setIsResolveModalOpen(true)}
              disabled={isResolved}
              sx={{ 
                background: GOLD_GRADIENT, color: 'black', fontWeight: 900, 
                px: 4, borderRadius: 2, boxShadow: '0 8px 16px rgba(255,215,0,0.2)'
              }}
            >
              RESOLVE INCIDENT
            </Button>
          </Stack>
        </Box>

        <Box p={3}>
          <Grid container spacing={3}>
            {/* Left Intelligence Column */}
            <Grid item xs={12} md={4}>
              <Stack spacing={3}>
                {/* Driver Intel */}
                <CrisisCard title="Driver Intelligence" icon={<LaunchIcon fontSize="small" />} color="#22D3EE">
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar src={incident.driver.photoUrl} sx={{ width: 64, height: 64, border: `2px solid #22D3EE` }}>{incident.driver.name[0]}</Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>{incident.driver.name}</Typography>
                      <Rating value={incident.driver.rating} readOnly size="small" />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>{incident.driver.phone}</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    {incident.driver.badges?.map((badge, i) => (
                      <Tooltip key={i} title={`${badge.name} (${badge.tier})`}>
                        <Avatar 
                          src={badge.icon} 
                          sx={{ 
                            width: 24, height: 24, 
                            bgcolor: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,215,0,0.3)' 
                          }}
                        >
                          {badge.name[0]}
                        </Avatar>
                      </Tooltip>
                    ))}
                  </Stack>
                  <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 2, bgcolor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <Typography variant="caption" sx={{ color: '#22D3EE', fontWeight: 800, display: 'block' }}>ORG UNIT</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{incident.driver.organization?.name || 'Independent'}</Typography>
                  </Box>
                </CrisisCard>

                {/* Passenger Intel */}
                <CrisisCard title="Passenger Intelligence" icon={<LaunchIcon fontSize="small" />} color="#06B6D4">
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar src={incident.passenger.photoUrl} sx={{ width: 64, height: 64, border: `2px solid #06B6D4` }}>{incident.passenger.name[0]}</Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>{incident.passenger.name}</Typography>
                      <Rating value={incident.passenger.rating} readOnly size="small" />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>{incident.passenger.phone}</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    {incident.passenger.badges?.map((badge, i) => (
                      <Tooltip key={i} title={`${badge.name} (${badge.tier})`}>
                        <Avatar 
                          src={badge.icon} 
                          sx={{ 
                            width: 24, height: 24, 
                            bgcolor: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(168, 85, 247, 0.3)' 
                          }}
                        >
                          {badge.name[0]}
                        </Avatar>
                      </Tooltip>
                    ))}
                  </Stack>
                </CrisisCard>

                {/* Responsibility Card */}
                <CrisisCard title="Crisis Protocol" icon={<SecurityIcon fontSize="small" />} color="#EF4444">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Deployment responsibility assigned to:</Typography>
                  <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#EF4444' }}>{incident.responsibleParty}</Typography>
                  </Box>
                </CrisisCard>
              </Stack>
            </Grid>

            {/* Tactical View Column */}
            <Grid item xs={12} md={8}>
              <Stack spacing={3}>
                {/* Map View */}
                <Paper sx={{ 
                  height: 400, borderRadius: 4, overflow: 'hidden', 
                  border: `1px solid ${CARD_BORDER}`, background: GLASS_BG,
                  position: 'relative'
                }}>
                  {incident.liveLocation ? (
                    <CabiMap 
                      center={[incident.liveLocation.lat, incident.liveLocation.lng]}
                      zoom={15}
                      markers={[{
                        id: 'incident',
                        position: [incident.liveLocation.lat, incident.liveLocation.lng],
                        type: 'custom',
                        popup: 'CRITICAL NODE'
                      }]}
                      height="100%"
                    />
                  ) : (
                    <Box display="flex" flex={1} alignItems="center" justifyContent="center" height="100%">
                      <RadioIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.2 }} />
                      <Typography sx={{ color: 'text.secondary' }}>Waiting for GPS Signal...</Typography>
                    </Box>
                  )}
                </Paper>

                {/* Statements */}
                <Box>
                  <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                    <DescriptionIcon sx={{ color: '#FFD700' }} />
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Verified Statements</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    {incident.statements?.map((stmt) => (
                      <Grid item xs={12} md={6} key={stmt.id}>
                        <Paper sx={{ 
                          p: 2.5, background: 'rgba(255,255,255,0.03)', 
                          borderRadius: 3, border: `1px solid ${CARD_BORDER}`,
                          position: 'relative'
                        }}>
                          <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                            <Avatar src={stmt.objectorPhoto} sx={{ width: 32, height: 32 }}>{stmt.objectorName[0]}</Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{stmt.objectorName}</Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>{stmt.role}</Typography>
                            </Box>
                            <Box flex={1} />
                            {stmt.status === 'PENDING' && (
                              <IconButton size="small" onClick={() => setReviewingStatement(stmt)} sx={{ color: '#FFD700' }}>
                                <GavelIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Stack>
                          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.8)', mb: 1 }}>"{stmt.text}"</Typography>
                          <Chip 
                            label={stmt.status} 
                            size="small" 
                            sx={{ 
                              bgcolor: stmt.status === 'ACCEPTED' ? '#10B981' : stmt.status === 'REJECTED' ? '#EF4444' : 'rgba(255,255,255,0.1)',
                              color: 'white', fontWeight: 800, fontSize: 10
                            }} 
                          />
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                {/* Action Log */}
                <CrisisCard title="Event History" icon={<HistoryIcon fontSize="small" />}>
                  <Box sx={{ maxHeight: 350, overflowY: 'auto', pr: 1 }}>
                    <Stack spacing={2}>
                      {(incident.annotatedLogs || incident.logs.map(l => ({ ...l, actorRole: 'Admin', actorName: 'Agent' }))).map((log: any, idx: number) => (
                        <Box key={idx} sx={{ 
                          p: 2, borderRadius: 2, 
                          bgcolor: 'rgba(255,255,255,0.03)', 
                          border: '1px solid rgba(255,255,255,0.05)',
                          position: 'relative',
                          overflow: 'hidden'
                        }}>
                          <Box sx={{ 
                            position: 'absolute', top: 0, left: 0, width: 3, height: '100%', 
                            bgcolor: log.actorRole === 'Driver' ? '#22D3EE' : log.actorRole === 'Passenger' ? '#06B6D4' : '#FFD700' 
                          }} />
                          <Box display="flex" justifyContent="space-between" mb={1} alignItems="center">
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Avatar src={log.actorPhoto} sx={{ width: 20, height: 20, fontSize: 10 }}>{log.actorName?.[0]}</Avatar>
                              <Typography variant="caption" sx={{ fontWeight: 800, color: '#FFD700', textTransform: 'uppercase' }}>
                                {log.actorRole} · {log.actorName}
                              </Typography>
                            </Stack>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>
                            {log.notes}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                  <Box display="flex" gap={1.5} mt={1}>
                    <TextField 
                      fullWidth size="small" placeholder="Transmit incident update..." 
                      value={newLog} onChange={e => setNewLog(e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { color: 'white', bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2 } }}
                    />
                    <Button variant="contained" onClick={handleLogAction} sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 800 }}>LOG</Button>
                  </Box>
                </CrisisCard>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {/* Resolution Modal */}
        <Modal open={isResolveModalOpen} onClose={() => setIsResolveModalOpen(false)}>
          <Box sx={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 450, background: GLASS_BG, backdropFilter: 'blur(30px)',
            borderRadius: 4, border: `1px solid ${CARD_BORDER}`, p: 4, outline: 'none'
          }}>
            <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: '#FFD700' }}>DE-ESCALATE INCIDENT</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>Formalize the resolution of this crisis event.</Typography>
            <TextField
              fullWidth multiline rows={4} label="Resolution Protocol Notes" variant="outlined"
              value={resolutionNote} onChange={e => setResolutionNote(e.target.value)}
              sx={{ mb: 3, '& .MuiOutlinedInput-root': { color: 'white', bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2 } }}
            />
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={() => setIsResolveModalOpen(false)} sx={{ color: 'text.secondary' }}>ABORT</Button>
              <Button 
                variant="contained" onClick={handleConfirmResolution} disabled={isResolving}
                sx={{ background: GOLD_GRADIENT, color: 'black', fontWeight: 900, borderRadius: 2, px: 4 }}
              >
                {isResolving ? <CircularProgress size={20} /> : 'RESOLVE'}
              </Button>
            </Stack>
          </Box>
        </Modal>

        {/* Statement Review Modal */}
        <Modal open={!!reviewingStatement} onClose={() => !isSubmittingReview && setReviewingStatement(null)}>
          <Box sx={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 500, background: GLASS_BG, backdropFilter: 'blur(30px)',
            borderRadius: 4, border: `1px solid ${CARD_BORDER}`, p: 4, outline: 'none',
            boxShadow: '0 24px 48px rgba(0,0,0,0.5)'
          }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <GavelIcon sx={{ color: '#FFD700' }} />
              <Typography variant="h5" sx={{ fontWeight: 900, color: 'white' }}>ADJUDICATE STATEMENT</Typography>
            </Box>

            {/* Objector Intelligence */}
            <Box display="flex" alignItems="center" gap={2} sx={{ mb: 3, p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }}>
              <Avatar src={reviewingStatement?.objectorPhoto} sx={{ width: 48, height: 48, border: '2px solid #FFD700' }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'white' }}>{reviewingStatement?.objectorName}</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip label={reviewingStatement?.role} size="small" sx={{ height: 16, fontSize: 9, fontWeight: 900, bgcolor: '#FFD700', color: 'black' }} />
                  <Rating value={reviewingStatement?.objectorRating || 0} readOnly size="small" sx={{ fontSize: 12 }} />
                </Stack>
              </Box>
            </Box>
            
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block', fontWeight: 800 }}>SOURCE STATEMENT</Typography>
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', mb: 3 }}>
              <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.9)' }}>"{reviewingStatement?.text}"</Typography>
            </Box>

            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block', fontWeight: 800 }}>DETERMINATION NOTES</Typography>
            <TextField
              fullWidth multiline rows={3} placeholder="Enter the rationale for this determination..." variant="outlined"
              value={reviewNote} onChange={e => setReviewNote(e.target.value)}
              sx={{ mb: 4, '& .MuiOutlinedInput-root': { color: 'white', bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2 } }}
            />

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={() => setReviewingStatement(null)} disabled={isSubmittingReview} sx={{ color: 'text.secondary' }}>CANCEL</Button>
              <Button 
                onClick={() => handleReviewStatement('REJECTED')} 
                disabled={isSubmittingReview}
                sx={{ color: '#EF4444', fontWeight: 800, border: '1px solid rgba(239, 68, 68, 0.2)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
              >
                REJECT
              </Button>
              <Button 
                onClick={() => handleReviewStatement('ACCEPTED')} 
                disabled={isSubmittingReview}
                variant="contained" 
                sx={{ background: GOLD_GRADIENT, color: 'black', fontWeight: 900, px: 4 }}
              >
                {isSubmittingReview ? <CircularProgress size={20} color="inherit" /> : 'ACCEPT'}
              </Button>
            </Stack>
          </Box>
        </Modal>

        <Snackbar open={!!notification} autoHideDuration={4000} onClose={() => setNotification(null)}>
          <Alert severity={notification?.severity} variant="filled" sx={{ borderRadius: 2, fontWeight: 800 }}>
            {notification?.message}
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
};