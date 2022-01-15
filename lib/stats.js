import { subDays } from 'date-fns';
import { by639_1 } from 'iso-language-codes';
import countries from 'i18n-iso-countries';

import { map, orderBy, groupBy, sumBy, inRange, countBy, flatMap } from 'lodash';

import { selectFromFields, cleanupAggregationResults, uppercaseFirst } from './util';
import prisma from './prisma';

import { CHART_DAYS_DEFAULT, SNAPSHOT_VALUE_FIELDS, STATS_RECENT_STREAMS_DAYS } from './config';

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

const buildChartData = (data, field = 'count') =>
  data
    .filter((snapshot) => snapshot[field] > 0)
    .map((snapshot) => ({ x: new Date(snapshot.timeStamp), y: snapshot[field] }));

const buildChartTimeCategories = (data, field = 'timeStamp') =>
  data.map((row) => new Date(row[field]));

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

// eslint-disable-next-line no-unused-vars
async function trackedChannelStats() {
  // Raw query, since I can't figure out max group by day
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

  const countByStreamAge = (start, end) =>
    sumBy(
      daysSinceOnlineBreakdown.filter(({ days }) => inRange(days, start, end)),
      'count'
    ) || 0;

  const daysSinceOnlineData = {
    categories: [
      'last 24 hours',
      '1-2 days',
      '3-6 days',
      '7-13 days',
      '14-20 days',
      '21-27 days',
      '28+ days',
    ],
    series: [
      {
        name: 'Channels',
        data: [
          daysSinceOnlineBreakdown.find(({ days }) => days === 0)?.count || 0,
          countByStreamAge(1, 2),
          countByStreamAge(3, 6),
          countByStreamAge(7, 13),
          countByStreamAge(14, 20),
          countByStreamAge(21, 2),
          sumBy(
            daysSinceOnlineBreakdown.filter(({ days }) => days >= 28),
            'count'
          ),
        ],
      },
    ],
  };

  return { daysSinceOnlineData };
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

async function streamStats() {
  // TODO: More queries to rewrite using either queryRaw or prisma.strean.gropBy when supported
  const findStreamCount = (streams, date) =>
    streams.find((stream) => stream.timeStamp === date)?.count || 0;

  const streamsByDayTotal = await prisma.$queryRawUnsafe(`
    SELECT
        DATE("startedAt") AS "timeStamp", count(*) AS count
    FROM "Stream"
    WHERE
        DATE("startedAt") > CURRENT_DATE - INTERVAL '${STATS_RECENT_STREAMS_DAYS} day'
    GROUP BY
        DATE("startedAt")
    ORDER BY
        "timeStamp" ASC`);
  const streamDates = streamsByDayTotal.map(({ timeStamp }) => timeStamp);

  const streamsByDayNonCoding = await prisma.$queryRawUnsafe(`
    SELECT
        DATE("startedAt") AS "timeStamp", count(*) AS count
    FROM "Stream"
    WHERE
        DATE("startedAt") > CURRENT_DATE - INTERVAL '${STATS_RECENT_STREAMS_DAYS} day' AND
        NOT('CODING' = ANY ("streamType"))
    GROUP BY
        DATE("startedAt")
    ORDER BY
        "timeStamp" ASC`);

  const streamsByDayOnlyCoding = await prisma.$queryRawUnsafe(`
    SELECT
        DATE("startedAt") AS "timeStamp", count(*) AS count
    FROM "Stream"
    WHERE
        DATE("startedAt") > CURRENT_DATE - INTERVAL '${STATS_RECENT_STREAMS_DAYS} day' AND
        "streamType" = ARRAY['CODING']::"StreamType"[]
    GROUP BY
        DATE("startedAt")
    ORDER BY
        "timeStamp" ASC`);

  const streamsByDaySomeCoding = await prisma.$queryRawUnsafe(`
    SELECT
        DATE("startedAt") AS "timeStamp", count(*) AS count
    FROM "Stream"
    WHERE
        DATE("startedAt") > CURRENT_DATE - INTERVAL '${STATS_RECENT_STREAMS_DAYS} day' AND
        array_length("streamType", 1) != 1 AND 'CODING' = ANY ("streamType")
    GROUP BY
        DATE("startedAt")
    ORDER BY
        "timeStamp" ASC`);

  const streamsByDayData = {
    categories: buildChartTimeCategories(streamsByDayNonCoding),
    totals: streamsByDayTotal.map((row) => row.count),
    series: [
      {
        name: 'Only Coding',
        data: streamDates.map((date) => findStreamCount(streamsByDayOnlyCoding, date)),
      },
      {
        name: 'Some Coding',
        data: streamDates.map((date) => findStreamCount(streamsByDaySomeCoding, date)),
      },
      {
        name: 'Non Coding',
        data: streamDates.map((date) => findStreamCount(streamsByDayNonCoding, date)),
      },
    ],
  };

  return { streamsByDayData };
}

async function accountStats() {
  const where = {
    isHidden: false,
    isPaused: false,
  };

  const channelTypes = cleanupAggregationResults({
    data: await prisma.channel.groupBy({
      by: ['channelType'],
      _count: { twitchId: true },
      where,
    }),
    type: 'count',
  });

  const broadcasterTypes = cleanupAggregationResults({
    data: await prisma.channel.groupBy({
      by: ['broadcasterType'],
      _count: { twitchId: true },
      where,
    }),
    type: 'count',
  });

  const channelTypeSeries = {
    labels: map(map(channelTypes, 'channelType'), (type) => uppercaseFirst(type)),
    data: map(channelTypes, 'count'),
  };

  const broadcasterTypeSeries = {
    labels: map(map(broadcasterTypes, 'broadcasterType'), (type) =>
      type === '' ? 'Standard' : uppercaseFirst(type)
    ),
    data: map(broadcasterTypes, 'count'),
  };

  return { channelTypeSeries, broadcasterTypeSeries };
}

export async function getStatsData() {
  return {
    _createdAt: new Date(),
    data: {
      ...(await viewerStats()),
      ...(await daysSinceOnlineStats()),
      // ...(await trackedChannelStats()),
      ...(await languageStats()),
      ...(await countryStats()),
      ...(await streamStats()),
      ...(await accountStats()),
    },
  };
}