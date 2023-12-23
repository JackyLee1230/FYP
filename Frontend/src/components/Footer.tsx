import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import { Grid } from "@mui/material";
import Image from "next/image";

function Copyright() {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ marginTop: "15px" }}
    >
      {"Copyright © "}
      <Link color="inherit" href="/">
        CritiQ Platform
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

export default function StickyFooter() {
  return (
    <ThemeProvider theme={defaultTheme}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "10vh",
        }}
      >
        <CssBaseline />
        <Container
          maxWidth="md"
          component="footer"
          sx={{
            borderTop: `1px solid`,
            mt: 8,
            py: [3, 6],
          }}
        >
          <Grid container spacing={4} justifyContent="space-evenly">
            <Grid item xs={6} sm={3}>
              <Link href="/">
                <Image
                  src="/logo.png"
                  width={226}
                  height={69}
                  alt="CritiQ Icon"
                />
                CritiQ Platform
              </Link>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="h6" color="text.primary" gutterBottom>
                {"Placeholder"}
              </Typography>
              <ul>
                <li>
                  <Link href="#" variant="subtitle1" color="text.secondary">
                    {"Placeholder 1"}
                  </Link>
                </li>
                <li>
                  <Link href="#" variant="subtitle1" color="text.secondary">
                    {"Placeholder 2"}
                  </Link>
                </li>
                <li>
                  <Link href="#" variant="subtitle1" color="text.secondary">
                    {"Placeholder 3"}
                  </Link>
                </li>
              </ul>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Typography variant="h6" color="text.primary" gutterBottom>
                {"TOS"}
              </Typography>
              <ul>
                <li>
                  <Link href="#" variant="subtitle1" color="text.secondary">
                    {"Terms of Service"}
                  </Link>
                </li>
                <li>
                  <Link href="#" variant="subtitle1" color="text.secondary">
                    {"About Us"}
                  </Link>
                </li>
                <li>
                  <Link href="#" variant="subtitle1" color="text.secondary">
                    {"Contact Us"}
                  </Link>
                </li>
              </ul>
            </Grid>
          </Grid>
          <Copyright />
        </Container>
      </Box>
    </ThemeProvider>
  );
}

