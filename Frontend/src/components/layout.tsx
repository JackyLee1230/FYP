import { Box, useMediaQuery, useTheme } from "@mui/material";
import Footer from "./Footer";
import WebToolbar from "./Toolbar";
import { use } from "react";

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <>
      <WebToolbar />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <main 
          style={{
            marginTop: isMobile ? "56px" : "64px",
          }}
        >
          {children}
        </main>
        <Footer />
      </Box>
    </>
  );
}

