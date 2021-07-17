import { sub } from 'date-fns';
import { pick, map, keyBy, sortBy } from 'lodash';
import pluralize from 'pluralize';

import { shallowEq, selectFromFields } from './util';

import {
  TWITCH_CHANNEL_FIELDS,
  PROFILE_CHANGE_FIELDS,
  OFFLINE_CHANNEL_FIELDS,
  OFFLINE_CHANNELS_LIMIT,
  OFFLINE_CHANNELS_RECENT_DAYS,
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

      process.env.DEBUG &&
        console.log(`Saving updates for ${channel.displayName} (${channel.latestStreamTags})`);
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

  console.log(`${pluralize('updated channel', updatesCount, true)} saved.`);
}

export async function getChannel({ name }) {
  return await prisma.channel.findFirst({
    where: {
      name: {
        equals: name,
        mode: 'insensitive', // Default value: default
      },
    },
  });
}

export async function getChannels({
  includeHidden = false,
  includePaused = true,
  fields = TWITCH_CHANNEL_FIELDS,
} = {}) {
  const select = {
    ...selectFromFields(fields),
    updatedAt: true,
  };

  const where = {};
  if (!includeHidden) where.isHidden = false;
  if (!includePaused) where.isPaused = false;

  return await prisma.channel.findMany({ select, where });
}

export async function saveChannels({ channels }) {
  return prisma.channel.createMany({
    data: channels.map((channel) =>
      pick(channel, [...TWITCH_CHANNEL_FIELDS, 'isHidden', 'isPaused'])
    ),
  });
}

export async function getSnapshots({ type = 'PEAKVIEWERS', limit = 24 } = {}) {
  return prisma.snapshot.findMany({
    select: { timeStamp: true, value: true },
    where: {
      type,
    },
    orderBy: [
      {
        timeStamp: 'desc',
      },
    ],
    take: parseInt(limit),
  });
}

export async function getQueue({ days, filterField = 'updatedAt' }) {
  const where = {
    status: 'PENDING',
  };
  if (days)
    where[filterField] = {
      gte: sub(new Date(), { days }),
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

export async function updateQueueItem({ id, status }) {
  return prisma.queue.update({
    where: {
      id,
    },
    data: {
      status,
    },
    select: {
      name: true,
    },
  });
}

export async function getKeywords() {
  return prisma.keyword.findMany();
}

// Get a list of recently online channels that streamed under a particular topic
export async function getOfflineChannels({ topic, lang }) {
  const select = selectFromFields(OFFLINE_CHANNEL_FIELDS);
  const where = {
    latestStreamTags: {
      has: topic,
    },
    isLive: false,
    lastOnline: {
      gt: sub(new Date(), { days: OFFLINE_CHANNELS_RECENT_DAYS }),
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
