"use client";
import { Box, styled, Typography } from "@mui/material";
import axios from "axios";
import { GetServerSideProps } from "next";
import LockResetIcon from '@mui/icons-material/LockReset';
import ResetPasswordBox from "@/components/ResetPasswordBox";
import Head from "next/head";

type ResetPasswordPageProps = {
  token: string;
  errorMessage: string;
}

const StyledLockResetIcon = styled(LockResetIcon)(({ theme }) => ({
  fontSize: 100,
  marginBottom: 16,
  color: theme.palette.primary.main,
}));

const NEXT_PUBLIC_BACKEND_PATH_PREFIX  = process.env.NEXT_PUBLIC_BACKEND_PATH_PREFIX

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { token } = context.query;

  let user = null;
  let errorMessage = null;

  try {
    // Fetch the game data from an API using Axios
    const response = await axios.post(
      `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/user/getUserByResetPasswordToken`,
      { resetPasswordToken: token },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
        },
      }
    );
    if (response.status === 200) {
      user = await response.data;
    } else {
      errorMessage = response.statusText;
    }
  } catch (error: any) {
    errorMessage = error.toString();
    console.error(error);
  }

  return {
    props: {
      token,
      errorMessage,
    },
  };
};


function ResetPasswordPage({token, errorMessage}: ResetPasswordPageProps) {
  return (
    <>
      <Head>
        <title>Reset Password | CritiQ</title>
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
            <StyledLockResetIcon />
            <Typography variant="h2" color="primary" sx={{ fontWeight: 600, textAlign: "center" }}>
              Reset Password
            </Typography>
          </Box>

          <ResetPasswordBox token={token} errorMessage={errorMessage} />
        </Box>
      </Box>
    </>
  );
}

export default ResetPasswordPage;

