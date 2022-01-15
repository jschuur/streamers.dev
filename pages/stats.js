import Layout from '../components/Layout/Layout';
import Section from '../components/Layout/Section';

import { getStatsData } from '../lib/stats';
import { useStatsData } from '../lib/api';

import { STATS_DATA_STALE_SECONDS } from '../lib/config';

import {
  ViewersChart,
  ChannelsChart,
  StreamsChart,
  LanguagesCharts,
  OriginsCharts,
  ChannelMap,
  LastStreamAgeChart,
  AccountTypeCharts,
} from '../components/Stats/StatsCharts';

export function StatsCharts({ data }) {
  if (!data) return <Section>Error: No stats data found</Section>;

  return (
    <>
      <ViewersChart data={data.viewerSeries} />
      <ChannelsChart data={data.channelSeries} />
      <StreamsChart data={data.streamsByDayData} />
      <LanguagesCharts
        data={{
          languagesByStreamsSeries: data.languagesByStreamsSeries,
          languagesByViewersSeries: data.languagesByViewersSeries,
        }}
      />
      <OriginsCharts
        data={{
          countriesByStreamsSeries: data.countriesByStreamsSeries,
          countriesByViewersSeries: data.countriesByViewersSeries,
        }}
      />
      <ChannelMap data={data.countriesByStreamersMapData} />
      <LastStreamAgeChart data={data.daysSinceOnlineData} />
      <AccountTypeCharts
        data={{
          channelTypeSeries: data.channelTypeSeries,
          broadcasterTypeSeries: data.broadcasterTypeSeries,
        }}
      />
    </>
  );
}

export default function Stats({ cachedStatsData }) {
  const { data: statsData } = useStatsData({ placeholderData: cachedStatsData });

  return (
    <Layout
      page='Stats'
      url='https://streamers.dev/stats'
      description='Stats on live-coding streamers'
    >
      <StatsCharts data={statsData.data} />
    </Layout>
  );
}

export async function getStaticProps() {
  return {
    props: {
      cachedStatsData: await getStatsData(),
    },
    revalidate: STATS_DATA_STALE_SECONDS,
  };
}
