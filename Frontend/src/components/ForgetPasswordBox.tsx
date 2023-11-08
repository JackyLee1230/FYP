import React, { useEffect, useState } from 'react';
import { Button, Typography, Box, FormControl, InputLabel, FormHelperText, CircularProgress } from '@mui/material';
import { CustomInput } from "@/components/CustomInput";
import axios from "axios";
import { validateEmail } from "@/utils/Regex";
import { displaySnackbarVariant } from '@/utils/DisplaySnackbar';

const NEXT_PUBLIC_BACKEND_PATH_PREFIX  = process.env.NEXT_PUBLIC_BACKEND_PATH_PREFIX

async function sendForgotPassword(email: string) {
  try {
    const response = await axios.post(
      `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/auth/forgot-password`,
      {
        email: email,
      }
    ); //
    if (response.status === 200) {
      console.debug("Forgot password req sent successfully");
      return(null);
    } else {
      console.debug("Failed to forgot password (response)", response);
      return(response.data.message)
    }
  } catch (error: any) {
    console.error("Failed to forgot password (error)", error);
    return(error.response.data.message);
  }
}


const ForgetPasswordBox = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [time, setTime] = useState(60);
  const [isWaiting, setIsWaiting] = useState(false);


  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isWaiting) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else {
      clearInterval(interval as unknown as NodeJS.Timeout);
    }
    if (time < 0) {
      setIsWaiting(false);
    }
    return () => clearInterval(interval as NodeJS.Timeout);
  }, [isWaiting, time]);

  function startTimer() {
    setIsWaiting(!isWaiting);
    setTime(60);
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

  async function handleForgotPassword(email: string){
    if(!verifyEmail()){
      return;
    }

    setIsLoading(true);
    setEmailError("");
    const error = await sendForgotPassword(email);
    if (error) {
      setServerError(error);
    } else{
      setServerError("");
      displaySnackbarVariant("Reset password email sent successfully. Please check your email.", "success");
      startTimer();
    }
    setIsLoading(false);
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
        Enter your registered email address to reset password
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2.5,
        }}
      >
        <FormControl variant="standard" error={!!emailError}>
          <InputLabel shrink sx={{ fontWeight: 500, fontSize: "20px" }}>
            Email Address
          </InputLabel>
          <CustomInput 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!emailError}
            onBlur={() => verifyEmail()}
            id="email"
            name="email"
            autoComplete="email"
          />
          <FormHelperText>{emailError}</FormHelperText>
        </FormControl>

        {serverError && (
          <Typography variant="body2" color="error">
            {serverError}
          </Typography>
        )}

        <Box sx={{ m: 1, position: 'relative' }}>
          <Button 
            variant="contained" 
            type="submit" 
            size="large" 
            fullWidth
            onClick={() => (
              handleForgotPassword(email)
            )}
            disabled={isLoading || isWaiting}
          >
            Confirm
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

        {isWaiting && (
          <Typography variant="body2" color="secondary">
            Please wait {time} seconds before resending
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ForgetPasswordBox;
