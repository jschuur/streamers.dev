import { NextSeo } from 'next-seo';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import Loader from 'react-loader-spinner';

import Layout from '../components/Layout/Layout';
import Section from '../components/Layout/Section';
import Chart from '../components/Stats/Chart';

export function StatsCharts({ peakSnapshots, trackedChannelSnapshots }) {
  const [statsData, setStatsData] = useState(null);
  const [error, setError] = useState(null);
  const { theme } = useTheme();

  async function getStatsData() {
    const response = await fetch('/api/getStatsData');
    const data = await response.json();

    if (data.error) setError(data.channels);
    else {
      const { viewerSeries, channelSeries, trackedChannelSeries } = data.stats;

      setStatsData({ viewerSeries, channelSeries, trackedChannelSeries });
    }
  }

  useEffect(() => {
    getStatsData();
  }, []);

  if (!statsData)
    return (
      <Section className='p-2'>
        <div className='flex flex-col place-items-center'>
          <div className='pb-2'>Loading stats data...</div>
          <Loader
            type='Bars'
            color={theme === 'dark' ? '#ffffff' : '#000000'}
            height={24}
            width={24}
          />
        </div>
      </Section>
    );

  if (error) return <Section>Error: {error}</Section>;

  return (
    <>
      <Chart type='area' title='Viewers' group='viewer_channels' series={statsData.viewerSeries} />
      <Chart
        type='area'
        title='Channels'
        group='viewer_channels'
        series={statsData.channelSeries}
      />
      <Chart type='line' title='Tracked Channels' series={statsData.trackedChannelSeries} />
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
