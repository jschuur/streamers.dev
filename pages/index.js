import { NextSeo } from 'next-seo';
import slugify from 'slugify';
import { useEffect, useContext } from 'react';

import Layout from '../components/Layout/Layout';
import ChannelList from '../components/Home/ChannelList';
import OfflineChannels from '../components/Home/OfflineChannels';

import useTagSlugs from '../hooks/useTagSlugs';

import { getKeywords } from '../lib/db';
import { HomePageContext } from '../lib/stores';
import { TAGLINE } from '../lib/config';

export default function Home({ tagSlugs }) {
  const { setTagSlugs } = useContext(HomePageContext);

  // Initialise the status list of tags and slugs loaded at build time
  useEffect(() => setTagSlugs(tagSlugs), []);

  return (
    <Layout
      description='Discover Twitch live-coding channels featuring your favorite tech stacks.'
      url='https://streamers.dev'
    >
      <ChannelList />
      <OfflineChannels />
    </Layout>
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
