import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  FormControlLabel,
  Switch,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  InputAdornment,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Brightness4 as DarkModeIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useThemeColors } from '../theme';

interface SettingsProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

/**
 * API key interface
 */
interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string | null;
}

/**
 * Mock API keys
 */
const mockApiKeys: ApiKey[] = [
  {
    id: '1',
    name: 'Development',
    key: 'sk-dev-xxxxxxxxxxxxxxxxxxxx',
    createdAt: '2023-05-15T10:30:00Z',
    lastUsed: '2023-06-01T14:22:10Z',
  },
  {
    id: '2',
    name: 'Production',
    key: 'sk-prod-xxxxxxxxxxxxxxxxxxxx',
    createdAt: '2023-05-20T09:15:00Z',
    lastUsed: null,
  },
];

/**
 * Settings page component
 */
const Settings: React.FC<SettingsProps> = ({ darkMode, toggleDarkMode }) => {
  const theme = useTheme();
  const themeColors = useThemeColors();
  
  // State for API settings
  const [apiEndpoint, setApiEndpoint] = useState('https://api.openai.com/v1');
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(mockApiKeys);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  
  // State for model settings
  const [embeddingModel, setEmbeddingModel] = useState('text-embedding-3-small');
  const [completionModel, setCompletionModel] = useState('gpt-4o');
  const [maxTokens, setMaxTokens] = useState('8192');
  const [temperature, setTemperature] = useState('0.7');
  
  // State for document settings
  const [chunkSize, setChunkSize] = useState('1000');
  const [chunkOverlap, setChunkOverlap] = useState('200');
  
  // State for UI
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<ApiKey | null>(null);

  // Handle saving settings
  const handleSaveSettings = () => {
    // In a real app, this would save to backend
    console.log('Saving settings...');
    console.log({
      apiEndpoint,
      embeddingModel,
      completionModel,
      maxTokens,
      temperature,
      chunkSize,
      chunkOverlap,
    });
    
    // Show success message
    setSaveSuccess(true);
  };

  // Handle adding a new API key
  const handleAddApiKey = () => {
    if (newKeyName && newKeyValue) {
      const newKey: ApiKey = {
        id: Date.now().toString(),
        name: newKeyName,
        key: newKeyValue,
        createdAt: new Date().toISOString(),
        lastUsed: null,
      };
      
      setApiKeys([...apiKeys, newKey]);
      setNewKeyName('');
      setNewKeyValue('');
      setShowNewKeyForm(false);
    }
  };

  // Handle deleting an API key
  const handleDeleteKey = (key: ApiKey) => {
    setKeyToDelete(key);
    setDeleteDialogOpen(true);
  };

  // Confirm deletion of API key
  const confirmDeleteKey = () => {
    if (keyToDelete) {
      setApiKeys(apiKeys.filter(key => key.id !== keyToDelete.id));
      setDeleteDialogOpen(false);
      setKeyToDelete(null);
    }
  };

  // Format date string
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
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
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Configure your application settings
        </Typography>

        <Grid container spacing={4}>
          {/* Appearance Settings */}
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ border: 1, borderColor: 'divider', height: '100%' }}>
              <CardHeader title="Appearance" />
              <Divider />
              <CardContent>
                <FormControlLabel
                  control={
                    <Switch
                      checked={darkMode}
                      onChange={toggleDarkMode}
                      color="primary"
                      icon={<DarkModeIcon />}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: themeColors.colors.primary,
                          '&:hover': {
                            backgroundColor: `${themeColors.colors.primary}08`, // 8% opacity
                          },
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: `${themeColors.colors.primary}50`, // 50% opacity
                        },
                      }}
                    />
                  }
                  label="Dark Mode"
                />
              </CardContent>
            </Card>
          </Grid>

          {/* API Settings */}
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ border: 1, borderColor: 'divider', height: '100%' }}>
              <CardHeader title="API Configuration" />
              <Divider />
              <CardContent>
                <TextField
                  fullWidth
                  label="API Endpoint"
                  variant="outlined"
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  margin="normal"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: themeColors.colors.primary,
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: themeColors.colors.primary,
                    },
                  }}
                />

                <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                  API Keys
                </Typography>

                <List>
                  {apiKeys.map((key) => (
                    <ListItem key={key.id} divider>
                      <ListItemText
                        primary={key.name}
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              {key.key.substring(0, 8)}...
                            </Typography>
                            <br />
                            <Typography variant="caption" component="span">
                              Created: {formatDate(key.createdAt)}
                              <br />
                              Last used: {formatDate(key.lastUsed)}
                            </Typography>
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteKey(key)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>

                {showNewKeyForm ? (
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Key Name"
                      variant="outlined"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      margin="dense"
                    />
                    <TextField
                      fullWidth
                      label="API Key"
                      variant="outlined"
                      value={newKeyValue}
                      onChange={(e) => setNewKeyValue(e.target.value)}
                      margin="dense"
                      type="password"
                    />
                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAddApiKey}
                        disabled={!newKeyName || !newKeyValue}
                        sx={{
                          backgroundColor: themeColors.colors.primary,
                          '&:hover': {
                            backgroundColor: themeColors.colors.primaryLight,
                          },
                        }}
                      >
                        Add Key
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setShowNewKeyForm(false);
                          setNewKeyName('');
                          setNewKeyValue('');
                        }}
                        sx={{
                          borderColor: themeColors.colors.secondary,
                          color: themeColors.colors.secondary,
                          '&:hover': {
                            borderColor: themeColors.colors.secondaryLight,
                          },
                        }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => setShowNewKeyForm(true)}
                    sx={{ mt: 2 }}
                  >
                    Add API Key
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Model Settings */}
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ border: 1, borderColor: 'divider', height: '100%' }}>
              <CardHeader title="Model Settings" />
              <Divider />
              <CardContent>
                <TextField
                  fullWidth
                  label="Embedding Model"
                  variant="outlined"
                  value={embeddingModel}
                  onChange={(e) => setEmbeddingModel(e.target.value)}
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Model used for creating vector embeddings of documents">
                          <InfoIcon fontSize="small" color="action" />
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: themeColors.colors.primary,
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: themeColors.colors.primary,
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Completion Model"
                  variant="outlined"
                  value={completionModel}
                  onChange={(e) => setCompletionModel(e.target.value)}
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Model used for generating responses to queries">
                          <InfoIcon fontSize="small" color="action" />
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="Max Tokens"
                  variant="outlined"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(e.target.value)}
                  margin="normal"
                  type="number"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Maximum number of tokens to generate in completions">
                          <InfoIcon fontSize="small" color="action" />
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="Temperature"
                  variant="outlined"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  margin="normal"
                  type="number"
                  inputProps={{ step: 0.1, min: 0, max: 2 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Controls randomness: 0 is deterministic, higher values are more random">
                          <InfoIcon fontSize="small" color="action" />
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Document Processing Settings */}
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ border: 1, borderColor: 'divider', height: '100%' }}>
              <CardHeader title="Document Processing" />
              <Divider />
              <CardContent>
                <TextField
                  fullWidth
                  label="Chunk Size"
                  variant="outlined"
                  value={chunkSize}
                  onChange={(e) => setChunkSize(e.target.value)}
                  margin="normal"
                  type="number"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Number of characters per document chunk">
                          <InfoIcon fontSize="small" color="action" />
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="Chunk Overlap"
                  variant="outlined"
                  value={chunkOverlap}
                  onChange={(e) => setChunkOverlap(e.target.value)}
                  margin="normal"
                  type="number"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Number of characters to overlap between chunks">
                          <InfoIcon fontSize="small" color="action" />
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSaveSettings}
            size="large"
            sx={{
              backgroundColor: themeColors.colors.primary,
              '&:hover': {
                backgroundColor: themeColors.colors.primaryLight,
              },
              fontWeight: 'bold',
              px: 4,
            }}
          >
            Save Settings
          </Button>
        </Box>
      </Paper>

      {/* Success Snackbar */}
      <Snackbar
        open={saveSuccess}
        autoHideDuration={6000}
        onClose={() => setSaveSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSaveSuccess(false)} severity="success">
          Settings saved successfully!
        </Alert>
      </Snackbar>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete API Key</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the API key "{keyToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDeleteKey} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings; 