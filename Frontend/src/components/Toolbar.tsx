import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, InputBase, Avatar, styled, alpha, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import Image from "next/image";

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
  },
  '& .MuiInputBase-root': {
    width: '100%',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
  },
}));

const WebToolbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleProfileRedirect = () => {
    // Redirect to profile page
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar disableGutters sx={{padding: "0px 24px"}}>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleDrawerOpen}>
            <MenuIcon />
          </IconButton>

          <Image src="/logo.png" width={210} height={64} alt="CritiQ Icon" />

          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search>

          <IconButton edge="end" color="inherit" aria-label="profile" onClick={handleProfileRedirect}>
            <Avatar alt="User Avatar" src="/static/images/avatar/1.jpg" />
          </IconButton>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default WebToolbar;
