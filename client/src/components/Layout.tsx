import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Home as HomeIcon,
  Description as DescriptionIcon,
  Search as SearchIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

// Drawer width
const drawerWidth = 240;

// Navigation items
const navItems = [
  { text: 'Home', path: '/', icon: <HomeIcon /> },
  { text: 'Documents', path: '/documents', icon: <DescriptionIcon /> },
  { text: 'Search', path: '/search', icon: <SearchIcon /> },
  { text: 'Entities', path: '/entities', icon: <PeopleIcon /> },
  { text: 'Settings', path: '/settings', icon: <SettingsIcon /> },
];

/**
 * Props for Layout component
 */
interface LayoutProps {
  children: React.ReactNode;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

/**
 * Layout component that provides a responsive layout with sidebar, header, and main content area
 */
const Layout: React.FC<LayoutProps> = ({ children, darkMode, toggleDarkMode }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for mobile drawer
  const [mobileOpen, setMobileOpen] = useState(false);

  // Handle drawer toggle
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Handle navigation
  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Drawer content
  const drawer = (
    <div>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: [1] }}>
        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            ml: 2,
            color: 'rgba(249,162,27,1)',
            fontWeight: 'bold'
          }}
        >
          Intelligence RAG
        </Typography>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: darkMode ? 'rgba(249,162,27,0.15)' : 'rgba(249,162,27,0.1)',
                  '&:hover': {
                    backgroundColor: darkMode ? 'rgba(249,162,27,0.25)' : 'rgba(249,162,27,0.2)',
                  },
                },
                '&:hover': {
                  backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                },
              }}
            >
              <ListItemIcon sx={{ 
                color: location.pathname === item.path ? 'rgba(249,162,27,1)' : undefined 
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  color: location.pathname === item.path ? 'rgba(249,162,27,1)' : undefined 
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: darkMode ? '#54595F' : undefined,
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 500,
            }}
          >
            {navItems.find((item) => item.path === location.pathname)?.text || 'Intelligence RAG'}
          </Typography>
          <IconButton color="inherit" onClick={toggleDarkMode}>
            {darkMode ? <Brightness7Icon sx={{ color: 'rgba(249,162,27,1)' }} /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="navigation"
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: darkMode ? '#1e1e1e' : undefined,
            },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: darkMode ? '#1e1e1e' : undefined,
              borderRight: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : undefined,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: darkMode ? '#121212' : undefined,
        }}
      >
        <Toolbar /> {/* Spacer for fixed AppBar */}
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 