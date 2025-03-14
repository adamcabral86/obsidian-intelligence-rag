import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  Grid,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Build as BuildIcon,
  Event as EventIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useThemeColors } from '../theme';

/**
 * Entity type enum
 */
enum EntityType {
  PERSON = 'person',
  ORGANIZATION = 'organization',
  LOCATION = 'location',
  EQUIPMENT = 'equipment',
  EVENT = 'event',
}

/**
 * Entity interface
 */
interface Entity {
  id: string;
  name: string;
  type: EntityType;
  description: string;
  confidence: 'high' | 'medium' | 'low';
  documentCount: number;
  relatedEntities: Array<{
    id: string;
    name: string;
    type: EntityType;
    relationship: string;
  }>;
}

/**
 * Mock entities data
 */
const mockEntities: Entity[] = [
  {
    id: '1',
    name: 'John Smith',
    type: EntityType.PERSON,
    description: 'Senior diplomat at the Foreign Ministry',
    confidence: 'high',
    documentCount: 5,
    relatedEntities: [
      {
        id: '4',
        name: 'Foreign Ministry',
        type: EntityType.ORGANIZATION,
        relationship: 'member_of',
      },
      {
        id: '5',
        name: 'Eastern Region Summit',
        type: EntityType.EVENT,
        relationship: 'participant',
      },
    ],
  },
  {
    id: '2',
    name: 'Alpha-3 Checkpoint',
    type: EntityType.LOCATION,
    description: 'Border checkpoint in the Northern Region',
    confidence: 'high',
    documentCount: 3,
    relatedEntities: [
      {
        id: '6',
        name: 'Northern Border Security',
        type: EntityType.ORGANIZATION,
        relationship: 'controlled_by',
      },
    ],
  },
  {
    id: '3',
    name: 'Encrypted Radio System',
    type: EntityType.EQUIPMENT,
    description: 'Advanced communication equipment used in the Western Region',
    confidence: 'medium',
    documentCount: 2,
    relatedEntities: [
      {
        id: '7',
        name: 'Western Communications Network',
        type: EntityType.ORGANIZATION,
        relationship: 'operated_by',
      },
    ],
  },
  {
    id: '4',
    name: 'Foreign Ministry',
    type: EntityType.ORGANIZATION,
    description: 'Government department responsible for international relations',
    confidence: 'high',
    documentCount: 4,
    relatedEntities: [
      {
        id: '1',
        name: 'John Smith',
        type: EntityType.PERSON,
        relationship: 'has_member',
      },
      {
        id: '5',
        name: 'Eastern Region Summit',
        type: EntityType.EVENT,
        relationship: 'organizer',
      },
    ],
  },
  {
    id: '5',
    name: 'Eastern Region Summit',
    type: EntityType.EVENT,
    description: 'Diplomatic meeting scheduled for March 15, 2023',
    confidence: 'high',
    documentCount: 3,
    relatedEntities: [
      {
        id: '1',
        name: 'John Smith',
        type: EntityType.PERSON,
        relationship: 'has_participant',
      },
      {
        id: '4',
        name: 'Foreign Ministry',
        type: EntityType.ORGANIZATION,
        relationship: 'organized_by',
      },
    ],
  },
];

/**
 * Get icon for entity type
 */
const getEntityIcon = (type: EntityType) => {
  switch (type) {
    case EntityType.PERSON:
      return <PersonIcon />;
    case EntityType.ORGANIZATION:
      return <BusinessIcon />;
    case EntityType.LOCATION:
      return <LocationIcon />;
    case EntityType.EQUIPMENT:
      return <BuildIcon />;
    case EntityType.EVENT:
      return <EventIcon />;
    default:
      return <PersonIcon />;
  }
};

/**
 * Get color for entity type
 */
const getEntityColor = (type: EntityType): 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'default' => {
  switch (type) {
    case EntityType.PERSON:
      return 'primary';
    case EntityType.ORGANIZATION:
      return 'secondary';
    case EntityType.LOCATION:
      return 'success';
    case EntityType.EQUIPMENT:
      return 'warning';
    case EntityType.EVENT:
      return 'info';
    default:
      return 'default';
  }
};

/**
 * Get confidence color
 */
const getConfidenceColor = (confidence: 'high' | 'medium' | 'low'): 'success' | 'warning' | 'error' | 'default' => {
  switch (confidence) {
    case 'high':
      return 'success';
    case 'medium':
      return 'warning';
    case 'low':
      return 'error';
    default:
      return 'default';
  }
};

/**
 * Entities page component
 */
const Entities: React.FC = () => {
  const theme = useTheme();
  const themeColors = useThemeColors();
  const [activeTab, setActiveTab] = useState<EntityType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: EntityType | 'all') => {
    setActiveTab(newValue);
    setSelectedEntity(null);
  };

  // Filter entities based on active tab and search term
  const filteredEntities = mockEntities.filter(
    (entity) =>
      (activeTab === 'all' || entity.type === activeTab) &&
      entity.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get background color for entity icon
  const getEntityBgColor = (type: EntityType) => {
    switch (type) {
      case EntityType.PERSON:
        return themeColors.colors.primary;
      case EntityType.ORGANIZATION:
        return themeColors.colors.secondary;
      case EntityType.LOCATION:
        return theme.palette.success.main;
      case EntityType.EQUIPMENT:
        return theme.palette.warning.main;
      case EntityType.EVENT:
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
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
          Entities
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Browse entities extracted from your documents
        </Typography>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            mb: 3,
            '& .MuiTab-root': {
              minHeight: '48px',
              textTransform: 'none',
              fontWeight: 500,
            },
            '& .MuiTabs-indicator': {
              backgroundColor: themeColors.colors.primary,
              height: 3,
            },
            '& .Mui-selected': {
              color: `${themeColors.colors.primary} !important`,
            }
          }}
        >
          <Tab label="All" value="all" />
          <Tab
            label="People"
            value={EntityType.PERSON}
            icon={<PersonIcon />}
            iconPosition="start"
          />
          <Tab
            label="Organizations"
            value={EntityType.ORGANIZATION}
            icon={<BusinessIcon />}
            iconPosition="start"
          />
          <Tab
            label="Locations"
            value={EntityType.LOCATION}
            icon={<LocationIcon />}
            iconPosition="start"
          />
          <Tab
            label="Equipment"
            value={EntityType.EQUIPMENT}
            icon={<BuildIcon />}
            iconPosition="start"
          />
          <Tab
            label="Events"
            value={EntityType.EVENT}
            icon={<EventIcon />}
            iconPosition="start"
          />
        </Tabs>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search entities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ 
            mb: 3,
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset': {
                borderColor: themeColors.colors.primary,
              },
            },
          }}
        />

        <Grid container spacing={3}>
          <Grid item xs={12} md={selectedEntity ? 6 : 12}>
            <List
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 1,
                border: 1,
                borderColor: 'divider',
              }}
            >
              {filteredEntities.length > 0 ? (
                filteredEntities.map((entity, index) => (
                  <React.Fragment key={entity.id}>
                    {index > 0 && <Divider component="li" />}
                    <ListItem
                      onClick={() => setSelectedEntity(entity)}
                      sx={{ 
                        cursor: 'pointer',
                        bgcolor: selectedEntity?.id === entity.id ? 
                          `${themeColors.colors.primary}10` : 'inherit', // 10% opacity
                        '&:hover': {
                          bgcolor: `${themeColors.colors.primary}05`, // 5% opacity
                        }
                      }}
                    >
                      <ListItemIcon>{getEntityIcon(entity.type)}</ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="subtitle1">{entity.name}</Typography>
                            <Chip
                              label={entity.type}
                              size="small"
                              color={getEntityColor(entity.type)}
                              sx={{ ml: 1 }}
                            />
                            <Chip
                              label={`${entity.confidence} confidence`}
                              size="small"
                              color={getConfidenceColor(entity.confidence)}
                              variant="outlined"
                              sx={{ ml: 1 }}
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {entity.description}
                          </Typography>
                        }
                      />
                    </ListItem>
                  </React.Fragment>
                ))
              ) : (
                <ListItem>
                  <ListItemText
                    primary="No entities found"
                    secondary={
                      searchTerm
                        ? 'Try adjusting your search terms'
                        : 'No entities of this type have been extracted'
                    }
                  />
                </ListItem>
              )}
            </List>
          </Grid>

          {selectedEntity && (
            <Grid item xs={12} md={6}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        mr: 2,
                        display: 'flex',
                        p: 1,
                        borderRadius: '50%',
                        bgcolor: getEntityBgColor(selectedEntity.type),
                        color: themeColors.colors.surfaceLight,
                      }}
                    >
                      {getEntityIcon(selectedEntity.type)}
                    </Box>
                    <Box>
                      <Typography variant="h5" component="h2">
                        {selectedEntity.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedEntity.type} • {selectedEntity.confidence} confidence •{' '}
                        {selectedEntity.documentCount} documents
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body1" paragraph>
                    {selectedEntity.description}
                  </Typography>

                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Related Entities
                  </Typography>
                  <List>
                    {selectedEntity.relatedEntities.length > 0 ? (
                      selectedEntity.relatedEntities.map((related, index) => (
                        <React.Fragment key={related.id}>
                          {index > 0 && <Divider component="li" />}
                          <ListItem>
                            <ListItemIcon>{getEntityIcon(related.type)}</ListItemIcon>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Typography variant="subtitle1">{related.name}</Typography>
                                  <Chip
                                    label={related.type}
                                    size="small"
                                    color={getEntityColor(related.type)}
                                    sx={{ ml: 1 }}
                                  />
                                </Box>
                              }
                              secondary={
                                <Typography variant="body2" color="text.secondary">
                                  Relationship: {related.relationship}
                                </Typography>
                              }
                            />
                          </ListItem>
                        </React.Fragment>
                      ))
                    ) : (
                      <ListItem>
                        <ListItemText primary="No related entities found" />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default Entities; 