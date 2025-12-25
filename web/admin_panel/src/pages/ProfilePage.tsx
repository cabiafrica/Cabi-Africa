import React, { useState, useEffect, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  List,
  IconButton,
  InputAdornment,
  ListItemButton,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuthContext } from '../../context/AuthContext';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, solarizedlight, atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import HistoryIcon from '@mui/icons-material/History';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { updateUserProfile, changePassword, enableTwoFactorAuth, verifyTwoFactorAuth, disableTwoFactorAuth, deleteAccount } from './api/profileService';
import { logAuditEvent, fetchUserAuditEvents, AuditEvent } from '@/features/audit/api/auditService';

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

const DetailItem = ({ label, value, onNotify }: { label: string; value: string; onNotify: (message: string, severity: 'success' | 'error') => void; }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      onNotify(`'${label}' copied to clipboard!`, 'success');
    }, (err) => {
      onNotify(`Failed to copy '${label}'.`, 'error');
      console.error('Could not copy text: ', err);
    });
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', my: 0.5, gap: 1 }}>
      <Typography variant="body1" sx={{ whiteSpace: 'nowrap' }}><strong>{label}:</strong></Typography>
      <Typography variant="body1" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</Typography>
      <IconButton onClick={handleCopy} size="small">
        <ContentCopyIcon fontSize="inherit" />
      </IconButton>
    </Box>
  );
};

export const ProfilePage = () => {
  const { user, updateUser, logout, syntaxTheme } = useAuthContext();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isTwoFactorModalOpen, setIsTwoFactorModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editedFullName, setEditedFullName] = useState(user?.fullName || '');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'error' } | null>(null);

  // State for image upload and crop
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.profilePictureUrl || null);
  const [imgSrc, setImgSrc] = useState('');
  const imgRef = React.useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();

  // State for 2FA setup
  const [twoFactorStep, setTwoFactorStep] = useState(1);
  const [twoFactorQrCode, setTwoFactorQrCode] = useState('');
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [twoFactorVerificationCode, setTwoFactorVerificationCode] = useState('');
  const [showTwoFactorSecret, setShowTwoFactorSecret] = useState(false);

  // State for recent activity
  const [recentActivity, setRecentActivity] = useState<AuditEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  // State for account deletion
  const [deleteConfirmationPassword, setDeleteConfirmationPassword] = useState('');

  // State for password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const isNewPasswordValid = useMemo(() => Object.values(passwordValidation).every(Boolean), [passwordValidation]);

  useEffect(() => {
    // Reset form field if user context changes
    if (user) {
      setEditedFullName(user.fullName);
      setPreviewUrl(user.profilePictureUrl || null);
    }

    const loadRecentActivity = async () => {
      if (!user) return;
      try {
        // Mocking response for demonstration
        const mockData: AuditEvent[] = [
          {
            id: 'evt-1', userId: user.id, action: 'PASSWORD_CHANGED', timestamp: new Date(Date.now() - 86400000).toISOString(),
            details: { sourceIp: '192.168.1.1', userAgent: 'Chrome/125.0.0.0' }
          },
          { id: 'evt-2', userId: user.id, action: '2FA_ENABLED', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
        ];
        // const data = await fetchUserAuditEvents(user.id, 5);
        setRecentActivity(mockData);
      } catch (err) {
        console.error('Failed to load recent activity', err);
      }
    };
    loadRecentActivity();
  }, [user]);

  if (!user) {
    return null; // Or a loading spinner
  }

  const themeMap: { [key: string]: any } = {
    vscDarkPlus,
    solarizedlight,
    atomDark,
  };

  const handleOpenModal = () => {
    setEditedFullName(user.fullName); // Ensure form is fresh when opened
    setPreviewUrl(user.profilePictureUrl || null);
    setSelectedFile(null);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedFile(null);
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // In a real app, you would get a new URL from the backend response.
      // For this mock, we'll just use the local blob URL for the preview.
      const updatedUser = await updateUserProfile(user.id, {
        fullName: editedFullName,
        profilePicture: selectedFile,
      });
      // The backend would return the new URL, so we update the user object.
      if (previewUrl && selectedFile) updatedUser.profilePictureUrl = previewUrl;
      updateUser(updatedUser); // Update global context
      setNotification({ open: true, message: 'Profile updated successfully!', severity: 'success' });
      handleCloseModal();
    } catch (err) {
      setNotification({ open: true, message: 'Failed to update profile.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined); // Makes crop preview update between images.
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(e.target.files[0]);
      setIsCropModalOpen(true);
    }
  };

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 1, width, height), width, height));
  }

  const handleCropImage = async () => {
    const image = imgRef.current;
    if (!image || !crop) {
      throw new Error('Crop details not available');
    }

    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('No 2d context');
    }

    ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Canvas is empty');
        return;
      }
      const croppedFile = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
      setSelectedFile(croppedFile);
      setPreviewUrl(URL.createObjectURL(blob));
      setIsCropModalOpen(false);
    }, 'image/jpeg');
  };

  const handleToggleTwoFactorAuth = async () => {
    if (user?.isTwoFactorEnabled) {
      // Logic to disable 2FA
      setLoading(true);
      try {
        await disableTwoFactorAuth(user.id);
        await logAuditEvent({ action: '2FA_DISABLED', userId: user.id });
        updateUser({ ...user, isTwoFactorEnabled: false });
        setNotification({ open: true, message: 'Two-Factor Authentication disabled.', severity: 'success' });
      } catch (err) {
        setNotification({ open: true, message: 'Failed to disable 2FA.', severity: 'error' });
      } finally {
        setLoading(false);
      }
    } else {
      // Logic to start enabling 2FA
      setLoading(true);
      try {
        // For a real app, the mock response would be replaced by the API call
        // const { qrCodeUrl, secret } = await enableTwoFactorAuth(user.id);
        const mockResponse = {
          qrCodeUrl: 'https://www.google.com/chart?chs=200x200&cht=qr&chl=otpauth://totp/CabiAdmin:admin@cabi.com%3Fsecret%3DJBSWY3DPEHPK3PXP&issuer=CabiAdmin',
          secret: 'JBSWY3DPEHPK3PXP'
        };
        setTwoFactorQrCode(mockResponse.qrCodeUrl);
        setTwoFactorSecret(mockResponse.secret);
        setIsTwoFactorModalOpen(true);
        setTwoFactorStep(1);
      } catch (err) {
        setNotification({ open: true, message: 'Failed to start 2FA setup.', severity: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVerifyTwoFactorAuth = async () => {
    setLoading(true);
    try {
      // await verifyTwoFactorAuth(user.id, twoFactorVerificationCode);
      console.log(`[Mock] Verifying 2FA with code: ${twoFactorVerificationCode}`);
      await logAuditEvent({ action: '2FA_ENABLED', userId: user.id });
      updateUser({ ...user, isTwoFactorEnabled: true });
      setNotification({ open: true, message: 'Two-Factor Authentication enabled successfully!', severity: 'success' });
      setIsTwoFactorModalOpen(false);
      setTwoFactorVerificationCode('');
    } catch (err) {
      setNotification({ open: true, message: 'Invalid verification code. Please try again.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseTwoFactorModal = () => {
    setIsTwoFactorModalOpen(false);
    setShowTwoFactorSecret(false);
  };

  const handleCopySecret = () => {
    if (!twoFactorSecret) return;
    navigator.clipboard.writeText(twoFactorSecret).then(() => {
      setNotification({ open: true, message: 'Secret key copied to clipboard!', severity: 'success' });
    }, (err) => {
      setNotification({ open: true, message: 'Failed to copy secret key.', severity: 'error' });
      console.error('Could not copy text: ', err);
    });
  };

  const handleCopyRawJson = () => {
    if (!selectedEvent) return;
    const jsonString = JSON.stringify(selectedEvent, null, 2);
    navigator.clipboard.writeText(jsonString).then(() => {
      setNotification({ open: true, message: 'Raw JSON copied to clipboard!', severity: 'success' });
    }, (err) => {
      setNotification({ open: true, message: 'Failed to copy JSON.', severity: 'error' });
      console.error('Could not copy text: ', err);
    });
  };

  const handleOpenDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteConfirmationPassword('');
  };

  const handleConfirmDeleteAccount = async () => {
    setLoading(true);
    try {
      await deleteAccount(user.id, deleteConfirmationPassword);
      await logAuditEvent({ action: 'ACCOUNT_DELETED', userId: user.id });
      setNotification({ open: true, message: 'Account deleted successfully. You will be logged out.', severity: 'success' });
      setTimeout(() => {
        logout(); // This will trigger redirect via apiClient interceptor
      }, 3000);
    } catch (err: any) {
      setNotification({ open: true, message: err.response?.data?.message || 'Failed to delete account. Please check your password.', severity: 'error' });
    } finally {
      setLoading(false);
      // Don't close modal on error, so user can retry.
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleOpenChangePasswordModal = () => {
    setIsChangePasswordModalOpen(true);
  };

  const handleCloseChangePasswordModal = () => {
    setIsChangePasswordModalOpen(false);
    // Clear password fields on close
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setNewPassword(password);
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const handleSaveChangesPassword = async () => {
    if (newPassword !== confirmNewPassword) {
      setNotification({ open: true, message: 'New passwords do not match.', severity: 'error' });
      return;
    }
    if (!isNewPasswordValid) {
      setNotification({ open: true, message: 'New password does not meet all requirements.', severity: 'error' });
      return;
    }
    setLoading(true);
    try {
      await changePassword(user.id, { currentPassword, newPassword });
      await logAuditEvent({ action: 'PASSWORD_CHANGED', userId: user.id });
      setNotification({ open: true, message: 'Password changed successfully!', severity: 'success' });
      handleCloseChangePasswordModal();
    } catch (err: any) {
      setNotification({ open: true, message: err.response?.data?.message || 'Failed to change password. Check your current password.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" gutterBottom>
          My Profile
        </Typography>
        <Button variant="contained" onClick={handleOpenModal}>
          Edit Profile
        </Button>
      </Box>
      <Paper sx={{ p: 3, mt: 2, maxWidth: 600 }}>
        <Box display="flex" alignItems="center" gap={3}>
          <Avatar src={user.profilePictureUrl} sx={{ width: 80, height: 80, textTransform: 'uppercase' }}>
            {!user.profilePictureUrl && user.fullName.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h5">{user.fullName}</Typography>
            <Chip label={user.role} color="primary" size="small" sx={{ mt: 1, textTransform: 'capitalize' }} />
          </Box>
        </Box>
        <Box mt={3} pt={3} borderTop="1px solid #eee">
          <Typography variant="h6" gutterBottom>Security</Typography>
          <Button variant="outlined" onClick={handleOpenChangePasswordModal}>
            Change Password
          </Button>
          <Button variant="outlined" onClick={handleToggleTwoFactorAuth} sx={{ ml: 2 }} disabled={loading}>
            {user.isTwoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
          </Button>
          <Button variant="outlined" color="error" onClick={handleOpenDeleteModal} sx={{ ml: 2 }}>
            Delete Account
          </Button>
        </Box>
        <Box mt={3} pt={3} borderTop="1px solid #eee">
          <Typography variant="h6" gutterBottom>Recent Activity</Typography>
          <List dense>
            {recentActivity.length > 0 ? (
              recentActivity.map(event => (
                <ListItemButton key={event.id} onClick={() => setSelectedEvent(event)}>
                  <ListItemIcon>
                    <HistoryIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={event.action.replace(/_/g, ' ')}
                    secondary={new Date(event.timestamp).toLocaleString()}
                  />
                </ListItemButton>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No recent security events found.
              </Typography>
            )}
          </List>
        </Box>
      </Paper>

      <Dialog open={!!selectedEvent} onClose={() => { setSelectedEvent(null); setShowRawJson(false); }} fullWidth maxWidth="sm">
        <DialogTitle>Event Details</DialogTitle>
        <DialogContent>
          {selectedEvent && (
            showRawJson ? (
              <SyntaxHighlighter language="json" style={themeMap[syntaxTheme]} customStyle={{ borderRadius: '4px', margin: 0 }}>
                {JSON.stringify(selectedEvent, null, 2)}
              </SyntaxHighlighter>
            ) : (
              <Box>
                <DetailItem label="Action" value={selectedEvent.action.replace(/_/g, ' ')} onNotify={(message, severity) => setNotification({ open: true, message, severity })} />
                <DetailItem label="Timestamp" value={new Date(selectedEvent.timestamp).toLocaleString()} onNotify={(message, severity) => setNotification({ open: true, message, severity })} />
                <DetailItem label="User ID" value={selectedEvent.userId} onNotify={(message, severity) => setNotification({ open: true, message, severity })} />
                {selectedEvent.details && (
                  <Box mt={2}>
                    <Typography variant="body1"><strong>Details:</strong></Typography>
                    <Paper variant="outlined" sx={{ p: 1, mt: 1, bgcolor: '#f5f5f5' }}>
                      {Object.entries(selectedEvent.details).map(([key, value]) => (
                        <DetailItem key={key} label={key} value={String(value)} onNotify={(message, severity) => setNotification({ open: true, message, severity })} />
                      ))}
                    </Paper>
                  </Box>
                )}
              </Box>
            )
          )}
        </DialogContent>
        <DialogActions>
          <Box sx={{ mr: 'auto' }}>
            <Button onClick={() => setShowRawJson(!showRawJson)}>
              {showRawJson ? 'View Formatted' : 'View Raw JSON'}
            </Button>
            {showRawJson && <Button onClick={handleCopyRawJson} startIcon={<ContentCopyIcon />}>Copy</Button>}
          </Box>
          <Button
            component={RouterLink}
            to={`/audit-log?userId=${selectedEvent?.userId}`}
          >View All User Activity</Button>
          <Button onClick={() => { setSelectedEvent(null); setShowRawJson(false); }} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isEditModalOpen} onClose={handleCloseModal} fullWidth maxWidth="xs">
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, my: 2 }}>
            <Avatar src={previewUrl || undefined} sx={{ width: 120, height: 120 }}>
              {!previewUrl && editedFullName.charAt(0)}
            </Avatar>
            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoCamera />}
            >
              Upload Picture
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={onSelectFile}
              />
            </Button>
          </Box>
          <TextField
            autoFocus
            margin="dense"
            id="fullName"
            label="Full Name"
            type="text"
            fullWidth
            variant="outlined"
            value={editedFullName}
            onChange={(e) => setEditedFullName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} disabled={loading}>Cancel</Button>
          <Button onClick={handleSaveProfile} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isCropModalOpen} onClose={() => setIsCropModalOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Crop Your Picture</DialogTitle>
        <DialogContent>
          {imgSrc && (
            <ReactCrop crop={crop} onChange={c => setCrop(c)} aspect={1}>
              <img ref={imgRef} alt="Crop me" src={imgSrc} onLoad={onImageLoad} style={{ maxHeight: '70vh' }} />
            </ReactCrop>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCropModalOpen(false)}>Cancel</Button>
          <Button onClick={handleCropImage} variant="contained">
            Apply Crop
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isTwoFactorModalOpen} onClose={handleCloseTwoFactorModal} fullWidth maxWidth="sm">
        <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
        <DialogContent>
          {twoFactorStep === 1 && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography gutterBottom>1. Scan this QR code with your authenticator app (e.g., Google Authenticator).</Typography>
              <img src={twoFactorQrCode} alt="2FA QR Code" />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Or manually enter this key:
              </Typography>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', p: 1, bgcolor: '#f5f5f5', mt: 1, borderRadius: 1 }}>
                <Typography component="p" sx={{ fontFamily: 'monospace', letterSpacing: 2 }}>
                  {showTwoFactorSecret ? twoFactorSecret.replace(/(.{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
                </Typography>
                <IconButton onClick={() => setShowTwoFactorSecret(!showTwoFactorSecret)} size="small" sx={{ ml: 1 }}>
                  {showTwoFactorSecret ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
                <IconButton onClick={handleCopySecret} size="small">
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          )}
          {twoFactorStep === 2 && (
            <Box>
              <Typography gutterBottom>2. Enter the 6-digit code from your authenticator app to verify.</Typography>
              <TextField
                autoFocus
                margin="dense"
                label="Verification Code"
                type="text"
                fullWidth
                variant="outlined"
                value={twoFactorVerificationCode}
                onChange={(e) => setTwoFactorVerificationCode(e.target.value)}
                inputProps={{ maxLength: 6 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTwoFactorModal} disabled={loading}>Cancel</Button>
          {twoFactorStep === 1 && <Button onClick={() => setTwoFactorStep(2)} variant="contained">Next</Button>}
          {twoFactorStep === 2 && (
            <Button onClick={handleVerifyTwoFactorAuth} variant="contained" disabled={loading || twoFactorVerificationCode.length < 6}>
              {loading ? <CircularProgress size={24} /> : 'Verify & Enable'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onClose={handleCloseDeleteModal} fullWidth maxWidth="sm">
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            This action is permanent and cannot be undone. All your data will be deleted.
          </Alert>
          <Typography sx={{ my: 2 }}>
            To confirm, please enter your password.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Current Password"
            type="password"
            fullWidth
            variant="outlined"
            value={deleteConfirmationPassword}
            onChange={(e) => setDeleteConfirmationPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteModal} disabled={loading}>Cancel</Button>
          <Button onClick={handleConfirmDeleteAccount} variant="contained" color="error" disabled={loading || !deleteConfirmationPassword}>
            {loading ? <CircularProgress size={24} /> : 'Delete My Account'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isChangePasswordModalOpen} onClose={handleCloseChangePasswordModal} fullWidth maxWidth="sm">
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Current Password"
            type={showCurrentPassword ? 'text' : 'password'}
            fullWidth
            variant="outlined"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    onMouseDown={(e) => e.preventDefault()}
                    edge="end"
                  >
                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            margin="dense"
            label="New Password"
            type={showNewPassword ? 'text' : 'password'}
            fullWidth
            variant="outlined"
            value={newPassword}
            onChange={handlePasswordChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    onMouseDown={(e) => e.preventDefault()}
                    edge="end"
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            margin="dense"
            label="Confirm New Password"
            type={showConfirmNewPassword ? 'text' : 'password'}
            fullWidth
            variant="outlined"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    onMouseDown={(e) => e.preventDefault()}
                    edge="end"
                  >
                    {showConfirmNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <List dense sx={{ mt: 1 }}>
            <PasswordRequirement valid={passwordValidation.length} text="At least 8 characters long" />
            <PasswordRequirement valid={passwordValidation.uppercase} text="Contains an uppercase letter" />
            <PasswordRequirement valid={passwordValidation.lowercase} text="Contains a lowercase letter" />
            <PasswordRequirement valid={passwordValidation.number} text="Contains a number" />
            <PasswordRequirement valid={passwordValidation.special} text="Contains a special character (!@#$...)" />
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseChangePasswordModal} disabled={loading}>Cancel</Button>
          <Button onClick={handleSaveChangesPassword} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {notification && (
        <Snackbar open={notification.open} autoHideDuration={6000} onClose={() => setNotification(null)}>
          <Alert onClose={() => setNotification(null)} severity={notification.severity} sx={{ width: '100%' }}>
            {notification.message}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};