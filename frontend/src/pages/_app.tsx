import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { store } from "../../store";
import { Provider } from "react-redux";
import { StyledEngineProvider } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import { themeOptions } from '../theme/MuiThemeOption'
import Layout from "../components/Layout"

const cache = createCache({
  key: 'css',
  prepend: true,
})

const theme = createTheme(themeOptions);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <StyledEngineProvider injectFirst>
        <Provider store={store}>
          <CacheProvider value={cache}>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </CacheProvider>
        </Provider>
      </StyledEngineProvider>
    </ThemeProvider>
  );
}

