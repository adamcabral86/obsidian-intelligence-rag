import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import DocumentUploader from '../components/DocumentUploader';

/**
 * Documents page component
 */
const Documents: React.FC = () => {
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
          Documents
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Upload and manage your documents for analysis and search
        </Typography>
      </Paper>

      <DocumentUploader />
    </Box>
  );
};

export default Documents; 