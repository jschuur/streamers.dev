import { NextSeo } from 'next-seo';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import Loader from '../components/Layout/Loader';

import Layout from '../components/Layout/Layout';
import Section from '../components/Layout/Section';
import { LineChart, BarChart } from '../components/Stats/Chart';

export function StatsCharts({ peakSnapshots, trackedChannelSnapshots }) {
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

  return (
    <>
      <LineChart
        type='area'
        title='Viewers'
        group='viewer_channels'
        series={statsData.viewerSeries}
      />
      <LineChart
        type='area'
        title='Channels'
        group='viewer_channels'
        series={statsData.channelSeries}
      />
      <BarChart
        title='Channels by Last Streamed Age'
        categories={statsData.daysSinceOnlineSeries.categories}
        data={statsData.daysSinceOnlineSeries.data}
      />{' '}
      <LineChart
        type='line'
        title='Total Tracked Channels'
        series={statsData.trackedChannelSeries}
      />
    </>
  );
}

export default function Stats() {
  return (
    <Layout
      page='Stats'
      url='https://streamers.dev/stats'
      description='Stats on live-coding streamers.'
    >
      <StatsCharts />
    </Layout>
  );
}
