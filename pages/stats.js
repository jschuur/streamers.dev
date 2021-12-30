import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

import Loader from '../components/Layout/Loader';
import Layout from '../components/Layout/Layout';
import Section from '../components/Layout/Section';

import {
  ViewersChart,
  ChannelsChart,
  StreamsChart,
  LanguagesCharts,
  OriginsCharts,
  ChannelMap,
  LastStreamAgeChart,
  TotalChannelsChart,
} from '../components/Stats/StatsCharts';

export function StatsCharts() {
  const [statsData, setStatsData] = useState(null);
  const [error, setError] = useState(null);
  const { theme } = useTheme();

  async function getStatsData() {
    const response = await fetch('/api/getStatsData');
    const data = await response.json();

    if (data.error) setError(data.channels);
    else setStatsData({ ...data.stats });
  }

  useEffect(() => {
    getStatsData();
  }, []);

  if (!statsData)
    return (
      <Section className='p-2'>
        <Loader message='Loading stats data...' theme={theme} />
      </Section>
    );

  if (error) return <Section>Error: {error}</Section>;

  const {
    viewerSeries,
    channelSeries,
    streamsByDaySeries,
    languagesByStreamsSeries,
    languagesByViewersSeries,
    countriesByStreamsSeries,
    countriesByViewersSeries,
    countriesByStreamersMapData,
    daysSinceOnlineSeries,
    trackedChannelSeries,
  } = statsData;

  return (
    <>
      <ViewersChart data={viewerSeries} />
      <ChannelsChart data={channelSeries} />
      <StreamsChart data={streamsByDaySeries} />
      <LanguagesCharts data={{ languagesByStreamsSeries, languagesByViewersSeries }} />
      <OriginsCharts data={{ countriesByStreamsSeries, countriesByViewersSeries }} />
      <ChannelMap data={countriesByStreamersMapData} />
      <LastStreamAgeChart data={daysSinceOnlineSeries} />
      <TotalChannelsChart data={trackedChannelSeries} />
    </>
  );
}

export default function Stats() {
  return (
    <Layout
      page='Stats'
      url='https://streamers.dev/stats'
      description='Stats on live-coding streamers'
    >
      <StatsCharts />
    </Layout>
  );
}
