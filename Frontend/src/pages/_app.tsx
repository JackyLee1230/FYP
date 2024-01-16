import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { store } from "../../store";
import { Provider } from "react-redux";
import { StyledEngineProvider } from "@mui/material/styles";
import createCache from "@emotion/cache";
import { createTheme, ThemeProvider, styled } from "@mui/material/styles";
import { themeOptions } from "../theme/MuiThemeOption";
import Layout from "../components/layout";
import { AuthContextProvider } from "@/context/AuthContext";
import { SnackbarProvider } from "notistack";
import { Analytics } from "@vercel/analytics/react";
import Head from "next/head";

const cache = createCache({
  key: "css",
  prepend: true,
});

const theme = createTheme(themeOptions);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <StyledEngineProvider injectFirst>
        <Provider store={store}>
          <AuthContextProvider>
            <Layout>
              <SnackbarProvider maxSnack={3}>
                <Head>
                  <meta
                    name="viewport"
                    content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
                  />
                  <meta name="application-name" content="CritiQ" />
                  <meta name="apple-mobile-web-app-capable" content="yes" />
                  <meta
                    name="apple-mobile-web-app-status-bar-style"
                    content="default"
                  />
                  <meta name="apple-mobile-web-app-title" content="CritiQ" />
                  <meta
                    name="description"
                    content="CritiQ: Game Review with Machine Learning"
                  />
                  <meta name="format-detection" content="telephone=no" />
                  <meta name="mobile-web-app-capable" content="yes" />
                  <meta
                    name="msapplication-config"
                    content="/icons/browserconfig.xml"
                  />
                  <meta name="msapplication-TileColor" content="#2B5797" />
                  <meta name="msapplication-tap-highlight" content="no" />
                  <meta name="theme-color" content="#000000" />

                  <link
                    rel="apple-touch-icon"
                    href="/icons/apple-touch-icon.png"
                  />
                  <link
                    rel="apple-touch-icon"
                    sizes="152x152"
                    href="/icons/apple-touch-icon-152x152.png"
                  />
                  <link
                    rel="apple-touch-icon"
                    sizes="180x180"
                    href="/icons/apple-touch-icon-180x180.png"
                  />
                  <link
                    rel="icon"
                    type="image/png"
                    sizes="32x32"
                    href="/icons/favicon-32x32.png"
                  />
                  <link
                    rel="icon"
                    type="image/png"
                    sizes="16x16"
                    href="/icons/favicon-16x16.png"
                  />
                  <link rel="manifest" href="/manifest.json" />
                  <link
                    rel="mask-icon"
                    href="/icons/safari-pinned-tab.svg"
                    color="#5bbad5"
                  />
                  <link rel="shortcut icon" href="/favicon.ico" />
                  <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css?family=Roboto:300,400,500"
                  />

                  <meta name="twitter:card" content="summary" />
                  <meta
                    name="twitter:url"
                    content="https://critiq.itzjacky.info"
                  />
                  <meta name="twitter:title" content="PWA App" />
                  <meta
                    name="twitter:description"
                    content="CritiQ: Game Review with Machine Learning"
                  />
                  <meta
                    name="twitter:image"
                    content="https://yourdomain.com/icons/android-chrome-192x192.png"
                  />
                  <meta property="og:type" content="website" />
                  <meta property="og:title" content="CritiQ" />
                  <meta
                    property="og:description"
                    content="CritiQ: Game Review with Machine Learning"
                  />
                  <meta property="og:site_name" content="CritiQ" />
                  <meta
                    property="og:url"
                    content="https://critiq.itzjacky.info"
                  />
                  <meta
                    property="og:image"
                    content="https://critiq.itzjacky.info/icons/apple-touch-icon.png"
                  />
                </Head>
                <Component {...pageProps} />
                <Analytics />
              </SnackbarProvider>
            </Layout>
          </AuthContextProvider>
        </Provider>
      </StyledEngineProvider>
    </ThemeProvider>
  );
}

