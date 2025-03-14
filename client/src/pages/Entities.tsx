import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import EntityViewer from '../components/EntityViewer';

/**
 * Entities page component
 */
const Entities: React.FC = () => {
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
          Entities
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Explore named entities extracted from your documents
        </Typography>
      </Paper>

      <EntityViewer />
    </Box>
  );
};

export default Entities; 