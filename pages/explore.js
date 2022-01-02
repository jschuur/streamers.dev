import Layout from '../components/Layout/Layout';
import Section from '../components/Layout/Section';
import NewActiveChannels from '../components/Explore/NewActiveChannels';
import RecentStreamTopics from '../components/Explore/RecentStreamTopics';

import { getExploreData } from '../lib/explore';
import { useExploreData } from '../lib/api';

function ExploreSections({ data }) {
  if (!data) return <Section>Error: No explore data found</Section>;

  return (
    <>
      <RecentStreamTopics topics={data.topicPopularity} />
      <NewActiveChannels channels={data.newActiveChannels} />
    </>
  );
}

export default function Explore({ cachedExploreData }) {
  const { data: exploreData } = useExploreData({ placeholderData: cachedExploreData });

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
  return {
    props: {
      cachedExploreData: await getExploreData(),
    },
    revalidate: 600,
  };
}
