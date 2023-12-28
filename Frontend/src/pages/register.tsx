import React from "react";
import RegisterBox from "@/components/RegisterBox";
import { Box, CircularProgress, styled, Typography } from "@mui/material";
import LockPersonIcon from '@mui/icons-material/LockPerson';
import { useAuthContext } from '@/context/AuthContext'
import Head from "next/head";

const StyledRegisterIcon = styled(LockPersonIcon)(({ theme }) => ({
  fontSize: 100,
  marginBottom: 16,
  color: theme.palette.primary.main,
}));


function RegisterPage() {
  const { user, token, isUserLoading } = useAuthContext()

  return (
    <>
      <Head>
        <title>Register | CritiQ</title>
      </Head>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 128px"
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
            <StyledRegisterIcon />
            <Typography variant="h2" color="primary" sx={{ fontWeight: 600, textAlign: "center" }}>
              Register
            </Typography>
          </Box>

          { user && token ? (
            <>
              <Typography variant="h5" sx={{ marginBottom: 4, fontWeight: 600, textAlign: "center" }}>
                You are logged in
              </Typography>
              <Typography variant="body1" sx={{ marginBottom: 4, textAlign: "center" }}>
                You cannot create an account while logged in. Please log out first.
              </Typography>
            </>
          ) : (
            isUserLoading ? (
              <CircularProgress />
            ) : (
              <RegisterBox />
            )
          )}
        </Box>
      </Box>
    </>
  );
}

export default RegisterPage;

