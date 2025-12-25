import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { fetchSuspendedAccounts, reactivateAccount } from './api/accountService';
import { SuspendedAccount } from './api/types';

export const SuspendedAccountsPage = () => {
  const [accounts, setAccounts] = useState<SuspendedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'error' } | null>(null);
  const [accountToReactivate, setAccountToReactivate] = useState<SuspendedAccount | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const data = await fetchSuspendedAccounts();
      setAccounts(data);
    } catch (error) {
      setNotification({ open: true, message: 'Failed to fetch suspended accounts.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleReactivationConfirm = async () => {
    if (!accountToReactivate) return;

    try {
      // Note from previous step is missing, re-adding it.
      // await reactivateAccount(accountToReactivate.userId, reactivationNote);
      await reactivateAccount(accountToReactivate.userId);
      setNotification({ open: true, message: `Account for ${accountToReactivate.fullName} reactivated successfully.`, severity: 'success' });
      handleCloseDialog();
      loadAccounts(); // Refresh the list
    } catch (error) {
      setNotification({ open: true, message: 'Failed to reactivate account.', severity: 'error' });
    }
  };

  const handleCloseDialog = () => {
    setAccountToReactivate(null);
    setActiveTab(0); // Reset tab on close
  };
  const handleCloseNotification = () => setNotification(null);

  const handleDownloadCsv = () => {
    if (!accountToReactivate?.history) return;

    const history = accountToReactivate.history;
    const headers = ['Date', 'Action', 'Note'];

    const escapeCsvField = (field: string) => {
      if (field.includes(',') || field.includes('"') || field.includes('\n')) {
        return `"${field.replace(/"/g, '""')}"`;
      }
      return field;
    };

    const csvRows = [
      headers.join(','),
      ...history.map(row => [
        escapeCsvField(new Date(row.date).toLocaleString()),
        escapeCsvField(row.action),
        escapeCsvField(row.note),
      ].join(','))
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `history-${accountToReactivate.userId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Suspended Account Management</Typography>
      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Full Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Account Type</TableCell>
                <TableCell>Suspension Reason</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.userId}>
                  <TableCell>{account.fullName}</TableCell>
                  <TableCell>{account.email}</TableCell>
                  <TableCell><Chip label={account.accountType} size="small" /></TableCell>
                  <TableCell>{account.suspensionReason}</TableCell>
                  <TableCell align="right">
                    <Button variant="contained" color="primary" onClick={() => setAccountToReactivate(account)}>Reactivate</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={!!accountToReactivate} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Review Account: {accountToReactivate?.fullName}</DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label="Review & Reactivate" />
              <Tab label="Account History" />
            </Tabs>
          </Box>
          {accountToReactivate && activeTab === 0 && (
            <Box sx={{ pt: 3 }}>
              <Typography variant="h6">{accountToReactivate.fullName}</Typography>
              <Typography color="text.secondary" gutterBottom>{accountToReactivate.email}</Typography>
              <Chip label={accountToReactivate.accountType} size="small" sx={{ my: 1 }} />
              <Typography variant="body1" sx={{ mt: 2 }}><strong>Current Suspension Reason:</strong></Typography>
              <Typography variant="body2" sx={{ p: 1, border: '1px solid #eee', borderRadius: 1, mt: 1 }}>{accountToReactivate.suspensionReason}</Typography>
              <DialogContentText sx={{ mt: 3 }}>
                Clicking "Reactivate" will restore account access for this user.
              </DialogContentText>
            </Box>
          )}
          {accountToReactivate && activeTab === 1 && (
            <Box sx={{ pt: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Account Event Log</Typography>
                <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownloadCsv} disabled={!accountToReactivate.history || accountToReactivate.history.length === 0}>
                  Download as CSV
                </Button>
              </Box>
              <List>
                {accountToReactivate.history && accountToReactivate.history.length > 0 ? (
                  accountToReactivate.history.map((item, index) => (
                    <ListItem key={index} divider>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body1" component="span" color={item.action === 'SUSPENDED' ? 'error' : 'success.main'}>{item.action}</Typography>
                            <Typography variant="body2" color="text.secondary">{new Date(item.date).toLocaleString()}</Typography>
                          </Box>
                        }
                        secondaryTypographyProps={{ component: 'p', sx: { mt: 1 } }}
                        secondary={`Note: ${item.note}`}
                      />
                    </ListItem>
                  ))
                ) : <Typography>No history found for this account.</Typography>}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleReactivationConfirm} color="primary" autoFocus>
            Reactivate
          </Button>
        </DialogActions>
      </Dialog>

      {notification && (
        <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification}>
          <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>{notification.message}</Alert>
        </Snackbar>
      )}
    </Box>
  );
};