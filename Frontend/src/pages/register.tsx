import React from "react";
import RegisterBox from "@/components/RegisterBox";
import { Box } from "@mui/material";


function RegisterPage() {
  return (
    <Box
      sx={{
        padding: "48px 128px"
      }}
    >
      <RegisterBox />
    </Box>
  );
}

export default RegisterPage;

