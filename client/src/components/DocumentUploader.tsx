import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  Tooltip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Description as FileIcon,
  Delete as DeleteIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useThemeColors } from '../theme';

// API URL from environment or default
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// File types allowed for upload
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
  'text/markdown',
  'text/csv',
];

// File extensions for display
const FILE_EXTENSIONS: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/msword': 'DOC',
  'text/plain': 'TXT',
  'text/markdown': 'MD',
  'text/csv': 'CSV',
};

// Document interface
interface Document {
  id: string;
  filename: string;
  filesize: number;
  uploadDate: string;
  status: 'pending' | 'processing' | 'indexed' | 'failed';
  type: string;
  metadata?: {
    pageCount?: number;
    wordCount?: number;
    category?: string;
    tags?: string[];
  };
}

// Upload status interface
interface UploadStatus {
  file: File;
  progress: number;
  status: 'uploading' | 'processing' | 'success' | 'error';
  message?: string;
  documentId?: string;
}

const DocumentUploader: React.FC = () => {
  const themeColors = useThemeColors();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploads, setUploads] = useState<UploadStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  // Fetch documents on component mount
  React.useEffect(() => {
    fetchDocuments();
  }, []);

  // Fetch documents from API
  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    setRefreshing(true);
    
    try {
      const response = await axios.get(`${API_URL}/documents`);
      setDocuments(response.data);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle file selection
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Create array from FileList
    const fileArray = Array.from(files);
    
    // Filter out unsupported file types
    const supportedFiles = fileArray.filter(file => ALLOWED_FILE_TYPES.includes(file.type));
    const unsupportedFiles = fileArray.filter(file => !ALLOWED_FILE_TYPES.includes(file.type));
    
    if (unsupportedFiles.length > 0) {
      setError(`Unsupported file type(s): ${unsupportedFiles.map(f => f.name).join(', ')}`);
    }
    
    // Add files to upload queue
    const newUploads = supportedFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const,
    }));
    
    setUploads(prev => [...prev, ...newUploads]);
    
    // Start uploading each file
    supportedFiles.forEach((file, index) => {
      uploadFile(file, newUploads.length - supportedFiles.length + index);
    });
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Upload file to server
  const uploadFile = async (file: File, uploadIndex: number) => {
    const formData = new FormData();
    formData.append('document', file);
    
    try {
      const response = await axios.post(`${API_URL}/documents/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploads(prev => 
              prev.map((upload, idx) => 
                idx === uploadIndex ? { ...upload, progress } : upload
              )
            );
          }
        },
      });
      
      // Update upload status to success
      setUploads(prev => 
        prev.map((upload, idx) => 
          idx === uploadIndex 
            ? { 
                ...upload, 
                status: 'success', 
                message: 'Upload complete. Document is being processed.',
                documentId: response.data.id,
              } 
            : upload
        )
      );
      
      // Refresh document list
      fetchDocuments();
      
    } catch (err: any) {
      console.error('Error uploading file:', err);
      
      // Update upload status to error
      setUploads(prev => 
        prev.map((upload, idx) => 
          idx === uploadIndex 
            ? { 
                ...upload, 
                status: 'error', 
                message: err.response?.data?.message || 'Upload failed. Please try again.',
              } 
            : upload
        )
      );
    }
  };

  // Trigger file input click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Remove upload from list
  const removeUpload = (index: number) => {
    setUploads(prev => prev.filter((_, idx) => idx !== index));
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (documentId: string) => {
    setDocumentToDelete(documentId);
    setDeleteDialogOpen(true);
  };

  // Close delete confirmation dialog
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDocumentToDelete(null);
  };

  // Delete document
  const deleteDocument = async () => {
    if (!documentToDelete) return;
    
    try {
      await axios.delete(`${API_URL}/documents/${documentToDelete}`);
      setDocuments(prev => prev.filter(doc => doc.id !== documentToDelete));
      closeDeleteDialog();
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Failed to delete document. Please try again.');
      closeDeleteDialog();
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Get status chip color
  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'indexed': return 'success';
      case 'processing': return 'warning';
      case 'pending': return 'info';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileSelect}
        multiple
        accept={ALLOWED_FILE_TYPES.join(',')}
      />

      {/* Upload button and info */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          border: '2px dashed',
          borderColor: themeColors.colors.borderLight,
          bgcolor: 'transparent',
          textAlign: 'center',
        }}
      >
        <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Upload Documents
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Supported formats: PDF, DOCX, DOC, TXT, MD, CSV
        </Typography>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={handleUploadClick}
          sx={{ mt: 1 }}
        >
          Select Files
        </Button>
      </Paper>

      {/* Error message */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Current uploads */}
      {uploads.length > 0 && (
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Uploads
          </Typography>
          <List>
            {uploads.map((upload, index) => (
              <ListItem
                key={`${upload.file.name}-${index}`}
                secondaryAction={
                  <IconButton 
                    edge="end" 
                    aria-label="remove" 
                    onClick={() => removeUpload(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemIcon>
                  {upload.status === 'uploading' ? (
                    <CircularProgress size={24} />
                  ) : upload.status === 'success' ? (
                    <SuccessIcon color="success" />
                  ) : (
                    <ErrorIcon color="error" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={upload.file.name}
                  secondary={
                    <>
                      {upload.status === 'uploading' ? (
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={upload.progress} 
                            sx={{ mt: 1, mb: 1 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {upload.progress}% • {formatFileSize(upload.file.size)}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          {upload.message || ''} • {formatFileSize(upload.file.size)}
                        </Typography>
                      )}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Document list */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Your Documents
          </Typography>
          <Tooltip title="Refresh document list">
            <IconButton onClick={fetchDocuments} disabled={refreshing}>
              {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
        </Box>

        {loading && documents.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : documents.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No documents uploaded yet
            </Typography>
          </Box>
        ) : (
          <List>
            {documents.map((document) => (
              <ListItem
                key={document.id}
                secondaryAction={
                  <IconButton 
                    edge="end" 
                    aria-label="delete" 
                    onClick={() => openDeleteDialog(document.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': {
                    bgcolor: themeColors.isDarkMode
                      ? `${themeColors.colors.surfaceLight}05` // 5% opacity
                      : `${themeColors.colors.secondary}05`,   // 5% opacity
                  },
                }}
              >
                <ListItemIcon>
                  <FileIcon />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="body1" component="span">
                        {document.filename}
                      </Typography>
                      <Chip 
                        label={FILE_EXTENSIONS[document.type] || document.type} 
                        size="small" 
                        variant="outlined"
                      />
                      <Chip 
                        label={document.status} 
                        size="small" 
                        color={getStatusColor(document.status)}
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        {formatFileSize(document.filesize)} • Uploaded on {formatDate(document.uploadDate)}
                      </Typography>
                      {document.metadata && document.metadata.tags && document.metadata.tags.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {document.metadata.tags.map((tag, idx) => (
                            <Chip 
                              key={idx} 
                              label={tag} 
                              size="small" 
                              variant="outlined" 
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
      >
        <DialogTitle>Delete Document</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this document? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button onClick={deleteDocument} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentUploader; 