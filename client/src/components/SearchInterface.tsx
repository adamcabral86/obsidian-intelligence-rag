import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  Divider,
  CircularProgress,
  Chip,
  Alert,
  IconButton,
  Collapse,
  Card,
  CardContent,
  Grid,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ContentCopy as ContentCopyIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { useThemeColors } from '../theme';
import axios from 'axios';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Types
interface SearchResult {
  answer: string;
  sources: {
    content: string;
    documentId: string;
    documentTitle: string;
    score: number;
  }[];
  query: string;
}

interface SourceExpanded {
  [key: string]: boolean;
}

const SearchInterface: React.FC = () => {
  const themeColors = useThemeColors();
  
  // State
  const [query, setQuery] = useState<string>('');
  const [searching, setSearching] = useState<boolean>(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedSources, setExpandedSources] = useState<SourceExpanded>({});
  const [copied, setCopied] = useState<boolean>(false);
  
  // Handle query change
  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };
  
  // Handle search
  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setSearching(true);
    setResult(null);
    setError(null);
    
    try {
      // Call the RAG API
      const response = await axios.post(`${API_URL}/rag`, {
        query: query.trim(),
        maxResults: 5,
        threshold: 0.7
      });
      
      setResult(response.data);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to perform search. Please try again.');
    } finally {
      setSearching(false);
    }
  };
  
  // Handle source expansion toggle
  const toggleSource = (index: number) => {
    setExpandedSources(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  // Handle copy to clipboard
  const handleCopy = () => {
    if (!result) return;
    
    navigator.clipboard.writeText(result.answer)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
  };
  
  // Format score as percentage
  const formatScore = (score: number): string => {
    return `${Math.round(score * 100)}%`;
  };
  
  return (
    <Box>
      {/* Search Input */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          backgroundColor: themeColors.isDarkMode ? themeColors.colors.surfaceDark : undefined,
          border: `1px solid ${themeColors.colors.borderLight}`,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Ask a question about your documents
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="What would you like to know?"
            value={query}
            onChange={handleQueryChange}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            disabled={searching}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: themeColors.colors.primary,
                },
              },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={searching ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
            onClick={handleSearch}
            disabled={!query.trim() || searching}
          >
            {searching ? 'Searching...' : 'Search'}
          </Button>
        </Box>
      </Paper>
      
      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}
      
      {/* Search Results */}
      {result && (
        <Box>
          {/* Answer Card */}
          <Card 
            elevation={2} 
            sx={{ 
              mb: 4,
              backgroundColor: themeColors.isDarkMode ? themeColors.colors.surfaceDark : undefined,
              border: `1px solid ${themeColors.colors.borderLight}`,
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6" color="primary">Answer</Typography>
                <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
                  <IconButton onClick={handleCopy} size="small">
                    {copied ? <CheckIcon color="success" /> : <ContentCopyIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="body1" paragraph>
                {result.answer}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Chip 
                  label={`Based on ${result.sources.length} sources`} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>
          
          {/* Sources */}
          <Typography variant="h6" gutterBottom>
            Sources
          </Typography>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              backgroundColor: themeColors.isDarkMode ? themeColors.colors.surfaceDark : undefined,
              border: `1px solid ${themeColors.colors.borderLight}`,
              overflow: 'hidden',
            }}
          >
            <List disablePadding>
              {result.sources.map((source, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <Divider />}
                  <ListItem 
                    sx={{ 
                      display: 'block', 
                      p: 2,
                      '&:hover': {
                        backgroundColor: themeColors.isDarkMode 
                          ? `${themeColors.colors.surfaceLight}05` // 5% opacity 
                          : `${themeColors.colors.secondary}02`,   // 2% opacity
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {source.documentTitle}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={`Relevance: ${formatScore(source.score)}`} 
                          size="small" 
                          color={source.score > 0.8 ? "success" : "primary"}
                          variant="outlined"
                        />
                        <IconButton 
                          size="small" 
                          onClick={() => toggleSource(index)}
                          aria-label={expandedSources[index] ? "Collapse source" : "Expand source"}
                        >
                          {expandedSources[index] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Box>
                    </Box>
                    
                    <Collapse in={expandedSources[index]} timeout="auto" unmountOnExit>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          mt: 1,
                          backgroundColor: themeColors.isDarkMode 
                            ? `${themeColors.colors.primaryDark}10` // 10% opacity 
                            : `${themeColors.colors.primary}05`,    // 5% opacity
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                          {source.content}
                        </Typography>
                      </Paper>
                    </Collapse>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Box>
      )}
      
      {/* Empty State */}
      {!result && !searching && !error && (
        <Grid container justifyContent="center" sx={{ mt: 8 }}>
          <Grid item xs={12} sm={10} md={8} lg={6}>
            <Box sx={{ textAlign: 'center' }}>
              <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Search Your Intelligence Documents
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Ask questions in natural language to retrieve relevant information from your documents.
                Our RAG system will find the most relevant content and generate a comprehensive answer.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Example queries:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mt: 2 }}>
                <Chip 
                  label="What activities were reported in the Eastern Region?" 
                  onClick={() => setQuery("What activities were reported in the Eastern Region?")}
                  clickable
                />
                <Chip 
                  label="Summarize the security situation at the Northern Border" 
                  onClick={() => setQuery("Summarize the security situation at the Northern Border")}
                  clickable
                />
                <Chip 
                  label="What equipment was mentioned in recent reports?" 
                  onClick={() => setQuery("What equipment was mentioned in recent reports?")}
                  clickable
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default SearchInterface; 