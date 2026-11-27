import React, { useState, useEffect, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
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
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, solarizedlight, atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import HistoryIcon from '@mui/icons-material/History';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import { useAuthContext } from '../AuthContext';
import { PageHeader } from '../components/common/PageHeader';
import { isPlatformAuthenticatorAvailable, registerPasskeyCredential } from '../lib/webauthn';
import {
  updateUserProfile,
  changePassword,
  enableTwoFactorAuth,
  verifyTwoFactorAuth,
  disableTwoFactorAuth,
  deleteAccount,
  getWebAuthnChallenge,
  registerWebAuthnCredential
} from './api/profileService';
import { logAuditEvent, AuditEvent } from '@/features/audit/api/auditService';
import {
  PERMISSIONS_LIST,
  PERMISSION_CATEGORIES,
  getPermissionCategory,
  getPermissionLabel,
  getPermissionDescription
} from '../constants/permissions';
import {
  ShieldCheck,
  KeyRound,
  QrCode,
  UserCheck,
  Mail,
  Shield,
  Smartphone,
  Lock,
  Edit3,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Award
} from 'lucide-react';

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
      <Typography variant="body2" sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{label}:</Typography>
      <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'monospace' }}>{value}</Typography>
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
  const [editedPhone, setEditedPhone] = useState((user as any)?.phone || '');
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

  const [isPasskeySupported, setIsPasskeySupported] = useState(false);
  const [enrollingPasskey, setEnrollingPasskey] = useState(false);

  // Permissions inspector states
  const [permSearch, setPermSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    isPlatformAuthenticatorAvailable().then(setIsPasskeySupported);
  }, []);

  const handleEnrollPasskey = async () => {
    if (!user) return;
    setEnrollingPasskey(true);
    try {
      const challengeRes = await getWebAuthnChallenge(user.id || user.email || 'admin');
      const credential = await registerPasskeyCredential(user.id, user.email || 'admin@cabi.africa', challengeRes.challenge);
      await registerWebAuthnCredential(user.id, credential);
      await logAuditEvent({ action: 'PASSKEY_REGISTERED', userId: user.id } as any);
      setNotification({
        open: true,
        message: 'Biometric Passkey registered successfully! Touch ID / Face ID is active for instant unlock.',
        severity: 'success',
      });
    } catch (err: any) {
      console.error('Passkey enrollment failed', err);
      setNotification({
        open: true,
        message: err.message || 'Passkey enrollment was cancelled or failed.',
        severity: 'error',
      });
    } finally {
      setEnrollingPasskey(false);
    }
  };

  useEffect(() => {
    if (user) {
      setEditedFullName(user.fullName);
      setPreviewUrl(user.profilePictureUrl || null);
      setEditedPhone((user as any).phone || '');
    }

    // Populate recent security activity log
    const mockEvents: AuditEvent[] = [
      {
        id: 'evt-1',
        action: 'SUPER_ADMIN_SESSION_VERIFIED',
        timestamp: new Date().toISOString(),
        userId: user?.id || 'admin-001',
        details: { method: 'JWT_2FA', ip: '192.168.100.78', client: 'Admin Console' }
      },
      {
        id: 'evt-2',
        action: 'PERMISSION_MATRIX_EVALUATED',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        userId: user?.id || 'admin-001',
        details: { scope: 'DISPATCH_FLEET_SACCO', status: 'GRANTED' }
      },
      {
        id: 'evt-3',
        action: 'INACTIVITY_SENTINEL_ACTIVE',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        userId: user?.id || 'admin-001',
        details: { timeoutMinutes: 30 }
      }
    ];
    setRecentActivity(mockEvents);
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-gray-400">
        Loading profile...
      </div>
    );
  }

  const themeMap: { [key: string]: any } = {
    vscDarkPlus,
    solarizedlight,
    atomDark,
  };

  // Determine user's active permissions
  const activePermissions = user.permissions?.includes('*') || (user.role && user.role.toUpperCase() === 'SUPER_ADMIN')
    ? PERMISSIONS_LIST
    : (user.permissions || []);

  const categoriesList = ['All', ...Object.keys(PERMISSION_CATEGORIES)];

  const filteredPermissions = activePermissions.filter(perm => {
    const category = getPermissionCategory(perm);
    const matchesCategory = selectedCategory === 'All' || category === selectedCategory;
    const label = getPermissionLabel(perm);
    const desc = getPermissionDescription(perm);
    const matchesSearch = !permSearch.trim() ||
      perm.toLowerCase().includes(permSearch.toLowerCase()) ||
      label.toLowerCase().includes(permSearch.toLowerCase()) ||
      desc.toLowerCase().includes(permSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenModal = () => {
    setEditedFullName(user.fullName);
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
      const updatedUser = await updateUserProfile(user.id, {
        fullName: editedFullName,
        phone: editedPhone,
        profilePicture: selectedFile,
        profilePictureUrl: previewUrl || undefined,
      });

      updateUser(updatedUser);
      setNotification({ open: true, message: 'Profile updated successfully!', severity: 'success' });
      handleCloseModal();
    } catch (err: any) {
      setNotification({ open: true, message: err.message || 'Failed to update profile.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined);
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
    if (!image || !crop) return;

    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const croppedFile = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
      setSelectedFile(croppedFile);
      setPreviewUrl(URL.createObjectURL(blob));
      setIsCropModalOpen(false);
    }, 'image/jpeg');
  };

  const handleToggleTwoFactorAuth = async () => {
    if (user?.isTwoFactorEnabled) {
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
      setLoading(true);
      try {
        const { qrCodeUrl, secret } = await enableTwoFactorAuth(user.id);
        setTwoFactorQrCode(qrCodeUrl);
        setTwoFactorSecret(secret);
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
      await verifyTwoFactorAuth(user.id, twoFactorVerificationCode);
      await logAuditEvent({ action: '2FA_ENABLED', userId: user.id });
      updateUser({ ...user, isTwoFactorEnabled: true });
      setNotification({ open: true, message: 'Two-Factor Authentication enabled successfully!', severity: 'success' });
      setIsTwoFactorModalOpen(false);
      setTwoFactorVerificationCode('');
    } catch (err: any) {
      setNotification({ open: true, message: err.message || 'Invalid verification code. Please try again.', severity: 'error' });
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
    });
  };

  const handleCopyRawJson = () => {
    if (!selectedEvent) return;
    const jsonString = JSON.stringify(selectedEvent, null, 2);
    navigator.clipboard.writeText(jsonString).then(() => {
      setNotification({ open: true, message: 'Raw JSON copied to clipboard!', severity: 'success' });
    });
  };

  const handleOpenDeleteModal = () => setIsDeleteModalOpen(true);
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
      setTimeout(() => logout(), 2000);
    } catch (err: any) {
      setNotification({ open: true, message: err.message || 'Failed to delete account.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChangePasswordModal = () => setIsChangePasswordModalOpen(true);
  const handleCloseChangePasswordModal = () => {
    setIsChangePasswordModalOpen(false);
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
      setNotification({ open: true, message: 'Master password changed successfully!', severity: 'success' });
      handleCloseChangePasswordModal();
    } catch (err: any) {
      setNotification({ open: true, message: err.message || 'Failed to change password.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        category="Executive Governance"
        title="Super Admin Profile & Security"
        subtitle="Manage your personal credentials, identity verification, multi-factor authentication, and operational authority."
        icon={<UserCheck className="w-5 h-5 text-amber-500" />}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenModal}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-brand-yellow hover:bg-brand-yellowHover text-black flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile Details</span>
            </button>
            <button
              onClick={handleOpenChangePasswordModal}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-gray-200 border border-slate-200 dark:border-white/10 flex items-center gap-1.5 transition-all"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-500" />
              <span>Change Password</span>
            </button>
          </div>
        }
      />

      {/* Main Profile Hero Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#131722] border border-slate-200 dark:border-white/10 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-yellow/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <Avatar
                src={previewUrl || user.profilePictureUrl}
                sx={{
                  width: 90,
                  height: 90,
                  bgcolor: '#F59E0B',
                  color: '#000',
                  fontWeight: 900,
                  fontSize: '2rem',
                  boxShadow: '0 0 25px rgba(245, 158, 11, 0.25)',
                  border: '3px solid rgba(245, 158, 11, 0.4)'
                }}
              >
                {!user.profilePictureUrl && !previewUrl && (user.fullName ? user.fullName.charAt(0) : 'A')}
              </Avatar>
              <button
                type="button"
                onClick={handleOpenModal}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-amber-500 text-black shadow-md hover:bg-amber-400 transition-transform active:scale-95"
                title="Change Profile Picture"
              >
                <PhotoCamera sx={{ fontSize: 16 }} />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {user.fullName || 'Admin User'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{user.role || 'SUPER_ADMIN'}</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Identity Verified</span>
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-gray-400 mt-2 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user.email || 'admin@cabi.africa'}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <span>Authority: Full System Governance</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Active Session: Verified</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Security Badges */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <div className={`p-3 rounded-xl border flex items-center justify-between gap-4 text-xs ${
              user.isTwoFactorEnabled
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4" />
                <span className="font-bold">{user.isTwoFactorEnabled ? '2FA Active (TOTP)' : '2FA Not Active'}</span>
              </div>
              <button
                type="button"
                onClick={handleToggleTwoFactorAuth}
                className="text-[11px] font-black underline hover:opacity-80"
              >
                {user.isTwoFactorEnabled ? 'Disable' : 'Configure'}
              </button>
            </div>

            {isPasskeySupported && (
              <button
                type="button"
                onClick={handleEnrollPasskey}
                disabled={enrollingPasskey}
                className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/15 text-blue-400 flex items-center justify-between gap-4 text-xs font-bold transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FingerprintIcon fontSize="small" />
                  <span>{enrollingPasskey ? 'Enrolling...' : 'Register Passkey (Touch ID)'}</span>
                </div>
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Permissions Matrix & Security Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: My Active Operational Permissions (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#131722] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-brand-yellow" />
                <span>My Active Operational Privileges</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                Effective capabilities granted to your account under {user.role || 'Super Admin'}.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/30 shrink-0">
              {activePermissions.length} Active Permissions
            </span>
          </div>

          {/* Search & Category Filter */}
          <div className="space-y-2.5 pt-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={permSearch}
                onChange={e => setPermSearch(e.target.value)}
                placeholder="Search your permissions (e.g. dispatch, cancel, payout, verify)..."
                className="w-full !pl-11 pr-4 py-2 text-xs bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 text-xs">
              {categoriesList.map(cat => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg whitespace-nowrap font-bold text-[11px] transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-black shadow-xs font-black'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Permissions Table */}
          <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden max-h-[360px] overflow-y-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-white/10">
              <thead className="bg-slate-50 dark:bg-black/60 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="py-2.5 pl-4 pr-3 text-left text-xs uppercase tracking-wider font-bold text-slate-600 dark:text-gray-400">
                    Capability
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs uppercase tracking-wider font-bold text-slate-600 dark:text-gray-400">
                    Category
                  </th>
                  <th className="px-3 py-2.5 text-right text-xs uppercase tracking-wider font-bold text-slate-600 dark:text-gray-400 pr-4">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 bg-white dark:bg-[#131722]">
                {filteredPermissions.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-xs text-slate-400">
                      No matching capabilities found.
                    </td>
                  </tr>
                ) : (
                  filteredPermissions.map(perm => {
                    const label = getPermissionLabel(perm);
                    const desc = getPermissionDescription(perm);
                    const cat = getPermissionCategory(perm);
                    return (
                      <tr key={perm} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                        <td className="py-2.5 pl-4 pr-3">
                          <div className="font-bold text-xs text-slate-900 dark:text-white">
                            {label}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-gray-400 line-clamp-1">
                            {desc}
                          </div>
                          <code className="text-[9px] text-slate-400 dark:text-gray-500 font-mono">
                            {perm}
                          </code>
                        </td>
                        <td className="px-3 py-2.5 text-[11px] font-semibold text-slate-500 dark:text-gray-400 whitespace-nowrap">
                          {cat}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-right pr-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Authorized</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Security Center & Recent Events (1 col) */}
        <div className="space-y-6">
          {/* Security Summary Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#131722] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-brand-yellow" />
              <span>Security & Access Controls</span>
            </h3>

            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={handleOpenChangePasswordModal}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-semibold transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <KeyRound className="w-4 h-4 text-amber-500" />
                  <span>Master Password</span>
                </div>
                <span className="text-[11px] font-bold text-amber-500">Update</span>
              </button>

              <button
                type="button"
                onClick={handleToggleTwoFactorAuth}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-semibold transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4 text-emerald-500" />
                  <span>Authenticator App (2FA)</span>
                </div>
                <span className={`text-[11px] font-bold ${user.isTwoFactorEnabled ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {user.isTwoFactorEnabled ? 'Configured' : 'Setup'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleEnrollPasskey}
                disabled={enrollingPasskey}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-semibold transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <FingerprintIcon fontSize="small" sx={{ color: '#3B82F6' }} />
                  <span>Hardware Passkey</span>
                </div>
                <span className="text-[11px] font-bold text-blue-500">
                  {enrollingPasskey ? 'Enrolling...' : 'Register'}
                </span>
              </button>
            </div>
          </div>

          {/* Recent Security Activity Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#131722] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HistoryIcon className="text-amber-500" />
                <span>Security Activity Log</span>
              </h3>
              <RouterLink to="/audit-log" className="text-[11px] font-bold text-amber-500 hover:underline">
                View All
              </RouterLink>
            </div>

            <div className="space-y-2">
              {recentActivity.map(event => (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {event.action.replace(/_/g, ' ')}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5">
                      {new Date(event.timestamp).toLocaleTimeString()} • {new Date(event.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-[10px] text-amber-500 font-bold">Details</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={isEditModalOpen} onClose={handleCloseModal} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800 }}>Edit Administrator Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, my: 2 }}>
            <Avatar src={previewUrl || undefined} sx={{ width: 100, height: 100, bgcolor: '#F59E0B', color: '#000', fontWeight: 800 }}>
              {!previewUrl && (editedFullName ? editedFullName.charAt(0) : 'A')}
            </Avatar>
            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoCamera />}
              size="small"
              sx={{ borderColor: '#F59E0B', color: '#F59E0B' }}
            >
              Upload New Picture
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
            label="Full Legal Name"
            type="text"
            fullWidth
            variant="outlined"
            value={editedFullName}
            onChange={(e) => setEditedFullName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="phone"
            label="Direct Hotline / Mobile Phone"
            type="tel"
            fullWidth
            variant="outlined"
            placeholder="+254 758 777 222"
            value={editedPhone}
            onChange={(e) => setEditedPhone(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCloseModal} disabled={loading}>Cancel</Button>
          <Button
            onClick={handleSaveProfile}
            variant="contained"
            disabled={loading}
            sx={{ bgcolor: '#F59E0B', color: '#000', fontWeight: 700, '&:hover': { bgcolor: '#D97706' } }}
          >
            {loading ? <CircularProgress size={20} /> : 'Save Profile Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Cropping Modal */}
      <Dialog open={isCropModalOpen} onClose={() => setIsCropModalOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 800 }}>Crop Profile Picture</DialogTitle>
        <DialogContent>
          {imgSrc && (
            <ReactCrop crop={crop} onChange={c => setCrop(c)} aspect={1}>
              <img ref={imgRef} alt="Crop preview" src={imgSrc} onLoad={onImageLoad} style={{ maxHeight: '65vh' }} />
            </ReactCrop>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsCropModalOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCropImage}
            variant="contained"
            sx={{ bgcolor: '#F59E0B', color: '#000', fontWeight: 700, '&:hover': { bgcolor: '#D97706' } }}
          >
            Apply & Use Photo
          </Button>
        </DialogActions>
      </Dialog>

      {/* 2FA Setup Modal */}
      <Dialog open={isTwoFactorModalOpen} onClose={handleCloseTwoFactorModal} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>Setup Multi-Factor Authentication</DialogTitle>
        <DialogContent>
          {twoFactorStep === 1 && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                1. Scan this QR code with Google Authenticator or Microsoft Authenticator.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <img src={twoFactorQrCode} alt="2FA QR Code" className="rounded-xl border p-2 bg-white" style={{ maxWidth: 200 }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                Or manually enter this secret setup key:
              </Typography>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', p: 1, bgcolor: 'rgba(0,0,0,0.06)', mt: 1, borderRadius: 1 }}>
                <Typography component="p" sx={{ fontFamily: 'monospace', letterSpacing: 2, fontSize: '0.875rem' }}>
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
            <Box sx={{ py: 2 }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                2. Enter the live 6-digit code shown in your Authenticator app to confirm binding.
              </Typography>
              <TextField
                autoFocus
                margin="dense"
                label="6-Digit Verification Code"
                type="text"
                fullWidth
                variant="outlined"
                value={twoFactorVerificationCode}
                onChange={(e) => setTwoFactorVerificationCode(e.target.value)}
                inputProps={{ maxLength: 6, style: { textAlign: 'center', letterSpacing: 8, fontSize: '1.25rem', fontFamily: 'monospace' } }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseTwoFactorModal} disabled={loading}>Cancel</Button>
          {twoFactorStep === 1 && (
            <Button
              onClick={() => setTwoFactorStep(2)}
              variant="contained"
              sx={{ bgcolor: '#F59E0B', color: '#000', fontWeight: 700, '&:hover': { bgcolor: '#D97706' } }}
            >
              Next: Verify Code
            </Button>
          )}
          {twoFactorStep === 2 && (
            <Button
              onClick={handleVerifyTwoFactorAuth}
              variant="contained"
              disabled={loading || twoFactorVerificationCode.length < 6}
              sx={{ bgcolor: '#F59E0B', color: '#000', fontWeight: 700, '&:hover': { bgcolor: '#D97706' } }}
            >
              {loading ? <CircularProgress size={20} /> : 'Verify & Enable 2FA'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog open={isChangePasswordModalOpen} onClose={handleCloseChangePasswordModal} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>Change Master Administrator Password</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Current Password"
              type={showCurrentPassword ? 'text' : 'password'}
              fullWidth
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)} edge="end">
                      {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              fullWidth
              value={newPassword}
              onChange={handlePasswordChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Confirm New Password"
              type={showConfirmNewPassword ? 'text' : 'password'}
              fullWidth
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} edge="end">
                      {showConfirmNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ mt: 1, p: 2, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, mb: 1, display: 'block' }}>
                Password Strength Requirements:
              </Typography>
              <List dense sx={{ py: 0 }}>
                <PasswordRequirement valid={passwordValidation.length} text="At least 8 characters in length" />
                <PasswordRequirement valid={passwordValidation.uppercase} text="At least one uppercase letter (A-Z)" />
                <PasswordRequirement valid={passwordValidation.lowercase} text="At least one lowercase letter (a-z)" />
                <PasswordRequirement valid={passwordValidation.number} text="At least one number (0-9)" />
                <PasswordRequirement valid={passwordValidation.special} text="At least one special character (!@#$%^&*)" />
              </List>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCloseChangePasswordModal} disabled={loading}>Cancel</Button>
          <Button
            onClick={handleSaveChangesPassword}
            variant="contained"
            disabled={loading || !isNewPasswordValid || newPassword !== confirmNewPassword}
            sx={{ bgcolor: '#F59E0B', color: '#000', fontWeight: 700, '&:hover': { bgcolor: '#D97706' } }}
          >
            {loading ? <CircularProgress size={20} /> : 'Save New Password'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onClose={() => { setSelectedEvent(null); setShowRawJson(false); }} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>Security Event Record</DialogTitle>
        <DialogContent>
          {selectedEvent && (
            showRawJson ? (
              <SyntaxHighlighter language="json" style={themeMap[syntaxTheme]} customStyle={{ borderRadius: '8px', margin: 0 }}>
                {JSON.stringify(selectedEvent, null, 2)}
              </SyntaxHighlighter>
            ) : (
              <Box sx={{ py: 1 }}>
                <DetailItem label="Action" value={selectedEvent.action.replace(/_/g, ' ')} onNotify={(message, severity) => setNotification({ open: true, message, severity })} />
                <DetailItem label="Timestamp" value={new Date(selectedEvent.timestamp).toLocaleString()} onNotify={(message, severity) => setNotification({ open: true, message, severity })} />
                <DetailItem label="User ID" value={selectedEvent.userId} onNotify={(message, severity) => setNotification({ open: true, message, severity })} />
                {selectedEvent.details && (
                  <Box mt={2}>
                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>Payload & Session Metadata:</Typography>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)' }}>
                      {Object.entries(selectedEvent.details).map(([key, value]) => (
                        <DetailItem key={key} label={key} value={String(value)} onNotify={(message, severity) => setNotification({ open: true, message, severity })} />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Box sx={{ mr: 'auto' }}>
            <Button onClick={() => setShowRawJson(!showRawJson)} size="small">
              {showRawJson ? 'View Formatted' : 'View Raw JSON'}
            </Button>
            {showRawJson && <Button onClick={handleCopyRawJson} size="small" startIcon={<ContentCopyIcon />}>Copy</Button>}
          </Box>
          <Button onClick={() => { setSelectedEvent(null); setShowRawJson(false); }} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Global Notifications */}
      {notification && (
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity={notification.severity} onClose={() => setNotification(null)} sx={{ width: '100%', fontWeight: 600 }}>
            {notification.message}
          </Alert>
        </Snackbar>
      )}
    </div>
  );
};
