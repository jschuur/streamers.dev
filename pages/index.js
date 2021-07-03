import Head from 'next/head';
import slugify from 'slugify';

import ChannelList from '../components/ChannelList';
import Footer from '../components/Footer';
import ThemeChanger from '../components/ThemeChanger';

import { HomePageProvider } from '../lib/stores';
import { getKeywords } from '../lib/db';

export default function Home({ tagSlugs }) {
  return (
    <>
      <Head>
        <title>streamers.dev - a directory of live coding streamers</title>
        <meta name='description' content='A directory of live coding streamers'></meta>
      </Head>

      <HomePageProvider>
        <ThemeChanger />
        <h1 className='text-center font-medium text-2xl sm:text-3xl mt-5'>streamers.dev</h1>
        <h2 className='text-center text-lg sm:text-xl'>
          a curated directory of live coding streamers
        </h2>
        <div className='max-w-5xl mx-auto sm:px-7 py-4 sm:py-5'>
          <ChannelList tagSlugs={tagSlugs} />
          <Footer />
        </div>
      </HomePageProvider>
    </>
  );
}

export async function getStaticProps(context) {
  const tags = await getKeywords();

  // Slugify handles most slugs, but the keyword list can define overrides
  const tagSlugs = tags.map(({ tag, slug }) => ({
    tag,
    slug: slug || slugify(tag, { lower: true, remove: '.' }),
  }));

  return {
    props: { tagSlugs },
  };
}
