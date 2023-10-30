import React, { useState } from 'react';
import { Button, Typography, Box, FormControl, InputLabel, FormHelperText } from '@mui/material';
import { useRouter } from "next/router";
import { CustomInput } from "@/components/CustomInput";

const RegisterBox = () => {
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [registerError, setRegisterError] = useState('');

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (username && email && password && confirmPassword) {
      if (password === confirmPassword) {
        setUsernameError('');
        setEmailError('');
        setPasswordError('');
        setConfirmPasswordError('');
        setRegisterError('');
        onRegister(username, email, password);
      } 
    } else {
      if(!username){
        setUsernameError('Please fill in your username.');
      }
      else{
        setUsernameError('');
      }
      if(!email){
        setEmailError('Please fill in your email.');
      }
      else{
        setEmailError('');
      }
      if(!password){
        setPasswordError('Please fill in your password.');
      }
      else{
        setPasswordError('');
      }
      if(!confirmPassword){
        setConfirmPasswordError('Please fill in your password again.');
      }
      else{
        setConfirmPasswordError('');
      }
      if(password !== confirmPassword){
        setPasswordError('Passwords do not match.');
        setConfirmPasswordError('Passwords do not match.');
      }
      setRegisterError('Please fill in all the fields.');
    }
  };

  const onRegister = (username: string, email: string, password: string) => {
    
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
      <Typography variant="h5" sx={{ marginBottom: 4, fontWeight: 600 }}>
        Get started with a free CritiQ account to review and discover your favorite games!
      </Typography>
      <form onSubmit={handleRegister}>
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

          <FormControl variant="standard" error={!!emailError}>
            <InputLabel shrink sx={{ fontWeight: 500, fontSize: "20px" }}>
              Email
            </InputLabel>
            <CustomInput
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!emailError}
            />
            <FormHelperText>{emailError}</FormHelperText>
          </FormControl>

          <FormControl variant="standard" error={!!passwordError}>
            <InputLabel shrink sx={{ fontWeight: 500, fontSize: "20px" }}>
              Password
            </InputLabel>
            <CustomInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!passwordError}
              type="password"
            />
            <FormHelperText>{passwordError}</FormHelperText>
          </FormControl>

          <FormControl variant="standard" error={!!confirmPasswordError}>
            <InputLabel shrink sx={{ fontWeight: 500, fontSize: "20px" }}>
              Confirm Password
            </InputLabel>
            <CustomInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={!!confirmPasswordError}
              type="password"
            />
            <FormHelperText>{confirmPasswordError}</FormHelperText>
          </FormControl>

          {registerError && (
            <Typography variant="body2" color="error">
              {registerError}
            </Typography>
          )}
          <Button variant="contained" type="submit" size="large" fullWidth>
            Register
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default RegisterBox;
