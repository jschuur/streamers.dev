import Head from 'next/head';

import ChannelList from '../components/ChannelList';
import Footer from '../components/Footer';

import { HomePageProvider } from '../lib/stores';

export default function Home() {
  return (
    <>
      <Head>
        <title>streamers.dev - a directory of live coding streamers</title>
        <meta name='description' content='A directory of live coding streamers'></meta>
      </Head>

      <HomePageProvider>
        <h1 className='text-center font-medium text-2xl sm:text-3xl mt-5'>streamers.dev</h1>
        <h2 className='text-center text-lg sm:text-xl'>
          a curated directory of live coding streamers
        </h2>
        <div className='max-w-6xl mx-auto sm:px-7 py-5'>
          <ChannelList />
          <Footer />
        </div>
      </HomePageProvider>
    </>
  );
}
