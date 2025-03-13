import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';

/**
 * Mock search result interface
 */
interface SearchResult {
  id: string;
  documentId: string;
  documentTitle: string;
  text: string;
  score: number;
  metadata: {
    tags: string[];
    date: string;
    source: string;
  };
}

/**
 * Search page component
 */
const Search: React.FC = () => {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);

  // Handle search
  const handleSearch = () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setSearchResults(null);
    setAnswer(null);

    // Simulate search delay
    setTimeout(() => {
      // Mock search results
      const results: SearchResult[] = [
        {
          id: '1',
          documentId: '1',
          documentTitle: 'Intelligence Report: Eastern Region',
          text: 'Surveillance operations in the Eastern Region have identified increased activity near the border checkpoint. Multiple vehicles with diplomatic plates were observed entering the restricted zone on March 10, 2023.',
          score: 0.92,
          metadata: {
            tags: ['OSINT', 'Eastern Region', 'Surveillance'],
            date: '2023-03-15',
            source: 'Field Report',
          },
        },
        {
          id: '2',
          documentId: '2',
          documentTitle: 'Field Assessment: Northern Border',
          text: 'The security situation along the Northern Border remains tense. Local informants report unusual movement of unmarked vehicles near checkpoint Alpha-3. This activity coincides with diplomatic meetings scheduled for next week.',
          score: 0.85,
          metadata: {
            tags: ['HUMINT', 'Northern Border', 'Security'],
            date: '2023-02-28',
            source: 'Agent Report',
          },
        },
        {
          id: '3',
          documentId: '3',
          documentTitle: 'Signals Analysis: Western Communications',
          text: 'Analysis of intercepted communications in the Western Region shows a 40% increase in encrypted transmissions. The pattern suggests coordination between multiple groups, possibly related to the upcoming diplomatic summit.',
          score: 0.78,
          metadata: {
            tags: ['SIGINT', 'Western Region', 'Communications'],
            date: '2023-04-10',
            source: 'Signals Report',
          },
        },
      ];

      // Mock RAG answer
      const mockAnswer = `Based on the analyzed documents, there appears to be increased activity across multiple regions that may be connected to upcoming diplomatic events. 

Specifically:
1. Surveillance in the Eastern Region detected vehicles with diplomatic plates entering a restricted zone on March 10, 2023.
2. Unusual movement of unmarked vehicles near checkpoint Alpha-3 on the Northern Border coincides with scheduled diplomatic meetings.
3. There's a 40% increase in encrypted communications in the Western Region, potentially related to a diplomatic summit.

These activities suggest coordinated preparations for diplomatic engagements across different regions, with possible security implications that warrant continued monitoring.`;

      setSearchResults(results);
      setAnswer(mockAnswer);
      setIsSearching(false);
    }, 2000);
  };

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
          Semantic Search
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Ask questions about your documents using natural language
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="What diplomatic activities have been observed across different regions?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            disabled={isSearching}
          />
          <Button
            variant="contained"
            startIcon={isSearching ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
            onClick={handleSearch}
            disabled={!query.trim() || isSearching}
          >
            Search
          </Button>
        </Box>
      </Paper>

      {isSearching && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {answer && !isSearching && (
        <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom>
            Answer
          </Typography>
          <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-line' }}>
            {answer}
          </Typography>
        </Paper>
      )}

      {searchResults && !isSearching && (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom>
            Source Documents
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {searchResults.length} relevant passages found
          </Typography>

          <List>
            {searchResults.map((result, index) => (
              <React.Fragment key={result.id}>
                {index > 0 && <Divider component="li" />}
                <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                  <Accordion
                    elevation={0}
                    sx={{
                      width: '100%',
                      bgcolor: 'transparent',
                      '&:before': {
                        display: 'none',
                      },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{
                        px: 2,
                        borderRadius: 1,
                        '&:hover': {
                          bgcolor:
                            theme.palette.mode === 'dark'
                              ? 'rgba(255,255,255,0.05)'
                              : 'rgba(0,0,0,0.02)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <DescriptionIcon
                          sx={{ mr: 2, color: 'primary.main' }}
                          fontSize="small"
                        />
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" component="div">
                              {result.documentTitle}
                              <Chip
                                label={`${Math.round(result.score * 100)}% match`}
                                size="small"
                                color="primary"
                                sx={{ ml: 1 }}
                              />
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {result.text}
                            </Typography>
                          }
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 2 }}>
                      <Typography variant="body1" paragraph>
                        {result.text}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                        {result.metadata.tags.map((tag) => (
                          <Chip key={tag} label={tag} size="small" variant="outlined" />
                        ))}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Source: {result.metadata.source} | Date: {result.metadata.date}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {!isSearching && !searchResults && (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: 'center',
            bgcolor:
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
          }}
        >
          <SearchIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Enter a query to search your documents
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try asking specific questions like "What diplomatic activities have been observed?" or
            "Summarize the security situation at the Northern Border"
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default Search; 