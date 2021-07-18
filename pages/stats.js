import { subDays } from 'date-fns';
import Head from 'next/head';

import Chart from '../components/stats/Chart';

import prisma from '../lib/prisma';
import { getSnapshots } from '../lib/db';

import { CHART_DAYS_DEFAULT } from '../lib/config';

const filterStats = (data, type) =>
  data
    .filter((snapshot) => snapshot.type === type && snapshot.value > 0)
    .map(({ timeStamp, value }) => ({ x: new Date(timeStamp), y: value }));

export default function Stats({ data, trackedChannels }) {
  const viewerData = filterStats(data, 'PEAKVIEWERS');
  const trackedChannelData = trackedChannels.map(({ date, value }) => ({
    x: new Date(date),
    y: value,
  }));

  return (
    <>
      <Head>
        <title>streamers.dev - Stats</title>
        <meta name='description' content='Stats on live-coding streamers' />
      </Head>

      <h1 className='text-center font-medium text-2xl sm:text-3xl mt-5'>Stats</h1>

      <div className='max-w-5xl mx-auto sm:px-7 py-4 sm:py-5'>
        <Chart type='line' title='Peak Viewers' data={viewerData} />
        <Chart type='line' title='Tracked Channels' data={trackedChannelData} />
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const data = await getSnapshots({
    types: ['PEAKVIEWERS', 'PEAKVIEWERS_CODING', 'PEAKVIEWERS_NONCODING', 'TRACKEDCHANNELS'],
    startDate: subDays(new Date(), CHART_DAYS_DEFAULT),
  });

  // Raw query, since I can't figure out max group by day
  const trackedChannels = await prisma.$queryRaw(`
    SELECT date("timeStamp") as date, MAX(value) as value, type
    FROM "Snapshot"
    WHERE type = 'TRACKEDCHANNELS'
    group by date, type
    ORDER BY date DESC
  `);

  return { props: { data, trackedChannels } };
}
