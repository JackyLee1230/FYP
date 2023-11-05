import React, { useState } from 'react';
import { Button, Typography, Box, FormControl, InputLabel, FormHelperText, FormControlLabel, Radio } from '@mui/material';
import { useRouter } from "next/router";
import { CustomInput } from "@/components/CustomInput";
import Link from 'next/link'
import axios from 'axios';

type LoginBoxProps = {
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

async function onLogin(username: string, password: string) {
  {/* 
  try {
    const response = await axios.post(
      "http://localhost:8080/api/auth/login",
      {
        name: username,
        password: password,
      }
    );
    if (response.status === 200) {
      console.debug("Login successful");
      return(null);
    } else {
      console.debug("Failed to login (response)", response);
      return(response.data.message)
    }
  } catch (error: any) {
    console.error("Failed to login (error)", error);
    return(error.response.data.message);
  }
  */}
}

const LoginBox = ({setOpen}: LoginBoxProps) => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [LoginError, setLoginError] = useState('');
  const [isRemembered, setIsRemembered] = useState(false);

  function verifyUsername(): boolean{
    if (username === '') {
      setUsernameError('Please enter your username or email address.');
      return false;
    } else {
      setUsernameError('');
      return true;
    }
  }

  function verifyPassword(): boolean{
    if (password === '') {
      setPasswordError('Please enter your password.');
      return false;
    } else {
      setPasswordError('');
      return true;
    }
  }

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const usernameValid = verifyUsername();
    const passwordValid = verifyPassword();
    if(!usernameValid || !passwordValid) {
      setLoginError('Please fill in all the fields.')
      return;
    }
    onLogin(username, password);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography variant="h5" sx={{ marginBottom: 4, fontWeight: 600, textAlign: "center" }}>
        Welcome back to CritiQ
      </Typography>
      <form onSubmit={handleLogin}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2.5,
          }}
        >
          <FormControl variant="standard" error={!!usernameError}>
            <InputLabel shrink sx={{ fontWeight: 500, fontSize: "20px" }}>
              User Name / Email Address
            </InputLabel>
            <CustomInput 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={!!usernameError}
              onBlur={verifyUsername}
              inputProps={{ maxLength: 14 }}
              autoComplete="username-or-email"
            />
            <FormHelperText>{usernameError}</FormHelperText>
          </FormControl>

          <FormControl variant="standard" error={!!passwordError}>
            <InputLabel shrink sx={{ fontWeight: 500, fontSize: "20px" }}>
              Password
            </InputLabel>
            <CustomInput 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!passwordError}
              onBlur={verifyPassword}
              inputProps={{ maxLength: 16 }}
              autoComplete="password"
            />
            <FormHelperText>{passwordError}</FormHelperText>
          </FormControl>

          <FormControlLabel 
            checked={isRemembered} 
            control={<Radio checked={isRemembered} onClick={() => setIsRemembered(prev => !prev)}/>} 
            label="Remember Me" 
            sx={{
              alignSelf: "flex-start",
            }}
          />
          
          {LoginError && (
            <Typography variant="body2" color="error">
              {LoginError}
            </Typography>
          )}

          <Button variant="contained" type="submit" size="large" fullWidth>
            Login
          </Button>
          <Button 
            variant="text" 
            sx={{ textDecoration: "underline"}} 
            size="small" 
            LinkComponent={Link} 
            href="/forgot-password"
            onClick={() => (setOpen ? setOpen(false) : null)}
          >
            Forgot Passward?
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default LoginBox;
