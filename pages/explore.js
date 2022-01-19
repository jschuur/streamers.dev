import { useContext, useEffect } from 'react';

import Layout from '../components/Layout/Layout';
import Section from '../components/Layout/Section';
import NewActiveChannels from '../components/Explore/NewActiveChannels';
import RecentStreamTopics from '../components/Explore/RecentStreamTopics';

import { getExploreData } from '../lib/explore';
import { useExploreData } from '../lib/api';
import { getTagSlugs } from '../lib/db';

import { HomePageContext } from '../lib/stores';
import { EXPLORE_DATA_STALE_SECONDS } from '../lib/config';

function ExploreSections({ data }) {
  if (!data) return <Section>Error: No explore data found</Section>;

  return (
    <>
      <RecentStreamTopics topics={data.topicPopularity} />
      <NewActiveChannels channels={data.newActiveChannels} />
    </>
  );
}

export default function Explore({ cachedExploreData, tagSlugs }) {
  const { setTagSlugs } = useContext(HomePageContext);
  const { data: exploreData } = useExploreData({ placeholderData: cachedExploreData });

  // Initialise the status list of tags and slugs loaded at build time
  useEffect(() => setTagSlugs(tagSlugs), []);

  return (
    <Layout
      page='explore'
      url='https://streamers.dev/explore'
      description='Explore live-coding streamers.'
    >
      <ExploreSections data={exploreData.data} />
    </Layout>
  );
}

export async function getStaticProps() {
  const cachedExploreData = await getExploreData();
  const tagSlugs = await getTagSlugs();

  return {
    props: { cachedExploreData, tagSlugs },
    revalidate: EXPLORE_DATA_STALE_SECONDS,
  };
}
