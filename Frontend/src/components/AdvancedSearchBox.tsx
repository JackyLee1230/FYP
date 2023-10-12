import React, { useState } from 'react';
import { Box, TextField, Checkbox, FormControlLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import Genre  from "@/type/gameGenre";
import Platform from "@/type/gamePlatform"

const AdvancedSearchBox: React.FC = () => {
  const [searchType, setSearchType] = useState<'game' | 'developer'>('game');
  const [selectedGenres, setSelectedGenres] = useState<Record<Genre, boolean>>({} as Record<Genre, boolean>);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Record<Platform, boolean>>({} as Record<Platform, boolean>);

  const handleSearchTypeChange = (event: SelectChangeEvent<"game" | "developer">) => {
    setSearchType(event.target.value as 'game' | 'developer');
  };

  const handleGenreChange = (genre: Genre) => {
    setSelectedGenres({ ...selectedGenres, [genre]: !selectedGenres[genre] });
  };

  const handlePlatformChange = (platform: Platform) => {
    setSelectedPlatforms({ ...selectedPlatforms, [platform]: !selectedPlatforms[platform] });
  };

  return (
    <Box 
      sx={{
        background: "white", 
        maxWidth: 1072, 
        borderRadius: 4, 
        padding: "24px 36px", 
        marginTop: "12px",
        border: "0.8px solid",
        borderColor: "divider",
        boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
      }}
    >
      <TextField label="Search" variant="outlined"/>
      <Select value={searchType} onChange={handleSearchTypeChange}>
        <MenuItem value='game'>Game</MenuItem>
        <MenuItem value='developer'>Developer</MenuItem>
      </Select>
      {Object.values(Genre).map((genre) => (
        <FormControlLabel control={<Checkbox checked={selectedGenres[genre]} onChange={() => handleGenreChange(genre)} />} label={genre} key={genre} />
      ))}
      {Object.values(Platform).map((platform) => (
        <FormControlLabel control={<Checkbox checked={selectedPlatforms[platform]} onChange={() => handlePlatformChange(platform)} />} label={platform} key={platform} />
      ))}
    </Box>
  );
};

export default AdvancedSearchBox;
