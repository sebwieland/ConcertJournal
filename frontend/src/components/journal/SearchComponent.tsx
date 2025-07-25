import React, { useState, useEffect, useCallback } from 'react';
import { sortData } from '../../utils/SortData';
import {
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  Typography,
  InputAdornment,
  IconButton,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import RatingStars from '../utilities/RatingStars';
import { ConcertEvent } from '../../types/events';
import { SwipeableList } from 'react-swipeable-list';
import 'react-swipeable-list/dist/styles.css';
import { leadingActions, StyledSwipeableListItem, trailingActions } from "./SwipeableListItem";

interface SearchComponentProps {
  data: ConcertEvent[];
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const SearchComponent: React.FC<SearchComponentProps> = ({ data, onEdit, onDelete }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ConcertEvent[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Memoize the search function to avoid unnecessary re-renders
  const performSearch = useCallback((searchText: string, sourceData: ConcertEvent[]) => {
    // Log for debugging (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log("Performing search");
      console.log("Search term:", searchText);
      console.log("Available data:", sourceData);
    }
    
    if (!searchText.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    const term = searchText.toLowerCase();
    
    // Handle case where data might be undefined or empty
    if (!sourceData || sourceData.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log("No data available for search");
      }
      setSearchResults([]);
      setHasSearched(true);
      return;
    }
    
    try {
      const results = sourceData.filter(event => {
        // Add null checks to prevent errors
        const bandName = event.bandName?.toLowerCase() || '';
        const place = event.place?.toLowerCase() || '';
        const comment = event.comment?.toLowerCase() || '';
        
        return bandName.includes(term) ||
               place.includes(term) ||
               comment.includes(term);
      });
      
      if (process.env.NODE_ENV === 'development') {
        console.log("Search results:", results);
      }
      // Sort the results by date in descending order (newest first)
      const sortedResults = sortData(results, 'date', 'desc');
      setSearchResults(sortedResults);
      setHasSearched(true);
    } catch (error) {
      console.error("Error during search:", error);
      setSearchResults([]);
      setHasSearched(true);
    }
  }, []);

  // Re-run search when data changes (e.g., after deletion)
  useEffect(() => {
    if (hasSearched && searchTerm.trim()) {
      if (process.env.NODE_ENV === 'development') {
        console.log("Data changed, refreshing search results");
      }
      performSearch(searchTerm, data);
    }
  }, [data, hasSearched, searchTerm, performSearch]);

  const handleSearch = () => {
    performSearch(searchTerm, data);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSearchResults([]);
    setHasSearched(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (process.env.NODE_ENV === 'development') {
        console.log("Enter key pressed");
      }
      handleSearch();
    }
  };
  

  const formatDate = (date: string | number[]) => {
    try {
      if (Array.isArray(date)) {
        const [year, month, day] = date;
        return new Date(year, month - 1, day).toLocaleDateString();
      } else if (typeof date === 'string' && date.startsWith('[') && date.endsWith(']')) {
        try {
          const dateArray = JSON.parse(date);
          if (Array.isArray(dateArray) && dateArray.length === 3) {
            return new Date(dateArray[0], dateArray[1] - 1, dateArray[2]).toLocaleDateString();
          }
        } catch (error) {
          return 'Invalid date format';
        }
      } else if (date) {
        return new Date(date).toLocaleDateString();
      } else {
        return 'No date';
      }
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <Box sx={{ width: '100%', mb: 4 }} data-testid="search-component">
      <Box sx={{ display: 'flex', mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search for bands, locations, comments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          data-testid="search-input"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={handleClear} edge="end">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          data-testid="search-button"
          sx={{
            ml: 1,
            px: 3,
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: 'primary.dark',
              transform: 'scale(1.05)',
              transition: 'all 0.2s'
            }
          }}
          startIcon={<SearchIcon />}
        >
          Search
        </Button>
      </Box>
      

      {hasSearched && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {searchResults.length === 0
              ? 'No results found'
              : `Found ${searchResults.length} result${searchResults.length !== 1 ? 's' : ''}`}
          </Typography>
          
          {isMobile ? (
            // Mobile view with swipeable list items
            <Box style={{ width: '100%' }}>
              <SwipeableList style={{ width: '100%' }}>
                {searchResults.map((result) => (
                  <StyledSwipeableListItem
                    key={result.id}
                    leadingActions={onDelete ? leadingActions(onDelete, result.id) : undefined}
                    trailingActions={onEdit ? trailingActions(onEdit, result.id) : undefined}
                  >
                    <Card sx={{
                      width: '100%',
                      height: '100%',
                      marginBottom: theme.spacing(1)
                    }}>
                      <CardContent sx={{ height: '100%' }}>
                        <Typography variant="h5" component="div">
                          {result.bandName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {result.place}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(result.date)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {result.comment}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <RatingStars rating={result.rating} />
                        </Typography>
                      </CardContent>
                    </Card>
                  </StyledSwipeableListItem>
                ))}
              </SwipeableList>
            </Box>
          ) : (
            // Desktop view with grid layout
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {searchResults.map((result) => (
                <Box key={result.id} sx={{ width: { xs: '100%', sm: '45%', md: '30%' } }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h5" component="div">
                        {result.bandName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {result.place}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(result.date)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {result.comment}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <RatingStars rating={result.rating} />
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SearchComponent;