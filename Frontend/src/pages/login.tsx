import React, { useEffect } from "react";
import LoginBox from "@/components/LoginBox";
import { Box, CircularProgress, styled, Typography } from "@mui/material";
import LoginIcon from '@mui/icons-material/Login';
import { useAuthContext } from '@/context/AuthContext'
import { useRouter } from "next/router";
import Head from "next/head";

const StyledLoginIcon = styled(LoginIcon)(({ theme }) => ({
  fontSize: 100,
  marginBottom: 16,
  color: theme.palette.primary.main,
}));

function LoginPage() {
  const router = useRouter();
  const { user, token, isUserLoading } = useAuthContext()

  useEffect(() => {
    if(user && token) {
      if(window.history.length > 1 && 
        document.referrer.indexOf(window.location.host) !== -1) {  
        router.back();
      } else {
      router.push('/')
      }
    }
  }, [user, token, router])

  return (
    <>
      <Head>
        <title>Login | CritiQ</title>
      </Head>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 128px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "white", 
            borderRadius: 4, 
            padding: "36px 48px", 
            border: "0.8px solid",
            borderColor: "divider",
            boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
            margin: "0 auto",
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <StyledLoginIcon />
            <Typography variant="h2" color="primary" sx={{ fontWeight: 600, textAlign: "center" }}>
              Login
            </Typography>
          </Box>

          {user && token ? (
            <>
              <Typography variant="h5" sx={{ marginBottom: 4, fontWeight: 600, textAlign: "center" }}>
                Logged in successfully
              </Typography>
              <Typography variant="body1" sx={{ marginBottom: 4, textAlign: "center" }}>
                You will be redirected to the home page in a few seconds.
              </Typography>
            </>
          ) : (
            isUserLoading ? (
              <CircularProgress/>
            ) : (
              <LoginBox />
            )
          )}
        </Box>
      </Box>
    </>
  );
}

export default LoginPage;

