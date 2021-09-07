import { subDays } from 'date-fns';
import { map, sortBy, sumBy, inRange } from 'lodash';

import { selectFromFields } from './util';
import prisma from './prisma';

import {
  CHART_DAYS_DEFAULT,
  TWITCH_CHANNEL_FIELDS,
  PROFILE_CHANGE_FIELDS,
  OFFLINE_CHANNEL_FIELDS,
  OFFLINE_CHANNELS_LIMIT,
  OFFLINE_CHANNELS_RECENT_DAYS,
  SNAPSHOT_VALUE_FIELDS,
} from './config';

async function getSnapshots({ fields = SNAPSHOT_VALUE_FIELDS, startDate } = {}) {
  let where = {};
  if (startDate) where.timeStamp = { gte: startDate };

  return prisma.snapshot.findMany({
    select: selectFromFields(['timeStamp', ...fields]),
    where,
    orderBy: [
      {
        timeStamp: 'desc',
      },
    ],
  });
}

const buildChartData = (data, field) =>
  data
    .filter((snapshot) => snapshot[field] > 0)
    .map((snapshot) => ({ x: new Date(snapshot.timeStamp), y: snapshot[field] }));

async function viewerStats() {
  const peakSnapshots = await getSnapshots({
    startDate: subDays(new Date(), CHART_DAYS_DEFAULT),
  });

  const viewerSeries = [
    { name: 'Live Tracked Viewers', data: buildChartData(peakSnapshots, 'totalLiveViewers') },
    {
      name: 'Peak Coding Stream Viewers',
      data: buildChartData(peakSnapshots, 'peakLiveCodingViewers'),
    },
  ];
  const channelSeries = [
    {
      name: 'Live Tracked Channels',
      data: buildChartData(peakSnapshots, 'totalLiveChannels'),
    },
    {
      name: 'Peak Coding Stream Channels',
      data: buildChartData(peakSnapshots, 'peakLiveCodingChannels'),
    },
  ];

  return { viewerSeries, channelSeries };
}

async function trackedChannelStats() {
  // Raw query, since I can't figure out max group by day
  const trackedChannelSnapshots = await prisma.$queryRaw(`
    SELECT date("timeStamp") as "timeStamp", MAX("trackedChannels") as "trackedChannels"
    FROM "Snapshot"
    group by date("timeStamp")
    ORDER BY date("timeStamp") DESC
  `);

  const trackedChannelSeries = [
    {
      name: 'Tracked Channels',
      data: buildChartData(trackedChannelSnapshots, 'trackedChannels'),
    },
  ];

  return { trackedChannelSeries };
}

async function daysSinceOnlineStats() {
  const daysSinceOnlineBreakdown = await prisma.$queryRaw(`
    SELECT CURRENT_DATE - date("lastOnline") as days, count(*) AS count
    FROM "Channel"
    WHERE "lastOnline" IS NOT NULL
    GROUP BY days
    ORDER BY days
  `);

  const daysSinceOnlineSeries = {
    categories: [
      'last 24 hours',
      '1-2 days',
      '3-6 days',
      '7-13 days',
      '14-20 days',
      '21-27 days',
      '28+ days',
    ],
    data: [
      daysSinceOnlineBreakdown.find(({ days }) => days === 0)?.count || 0,
      sumBy(
        daysSinceOnlineBreakdown.filter(({ days }) => inRange(days, 1, 2)),
        'count'
      ) || 0,
      sumBy(
        daysSinceOnlineBreakdown.filter(({ days }) => inRange(days, 3, 6)),
        'count'
      ) || 0,
      sumBy(
        daysSinceOnlineBreakdown.filter(({ days }) => inRange(days, 7, 13)),
        'count'
      ) || 0,
      sumBy(
        daysSinceOnlineBreakdown.filter(({ days }) => inRange(days, 14, 20)),
        'count'
      ) || 0,
      sumBy(
        daysSinceOnlineBreakdown.filter(({ days }) => inRange(days, 21, 27)),
        'count'
      ) || 0,
      sumBy(
        daysSinceOnlineBreakdown.filter(({ days }) => days >= 28),
        'count'
      ),
    ],
  };

  return { daysSinceOnlineSeries };
}

export async function getStatsData() {
  return {
    ...(await viewerStats()),
    ...(await daysSinceOnlineStats()),
    ...(await trackedChannelStats()),
  };
}
