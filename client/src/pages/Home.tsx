import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, CardActionArea, useTheme } from '@mui/material';
import { Description, Search, People, Settings } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

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
            backgroundColor: 'rgba(249,162,27,0.8)',
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
                bgcolor: 'rgba(249,162,27,1)',
                color: '#fff',
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

  return (
    <Box>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          mb: 4, 
          borderRadius: 2,
          background: 'linear-gradient(45deg, #54595F 30%, #6c757d 90%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '30%',
            height: '100%',
            background: 'linear-gradient(45deg, transparent, rgba(249,162,27,0.3))',
            zIndex: 1,
          }
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
        borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
      }}>
        <Typography variant="h5" gutterBottom sx={{ color: 'rgba(249,162,27,1)' }}>
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