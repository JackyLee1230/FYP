import { Box } from "@mui/material";
import Footer from "./Footer";
import WebToolbar from "./Toolbar";

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
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
        <main style={{marginTop: "64px"}}>{children}</main>
        <Footer />
      </Box>
    </>
  );
}

