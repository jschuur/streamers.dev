import Head from 'next/head';
import slugify from 'slugify';
import { useEffect, useContext } from 'react';

import ChannelList from '../components/ChannelList';
import Footer from '../components/Footer';
import ThemeChanger from '../components/ThemeChanger';

import useTagSlugs from '../hooks/useTagSlugs';
import useFilterNav from '../hooks/useFilterNav';

import { getKeywords } from '../lib/db';
import { HomePageContext } from '../lib/stores';
import { TAGLINE } from '../lib/config';

export default function Home({ tagSlugs }) {
  const { setTagSlugs } = useContext(HomePageContext);
  const filterNav = useFilterNav();

  // Initialise the status list of tags and slugs loaded at build time
  useEffect(() => setTagSlugs(tagSlugs), []);

  return (
    <>
      <Head>
        <title>streamers.dev - {TAGLINE}</title>
        <meta
          name='description'
          content='Find live-coding channels that use your favorite tech stacks.'
        />
      </Head>

      <ThemeChanger />
      <h1
        onClick={() => filterNav({ reset: 'all' })}
        className='text-center font-medium text-3xl sm:text-5xl mt-5 cursor-pointer'
      >
        streamers.dev
      </h1>
      <h2 className='text-center text-xl sm:text-2xl'>{TAGLINE}</h2>

      <div className='max-w-5xl mx-auto sm:px-7 py-4 sm:py-5'>
        <ChannelList />
        <Footer />
      </div>
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
