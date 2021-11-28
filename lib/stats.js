import { subDays } from 'date-fns';
import { by639_1 } from 'iso-language-codes';
import countries from 'i18n-iso-countries';

import { map, sortBy, orderBy, groupBy, sumBy, inRange, countBy, flatMap } from 'lodash';

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

countries.registerLocale(require('i18n-iso-countries/langs/en.json'));

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
  // TODO: Can we do this without queryRaw?
  const trackedChannelSnapshots = await prisma.$queryRaw`
    SELECT date("timeStamp") as "timeStamp", MAX("trackedChannels") as "trackedChannels"
    FROM "Snapshot"
    group by date("timeStamp")
    ORDER BY date("timeStamp") DESC
  `;

  const trackedChannelSeries = [
    {
      name: 'Tracked Channels',
      data: buildChartData(trackedChannelSnapshots, 'trackedChannels'),
    },
  ];

  return { trackedChannelSeries };
}

async function daysSinceOnlineStats() {
  // TODO: Can we do this without queryRaw?
  const daysSinceOnlineBreakdown = await prisma.$queryRaw`
    SELECT CURRENT_DATE - date("lastOnline") as days, count(*) AS count
    FROM "Channel"
    WHERE "lastOnline" IS NOT NULL
    GROUP BY days
    ORDER BY days
  `;

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

async function languageStats() {
  const languageData = await prisma.channel.groupBy({
    by: ['latestStreamLanguage'],
    _count: { latestStreamLanguage: true },
    _sum: { latestStreamViewers: true },
    where: {
      isLive: true,
      isCoding: true,
      latestStreamLanguage: { not: null },
    },
  });

  const liveLanguagesByStreams = orderBy(
    languageData,
    ['_count.latestStreamLanguage'],
    ['desc']
  ).map((lang) => ({
    lang: by639_1[lang.latestStreamLanguage]?.name || lang.latestStreamLanguage,
    count: lang._count.latestStreamLanguage,
  }));
  const liveLanguagesByViewers = orderBy(languageData, ['_sum.latestStreamViewers'], ['desc']).map(
    (lang) => ({
      lang: by639_1[lang.latestStreamLanguage]?.name || lang.latestStreamLanguage,
      count: lang._sum.latestStreamViewers,
    })
  );

  const languagesByStreamsSeries = {
    labels: map(liveLanguagesByStreams, 'lang'),
    data: map(liveLanguagesByStreams, 'count'),
  };

  const languagesByViewersSeries = {
    labels: map(liveLanguagesByViewers, 'lang'),
    data: map(liveLanguagesByViewers, 'count'),
  };

  return { languagesByStreamsSeries, languagesByViewersSeries };
}

async function countryStats() {
  const totalChannels = await prisma.channel.count({
    where: { isHidden: false, isPaused: false },
  });

  const results = await prisma.channel.findMany({
    where: {
      isHidden: false,
      countries: {
        isEmpty: false,
      },
    },
    select: {
      countries: true,
      isCoding: true,
      isLive: true,
      latestStreamViewers: true,
    },
  });

  const countryDataLive = groupBy(
    flatMap(
      results
        .filter(({ isLive, isCoding }) => isLive && isCoding)
        .map(({ countries, latestStreamViewers: viewers }) =>
          countries.map((country) => ({
            name: country,
            viewers,
          }))
        )
    ),
    'name'
  );

  const countriesByStreams = orderBy(
    Object.keys(countryDataLive).map((countryCode) => ({
      name:
        countries.getName(countryCode.toUpperCase(), 'en', { select: 'official' }) || countryCode,
      count: countryDataLive[countryCode].length,
    })),
    ['count'],
    ['desc']
  );
  const countriesByViewers = orderBy(
    Object.keys(countryDataLive).map((countryCode) => ({
      name:
        countries.getName(countryCode.toUpperCase(), 'en', { select: 'official' }) || countryCode,
      viewers: sumBy(countryDataLive[countryCode], 'viewers'),
    })),
    ['viewers'],
    ['desc']
  );

  const countriesByStreamsSeries = {
    labels: map(countriesByStreams, 'name'),
    data: map(countriesByStreams, 'count'),
  };

  const countriesByViewersSeries = {
    labels: map(countriesByViewers, 'name'),
    data: map(countriesByViewers, 'viewers'),
  };

  const countriesByStreamersMapData = {
    countries: orderBy(
      Object.entries(countBy(flatMap(results.map(({ countries }) => countries)))).map(
        ([country, count]) => ({ country, value: count })
      ),
      ['value'],
      ['desc']
    ),
    totalChannels,
    channelsWithCountriesCount: results.length,
  };

  return {
    countriesByStreamsSeries,
    countriesByViewersSeries,
    countriesByStreamersMapData,
  };
}

export async function getStatsData() {
  return {
    ...(await viewerStats()),
    ...(await daysSinceOnlineStats()),
    ...(await trackedChannelStats()),
    ...(await languageStats()),
    ...(await countryStats()),
  };
}