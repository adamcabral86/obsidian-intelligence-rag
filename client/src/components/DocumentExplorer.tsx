import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  CircularProgress, 
  Divider,
  Snackbar,
  Alert,
  LinearProgress,
  Grid,
  Chip,
  Card,
  CardContent,
  CardActions,
  Tooltip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { useThemeColors } from '../theme';
import axios from 'axios';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

interface Document {
  id: string;
  title: string;
  createdAt: string;
  source: string;
}

interface QueueItem {
  documentId: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  startTime?: number;
  endTime?: number;
}

interface QueueStatus {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  documents: QueueItem[];
}

const DocumentExplorer: React.FC = () => {
  const themeColors = useThemeColors();
  
  // State for documents
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for upload dialog
  const [uploadOpen, setUploadOpen] = useState<boolean>(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  
  // State for alerts
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');
  
  // State for queue status
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [showQueue, setShowQueue] = useState<boolean>(false);
  
  // State for document details
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  
  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
    
    // Set up polling for queue status
    const intervalId = setInterval(() => {
      fetchQueueStatus();
    }, 5000); // every 5 seconds
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Fetch documents from API
  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}/documents`);
      setDocuments(response.data.documents || []);
    } catch (err) {
      setError('Failed to fetch documents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch queue status from API
  const fetchQueueStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/documents/queue/status`);
      setQueueStatus(response.data.queue);
    } catch (err) {
      console.error('Failed to fetch queue status:', err);
    }
  };
  
  // Handle upload dialog open
  const handleUploadOpen = () => {
    setUploadOpen(true);
    setUploadFile(null);
    setUploadTitle('');
  };
  
  // Handle upload dialog close
  const handleUploadClose = () => {
    setUploadOpen(false);
  };
  
  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setUploadFile(file);
      
      // Set default title from filename
      if (!uploadTitle) {
        setUploadTitle(file.name.split('.')[0]);
      }
    }
  };
  
  // Handle title change
  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploadTitle(event.target.value);
  };
  
  // Handle document upload
  const handleUpload = async () => {
    if (!uploadFile) {
      showAlert('Please select a file to upload', 'error');
      return;
    }
    
    if (!uploadTitle.trim()) {
      showAlert('Please enter a title for the document', 'error');
      return;
    }
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('document', uploadFile);
      formData.append('title', uploadTitle);
      
      const response = await axios.post(`${API_URL}/documents/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      showAlert('Document uploaded successfully and queued for processing', 'success');
      handleUploadClose();
      
      // Fetch updated queue status
      fetchQueueStatus();
    } catch (err) {
      console.error(err);
      showAlert('Failed to upload document', 'error');
    } finally {
      setUploading(false);
    }
  };
  
  // Handle document deletion
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }
    
    try {
      await axios.delete(`${API_URL}/documents/${id}`);
      showAlert('Document deleted successfully', 'success');
      
      // Update documents list
      setDocuments(documents.filter(doc => doc.id !== id));
    } catch (err) {
      console.error(err);
      showAlert('Failed to delete document', 'error');
    }
  };
  
  // Handle document view
  const handleView = async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/documents/${id}`);
      setSelectedDocument(response.data.document);
      setDetailsOpen(true);
    } catch (err) {
      console.error(err);
      showAlert('Failed to fetch document details', 'error');
    }
  };
  
  // Handle refresh button
  const handleRefresh = () => {
    fetchDocuments();
    fetchQueueStatus();
  };
  
  // Handle clearing completed and failed queue items
  const handleClearQueue = async () => {
    try {
      await axios.post(`${API_URL}/documents/queue/clear`);
      showAlert('Queue cleared successfully', 'success');
      fetchQueueStatus();
    } catch (err) {
      console.error(err);
      showAlert('Failed to clear queue', 'error');
    }
  };
  
  // Helper to show alerts
  const showAlert = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };
  
  // Helper to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  // Get status color for queue items
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return themeColors.colors.success;
      case 'failed':
        return themeColors.colors.error;
      case 'processing':
        return themeColors.colors.primary;
      default:
        return themeColors.colors.secondary;
    }
  };
  
  // Render queue section
  const renderQueue = () => {
    if (!queueStatus) return null;
    
    return (
      <Paper
        sx={{
          p: 2,
          mt: 3,
          backgroundColor: themeColors.isDarkMode ? themeColors.colors.surfaceDark : undefined,
          border: `1px solid ${themeColors.colors.borderLight}`
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Processing Queue</Typography>
          <Button 
            size="small" 
            onClick={handleClearQueue}
            disabled={queueStatus.completed === 0 && queueStatus.failed === 0}
          >
            Clear Completed & Failed
          </Button>
        </Box>
        
        <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
          <Chip 
            label={`Pending: ${queueStatus.pending}`} 
            color="primary" 
            variant="outlined" 
            size="small" 
          />
          <Chip 
            label={`Processing: ${queueStatus.processing}`} 
            color="secondary" 
            variant="outlined" 
            size="small" 
          />
          <Chip 
            label={`Completed: ${queueStatus.completed}`} 
            color="success" 
            variant="outlined" 
            size="small" 
          />
          <Chip 
            label={`Failed: ${queueStatus.failed}`} 
            color="error" 
            variant="outlined" 
            size="small" 
          />
        </Box>
        
        {queueStatus.documents.length > 0 ? (
          <List>
            {queueStatus.documents.map(item => (
              <ListItem key={item.documentId}>
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2">{item.title}</Typography>
                    <Chip 
                      label={item.status} 
                      size="small"
                      sx={{ 
                        backgroundColor: getStatusColor(item.status),
                        color: '#fff'
                      }}
                    />
                  </Box>
                  
                  {item.status === 'processing' && (
                    <LinearProgress 
                      variant="determinate" 
                      value={item.progress} 
                      sx={{ my: 1, height: 5, borderRadius: 5 }}
                    />
                  )}
                  
                  {item.error && (
                    <Typography variant="caption" color="error">
                      Error: {item.error}
                    </Typography>
                  )}
                </Box>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2">No documents in queue</Typography>
        )}
      </Paper>
    );
  };
  
  // Render content
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Document Explorer</Typography>
        <Box>
          <Button 
            startIcon={<RefreshIcon />} 
            onClick={handleRefresh}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleUploadOpen}
          >
            Upload Document
          </Button>
        </Box>
      </Box>
      
      {/* Content */}
      <Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : documents.length === 0 ? (
          <Paper 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              backgroundColor: themeColors.isDarkMode ? themeColors.colors.surfaceDark : undefined,
              border: `1px solid ${themeColors.colors.borderLight}`
            }}
          >
            <Typography variant="h6" gutterBottom>No Documents Found</Typography>
            <Typography variant="body2" paragraph>
              Upload your first document to start using the Intelligence RAG system.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<CloudUploadIcon />}
              onClick={handleUploadOpen}
            >
              Upload Document
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {documents.map(doc => (
              <Grid item xs={12} sm={6} md={4} key={doc.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    backgroundColor: themeColors.isDarkMode ? themeColors.colors.surfaceDark : undefined,
                    border: `1px solid ${themeColors.colors.borderLight}`
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom noWrap>
                      {doc.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Source: {doc.source}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Added: {formatDate(doc.createdAt)}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Tooltip title="View Document">
                      <IconButton onClick={() => handleView(doc.id)} size="small">
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Document">
                      <IconButton onClick={() => handleDelete(doc.id)} color="error" size="small">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        
        {/* Processing Queue */}
        {renderQueue()}
      </Box>
      
      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onClose={handleUploadClose} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Supported formats: TXT, PDF, DOC, DOCX, XLS, XLSX, CSV, MD
            </Typography>
          </Box>
          <TextField
            label="Document Title"
            value={uploadTitle}
            onChange={handleTitleChange}
            fullWidth
            margin="normal"
            required
          />
          <Box sx={{ mt: 2 }}>
            <input
              accept=".txt,.pdf,.doc,.docx,.xls,.xlsx,.csv,.md"
              style={{ display: 'none' }}
              id="document-file"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="document-file">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
                fullWidth
              >
                Select File
              </Button>
            </label>
          </Box>
          {uploadFile && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">
                File: {uploadFile.name}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Size: {(uploadFile.size / 1024).toFixed(2)} KB
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUploadClose} disabled={uploading}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            color="primary" 
            disabled={uploading || !uploadFile || !uploadTitle.trim()}
          >
            {uploading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Document Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        {selectedDocument && (
          <>
            <DialogTitle>{selectedDocument.title}</DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Source: {selectedDocument.source}
                </Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  Added: {formatDate(selectedDocument.createdAt)}
                </Typography>
              </Box>
              
              {selectedDocument.metadata?.summary && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Summary</Typography>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      backgroundColor: themeColors.isDarkMode ? 
                        `${themeColors.colors.primaryDark}10` : 
                        `${themeColors.colors.primary}05` 
                    }}
                  >
                    <Typography variant="body2">{selectedDocument.metadata.summary}</Typography>
                  </Paper>
                </Box>
              )}
              
              {selectedDocument.metadata?.entities && selectedDocument.metadata.entities.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Entities</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedDocument.metadata.entities.map((entity: any, index: number) => (
                      <Chip 
                        key={index}
                        label={`${entity.name} (${entity.type})`}
                        size="small"
                        sx={{ 
                          backgroundColor: themeColors.isDarkMode ? 
                            `${themeColors.colors.secondaryDark}` : 
                            `${themeColors.colors.secondary}` 
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>Content</Typography>
              <Paper 
                elevation={1}
                sx={{ 
                  p: 2, 
                  maxHeight: '300px', 
                  overflow: 'auto',
                  backgroundColor: themeColors.isDarkMode ? themeColors.colors.surfaceDark : undefined,
                  border: `1px solid ${themeColors.colors.borderLight}`
                }}
              >
                <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedDocument.content}
                </Typography>
              </Paper>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsOpen(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Alert Snackbar */}
      <Snackbar 
        open={alertOpen} 
        autoHideDuration={6000} 
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setAlertOpen(false)} 
          severity={alertSeverity}
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentExplorer; 