import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, InputBase, Avatar, styled, alpha, Box, Button, darken, ButtonBase, Modal } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import Image from "next/image";
import { useRouter } from 'next/router'
import { useDebounce } from "usehooks-ts";
import Link from 'next/link'
import SignInUpPanel from './SignInUpPanel';

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
  const [searchString, setSearchString] = useState<string>("")
  const debouncedSearchString = useDebounce(searchString, 200);
  const [isLogin, setIsLogin] = useState(false);
  const router = useRouter()
  const [openPanel, setOpenPanel] = useState(false);

  const handleProfileRedirect = () => {
    // Redirect to profile page
  };

  const handleGameSearch = () => {
    if(debouncedSearchString.trim().length > 0){
      router.push({
        pathname: '/result',
        query: { gamename: debouncedSearchString },
      })
    }
    else{
      router.push({
        pathname: '/result',
      }) 
    }
  }

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
          sx={{
            maxWidth: 1440, 
            alignSelf:"center", 
            gap: "12px",
            width: "100%"
          }}
        >
          <ButtonBase LinkComponent={Link} href="/" sx={{borderRadius: 2}}>
            <Image src="/logo.png" width={210} height={64} alt="CritiQ Icon" />
          </ButtonBase>
          

          <Button 
            variant="text" 
            size="large" 
            sx={{color: 'background.default', whiteSpace : "nowrap", flexShrink: 0, fontWeight: 500}}
            LinkComponent={Link} 
            href="/new-game"
          >
            Add Game
          </Button>

          <Button 
            variant="text" 
            size="large" 
            sx={{color: 'background.default', whiteSpace : "nowrap", flexShrink: 0, fontWeight: 500}}
            LinkComponent={Link}
            href="/new-review"
          >
            Add Review
          </Button>

          <Search
            onKeyPress={(ev) => {
              if (ev.key === 'Enter') {
                handleGameSearch();
                ev.preventDefault();
              }
            }}
          >
            <StyledInputBase
              placeholder="Search Game…"
              inputProps={{ 'aria-label': 'search' }}
              onChange={event=>{                                
                setSearchString(event.target.value)
              }}   
            />
            <SearchIconWrapper
              onClick={handleGameSearch}
            >
              <SearchIcon />
            </SearchIconWrapper>
          </Search>

          {isLogin ? (
            <IconButton edge="end" color="inherit" aria-label="profile" onClick={handleProfileRedirect}>
              <Avatar alt="User Avatar" src="/static/images/avatar/1.jpg" />
            </IconButton>
          ) : (
            <>
              <Button variant="outlined" color="secondary" size="large" sx={{whiteSpace: "nowrap", flexShrink: 0, fontWeight: 500}} onClick={() => setOpenPanel(true)}>Register</Button>

              <Modal
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                open={openPanel}
                onClose={() => setOpenPanel(false)}
              >
                <SignInUpPanel setOpen={setOpenPanel}/>
              </Modal>
            </>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default WebToolbar;
