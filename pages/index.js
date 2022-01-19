import superjson from 'superjson';

import { useEffect, useContext } from 'react';

import Layout from '../components/Layout/Layout';
import ChannelList from '../components/Home/ChannelList';
import OfflineChannels from '../components/Home/OfflineChannels';

import { getTagSlugs, getLiveChannelData } from '../lib/db';
import { HomePageContext } from '../lib/stores';

import { HOME_DATA_STALE_SECONDS } from '../lib/config';

export default function Home({ tagSlugs, initialChannelData }) {
  const { setTagSlugs } = useContext(HomePageContext);

  // Initialise the status list of tags and slugs loaded at build time
  useEffect(() => setTagSlugs(tagSlugs), []);

  return (
    <Layout
      description='Discover Twitch live-coding channels featuring your favorite tech stacks.'
      url='https://streamers.dev'
    >
      <ChannelList initialChannelData={initialChannelData} />
      <OfflineChannels />
    </Layout>
  );
}

export async function getStaticProps() {
  const tagSlugs = await getTagSlugs();
  const initialChannelData = await getLiveChannelData();

  // Explicitly use superjson to serialise data, because all dates are expected to be strings, since data
  // could have also come via the API route when used in LiveChannels component.
  return {
    props: { tagSlugs, initialChannelData: superjson.serialize(initialChannelData).json },
    revalidate: HOME_DATA_STALE_SECONDS,
  };
}
