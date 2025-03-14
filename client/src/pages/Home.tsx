import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, CardActionArea, useTheme } from '@mui/material';
import { Description, Search, People, Settings } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useThemeColors } from '../theme';

/**
 * Feature card props
 */
interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
}

/**
 * Feature card component
 */
const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, path }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const themeColors = useThemeColors();

  return (
    <Card 
      elevation={3} 
      sx={{ 
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: theme.shadows[6],
          '& .card-icon': {
            backgroundColor: themeColors.colors.primaryLight,
          }
        },
        borderRadius: 2,
      }}
    >
      <CardActionArea 
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
        onClick={() => navigate(path)}
      >
        <CardContent sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box 
              className="card-icon"
              sx={{ 
                mr: 2, 
                display: 'flex', 
                p: 1, 
                borderRadius: '50%', 
                bgcolor: themeColors.colors.primary,
                color: themeColors.colors.surfaceLight,
                transition: 'background-color 0.2s',
              }}
            >
              {icon}
            </Box>
            <Typography variant="h5" component="h2">
              {title}
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

/**
 * Home page component
 */
const Home: React.FC = () => {
  const theme = useTheme();
  const themeColors = useThemeColors();

  return (
    <Box>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          mb: 4, 
          borderRadius: 2,
          backgroundColor: themeColors.isDarkMode ? themeColors.colors.surfaceDark : themeColors.colors.secondary,
          color: themeColors.colors.textPrimaryDark,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Intelligence RAG Application
          </Typography>
          <Typography variant="h6" sx={{ maxWidth: '800px' }}>
            A powerful tool for intelligence personnel to analyze, search, and discover connections in documents using Retrieval-Augmented Generation.
          </Typography>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <FeatureCard
            title="Documents"
            description="Upload, manage, and organize intelligence reports"
            icon={<Description />}
            path="/documents"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FeatureCard
            title="Search"
            description="Find relevant information using natural language queries"
            icon={<Search />}
            path="/search"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FeatureCard
            title="Entities"
            description="Browse documents by extracted entities and relationships"
            icon={<People />}
            path="/entities"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FeatureCard
            title="Settings"
            description="Configure application settings and AI models"
            icon={<Settings />}
            path="/settings"
          />
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ 
        p: 3, 
        mt: 4, 
        borderRadius: 2,
        border: '1px solid',
        borderColor: themeColors.isDarkMode ? themeColors.colors.borderDark : themeColors.colors.borderLight,
      }}>
        <Typography variant="h5" gutterBottom sx={{ color: themeColors.colors.primary }}>
          Getting Started
        </Typography>
        <Typography variant="body1" paragraph>
          1. Upload your intelligence documents in the <strong>Documents</strong> section.
        </Typography>
        <Typography variant="body1" paragraph>
          2. The system will automatically analyze the documents, extract entities, and generate embeddings.
        </Typography>
        <Typography variant="body1" paragraph>
          3. Use the <strong>Search</strong> feature to find information across all your documents.
        </Typography>
        <Typography variant="body1">
          4. Explore extracted <strong>Entities</strong> to discover connections between documents.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Home; 