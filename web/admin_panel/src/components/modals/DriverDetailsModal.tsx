import React, { useState } from 'react';
import { 
  Modal, 
  Box, 
  Typography, 
  Button, 
  Stack, 
  CircularProgress,
  TextField
} from '@mui/material';

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

// This would be in a dedicated api service file
const updateDriverStatus = async (driverId: string, action: 'approve' | 'reject' | 'request-correction', payload?: any) => {
  // const response = await fetch(`http://localhost:3334/api/admin/drivers/${driverId}/${action}`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: payload ? JSON.stringify(payload) : undefined,
  // });
  // if (!response.ok) throw new Error(`Failed to ${action} driver`);
  console.log(`[Mock] Action: ${action} on driver ${driverId} with payload:`, payload);
  return { success: true };
};

export const DriverDetailsModal = ({ driver, open, onClose }: { driver: any, open: boolean, onClose: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [showCorrectionForm, setShowCorrectionForm] = useState(false);
  const [correctionReason, setCorrectionReason] = useState('');

  const handleAction = async (action: 'approve' | 'reject' | 'request-correction') => {
    setLoading(true);
    try {
      let payload;
      if (action === 'request-correction') {
        // In a real UI, you'd have a form for multiple fields.
        // For simplicity, we're using one text field.
        payload = { corrections: [{ field: 'documents', reason: correctionReason }] };
      }
      await updateDriverStatus(driver.userId, action, payload);
      onClose(); // Close modal on success
    } catch (error) {
      console.error('Failed to update driver status', error);
      // TODO: Show error toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h5" component="h2">Review Application: {driver.fullName}</Typography>
        <Typography sx={{ mt: 2 }}>User ID: {driver.userId}</Typography>
        <Typography sx={{ mt: 2 }}>Status: {driver.status}</Typography>
        
        {/* Placeholder for document links and vehicle details */}
        <Box my={3} p={2} border="1px dashed grey">
          <Typography>Documents and Vehicle Details would be displayed here.</Typography>
        </Box>

        {showCorrectionForm && (
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason for Correction"
            value={correctionReason}
            onChange={(e) => setCorrectionReason(e.target.value)}
            sx={{ my: 2 }}
          />
        )}

        <Stack direction="row" spacing={2} mt={4} justifyContent="flex-end">
          {loading ? <CircularProgress /> : (
            <>
              <Button variant="outlined" color="secondary" onClick={() => setShowCorrectionForm(!showCorrectionForm)}>
                {showCorrectionForm ? 'Cancel Correction' : 'Request Correction'}
              </Button>
              <Button variant="contained" color="error" onClick={() => handleAction('reject')}>Reject</Button>
              <Button variant="contained" color="success" onClick={() => showCorrectionForm ? handleAction('request-correction') : handleAction('approve')}>
                {showCorrectionForm ? 'Submit Correction Request' : 'Approve'}
              </Button>
            </>
          )}
        </Stack>
      </Box>
    </Modal>
  );
};