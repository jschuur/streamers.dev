import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';

import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

import { HomePageProvider } from '../lib/stores';

import '../styles/globals.css';

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const queryClient = new QueryClient();

  return (
    <HomePageProvider>
      <ThemeProvider enableSystem={true} attribute='class'>
        <SessionProvider session={session}>
          <QueryClientProvider client={queryClient}>
            <Component {...pageProps} />
            <ReactQueryDevtools />
          </QueryClientProvider>
        </SessionProvider>
      </ThemeProvider>
    </HomePageProvider>
  );
}

export default MyApp;
