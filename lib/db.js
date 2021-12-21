import { subDays } from 'date-fns';
import { pick, map, keyBy, sortBy, merge, uniq, flatMap } from 'lodash';
import pluralize from 'pluralize';

import { shallowEq, selectFromFields, formatPercentage } from './util';
import logger from './logger';

import {
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

  logger.info(`Saving updated channels...`);

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

  logger.info(`...${pluralize('updated channel', updatesCount, true)} saved.`);
}

export async function saveStreamData(channels) {
  let newStreams = 0;

  channels.forEach((channel) => {
    if (
      !channel?.streams[0] ||
      channel?.streams?.[0].twitchStreamId !== channel.latestStreamTwitchId
    )
      newStreams++;
  });
  logger.info(`Saving stream data (${pluralize('new stream', newStreams, true)})...`);

  for (const channel of channels) await createOrUpdateStream(channel);
}

async function createOrUpdateStream(channel) {
  const {
    id: channelId,
    latestStreamTitle: title,
    latestStreamTwitchId: twitchStreamId,
    latestStreamGameName: gameName,
    latestStreamLanguage: language,
    latestStreamViewers: viewers,
    latestStreamPeakViewers: peakViewers,
    latestStreamStartedAt: startedAt,
    latestStreamTwitchTags: twitchTags,
    latestStreamTags: tags,
    isCoding,
    isLive,
  } = channel;

  const data = {
    startedAt,
    title,
    gameName,
    language,
    viewers,
    peakViewers,
    twitchTags,
    tags,
    isCoding,
    isLive,
  };

  if (isLive) data.lastOnline = new Date();

  // TODO: Only save if there's a change?

  await prisma.stream.upsert({
    where: {
      twitchStreamId,
    },
    update: data,
    create: { data, ...twitchStreamId },
  });
}

export async function getChannel(where) {
  return await prisma.channel.findFirst({ where });
}

export async function getChannels({
  includeHidden = false,
  includePaused = false,
  isLive,
  minDaysSinceOnline = 0,
  maxDaysSinceOnline,
  updatePercentage,
  fields = TWITCH_CHANNEL_FIELDS,
  now,
} = {}) {
  const query = {
    select: {
      ...selectFromFields(fields),
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      streams: {
        take: 1,
      },
    },
  };

  const where = {};
  if (!includeHidden) where.isHidden = false;
  if (!includePaused) where.isPaused = false;
  if (isLive !== undefined) where.isLive = isLive;

  // Filter by recently online
  if (minDaysSinceOnline || maxDaysSinceOnline) {
    const dateFilter = {};

    if (minDaysSinceOnline && !maxDaysSinceOnline) {
      // Include channels that were never online too
      where.OR = [
        {
          lastOnline: null,
        },
        {
          lastOnline: {
            lt: subDays(now, minDaysSinceOnline),
          },
        },
      ];
    } else {
      if (minDaysSinceOnline) dateFilter.lt = subDays(now, minDaysSinceOnline);
      if (maxDaysSinceOnline) dateFilter.gte = subDays(now, maxDaysSinceOnline);

      where.lastOnline = dateFilter;
    }
  }

  // Only get a certain percentage of the channels, based on updatedAt time.
  // Used for staggered updates of channels that haven't been online recently.
  if (updatePercentage < 1) {
    const count = await prisma.channel.count({ where });
    const partialCount = Math.ceil(count * updatePercentage);

    logger.info(
      `Querying partial channel range: ${partialCount} of ${count} ${pluralize(
        'channel',
        partialCount
      )} (${formatPercentage(updatePercentage)})`
    );

    merge(query, {
      orderBy: {
        updatedAt: 'asc',
      },
      take: partialCount,
    });
  }

  merge(query, { where });
  logger.verbose(`getChannels query: ${JSON.stringify(query, null, 2)}`);

  return prisma.channel.findMany(query);
}

export async function saveChannels({ channels }) {
  return prisma.channel.createMany({
    data: channels.map((channel) =>
      pick(channel, [...TWITCH_CHANNEL_FIELDS, 'isHidden', 'isPaused'])
    ),
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

// Get a list of recently added channels with no profile details, that can be
// reviewed via the admin dashboard
export function getRecentChannels() {
  return prisma.channel.findMany({
    select: {
      name: true,
      displayName: true,
      createdAt: true,
      profilePictureUrl: true,
      countries: true,
    },
    where: {
      createdAt: {
        gte: subDays(new Date(), 7),
      },
      isHidden: false,
      fullName: null,
      countries: { equals: null },
      homepage: null,
      youtube: null,
      twitter: null,
      github: null,
      discord: null,
      instagram: null,
    },
  });
}
export async function getTrackedChannelCount() {
  const result = await prisma.channel.count({
    where: {
      isHidden: false,
      isPaused: false,
    },
  });

  return result || 0;
}

export async function getDistinctCountryCount() {
  const result = await prisma.channel.findMany({
    where: { isHidden: false, isPaused: false, countries: { isEmpty: false } },
    select: { countries: true },
  });

  return uniq(flatMap(result, 'countries')).length || 0;
}
