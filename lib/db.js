import { pick, map, keyBy, sortBy } from 'lodash';
import pluralize from 'pluralize';
import { PrismaClient } from '@prisma/client';

import { TWITCH_USER_FIELDS } from './config';

const prisma = new PrismaClient(process.env.DEBUG ? { log: ['query'] } : {});

export async function disconnectDB() {
  return prisma.$disconnect();
}

// Saved users back to the database, sometimes only if they were had updates
export async function saveUpdatedUsers({
  users,
  lastUserState,
  updateAll = false,
  fields = TWITCH_USER_FIELDS,
}) {
  const recentUser = keyBy(lastUserState, 'twitchId');
  let updatesCount = 0;

  // Only save users who are still online or who were previously online back to the DB unless using --fullDetails
  await prisma.$transaction(
    users
      .filter((user) => updateAll || user.isLive || recentUser[user.twitchId].isLive)
      .map((user) => {
        const data = pick(user, fields);

        process.env.DEBUG && console.log(`Saving updates for ${user.displayName}`);
        updatesCount++;

        return prisma.user.update({
          where: { id: recentUser[user.twitchId].id },
          data,
        });
      })
  );

  // Mark all users as updated, since even those who didn't get updates saved were checked for being online
  await prisma.user.updateMany({
    where: {
      id: { in: map(lastUserState, 'id') },
    },
    data: {
      updatedAt: new Date(),
    },
  });

  console.log(`${pluralize('updated user', updatesCount, true)} saved.`);
}

export async function getUser({ name }) {
  return await prisma.user.findFirst({
    where: {
      name: {
        equals: name,
        mode: 'insensitive', // Default value: default
      },
    },
  });
}

export async function getUsers({
  includeHidden = false,
  includePaused = true,
  fields = TWITCH_USER_FIELDS,
} = {}) {
  const select = {
    ...fields.reduce((acc, field) => ({ ...acc, [field]: true }), {}),
    updatedAt: true,
  };

  const where = {};
  if (!includeHidden) where.isHidden = false;
  if (!includePaused) where.isPaused = false;

  return await prisma.user.findMany({ select, where });
}

export async function saveUsers({ users }) {
  return prisma.user.createMany({
    data: users.map((user) => pick(user, [...TWITCH_USER_FIELDS, 'isHidden', 'isPaused'])),
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

export async function getQueue() {
  const result = await prisma.queue.findMany({
    where: {
      status: 'PENDING',
    },
  });

  return sortBy(
    result.map((channel) =>
      pick(channel, ['id', 'name', 'title', 'language', 'views', 'viewers', 'tag'])
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
