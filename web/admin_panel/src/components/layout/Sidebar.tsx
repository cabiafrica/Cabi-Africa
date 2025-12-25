import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Divider, Box, Typography, Link } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import PolicyIcon from '@mui/icons-material/Policy';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuthContext } from '@/context/AuthContext';

const drawerWidth = 240;

export const Sidebar = () => {
  const { isAuthenticated, user, logout } = useAuthContext();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        {isAuthenticated && (
          <>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">{user?.fullName}</Typography>
              <Link component={RouterLink} to="/profile" sx={{ textDecoration: 'none' }}>
                <Typography variant="caption" color="primary" sx={{ textTransform: 'capitalize' }}>{user?.role}</Typography>
              </Link>
            </Box>
            <Divider />
            <List>
              {/* Main navigation items */}
              <ListItem key="Suspended Accounts" disablePadding component={RouterLink} to="/accounts/suspended" sx={{ color: 'inherit', textDecoration: 'none' }}>
                <ListItemButton>
                  <ListItemIcon><BlockIcon /></ListItemIcon>
                  <ListItemText primary="Suspended Accounts" />
                </ListItemButton>
              </ListItem>
              <ListItem key="Audit Log" disablePadding component={RouterLink} to="/audit-log" sx={{ color: 'inherit', textDecoration: 'none' }}>
                <ListItemButton>
                  <ListItemIcon><PolicyIcon /></ListItemIcon>
                  <ListItemText primary="Audit Log" />
                </ListItemButton>
              </ListItem>
              {/* Add other authenticated routes here */}
              <Divider sx={{ my: 1 }} />
              {/* Action items */}
              <ListItem key="Logout" disablePadding>
                <ListItemButton onClick={logout}>
                  <ListItemIcon><LogoutIcon /></ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItemButton>
              </ListItem>
            </List>
          </>
        )}
      </Box>
    </Drawer>
  );
};