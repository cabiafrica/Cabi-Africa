import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, CircularProgress, Grid, TextField, Typography, Alert, Card, CardContent, CardHeader, Modal, Snackbar, Chip } from '@mui/material';
import { useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { Mic as MicIcon, Notes as NotesIcon } from '@mui/icons-material';
import { adminService, SOSIncidentDetails, SOSIncidentLogEntry } from '../services/adminService';
import CabiMap, { MapMarker } from '../components/CabiMap';
import 'leaflet/dist/leaflet.css'; // Required for Leaflet styles

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

  // Refs for audio streaming to avoid re-renders
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSocketRef = useRef<WebSocket | null>(null);
  const audioQueueRef = useRef<ArrayBuffer[]>([]);
  const isPlayingAudioRef = useRef(false);

  // Load initial data
  useEffect(() => {
    const loadIncident = async () => {
      if (!incidentId) return;
      try {
        setLoading(true);
        const data = await adminService.getSosIncidentDetails(incidentId);
        setIncident(data);
        // Assuming status is in the incident object, but SOSIncidentDetails doesn't have it in types.ts
        // Let's check the types.ts again or just use a safe check.
        setIsResolved((data as any).status === 'RESOLVED');
      } catch (err) {
        setNotification({ open: true, message: 'Failed to load incident details.', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };
    loadIncident();
  }, [incidentId]);

  // Handle WebSocket connection for real-time updates
  useEffect(() => {
    if (!incidentId || isResolved) return;

    // In a real app, the URL would come from an environment config file.
    // The query helps the backend subscribe this client to the correct incident room.
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3333';
    const socket: Socket = io(socketUrl, {
      query: { incidentId },
    });

    socket.on('connect', () => {
      console.log(`[WebSocket] Connected and subscribed to incident ${incidentId}`);
    });

    socket.on('locationUpdate', (newLocation: { lat: number; lng: number }) => {
      console.log('[WebSocket] Received location update:', newLocation);
      setIncident(prev => prev ? { ...prev, liveLocation: { lat: newLocation.lat, lng: newLocation.lng } } : null);
    });

    socket.on('disconnect', () => {
      console.log('[WebSocket] Disconnected');
    });

    // Cleanup function to disconnect socket
    return () => { socket.disconnect(); };
  }, [incidentId, isResolved]);

  const handleLogAction = async () => {
    if (!newLog.trim() || !incidentId) return;
    try {
      const addedLog = await adminService.logSosIncidentAction(incidentId, newLog);
      const logEntry: SOSIncidentLogEntry = {
        timestamp: new Date().toISOString(),
        notes: newLog
      };
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

    audioContextRef.current.decodeAudioData(audioData)
      .then(buffer => {
        const source = audioContextRef.current!.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current!.destination);
        source.onended = playNextAudioChunk; // Play the next chunk when this one finishes
        source.start();
      })
      .catch(e => console.error("Error decoding audio data", e));
  };

  const handleListenIn = async () => {
    if (isListening) {
      // Stop listening
      isPlayingAudioRef.current = false;
      if (audioSocketRef.current) {
        audioSocketRef.current.close();
        audioSocketRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        await audioContextRef.current.close();
        audioContextRef.current = null;
      }
      audioQueueRef.current = [];
      console.log('[Audio] Disconnected from audio stream.');
    } else {
      // Start listening
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        // In a real app, use wss:// for secure connections
        const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3333';
        const wsUrl = socketUrl.replace('https://', 'wss://').replace('http://', 'ws://');
        const socket = new WebSocket(`${wsUrl}/audio?incidentId=${incidentId}`);
        socket.binaryType = 'arraybuffer';

        socket.onopen = () => console.log('[Audio] Connected to audio stream.');
        socket.onmessage = (event) => {
          audioQueueRef.current.push(event.data);
          if (!isPlayingAudioRef.current) {
            isPlayingAudioRef.current = true;
            playNextAudioChunk();
          }
        };
        socket.onclose = () => console.log('[Audio] Audio stream closed.');
        socket.onerror = (err) => console.error('[Audio] WebSocket error:', err);
        audioSocketRef.current = socket;
      } catch (err) {
        console.error("Failed to start audio stream:", err);
        setNotification({ open: true, message: 'Could not connect to audio stream. Web Audio API may not be supported.', severity: 'error' });
      }
    }
    setIsListening(prev => !prev);
  };

  const handleConfirmResolution = async () => {
    if (!resolutionNote.trim() || !incidentId) return;
    setIsResolving(true);
    try {
      await adminService.resolveSosIncident(incidentId, 'LEGITIMATE'); // Assuming 'LEGITIMATE' as default for now or update UI
      setIsResolved(true);
      setIsResolveModalOpen(false);
      setResolutionNote('');
      setNotification({ open: true, message: 'Incident resolved successfully.', severity: 'success' });
    } catch (err: any) {
      setNotification({ open: true, message: err.message || 'Failed to resolve incident.', severity: 'error' });
    } finally {
      setIsResolving(false);
    }
  };

  const handleCloseNotification = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setNotification(null);
  };

  if (loading) return <CircularProgress />;
  // Show a blocking error only if the initial load fails completely
  if (!incident && notification?.severity === 'error') {
    return <Alert severity="error">{notification.message}</Alert>;
  }
  if (!incident) return <Alert severity="warning">Incident not found.</Alert>;

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" gutterBottom>SOS Incident: {incident.id}</Typography>
        <Chip 
          label={isResolved ? 'Resolved' : 'Active'} 
          color={isResolved ? 'success' : 'error'} 
        />
      </Box>
      <Grid container spacing={3}>
        {/* Left Column: Details */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Driver Details" />
            <CardContent>
              <Typography variant="body1">Name: {incident.driver.name}</Typography>
              <Typography variant="body1">Phone: {incident.driver.phone}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ mt: 2 }}>
            <CardHeader title="Passenger Details" />
            <CardContent>
              <Typography variant="body1">Name: {incident.passenger.name}</Typography>
              <Typography variant="body1">Phone: {incident.passenger.phone}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ mt: 2 }}>
            <CardHeader title="Upline Contacts" />
            <CardContent>
              <Typography variant="body1">Upline 1: {incident.upline1.name} ({incident.upline1.phone})</Typography>
              <Typography variant="body1">Upline 2: {incident.upline2.name} ({incident.upline2.phone})</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Map and Actions */}
        <Grid item xs={12} md={8}>
          <Box sx={{ height: '400px', width: '100%', position: 'relative' }}>
            <CabiMap 
              center={[incident.liveLocation.lat, incident.liveLocation.lng]}
              zoom={15}
              markers={[{
                id: 'incident-location',
                position: [incident.liveLocation.lat, incident.liveLocation.lng],
                type: 'custom',
                popup: 'SOS Location'
              }]}
              height="400px"
            />
          </Box>
          <Box mt={2} display="flex" gap={2}>
            <Button variant="contained" color={isListening ? 'secondary' : 'primary'} startIcon={<MicIcon />} onClick={handleListenIn} disabled={isResolved}>
              {isListening ? 'Stop Listening' : 'Listen In'}
            </Button>
            <Button variant="contained" color="success" onClick={() => setIsResolveModalOpen(true)} disabled={isResolved}>
              Resolve Incident
            </Button>
          </Box>

          <Box mt={3}>
            <Typography variant="h6" gutterBottom><NotesIcon /> Action Log</Typography>
            <Box sx={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', p: 1, mb: 2 }}>
              {incident.logs.map((log, index) => (
                <Typography key={index} variant="body2" sx={{ fontFamily: 'monospace' }}>[{new Date(log.timestamp).toLocaleTimeString()}] {log.notes}</Typography>
              ))}
            </Box>
            <TextField label="Log a new action..." value={newLog} onChange={(e) => setNewLog(e.target.value)} fullWidth multiline rows={2} disabled={isResolved} />
            <Button variant="contained" onClick={handleLogAction} sx={{ mt: 1 }} disabled={isResolved}>Log Action</Button>
          </Box>
        </Grid>
      </Grid>

      <Modal open={isResolveModalOpen} onClose={() => setIsResolveModalOpen(false)}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 500, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4,
        }}>
          <Typography variant="h6" component="h2">Confirm Incident Resolution</Typography>
          <Typography sx={{ mt: 2 }}>Please provide a final note summarizing the resolution of this incident.</Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Resolution Note"
            value={resolutionNote}
            onChange={(e) => setResolutionNote(e.target.value)}
            sx={{ my: 2 }}
            required
            error={!resolutionNote.trim() && isResolving}
            helperText={!resolutionNote.trim() && isResolving ? "Resolution note is required." : ""}
          />
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="text" onClick={() => setIsResolveModalOpen(false)} disabled={isResolving}>Cancel</Button>
            <Button variant="contained" color="primary" onClick={handleConfirmResolution} disabled={isResolving}>
              {isResolving ? <CircularProgress size={24} /> : 'Confirm Resolution'}
            </Button>
          </Box>
        </Box>
      </Modal>

      {notification && (
        <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification}>
          <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>{notification.message}</Alert>
        </Snackbar>
      )}
    </Box>
  );
};