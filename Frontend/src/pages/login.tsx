import React from "react";
import LoginBox from "@/components/LoginBox";
import SignInUpPanel from "@/components/signInUpPanel";
import { Box } from "@mui/material";


function LoginPage() {
  return (
    <Box
      sx={{
        padding: "48px 128px"
      }}
    >
      <LoginBox />
    </Box>
  );
}

export default LoginPage;

