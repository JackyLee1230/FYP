import React, { useState } from 'react';
import { Button, Typography, Box, FormControl, InputLabel, FormHelperText, FormControlLabel, Radio } from '@mui/material';
import { useRouter } from "next/router";
import { CustomInput } from "@/components/CustomInput";
import Link from 'next/link'
import { login } from "@/services/authService"
import { setAuthCookies } from "@/libs/authHelper"
import { useAuthContext } from '@/context/AuthContext'

type LoginBoxProps = {
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const LoginBox = ({setOpen}: LoginBoxProps) => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [LoginError, setLoginError] = useState('');
  const [isTemporary, setIsTemporary] = useState(true);
  const { setUser, setToken } = useAuthContext()

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
    onLogin();
  };

  async function onLogin() {
    try{
      const response = await login(username, password);
      if(response?.user) {
        const access_token = response.access_token;
        const refresh_token = response.refresh_token;
        setAuthCookies(refresh_token, isTemporary);
        setUser(response.user);
        setToken(access_token);
        //router.reload();
      }
    } catch (error: any) {
      setLoginError(error.response.data.message)
    } 
  }

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
            checked={!isTemporary} 
            control={<Radio checked={!isTemporary} onClick={() => setIsTemporary(prev => !prev)}/>} 
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
