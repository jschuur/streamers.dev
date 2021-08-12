import { subDays } from 'date-fns';
import { pick, map, keyBy, sortBy, merge } from 'lodash';
import pluralize from 'pluralize';

import { shallowEq, selectFromFields } from './util';
import logger from './logger';

import {
  CHART_DAYS_DEFAULT,
  TWITCH_CHANNEL_FIELDS,
  PROFILE_CHANGE_FIELDS,
  OFFLINE_CHANNEL_FIELDS,
  OFFLINE_CHANNELS_LIMIT,
  OFFLINE_CHANNELS_RECENT_DAYS,
  SNAPSHOT_VALUE_FIELDS,
} from './config';

import prisma from './prisma';

export async function disconnectDB() {
  return prisma.$disconnect();
}

// Save channels back to the database, sometimes only if they were had updates
export async function saveUpdatedChannels({
  channels,
  lastChannelState,
  updateAll = false,
  fields = TWITCH_CHANNEL_FIELDS,
}) {
  const recentChannel = keyBy(lastChannelState, 'twitchId');
  let updatesCount = 0;

  // Save updates if a channel is live, was recently live, or other profile fields
  // that are updatable are modified (if doing a full update)
  function hasUpdated(channel) {
    const { isLive, twitchId } = channel;
    const currentUpdatableFields = pick(channel, PROFILE_CHANGE_FIELDS),
      recentUpdatableFields = pick(recentChannel[twitchId], PROFILE_CHANGE_FIELDS);

    return (
      (updateAll && !shallowEq(currentUpdatableFields, recentUpdatableFields)) ||
      isLive ||
      recentChannel[twitchId].isLive
    );
  }

  // Only save channels who are still online or who were previously online back to the DB unless using --fullDetails
  await prisma.$transaction(
    channels.filter(hasUpdated).map((channel) => {
      const data = pick(channel, fields);

      logger.verbose(`Saving updates for ${channel.displayName} (${channel.latestStreamTags})`);
      updatesCount++;

      return prisma.channel.update({
        where: { id: recentChannel[channel.twitchId].id },
        data,
      });
    })
  );

  // Mark all channels as updated, since even those who didn't get updates saved were checked for being online
  await prisma.channel.updateMany({
    where: {
      id: { in: map(lastChannelState, 'id') },
    },
    data: {
      updatedAt: new Date(),
    },
  });

  logger.info(`${pluralize('updated channel', updatesCount, true)} saved.`);
}

export async function getChannel(where) {
  return await prisma.channel.findFirst({ where });
}

export async function getChannels({
  includeHidden = false,
  includePaused = true,
  isLive,
  fields = TWITCH_CHANNEL_FIELDS,
} = {}) {
  const select = {
    ...selectFromFields(fields),
    updatedAt: true,
  };

  const where = {};
  if (!includeHidden) where.isHidden = false;
  if (!includePaused) where.isPaused = false;
  if (isLive !== undefined) where.isLive = isLive;

  return await prisma.channel.findMany({ select, where });
}

export async function saveChannels({ channels }) {
  return prisma.channel.createMany({
    data: channels.map((channel) =>
      pick(channel, [...TWITCH_CHANNEL_FIELDS, 'isHidden', 'isPaused'])
    ),
  });
}

export async function getSnapshots({ fields = SNAPSHOT_VALUE_FIELDS, startDate } = {}) {
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

export async function getQueue({ days, filterField = 'updatedAt' }) {
  const where = {
    status: 'PENDING',
  };
  if (days)
    where[filterField] = {
      gte: subDays(new Date(), days),
    };

  const result = await prisma.queue.findMany({ where });

  return sortBy(
    result.map((channel) =>
      pick(channel, [
        'id',
        'name',
        'title',
        'language',
        'views',
        'viewers',
        'tag',
        'createdAt',
        'updatedAt',
      ])
    ),
    'views'
  ).reverse();
}

export async function getQueueItem(where) {
  return prisma.queue.findFirst({ where });
}

export async function addOrUpdateQueueItem({
  stream = {},
  user,
  id,
  twitchId,
  status,
  tagName = '(Other Sources)',
}) {
  const options = {
    update: {
      updatedAt: new Date(),
    },
    select: { id: true, name: true, createdAt: true },
  };

  if (id) merge(options, { where: { id } });
  else if (twitchId) merge(options, { where: { twitchId } });

  if (user) {
    merge(options, {
      update: {
        title: stream?.title || '',
        language: stream?.language || '',
        views: user.views,
        viewers: stream?.viewers || 0,
      },
      create: {
        twitchId,
        name: user.name,
        title: stream?.title || '',
        language: stream?.language || '',
        tag: tagName,
        views: user.views,
        viewers: stream?.viewers || 0,
      },
    });
  }

  if (status) {
    merge(options, {
      update: { status },
      create: { status },
    });
  }

  return prisma.queue.upsert(options);
}

export async function updateQueueItemStatus({ id, twitchId, status }) {
  const options = {
    data: {
      status,
      updatedAt: new Date(),
    },
    select: {
      name: true,
    },
  };

  if (id) merge(options, { where: { id } });
  else if (twitchId) merge(options, { where: { twitchId } });

  return prisma.queue.update(options);
}

export async function getKeywords() {
  return prisma.keyword.findMany();
}

// Get a list of recently online channels that streamed under a particular topic
export async function getOfflineChannels({ topic, lang }) {
  const select = selectFromFields(OFFLINE_CHANNEL_FIELDS);
  const where = {
    allStreamTags: {
      has: topic,
    },
    isLive: false,
    lastOnline: {
      gt: subDays(new Date(), OFFLINE_CHANNELS_RECENT_DAYS),
    },
  };

  if (lang === 'english') where.latestStreamLanguage = 'en';
  else if (lang === 'notenglish') where.NOT = { latestStreamLanguage: 'en' };

  const params = {
    select,
    where,
    orderBy: {
      latestStreamPeakViewers: 'desc',
    },
    take: OFFLINE_CHANNELS_LIMIT,
  };

  return await prisma.channel.findMany(params);
}

const buildChartData = (data, field) =>
  data
    .filter((snapshot) => snapshot[field] > 0)
    .map((snapshot) => ({ x: new Date(snapshot.timeStamp), y: snapshot[field] }));

export async function getStatsData() {
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

  const trackedChannelSeries = [
    {
      name: 'Tracked Channels',
      data: buildChartData(trackedChannelSnapshots, 'trackedChannels'),
    },
  ];

  return { viewerSeries, channelSeries, trackedChannelSeries };
}

export function getNewChannels() {
  return prisma.channel.findMany({
    select: {
      name: true,
      createdAt: true,
    },
    where: {
      createdAt: {
        gte: subDays(new Date(), 7),
      },
      isHidden: false,
      fullName: null,
      country: null,
      homepage: null,
      youtube: null,
      twitter: null,
      github: null,
      discord: null,
      instagram: null,
    },
  });
}