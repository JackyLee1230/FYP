import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { store } from "../../store";
import { Provider } from "react-redux";
import { StyledEngineProvider } from '@mui/material/styles';
import {
  experimental_extendTheme as materialExtendTheme,
  Experimental_CssVarsProvider as MaterialCssVarsProvider,
  THEME_ID as MATERIAL_THEME_ID,
} from '@mui/material/styles';
import { CssVarsProvider as JoyCssVarsProvider } from '@mui/joy/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

const cache = createCache({
  key: 'css',
  prepend: true,
});

const materialTheme = materialExtendTheme();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MaterialCssVarsProvider theme={{ [MATERIAL_THEME_ID]: materialTheme }}>
      <JoyCssVarsProvider>
        <StyledEngineProvider injectFirst>
          <Provider store={store}>
            <CacheProvider value={cache}>
              <Component {...pageProps} />
            </CacheProvider>
          </Provider>
        </StyledEngineProvider>
      </JoyCssVarsProvider>
    </MaterialCssVarsProvider>
  );
}

