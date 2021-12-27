import { sum } from 'lodash';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import Loader from '../components/Layout/Loader';

import Layout from '../components/Layout/Layout';
import Section from '../components/Layout/Section';
import ChannelMap from '../components/Stats/ChannelMap';
import { LineChart, BarChart, PieChart } from '../components/Stats/Chart';

export function StatsCharts() {
  const [statsData, setStatsData] = useState(null);
  const [error, setError] = useState(null);
  const { theme } = useTheme();

  const addValueToLegend = (seriesName, opts) =>
    `${seriesName} (${opts.w.globals.series[opts.seriesIndex]})`;

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
      <Section>
        <LineChart
          type='area'
          title='Viewers'
          group='viewer_channels'
          series={statsData.viewerSeries}
        />
      </Section>
      <Section>
        <LineChart
          type='area'
          title='Channels'
          group='viewer_channels'
          series={statsData.channelSeries}
        />
      </Section>

      <Section>
        <div className='grid grid-cols-1 md:grid-cols-2'>
          <PieChart
            section={false}
            title={`Languages by Live Streams (${sum(statsData.languagesByStreamsSeries.data)})`}
            options={{ legend: { position: 'bottom', formatter: addValueToLegend } }}
            labels={statsData.languagesByStreamsSeries.labels}
            series={statsData.languagesByStreamsSeries.data}
          />
          <PieChart
            section={false}
            title={`Languages by Live Viewers (${sum(statsData.languagesByViewersSeries.data)})`}
            options={{ legend: { position: 'bottom', formatter: addValueToLegend } }}
            labels={statsData.languagesByViewersSeries.labels}
            series={statsData.languagesByViewersSeries.data}
          />
        </div>
        <div className='p-3'>
          For currently live channels, marked as coding and based on the Twitch{' '}
          <a href='https://help.twitch.tv/s/article/languages-on-twitch?language=en_US#streamlang'>
            language
          </a>{' '}
          of the streamer being watched, not Twitch language tags or viewer language preferences.
        </div>
      </Section>

      <Section>
        <div className='grid grid-cols-1 md:grid-cols-2'>
          <PieChart
            title={`Channel Origin by Live Streams (${sum(
              statsData.languagesByStreamsSeries.data
            )})`}
            options={{ legend: { position: 'bottom', formatter: addValueToLegend } }}
            labels={statsData.countriesByStreamsSeries.labels}
            series={statsData.countriesByStreamsSeries.data}
          />
          <PieChart
            title={`Channel Origin by Live Viewers (${sum(
              statsData.languagesByViewersSeries.data
            )})`}
            options={{ legend: { position: 'bottom', formatter: addValueToLegend } }}
            labels={statsData.countriesByViewersSeries.labels}
            series={statsData.countriesByViewersSeries.data}
          />
        </div>
        <div className='p-3'>
          For currently live channels, marked as coding and based on both the current location and
          nationality of the streamer (not their viewers). Locations are manually curated, using
          public information from channel and social media profiles. Totals will be greater than
          channel/viewer counts if streamers live in a different location than their nationality.
        </div>
      </Section>

      <Section>
        <ChannelMap data={statsData.countriesByStreamersMapData} />
      </Section>

      <Section>
        <BarChart
          title='Channels by Last Streamed Age'
          categories={statsData.daysSinceOnlineSeries.categories}
          data={statsData.daysSinceOnlineSeries.data}
        />
      </Section>

      <Section>
        <LineChart
          type='line'
          title='Total Tracked Channels'
          series={statsData.trackedChannelSeries}
        />
      </Section>
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
