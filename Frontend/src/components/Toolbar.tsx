import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, IconButton, InputBase, Avatar, styled, alpha, Box, Button, darken, ButtonBase, Modal, Menu, MenuItem, ListItemIcon, CircularProgress, Divider, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Image from "next/image";
import { useRouter } from 'next/router'
import { useDebounce } from "usehooks-ts";
import Link from 'next/link'
import SignInUpPanel from './SignInUpPanel';
import { useAuthContext } from '@/context/AuthContext'
import Logout from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { logout } from "@/services/authService"
import { User } from '@/type/user';
import { displaySnackbarVariant } from '@/utils/DisplaySnackbar';

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

function displayUserRole(user: User | null): string {
  if(user){
    if (user.role.length > 1) {
      let filteredRoles = user.role.filter((r) => r !== "USER");
      return filteredRoles.join(`\n`);
    } else {
      return user?.role.join(`\n`);
    }
  }
  return "";
}

const WebToolbar = () => {
  const [searchString, setSearchString] = useState<string>("")
  const debouncedSearchString = useDebounce(searchString, 200);
  const [isLogin, setIsLogin] = useState(false);
  const router = useRouter()
  const [openPanel, setOpenPanel] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  let { user, token, setUser, setToken } = useAuthContext();

  useEffect(() => {
    if(token || user){
      setIsLogin(true);
    }
    else{
      setIsLogin(false);
    }
  }, [token, user])


  const handleProfileRedirect = () => {
    // Redirect to profile page
  };

  const handleLogout = async () => {
    await onLogout();
    setIsLogin(false);
    setUser(null);
    setToken(null);
    handleUserMenuClose();
    displaySnackbarVariant("Logout successfully.", "success");
    router.reload();
  };

  async function onLogout() {
    if(token){
      await logout(token);
    }
  }

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
              id="search-input"
              name="search-input"
              autoComplete='on'
            />
            <SearchIconWrapper
              onClick={handleGameSearch}
            >
              <SearchIcon />
            </SearchIconWrapper>
          </Search>

          {isLogin ? (
            <>
              <IconButton edge="end" color="inherit" aria-label="profile" onClick={handleUserMenuOpen}>
                <Avatar alt="User Avatar" src="/static/images/avatar/1.jpg" />
              </IconButton>
              
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleUserMenuClose}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    bgcolor: 'white',
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                    marginTop: "4px",
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: 'white',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box
                  sx={{
                    display: 'block',
                    padding: "0px 16px 8px 16px",
                    zIndex: 0,
                  }}
                >
                  <Typography variant="subtitle1" sx={{fontWeight: 500}}>
                    {user?.name}
                  </Typography>
                  <Typography variant="body1" sx={{color: "text.secondary"}}>
                    {displayUserRole(user)}
                  </Typography>
                </Box>
                <Divider/>
                <MenuItem onClick={handleUserMenuClose}>
                  <ListItemIcon>
                    <AccountCircleIcon fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            token !== undefined ? (
              <>
                <Button variant="outlined" color="secondary" size="large" sx={{whiteSpace: "nowrap", flexShrink: 0, fontWeight: 500}} onClick={() => setOpenPanel(true)}>Register</Button>

                <Modal
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  open={openPanel}
                >
                  <Box>
                    <SignInUpPanel setOpen={setOpenPanel}/>
                  </Box>
                </Modal>
              </>
            ) : (
              <Box sx={{ display: 'flex' }}>
                <CircularProgress color="secondary" />
              </Box>
            )
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default WebToolbar;
