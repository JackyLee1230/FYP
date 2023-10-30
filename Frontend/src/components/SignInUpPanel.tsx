import React, { useState } from 'react';
import ResiterBox from "@/components/RegisterBox";
import LoginBox from "@/components/LoginBox";
import Image from "next/image";
import { Box, Tab, Tabs, IconButton } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

type SignInUpPanelProps = {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SignInUpPanel = ({setOpen}: SignInUpPanelProps) => {
  const [mode, setMode] = useState('register');

  return (
    <Box
      sx={{
        display: "flex",
        position: "relative",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "white", 
        borderRadius: 4, 
        padding: "36px 48px", 
        border: "0.8px solid",
        borderColor: "divider",
        boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
        gap: 2,
        width: 500
      }}
    >
      <IconButton 
        size="large" 
        onClick={() => setOpen(false)} 
        sx={{
          position: "absolute",
          top: 24,
          right: 36,
        }}
      >
        <CloseRoundedIcon/>
      </IconButton>

      <Image src="/logo.png" width={226} height={69} alt="CritiQ Icon" />
      <Tabs
        variant="fullWidth"
        value={mode}
        onChange={(e, newValue) => setMode(newValue)}
      >
        <Tab 
          value="register"
          label="Register"
        />
        <Tab
          value="login"
          label="Login"
        />
      </Tabs>

      {mode === 'register' ? <ResiterBox /> : <LoginBox />}
    </Box>
  );
};

export default SignInUpPanel;
