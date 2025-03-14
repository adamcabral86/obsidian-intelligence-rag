import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { useThemeColors } from '../theme';

/**
 * Mock document interface
 */
interface Document {
  id: string;
  title: string;
  description: string;
  dateAdded: string;
  status: 'processed' | 'processing' | 'error';
  tags: string[];
}

/**
 * Mock documents data
 */
const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Intelligence Report: Eastern Region',
    description: 'Comprehensive analysis of activities in the Eastern Region for Q1 2023.',
    dateAdded: '2023-03-15',
    status: 'processed',
    tags: ['OSINT', 'Eastern Region', 'Q1 2023'],
  },
  {
    id: '2',
    title: 'Field Assessment: Northern Border',
    description: 'Assessment of security situation along the Northern Border.',
    dateAdded: '2023-02-28',
    status: 'processed',
    tags: ['HUMINT', 'Northern Border', 'Security'],
  },
  {
    id: '3',
    title: 'Signals Analysis: Western Communications',
    description: 'Analysis of communication patterns in the Western Region.',
    dateAdded: '2023-04-10',
    status: 'processing',
    tags: ['SIGINT', 'Western Region', 'Communications'],
  },
];

/**
 * Documents page component
 */
const Documents: React.FC = () => {
  const theme = useTheme();
  const themeColors = useThemeColors();
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [newDocument, setNewDocument] = useState({
    title: '',
    description: '',
    tags: '',
  });
  const [isUploading, setIsUploading] = useState(false);

  // Filter documents based on search term
  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle document upload
  const handleUpload = () => {
    setIsUploading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      const newDoc: Document = {
        id: (documents.length + 1).toString(),
        title: newDocument.title,
        description: newDocument.description,
        dateAdded: new Date().toISOString().split('T')[0],
        status: 'processing',
        tags: newDocument.tags.split(',').map((tag) => tag.trim()),
      };
      
      setDocuments([...documents, newDoc]);
      setNewDocument({ title: '', description: '', tags: '' });
      setIsUploading(false);
      setUploadDialogOpen(false);
      
      // Simulate processing completion
      setTimeout(() => {
        setDocuments((prevDocs) =>
          prevDocs.map((doc) =>
            doc.id === newDoc.id ? { ...doc, status: 'processed' } : doc
          )
        );
      }, 3000);
    }, 1500);
  };

  // Handle document deletion
  const handleDelete = (id: string) => {
    setDocuments(documents.filter((doc) => doc.id !== id));
  };

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Documents
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Upload, manage, and organize your intelligence reports
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setUploadDialogOpen(true)}
        >
          Upload Document
        </Button>
      </Paper>

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search documents by title, description, or tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 1,
            '&:hover': {
              bgcolor: themeColors.isDarkMode
                ? `${themeColors.colors.surfaceLight}05` // 5% opacity 
                : `${themeColors.colors.secondary}02`,   // 2% opacity
            },
          }}
        />
      </Box>

      <Grid container spacing={3}>
        {filteredDocuments.length > 0 ? (
          filteredDocuments.map((document) => (
            <Grid item xs={12} sm={6} md={4} key={document.id}>
              <Card
                elevation={2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                }}
              >
                {document.status === 'processing' && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      p: 1,
                      zIndex: 1,
                    }}
                  >
                    <CircularProgress size={24} />
                  </Box>
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {document.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {document.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Added: {document.dateAdded}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {document.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </CardContent>
                <Divider />
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<VisibilityIcon />}
                    disabled={document.status === 'processing'}
                  >
                    View
                  </Button>
                  <Box sx={{ flexGrow: 1 }} />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(document.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                textAlign: 'center',
                bgcolor: themeColors.isDarkMode ? `${themeColors.colors.surfaceLight}05` : `${themeColors.colors.secondary}02`,
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No documents found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Upload your first document to get started'}
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => !isUploading && setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Title"
              margin="normal"
              variant="outlined"
              value={newDocument.title}
              onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
              disabled={isUploading}
            />
            <TextField
              fullWidth
              label="Description"
              margin="normal"
              variant="outlined"
              multiline
              rows={3}
              value={newDocument.description}
              onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
              disabled={isUploading}
            />
            <TextField
              fullWidth
              label="Tags (comma separated)"
              margin="normal"
              variant="outlined"
              value={newDocument.tags}
              onChange={(e) => setNewDocument({ ...newDocument, tags: e.target.value })}
              disabled={isUploading}
              placeholder="e.g. OSINT, Eastern Region, Q1 2023"
            />
            <Box
              sx={{
                mt: 2,
                p: 3,
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 1,
                textAlign: 'center',
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body1" gutterBottom>
                Drag and drop your document here
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                or
              </Typography>
              <Button variant="outlined" component="label" disabled={isUploading}>
                Browse Files
                <input type="file" hidden />
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!newDocument.title || isUploading}
            startIcon={isUploading ? <CircularProgress size={20} /> : null}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Documents; 