import React, { useState } from 'react';
import { Button, Typography, Box, FormControl, InputLabel, FormHelperText, CircularProgress } from '@mui/material';
import { useRouter } from "next/router";
import { CustomInput } from "@/components/CustomInput";
import { register } from "@/services/authService"
import { validateUsername, validateEmail, validatePassword } from '@/utils/Regex';
import { setAuthCookies } from "@/libs/authHelper"
import { useAuthContext } from '@/context/AuthContext'
import { displaySnackbarVariant } from '@/utils/DisplaySnackbar';

const RegisterBox = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setToken } = useAuthContext()

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
      setPasswordError("Password cannot be empty");
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
    setIsLoading(true);
    e.preventDefault();
    const usernameValid = verifyUsername();
    const passwordValid = verifyPassword();
    const emailValid = verifyEmail();
    if(!usernameValid || !passwordValid || !emailValid){
      setRegisterError('Please fill in all the fields.');
      setIsLoading(false);
      return;
    }
    onRegister();
  };

  async function onRegister() {
    try{
      const { user, refresh_token, access_token } = await register(username, email, password);
      setAuthCookies(refresh_token, false);
      setUser(user);
      setToken(access_token);
      displaySnackbarVariant("Register successfully. Please remember to verify your email address.", "success");
      router.push('/');
      setIsLoading(false);
    } catch (error: any) {
      console.error("Register failed", error);
      setRegisterError(error?.response?.data?.message ?? "Register failed, please try again later")
      setIsLoading(false);
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
              id="new-username"
              name='new-username'
              autoComplete="username"
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
              id="new-email"
              name='new-email'
              autoComplete="email"
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
              id="new-password"
              name='new-password'
              autoComplete="new-password"
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
              id='new-confirmPassword'
              name='new-confirmPassword'
              autoComplete="new-password"
            />
            <FormHelperText sx={{whiteSpace: "pre-wrap"}}>{passwordError}</FormHelperText>
          </FormControl>

          {registerError && (
            <Typography variant="body2" color="error">
              {registerError}
            </Typography>
          )}

          <Box sx={{ m: 1, position: 'relative' }}>
            <Button variant="contained" type="submit" size="large" fullWidth disabled={isLoading}>
              Register
            </Button>
            {isLoading && (
              <CircularProgress
                size={24}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-12px',
                  marginLeft: '-12px',
                }}
              />
            )}
          </Box>
        </Box>
      </form>
    </Box>
  );
};

export default RegisterBox;
