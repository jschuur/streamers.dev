import { Provider } from 'next-auth/client';
import { ThemeProvider } from 'next-themes';

import { HomePageProvider } from '../lib/stores';

import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <HomePageProvider>
      <ThemeProvider enableSystem={true} attribute='class'>
        <Provider session={pageProps.session}>
          <Component {...pageProps} />
        </Provider>
      </ThemeProvider>
    </HomePageProvider>
  );
}

export default MyApp;
