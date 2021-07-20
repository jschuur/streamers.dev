import { subDays } from 'date-fns';
import Head from 'next/head';

import Chart from '../components/stats/Chart';

import prisma from '../lib/prisma';
import { getSnapshots } from '../lib/db';

import { CHART_DAYS_DEFAULT } from '../lib/config';

const buildChartData = (data, field) =>
  data
    .filter((snapshot) => snapshot[field] > 0)
    .map((snapshot) => ({ x: new Date(snapshot.timeStamp), y: snapshot[field] }));

export default function Stats({ peakSnapshots, trackedChannelSnapshots }) {
  const viewerSeries = [
    { name: 'Live Tracked Viewers', data: buildChartData(peakSnapshots, 'totalLiveViewers') },
    {
      name: 'Peak Coding Stream Viewers',
      data: buildChartData(peakSnapshots, 'peakLiveCodingViewers'),
    },
  ];
  const channelSeries = [
    { name: 'Live Tracked Channels', data: buildChartData(peakSnapshots, 'totalLiveChannels') },
    {
      name: 'Peak Coding Stream Channels',
      data: buildChartData(peakSnapshots, 'peakLiveCodingChannels'),
    },
  ];

  const trackedChannelSeries = [
    { name: 'Tracked Channels', data: buildChartData(trackedChannelSnapshots, 'trackedChannels') },
  ];

  return (
    <>
      <Head>
        <title>streamers.dev - Stats</title>
        <meta name='description' content='Stats on live-coding streamers' />
      </Head>

      <h1 className='text-center font-medium text-2xl sm:text-3xl mt-5'>Stats</h1>

      <div className='max-w-5xl mx-auto sm:px-7 py-4 sm:py-5'>
        <Chart type='area' title='Viewers' group='viewer_channels' series={viewerSeries} />
        <Chart type='area' title='Channels' group='viewer_channels' series={channelSeries} />
        <Chart type='line' title='Tracked Channels' series={trackedChannelSeries} />
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const peakSnapshots = await getSnapshots({
    startDate: subDays(new Date(), CHART_DAYS_DEFAULT),
  });

  // Raw query, since I can't figure out max group by day
  const trackedChannelSnapshots = await prisma.$queryRaw(`
    SELECT date("timeStamp") as "timeStamp", MAX("trackedChannels") as "trackedChannels"
    FROM "Snapshot"
    group by date("timeStamp")
    ORDER BY date("timeStamp") DESC
  `);

  return { props: { peakSnapshots, trackedChannelSnapshots } };
}
