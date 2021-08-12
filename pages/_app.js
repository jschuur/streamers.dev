import { Provider } from 'next-auth/client';
import { ThemeProvider } from 'next-themes';

import { QueryClient, QueryClientProvider } from 'react-query';

import { HomePageProvider } from '../lib/stores';

import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const queryClient = new QueryClient();

  return (
    <HomePageProvider>
      <ThemeProvider enableSystem={true} attribute='class'>
        <Provider session={pageProps.session}>
          <QueryClientProvider client={queryClient}>
            <Component {...pageProps} />
          </QueryClientProvider>
        </Provider>
      </ThemeProvider>
    </HomePageProvider>
  );
}

export default MyApp;
