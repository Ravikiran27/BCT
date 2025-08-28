import React from 'react';
import { AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, CssBaseline, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import FactoryIcon from '@mui/icons-material/Factory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import StoreIcon from '@mui/icons-material/Store';
import PersonIcon from '@mui/icons-material/Person';
import { motion } from 'framer-motion';

const drawerWidth = 220;

const navItems = [
  { text: 'Home', icon: <HomeIcon />, path: '/' },
  { text: 'Manufacturer', icon: <FactoryIcon />, path: '/manufacturer' },
  { text: 'Distributor', icon: <LocalShippingIcon />, path: '/distributor' },
  { text: 'Retailer', icon: <StoreIcon />, path: '/retailer' },
  { text: 'Consumer', icon: <PersonIcon />, path: '/consumer' },
];

export default function DashboardLayout({ children, onNavigate }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f5f6fa' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: 1201, background: 'linear-gradient(90deg, #1976d2 60%, #2196f3 100%)' }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Supply Chain Dapp
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', background: '#fff' },
        }}
      >
        <Toolbar />
        <List>
          {navItems.map((item) => (
            <ListItem button key={item.text} onClick={() => onNavigate && onNavigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 4, marginLeft: `${drawerWidth}px`, marginTop: '64px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {children}
        </motion.div>
      </Box>
    </Box>
  );
}
