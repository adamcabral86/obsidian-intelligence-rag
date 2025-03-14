import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import SearchInterface from '../components/SearchInterface';

/**
 * Search page component
 */
const Search: React.FC = () => {
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
          Search
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Find relevant information using natural language queries
        </Typography>
      </Paper>

      <SearchInterface />
    </Box>
  );
};

export default Search; 