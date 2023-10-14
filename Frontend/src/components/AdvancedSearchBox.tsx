import React, { useState } from 'react';
import { Box, TextField, Checkbox, FormControlLabel, Select, MenuItem, SelectChangeEvent, Divider, Typography, Button, InputLabel, FormControl, Grid, Collapse, RadioGroup, Radio } from '@mui/material';
import { GenreList, getGenre, getIdByGenre } from "@/type/gameGenre";
import { PlatformList, getPlatform, getIdByPlatform } from "@/type/gamePlatform";
import { useRouter } from "next/router";
import { useDebounce } from 'usehooks-ts';

type AdvancedSearchBoxProps = {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AdvancedSearchBox = ({setOpen}: AdvancedSearchBoxProps) => {
  const router = useRouter();

  const [searchString, setSearchString] = useState<string>("")
  const debouncedSearchString = useDebounce(searchString, 200);
  const [searchType, setSearchType] = useState<'game' | 'developer'>('game');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isInDevelopment, setIsInDevelopment] = useState<boolean | null>(null);
  const [openGenre, setOpenGenre] = useState(false);
  const [openPlatform, setOpenPlatform] = useState(false);

  const handleToggleGenre = () => {
    setOpenGenre(!openGenre);
  };

  const handleTogglePlatform = () => {
    setOpenPlatform(!openPlatform);
  };

  const handleSearchTypeChange = (event: SelectChangeEvent<"game" | "developer">) => {
    setSearchType(event.target.value as 'game' | 'developer');
  };

  const handleIsInDevelopmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if((event.target as HTMLInputElement).value === "null"){
      setIsInDevelopment(null);
      return;
    }
    if((event.target as HTMLInputElement).value === "true"){
      setIsInDevelopment(true);
      return;
    }
    if((event.target as HTMLInputElement).value === "false"){
      setIsInDevelopment(false);
      return;
    }
  };


  const handleGenreChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const genre = event.target.name;
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handlePlatformChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const platform = event.target.name;
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(g => g !== platform)
        : [...prev, platform]
    );
  };

  const handleSearchRedirect = () => {
    if(debouncedSearchString.trim().length > 0){
      const genreIdList = selectedGenres.map(genre => getIdByGenre(genre));
      const platformIdList = selectedPlatforms.map(platform => getIdByPlatform(platform));

      if(searchType === "game"){
        router.push({
          pathname: '/result',
          query: { gamename: debouncedSearchString, genre: genreIdList, platform: platformIdList, inDevelopment: isInDevelopment === null ? "null" : isInDevelopment},
        })
      }
      else{
        router.push({
          pathname: '/result',
          query: { developername: debouncedSearchString, genre: genreIdList, platform: platformIdList, inDevelopment: isInDevelopment === null ? "null" : isInDevelopment},
        })
      }

      setOpen(false);
    }
  };

  return (
    <Box 
      sx={{
        display: "flex",
        flexDirection: "column",
        background: "white", 
        opacity: 0.95,
        maxWidth: 1072, 
        borderRadius: 4, 
        padding: "24px 36px", 
        marginTop: "12px",
        border: "0.8px solid",
        borderColor: "divider",
        boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
        gap: 2
      }}
    >
      <Box sx={{display: "flex", flexDirection: "column", gap: "24px"}}>
        <Box sx={{display: "flex", flexDirection: "column", gap: "8px"}}>
          <Typography color={"primary.main"} variant="h6" gutterBottom={false} sx={{fontWeight: 700}}>Genres</Typography>
          <Button onClick={handleToggleGenre} variant="contained">
            {openGenre ? 'Hide Genres' : 'Show Genres'}
          </Button>
          <Collapse in={openGenre}>
            <Grid container spacing={{ xs: 1, md: 2 }} columns={{ xs: 4, sm: 8, md: 12, lg: 16 }}>
              {GenreList.map((genre, index) => (
                <Grid item xs={4} key={index}>
                  <FormControlLabel
                    key={genre}
                    control={
                      <Checkbox
                        checked={selectedGenres.includes(genre)}
                        onChange={handleGenreChange}
                        name={genre}
                        color="primary"
                      />
                    }
                    label={getGenre(genre)}
                  />
                </Grid>
              ))}
            </Grid>
          </Collapse>
        </Box>
        <Box sx={{display: "flex", flexDirection: "column",  gap: "8px"}}>
          <Typography color={"primary.main"} variant="h6" gutterBottom={false} sx={{fontWeight: 700}}>Platforms</Typography>
          <Button onClick={handleTogglePlatform} variant="contained">
            {openPlatform ? 'Hide Platforms' : 'Show Platforms'}
          </Button>
          <Collapse in={openPlatform}>
            <Grid container spacing={{ xs: 1, md: 2 }} columns={{ xs: 4, sm: 8, md: 12, lg: 16 }}>
              {PlatformList.map((platform, index) => (
                <Grid item xs={4} key={index}>
                  <FormControlLabel
                    key={platform}
                    control={
                      <Checkbox
                        checked={selectedPlatforms.includes(platform)}
                        onChange={handlePlatformChange}
                        name={platform}
                        color="primary"
                      />
                    }
                    label={getPlatform(platform)}
                  />
                </Grid>
              ))}
            </Grid>
          </Collapse>
        </Box>
        <Box sx={{display: "flex", flexDirection: "row",  gap: "24px"}}>
          <Typography color={"primary.main"} variant="h6" gutterBottom={false} sx={{fontWeight: 700}}>Game In Development</Typography>
          <FormControl>
            <RadioGroup
              value={isInDevelopment}
              onChange={handleIsInDevelopmentChange}
            >
              <FormControlLabel value="null" control={<Radio />} label="Show All Games" />
              <FormControlLabel value="true" control={<Radio />} label="Show Games In Development" />
              <FormControlLabel value="false" control={<Radio />} label="Exclude Games In Development" />
            </RadioGroup>
          </FormControl>
        </Box>
      </Box>
      <Divider/>
      <Box sx={{display: "flex", gap: "8px"}}>
        <FormControl sx={{ minWidth: 126 }}>
          <InputLabel>Type</InputLabel>     
          <Select label="Type" value={searchType} onChange={handleSearchTypeChange} autoWidth={false}>
            <MenuItem value='game'>Game</MenuItem>
            <MenuItem value='developer'>Developer</MenuItem>
          </Select>
        </FormControl>
        <TextField 
          error={debouncedSearchString.trim().length === 0}
          placeholder='Search...' 
          fullWidth 
          variant="outlined" 
          value={searchString}               
          onChange={event=>{                                
            setSearchString(event.target.value)
          }}
          onKeyPress={(ev) => {
            if (ev.key === 'Enter') {
              handleSearchRedirect();
              ev.preventDefault();
            }
          }}
        />
        <Button variant="contained" color="primary" size="large" onClick={handleSearchRedirect}>Search</Button>
      </Box>
    </Box>
  );
};

export default AdvancedSearchBox;
