"use client";
import VerifyAccountBox from "@/components/VerifyAccountBox";
import { useAuthContext } from "@/context/AuthContext";
import SafetyCheckIcon from "@mui/icons-material/SafetyCheck";
import { Box, styled, Typography } from "@mui/material";
import axios from "axios";
import { GetServerSideProps } from "next";
import Head from "next/head";

type VerifyPageProps = {
  token: string;
  errorMessage: string;
};

const StyledSafetyCheckIcon = styled(SafetyCheckIcon)(({ theme }) => ({
  fontSize: 100,
  marginBottom: 16,
  color: theme.palette.primary.main,
}));

const NEXT_PUBLIC_BACKEND_PATH_PREFIX =
  process.env.NEXT_PUBLIC_BACKEND_PATH_PREFIX;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { token } = context.query;

  let user = null;
  let errorMessage = null;

  try {
    const response = await axios.post(
      `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/user/getUserByVerificationToken`,
      { verificationToken: token },
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
      errorMessage = await response.data.message;
    }
  } catch (error: any) {
    errorMessage = error.response.data.message;
    console.error(error.response.data.message);
  }

  return {
    props: {
      token,
      errorMessage,
    },
  };
};

function VerifyPage({ token, errorMessage }: VerifyPageProps) {
  let { user } = useAuthContext();

  return (
    <>
      <Head>
        <title>Verify Account | CritiQ</title>
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
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <StyledSafetyCheckIcon />
            <Typography
              variant="h2"
              color="primary"
              sx={{ fontWeight: 600, textAlign: "center" }}
            >
              Verify Account
            </Typography>
          </Box>
          <VerifyAccountBox user={user} errorMessage={errorMessage} />
        </Box>
      </Box>
    </>
  );
}

export default VerifyPage;

