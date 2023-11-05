import React, { useState } from 'react';
import { Button, Typography, Box, FormControl, InputLabel, FormHelperText } from '@mui/material';
import { useRouter } from "next/router";
import { CustomInput } from "@/components/CustomInput";
import axios from 'axios';
import { validateUsername, validateEmail, validatePassword } from '@/utils/Regex';


async function onRegister(username: string, email: string, password: string) {
  {/*
  try {
    const response = await axios.post(
      "http://localhost:8080/api/auth/register",
      {
        name: username,
        email: email,
        password: password,
      }
    );
    if (response.status === 200) {
      console.debug("Register successful");
      return(null);
    } else {
      console.debug("Failed to register (response)", response);
      return(response.data.message)
    }
  } catch (error: any) {
    console.error("Failed to register (error)", error);
    return(error.response.data.message);
  }
  */}
}

const RegisterBox = () => {
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [registerError, setRegisterError] = useState('');

  function verifyUsername(): boolean{
    if(username === ""){
      setUsernameError("Username cannot be empty");
      return false;
    }
    else if(!validateUsername(username)){
      setUsernameError("Your username cannot contain any spaces or @ symbols.");
      return false;
    }
    else{
      setUsernameError("");
      return true;
    }
  }

  function verifyEmail(): boolean{
    if(email === ""){
      setEmailError("Email address cannot be empty");
      return false;
    }
    else if(!validateEmail(email)){
      setEmailError("Invalid email address format");
      return false;
    }
    else{
      setEmailError("");
    }
    return true;
  }
  
  function verifyPassword(): boolean{
    if(!validatePassword(password) || !validatePassword(confirmPassword)){
      setPasswordError("Your password should have:\n 1. A minimum of 8 and a maximum of 16 characters\n 2. Contains both numbers and letters");
      return false;
    }
    else if(password === "" || confirmPassword === ""){
      setPasswordError("New Password cannot be empty");
      return false;
    }
    else if(password !== confirmPassword){
      setPasswordError("Password does not match");
      return false;
    }
    else{
      setPasswordError("");
    }
    return true;
  }

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const usernameValid = verifyUsername();
    const passwordValid = verifyPassword();
    const emailValid = verifyEmail();
    if(!usernameValid || !passwordValid || !emailValid){
      setRegisterError('Please fill in all the fields.');
      return;
    }
    onRegister(username, email, password);
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
      <Typography variant="h5" sx={{ marginBottom: 4, maxWidth: 600, fontWeight: 600, textAlign: "center" }}>
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
              onBlur={verifyUsername}
              inputProps={{ maxLength: 14 }}
              autoComplete="off"
            />
            <FormHelperText sx={{whiteSpace: "pre-wrap"}}>{usernameError}</FormHelperText>
          </FormControl>

          <FormControl variant="standard" error={!!emailError}>
            <InputLabel shrink sx={{ fontWeight: 500, fontSize: "20px" }}>
              Email Address
            </InputLabel>
            <CustomInput
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!emailError}
              onBlur={verifyEmail}
              autoComplete="off"
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
              onBlur={verifyPassword}
              inputProps={{ maxLength: 16 }}
              autoComplete="off"
            />
            <FormHelperText sx={{whiteSpace: "pre-wrap"}}>{passwordError}</FormHelperText>
          </FormControl>

          <FormControl variant="standard" error={!!passwordError}>
            <InputLabel shrink sx={{ fontWeight: 500, fontSize: "20px" }}>
              Confirm Password
            </InputLabel>
            <CustomInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={!!passwordError}
              type="password"
              onBlur={verifyPassword}
              inputProps={{ maxLength: 16 }}
              autoComplete="off"
            />
            <FormHelperText sx={{whiteSpace: "pre-wrap"}}>{passwordError}</FormHelperText>
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
