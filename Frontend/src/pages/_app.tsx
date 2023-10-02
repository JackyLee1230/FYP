import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { store } from "../../store";
import { Provider } from "react-redux";
import { StyledEngineProvider } from '@mui/material/styles';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <StyledEngineProvider>
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
    </StyledEngineProvider>
  );
}

