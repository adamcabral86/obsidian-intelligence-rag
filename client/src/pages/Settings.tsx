import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import SettingsPanel from '../components/SettingsPanel';

interface SettingsProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

/**
 * Settings page component
 */
const Settings: React.FC<SettingsProps> = ({ darkMode, toggleDarkMode }) => {
  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure your RAG system and application preferences
        </Typography>
      </Paper>

      <SettingsPanel darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
    </Box>
  );
};

export default Settings; 