import { useEffect, useContext } from 'react';
import slugify from 'slugify';

import Layout from '../components/Layout/Layout';
import ChannelList from '../components/Home/ChannelList';
import OfflineChannels from '../components/Home/OfflineChannels';

import { getKeywords, getLiveChannels } from '../lib/db';
import { HomePageContext } from '../lib/stores';

import { HOME_DATA_STALE_SECONDS } from '../lib/config';

export default function Home({ tagSlugs, initialChannels }) {
  const { setTagSlugs } = useContext(HomePageContext);

  // Initialise the status list of tags and slugs loaded at build time
  useEffect(() => setTagSlugs(tagSlugs), []);

  return (
    <Layout
      description='Discover Twitch live-coding channels featuring your favorite tech stacks.'
      url='https://streamers.dev'
    >
      <ChannelList initialChannels={initialChannels} />
      <OfflineChannels />
    </Layout>
  );
}

export async function getStaticProps() {
  const tags = await getKeywords();

  // Slugify handles most slugs, but the keyword list can define overrides
  const tagSlugs = tags.map(({ tag, slug }) => ({
    tag,
    slug: slug || slugify(tag, { lower: true, remove: '.' }),
  }));

  const initialChannels = await getLiveChannels();

  return {
    props: { tagSlugs, initialChannels },
    revalidate: HOME_DATA_STALE_SECONDS,
  };
}
