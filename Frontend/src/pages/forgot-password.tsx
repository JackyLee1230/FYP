import React from "react";
import ForgetPasswordBox from "@/components/ForgetPasswordBox";
import LockResetIcon from '@mui/icons-material/LockReset';
import { Box, styled, Typography } from "@mui/material";


const StyledLockResetIcon = styled(LockResetIcon)(({ theme }) => ({
  fontSize: 100,
  marginBottom: 16,
  color: theme.palette.primary.main,
}));


function ForgotPasswordPage() {
  return (
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
            Forget Password
          </Typography>
        </Box>

        <ForgetPasswordBox />
      </Box>
    </Box>
  );
}

export default ForgotPasswordPage;

