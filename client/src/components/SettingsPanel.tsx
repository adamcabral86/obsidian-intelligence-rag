import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Slider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Switch,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  InputLabel,
  Grid,
  Tooltip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  HelpOutline as HelpIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useThemeColors } from '../theme';

// API URL from environment or default
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Settings interface
interface Settings {
  embedding: {
    model: string;
    dimensions: number;
    batchSize: number;
  };
  chunking: {
    chunkSize: number;
    chunkOverlap: number;
    useStructuredChunking: boolean;
  };
  indexing: {
    maxConcurrentJobs: number;
    autoAnalyzeDocuments: boolean;
  };
  rag: {
    model: string;
    temperature: number;
    maxTokens: number;
    topK: number;
    similarityThreshold: number;
    includeSourceText: boolean;
  };
  ui: {
    darkMode: boolean;
  };
}

// Default settings
const defaultSettings: Settings = {
  embedding: {
    model: 'ollama/nomic-embed-text',
    dimensions: 768,
    batchSize: 32,
  },
  chunking: {
    chunkSize: 1000,
    chunkOverlap: 200,
    useStructuredChunking: true,
  },
  indexing: {
    maxConcurrentJobs: 2,
    autoAnalyzeDocuments: true,
  },
  rag: {
    model: 'ollama/llama3',
    temperature: 0.7,
    maxTokens: 1024,
    topK: 5,
    similarityThreshold: 0.75,
    includeSourceText: true,
  },
  ui: {
    darkMode: false,
  },
};

// Available models
const embeddingModels = [
  { value: 'ollama/nomic-embed-text', label: 'Nomic Embed Text' },
  { value: 'ollama/mxbai-embed-large', label: 'MxbAI Embed Large' },
  { value: 'ollama/all-minilm', label: 'All-MiniLM' },
];

const ragModels = [
  { value: 'ollama/llama3', label: 'Llama 3' },
  { value: 'ollama/mistral', label: 'Mistral' },
  { value: 'ollama/phi3', label: 'Phi-3' },
  { value: 'ollama/gemma', label: 'Gemma' },
];

interface SettingsPanelProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ darkMode, toggleDarkMode }) => {
  const themeColors = useThemeColors();
  const [settings, setSettings] = useState<Settings>({ ...defaultSettings, ui: { darkMode } });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | false>('embedding');

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  // Update UI settings when darkMode prop changes
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      ui: {
        ...prev.ui,
        darkMode,
      },
    }));
  }, [darkMode]);

  // Fetch settings from API
  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}/settings`);
      // Merge with default settings to ensure all fields exist
      setSettings({
        ...defaultSettings,
        ...response.data,
        ui: {
          ...defaultSettings.ui,
          ...response.data.ui,
          darkMode, // Always use the current darkMode state
        },
      });
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings. Using defaults.');
      // Keep using default settings
    } finally {
      setLoading(false);
    }
  };

  // Save settings to API
  const saveSettings = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      await axios.post(`${API_URL}/settings`, settings);
      setSuccess('Settings saved successfully.');
      
      // Update dark mode if it changed
      if (settings.ui.darkMode !== darkMode) {
        toggleDarkMode();
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle settings change
  const handleSettingChange = (section: keyof Settings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  // Handle accordion expansion
  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Format slider value
  const formatSliderValue = (value: number, min: number, max: number, step: number) => {
    const precision = step < 1 ? Math.ceil(Math.abs(Math.log10(step))) : 0;
    return value.toFixed(precision);
  };

  return (
    <Box>
      {/* Loading indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

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

      {/* Success message */}
      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      {!loading && (
        <Box>
          {/* Embedding settings */}
          <Accordion 
            expanded={expanded === 'embedding'} 
            onChange={handleAccordionChange('embedding')}
            elevation={0}
            sx={{ 
              mb: 2,
              border: 1,
              borderColor: 'divider',
              '&:before': {
                display: 'none',
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="embedding-settings-content"
              id="embedding-settings-header"
            >
              <Typography variant="h6">Embedding Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel id="embedding-model-label">Embedding Model</InputLabel>
                    <Select
                      labelId="embedding-model-label"
                      id="embedding-model"
                      value={settings.embedding.model}
                      label="Embedding Model"
                      onChange={(e) => handleSettingChange('embedding', 'model', e.target.value)}
                    >
                      {embeddingModels.map((model) => (
                        <MenuItem key={model.value} value={model.value}>
                          {model.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Dimensions"
                    type="number"
                    value={settings.embedding.dimensions}
                    onChange={(e) => handleSettingChange('embedding', 'dimensions', parseInt(e.target.value))}
                    InputProps={{
                      endAdornment: (
                        <Tooltip title="Number of dimensions in the embedding vector">
                          <IconButton size="small" edge="end">
                            <HelpIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ),
                    }}
                    sx={{ mb: 3 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Batch Size"
                    type="number"
                    value={settings.embedding.batchSize}
                    onChange={(e) => handleSettingChange('embedding', 'batchSize', parseInt(e.target.value))}
                    InputProps={{
                      endAdornment: (
                        <Tooltip title="Number of chunks to process in a single batch">
                          <IconButton size="small" edge="end">
                            <HelpIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Chunking settings */}
          <Accordion 
            expanded={expanded === 'chunking'} 
            onChange={handleAccordionChange('chunking')}
            elevation={0}
            sx={{ 
              mb: 2,
              border: 1,
              borderColor: 'divider',
              '&:before': {
                display: 'none',
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="chunking-settings-content"
              id="chunking-settings-header"
            >
              <Typography variant="h6">Chunking Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography gutterBottom>
                    Chunk Size: {settings.chunking.chunkSize} characters
                  </Typography>
                  <Slider
                    value={settings.chunking.chunkSize}
                    min={100}
                    max={2000}
                    step={100}
                    onChange={(_, value) => handleSettingChange('chunking', 'chunkSize', value as number)}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value} chars`}
                    sx={{ mb: 3 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography gutterBottom>
                    Chunk Overlap: {settings.chunking.chunkOverlap} characters
                  </Typography>
                  <Slider
                    value={settings.chunking.chunkOverlap}
                    min={0}
                    max={500}
                    step={50}
                    onChange={(_, value) => handleSettingChange('chunking', 'chunkOverlap', value as number)}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value} chars`}
                    sx={{ mb: 3 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.chunking.useStructuredChunking}
                          onChange={(e) => handleSettingChange('chunking', 'useStructuredChunking', e.target.checked)}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography>Use structured chunking</Typography>
                          <Tooltip title="Split documents based on structure (headings, paragraphs) rather than fixed size">
                            <IconButton size="small">
                              <HelpIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      }
                    />
                  </FormGroup>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Indexing settings */}
          <Accordion 
            expanded={expanded === 'indexing'} 
            onChange={handleAccordionChange('indexing')}
            elevation={0}
            sx={{ 
              mb: 2,
              border: 1,
              borderColor: 'divider',
              '&:before': {
                display: 'none',
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="indexing-settings-content"
              id="indexing-settings-header"
            >
              <Typography variant="h6">Indexing Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Max Concurrent Jobs"
                    type="number"
                    value={settings.indexing.maxConcurrentJobs}
                    onChange={(e) => handleSettingChange('indexing', 'maxConcurrentJobs', parseInt(e.target.value))}
                    InputProps={{
                      inputProps: { min: 1, max: 8 },
                      endAdornment: (
                        <Tooltip title="Number of documents to process concurrently">
                          <IconButton size="small" edge="end">
                            <HelpIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ),
                    }}
                    sx={{ mb: 3 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.indexing.autoAnalyzeDocuments}
                          onChange={(e) => handleSettingChange('indexing', 'autoAnalyzeDocuments', e.target.checked)}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography>Auto-analyze documents</Typography>
                          <Tooltip title="Automatically extract entities and metadata from documents">
                            <IconButton size="small">
                              <HelpIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      }
                    />
                  </FormGroup>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* RAG settings */}
          <Accordion 
            expanded={expanded === 'rag'} 
            onChange={handleAccordionChange('rag')}
            elevation={0}
            sx={{ 
              mb: 2,
              border: 1,
              borderColor: 'divider',
              '&:before': {
                display: 'none',
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="rag-settings-content"
              id="rag-settings-header"
            >
              <Typography variant="h6">RAG Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel id="rag-model-label">LLM Model</InputLabel>
                    <Select
                      labelId="rag-model-label"
                      id="rag-model"
                      value={settings.rag.model}
                      label="LLM Model"
                      onChange={(e) => handleSettingChange('rag', 'model', e.target.value)}
                    >
                      {ragModels.map((model) => (
                        <MenuItem key={model.value} value={model.value}>
                          {model.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography gutterBottom>
                    Temperature: {formatSliderValue(settings.rag.temperature, 0, 1, 0.1)}
                  </Typography>
                  <Slider
                    value={settings.rag.temperature}
                    min={0}
                    max={1}
                    step={0.1}
                    onChange={(_, value) => handleSettingChange('rag', 'temperature', value as number)}
                    valueLabelDisplay="auto"
                    sx={{ mb: 3 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Max Tokens"
                    type="number"
                    value={settings.rag.maxTokens}
                    onChange={(e) => handleSettingChange('rag', 'maxTokens', parseInt(e.target.value))}
                    InputProps={{
                      inputProps: { min: 256, max: 4096 },
                    }}
                    sx={{ mb: 3 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Top K Results"
                    type="number"
                    value={settings.rag.topK}
                    onChange={(e) => handleSettingChange('rag', 'topK', parseInt(e.target.value))}
                    InputProps={{
                      inputProps: { min: 1, max: 20 },
                      endAdornment: (
                        <Tooltip title="Number of most relevant chunks to include in the context">
                          <IconButton size="small" edge="end">
                            <HelpIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ),
                    }}
                    sx={{ mb: 3 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography gutterBottom>
                    Similarity Threshold: {formatSliderValue(settings.rag.similarityThreshold, 0, 1, 0.05)}
                  </Typography>
                  <Slider
                    value={settings.rag.similarityThreshold}
                    min={0}
                    max={1}
                    step={0.05}
                    onChange={(_, value) => handleSettingChange('rag', 'similarityThreshold', value as number)}
                    valueLabelDisplay="auto"
                    sx={{ mb: 3 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.rag.includeSourceText}
                          onChange={(e) => handleSettingChange('rag', 'includeSourceText', e.target.checked)}
                        />
                      }
                      label="Include source text in response"
                    />
                  </FormGroup>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* UI settings */}
          <Accordion 
            expanded={expanded === 'ui'} 
            onChange={handleAccordionChange('ui')}
            elevation={0}
            sx={{ 
              mb: 3,
              border: 1,
              borderColor: 'divider',
              '&:before': {
                display: 'none',
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="ui-settings-content"
              id="ui-settings-header"
            >
              <Typography variant="h6">UI Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.ui.darkMode}
                      onChange={(e) => handleSettingChange('ui', 'darkMode', e.target.checked)}
                    />
                  }
                  label="Dark Mode"
                />
              </FormGroup>
            </AccordionDetails>
          </Accordion>

          {/* Action buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchSettings}
              disabled={loading || saving}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={saveSettings}
              disabled={loading || saving}
            >
              Save Settings
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SettingsPanel; 