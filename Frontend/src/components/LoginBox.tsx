import React, { useState } from 'react';
import { Button, Typography, Box, FormControl, InputLabel, FormHelperText } from '@mui/material';
import { useRouter } from "next/router";
import { CustomInput } from "@/components/CustomInput";
import Link from 'next/link'

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

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (username && password) {
      setUsernameError('');
      setPasswordError('');
      onLogin(username, password);
    } else {
      if(!username){
        setUsernameError('Please fill in your username.');
      }
      else{
        setUsernameError('');
      }
      if(!password){
        setPasswordError('Please fill in your password.');
      }
      else{
        setPasswordError('');
      }
      setLoginError('Please fill in all the fields.')
    }
  };

  const onLogin = (username: string, password: string) => {

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
              User Name
            </InputLabel>
            <CustomInput 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={!!usernameError}
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
            />
            <FormHelperText>{passwordError}</FormHelperText>
          </FormControl>

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
