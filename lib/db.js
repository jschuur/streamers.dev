import { sub } from 'date-fns';
import { pick, map, keyBy, sortBy } from 'lodash';
import pluralize from 'pluralize';

import { TWITCH_CHANNEL_FIELDS } from './config';

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

  // Only save channels who are still online or who were previously online back to the DB unless using --fullDetails
  await prisma.$transaction(
    channels
      .filter((channel) => updateAll || channel.isLive || recentChannel[channel.twitchId].isLive)
      .map((channel) => {
        const data = pick(channel, fields);

        process.env.DEBUG && console.log(`Saving updates for ${channel.displayName}`);
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
    ...fields.reduce((acc, field) => ({ ...acc, [field]: true }), {}),
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
