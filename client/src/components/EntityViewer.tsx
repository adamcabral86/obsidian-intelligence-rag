import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Grid,
  useTheme,
  ListItemButton,
} from '@mui/material';
import {
  Person as PersonIcon,
  Place as PlaceIcon,
  Business as OrganizationIcon,
  Event as EventIcon,
  Label as MiscIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useThemeColors } from '../theme';

// API URL from environment or default
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Entity types
type EntityType = 'PERSON' | 'LOCATION' | 'ORGANIZATION' | 'DATE' | 'MISC';

// Entity interface
interface Entity {
  id: string;
  text: string;
  type: EntityType;
  count: number;
  documents: {
    id: string;
    title: string;
    snippet: string;
  }[];
  confidence: number;
  metadata?: {
    aliases?: string[];
    description?: string;
    links?: {
      url: string;
      title: string;
    }[];
  };
}

// Tab panel props
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Tab panel component
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`entity-tabpanel-${index}`}
      aria-labelledby={`entity-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

// Get props for tab
const a11yProps = (index: number) => {
  return {
    id: `entity-tab-${index}`,
    'aria-controls': `entity-tabpanel-${index}`,
  };
};

const EntityViewer: React.FC = () => {
  const theme = useTheme();
  const themeColors = useThemeColors();
  const [tabValue, setTabValue] = useState(0);
  const [entities, setEntities] = useState<Record<EntityType, Entity[]>>({
    PERSON: [],
    LOCATION: [],
    ORGANIZATION: [],
    DATE: [],
    MISC: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Entity type mapping to tab index
  const entityTypes: EntityType[] = ['PERSON', 'LOCATION', 'ORGANIZATION', 'DATE', 'MISC'];

  // Fetch entities on component mount
  useEffect(() => {
    fetchEntities();
  }, []);

  // Fetch entities from API
  const fetchEntities = async () => {
    setLoading(true);
    setError(null);
    setRefreshing(true);
    
    try {
      const response = await axios.get(`${API_URL}/entities`);
      
      // Group entities by type
      const groupedEntities: Record<EntityType, Entity[]> = {
        PERSON: [],
        LOCATION: [],
        ORGANIZATION: [],
        DATE: [],
        MISC: [],
      };
      
      response.data.forEach((entity: Entity) => {
        if (entity.type in groupedEntities) {
          groupedEntities[entity.type].push(entity);
        } else {
          groupedEntities.MISC.push(entity);
        }
      });
      
      // Sort entities by count (descending)
      Object.keys(groupedEntities).forEach((type) => {
        groupedEntities[type as EntityType].sort((a, b) => b.count - a.count);
      });
      
      setEntities(groupedEntities);
    } catch (err) {
      console.error('Error fetching entities:', err);
      setError('Failed to load entities. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setSelectedEntity(null);
  };

  // Handle entity selection
  const handleEntitySelect = (entity: Entity) => {
    setSelectedEntity(entity);
  };

  // Handle search term change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Filter entities by search term
  const filteredEntities = (type: EntityType) => {
    if (!searchTerm.trim()) return entities[type];
    
    return entities[type].filter(entity => 
      entity.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.metadata?.aliases?.some(alias => 
        alias.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  // Get icon for entity type
  const getEntityIcon = (type: EntityType) => {
    switch (type) {
      case 'PERSON':
        return <PersonIcon />;
      case 'LOCATION':
        return <PlaceIcon />;
      case 'ORGANIZATION':
        return <OrganizationIcon />;
      case 'DATE':
        return <EventIcon />;
      default:
        return <MiscIcon />;
    }
  };

  // Get color for entity type
  const getEntityColor = (type: EntityType) => {
    switch (type) {
      case 'PERSON':
        return 'primary';
      case 'LOCATION':
        return 'success';
      case 'ORGANIZATION':
        return 'info';
      case 'DATE':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Format confidence percentage
  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`;
  };

  return (
    <Box>
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

      {/* Search bar */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          mb: 3, 
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <TextField
          placeholder="Search entities..."
          value={searchTerm}
          onChange={handleSearchChange}
          variant="outlined"
          size="small"
          sx={{ flexGrow: 1, mr: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  aria-label="clear search"
                  onClick={handleClearSearch}
                  edge="end"
                  size="small"
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Tooltip title="Refresh entities">
          <IconButton onClick={fetchEntities} disabled={refreshing}>
            {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
          </IconButton>
        </Tooltip>
      </Paper>

      {/* Main content */}
      <Paper elevation={0} sx={{ borderRadius: 2 }}>
        {/* Entity type tabs */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="entity tabs"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTabs-indicator': {
              backgroundColor: theme.palette.primary.main,
            },
          }}
        >
          <Tab 
            icon={<PersonIcon />} 
            label="People" 
            {...a11yProps(0)} 
            sx={{ 
              minWidth: 120,
              '&.Mui-selected': {
                color: theme.palette.primary.main,
              },
            }}
          />
          <Tab 
            icon={<PlaceIcon />} 
            label="Locations" 
            {...a11yProps(1)} 
            sx={{ 
              minWidth: 120,
              '&.Mui-selected': {
                color: theme.palette.primary.main,
              },
            }}
          />
          <Tab 
            icon={<OrganizationIcon />} 
            label="Organizations" 
            {...a11yProps(2)} 
            sx={{ 
              minWidth: 120,
              '&.Mui-selected': {
                color: theme.palette.primary.main,
              },
            }}
          />
          <Tab 
            icon={<EventIcon />} 
            label="Dates" 
            {...a11yProps(3)} 
            sx={{ 
              minWidth: 120,
              '&.Mui-selected': {
                color: theme.palette.primary.main,
              },
            }}
          />
          <Tab 
            icon={<MiscIcon />} 
            label="Miscellaneous" 
            {...a11yProps(4)} 
            sx={{ 
              minWidth: 120,
              '&.Mui-selected': {
                color: theme.palette.primary.main,
              },
            }}
          />
        </Tabs>

        {/* Loading indicator */}
        {loading && !refreshing && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Entity tab panels */}
        {!loading && entityTypes.map((type, index) => (
          <TabPanel key={type} value={tabValue} index={index}>
            <Box sx={{ display: 'flex' }}>
              {/* Entity list */}
              <Box sx={{ width: selectedEntity ? '40%' : '100%', pr: selectedEntity ? 2 : 0 }}>
                {filteredEntities(type).length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {searchTerm ? 'No entities match your search' : 'No entities found'}
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ maxHeight: 600, overflow: 'auto' }}>
                    {filteredEntities(type).map((entity, idx) => (
                      <React.Fragment key={entity.id}>
                        {idx > 0 && <Divider component="li" />}
                        <ListItemButton
                          onClick={() => handleEntitySelect(entity)}
                          selected={selectedEntity?.id === entity.id}
                          sx={{
                            borderRadius: 1,
                            mb: 0.5,
                            '&.Mui-selected': {
                              bgcolor: themeColors.isDarkMode
                                ? `${themeColors.colors.primary}15` // 15% opacity
                                : `${themeColors.colors.primary}10`, // 10% opacity
                            },
                            '&:hover': {
                              bgcolor: themeColors.isDarkMode
                                ? `${themeColors.colors.surfaceLight}10` // 10% opacity
                                : `${themeColors.colors.secondary}05`,   // 5% opacity
                            },
                          }}
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body1" component="span">
                                  {entity.text}
                                </Typography>
                                <Chip 
                                  size="small" 
                                  label={`${entity.count} mentions`}
                                  color={getEntityColor(entity.type)}
                                  sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                                />
                                {entity.metadata?.aliases && entity.metadata.aliases.length > 0 && (
                                  <Tooltip title={`Aliases: ${entity.metadata.aliases.join(', ')}`}>
                                    <Chip 
                                      size="small" 
                                      label="aliases"
                                      variant="outlined"
                                      sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                                    />
                                  </Tooltip>
                                )}
                              </Box>
                            }
                            secondary={
                              <Typography variant="body2" color="text.secondary">
                                Confidence: {formatConfidence(entity.confidence)}
                              </Typography>
                            }
                          />
                        </ListItemButton>
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Box>

              {/* Entity details */}
              {selectedEntity && (
                <Box sx={{ width: '60%', pl: 2, borderLeft: `1px solid ${themeColors.colors.borderLight}` }}>
                  <Typography variant="h6" gutterBottom>
                    {selectedEntity.text}
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Chip 
                      icon={getEntityIcon(selectedEntity.type)}
                      label={selectedEntity.type}
                      color={getEntityColor(selectedEntity.type)}
                      sx={{ mr: 1 }}
                    />
                    <Chip 
                      label={`${selectedEntity.count} mentions`}
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                    <Chip 
                      label={`Confidence: ${formatConfidence(selectedEntity.confidence)}`}
                      variant="outlined"
                    />
                  </Box>

                  {selectedEntity.metadata?.aliases && selectedEntity.metadata.aliases.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Aliases
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {selectedEntity.metadata.aliases.map((alias, idx) => (
                          <Chip key={idx} label={alias} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {selectedEntity.metadata?.description && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Description
                      </Typography>
                      <Typography variant="body2">
                        {selectedEntity.metadata.description}
                      </Typography>
                    </Box>
                  )}

                  <Typography variant="subtitle2" gutterBottom>
                    Mentioned in Documents
                  </Typography>
                  
                  {selectedEntity.documents.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No document references found
                    </Typography>
                  ) : (
                    <Grid container spacing={2}>
                      {selectedEntity.documents.map((doc) => (
                        <Grid item xs={12} key={doc.id}>
                          <Card variant="outlined" sx={{ bgcolor: 'transparent' }}>
                            <CardContent sx={{ pb: 2, '&:last-child': { pb: 2 } }}>
                              <Typography variant="subtitle1" gutterBottom>
                                {doc.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {doc.snippet}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}

                  {selectedEntity.metadata?.links && selectedEntity.metadata.links.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Related Links
                      </Typography>
                      <List dense>
                        {selectedEntity.metadata.links.map((link, idx) => (
                          <ListItem key={idx} sx={{ px: 0 }}>
                            <ListItemText
                              primary={
                                <a 
                                  href={link.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  style={{ color: theme.palette.primary.main }}
                                >
                                  {link.title}
                                </a>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </TabPanel>
        ))}
      </Paper>
    </Box>
  );
};

export default EntityViewer; 