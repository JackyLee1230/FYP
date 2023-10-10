import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, InputBase, Avatar, styled, alpha, Box, Button, darken, ButtonBase } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import Image from "next/image";

const Search = styled('div')(({ theme }) => ({
  display: "flex",
  position: 'relative',
  borderRadius: 24,
  boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25) inset",
  backgroundColor: alpha("#FFFFFF", 1),
  '&:hover': {
    backgroundColor: darken("#FFFFFF", 0.07),
  },
  marginLeft: 0,
  width: "-webkit-fill-available",
  color: theme.palette.text.secondary,
  '& .MuiInputBase-root': {
    width: "-webkit-fill-available",
  },
  paddingLeft: "0px",
  justifyContent: "space-between",
}));

const SearchIconWrapper = styled(ButtonBase)(({ theme }) => ({
  borderRadius: "4px 24px 24px 4px",
  backgroundColor: theme.palette.secondary.main,
  width: '72px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'left',
  padding: "0px 8px",
  color: "#FFFFFF",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: '38px',
    transition: theme.transitions.create('width'),
    fontSize: "15px",
  },
}));

const WebToolbar = () => {
  const [isLogin, setIsLogin] = useState(false);

  const handleProfileRedirect = () => {
    // Redirect to profile page
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar 
        position="static" 
        sx={(theme) => ({
          [theme.breakpoints.up('lg')]: {
            padding: "0px 128px"
          },
        })}
      >
        <Toolbar 
          disableGutters 
          sx={(theme) => ({
            maxWidth: 1440, 
            alignSelf:"center", 
            gap: "12px",
            width: "100%"
          })}
        >
          <Image src="/logo.png" width={210} height={64} alt="CritiQ Icon" />

          <Button 
            variant="text" 
            size="large" 
            sx={{color: 'background.default', whiteSpace : "nowrap", flexShrink: 0, fontWeight: 500}}
          >
            Add Game
          </Button>

          <Button 
            variant="text" 
            size="large" 
            sx={{color: 'background.default', whiteSpace : "nowrap", flexShrink: 0, fontWeight: 500}}
          >
            Add Review
          </Button>

          <Search>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
            />
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
          </Search>

          {isLogin ? (
            <IconButton edge="end" color="inherit" aria-label="profile" onClick={handleProfileRedirect}>
              <Avatar alt="User Avatar" src="/static/images/avatar/1.jpg" />
            </IconButton>
          ) : (
            <Button variant="outlined" color="secondary" size="large" sx={{whiteSpace: "nowrap", flexShrink: 0, fontWeight: 500}}>Register</Button>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default WebToolbar;
