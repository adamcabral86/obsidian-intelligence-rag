import React from 'react';
import { Box, Typography, Paper, Grid, Button, Card, CardContent, CardActions, Divider } from '@mui/material';
import { 
  Search as SearchIcon, 
  Description as DocumentIcon, 
  Person as EntityIcon, 
  Settings as SettingsIcon 
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useThemeColors } from '../theme';

/**
 * Home page component
 */
const Home: React.FC = () => {
  const themeColors = useThemeColors();

  // Feature cards data
  const features = [
    {
      title: 'Document Management',
      description: 'Upload, organize, and manage your documents. Supports PDF, DOCX, TXT, and more.',
      icon: <DocumentIcon fontSize="large" />,
      link: '/documents',
      buttonText: 'Manage Documents',
    },
    {
      title: 'Semantic Search',
      description: 'Ask questions about your documents using natural language and get accurate answers.',
      icon: <SearchIcon fontSize="large" />,
      link: '/search',
      buttonText: 'Search Documents',
    },
    {
      title: 'Entity Extraction',
      description: 'Automatically extract and explore entities like people, organizations, and locations.',
      icon: <EntityIcon fontSize="large" />,
      link: '/entities',
      buttonText: 'View Entities',
    },
    {
      title: 'System Settings',
      description: 'Configure embedding models, chunking parameters, and other RAG system settings.',
      icon: <SettingsIcon fontSize="large" />,
      link: '/settings',
      buttonText: 'Configure Settings',
    },
  ];

  return (
    <Box>
      {/* Hero section */}
      <Paper
        elevation={0}
        sx={{
          p: 6,
          mb: 6,
          borderRadius: 2,
          textAlign: 'center',
          background: themeColors.isDarkMode
            ? themeColors.colors.surfaceDark
            : `linear-gradient(120deg, ${themeColors.colors.secondary}10, ${themeColors.colors.primary}10)`,
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          Intelligence RAG
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
          A powerful Retrieval-Augmented Generation system for analyzing, searching, and extracting insights from your documents
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            component={RouterLink}
            to="/documents"
            variant="contained"
            size="large"
            startIcon={<DocumentIcon />}
          >
            Upload Documents
          </Button>
          <Button
            component={RouterLink}
            to="/search"
            variant="outlined"
            size="large"
            startIcon={<SearchIcon />}
          >
            Search
          </Button>
        </Box>
      </Paper>

      {/* Features section */}
      <Typography variant="h4" component="h2" gutterBottom>
        Features
      </Typography>
      <Divider sx={{ mb: 4 }} />
      
      <Grid container spacing={3}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              elevation={0} 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                border: 1,
                borderColor: 'divider',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" component="h3" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button 
                  component={RouterLink} 
                  to={feature.link} 
                  size="small" 
                  color="primary"
                >
                  {feature.buttonText}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* How it works section */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 8 }}>
        How It Works
      </Typography>
      <Divider sx={{ mb: 4 }} />
      
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              1. Document Processing
            </Typography>
            <Typography variant="body1" paragraph>
              Upload your documents to the system. They are automatically processed, chunked into smaller segments, and indexed for efficient retrieval.
            </Typography>
            
            <Typography variant="h6" gutterBottom>
              2. Semantic Embedding
            </Typography>
            <Typography variant="body1" paragraph>
              Each document chunk is converted into a vector embedding using state-of-the-art language models, capturing the semantic meaning of the text.
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              3. Intelligent Retrieval
            </Typography>
            <Typography variant="body1" paragraph>
              When you ask a question, the system finds the most relevant document chunks by comparing the semantic similarity of your query with the stored embeddings.
            </Typography>
            
            <Typography variant="h6" gutterBottom>
              4. Augmented Generation
            </Typography>
            <Typography variant="body1" paragraph>
              The retrieved document chunks are used to augment a language model, which generates accurate, contextual answers based on your specific documents.
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Home; 