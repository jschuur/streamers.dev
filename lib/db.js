import { pick, map, keyBy } from 'lodash';
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
      id: { in: map(lastUserState, 'id')},
    },
    data: {
      updatedAt: new Date(),
    },
  });

  console.log(`${pluralize('updated user', updatesCount, true)} saved.`);;;
}

export async function getUser({ userName }) {
  return await prisma.user.findFirst({
    where: {
      name: {
        equals: userName,
        mode: 'insensitive', // Default value: default
      },
    },
  });
}

export async function getUsers({ fields = TWITCH_USER_FIELDS } = {}) {
  // TODO: Add filter for hidden users here

  const select = {
    ...fields.reduce((acc, field) => ({ ...acc, [field]: true }), {}),
    updatedAt: true,
  };

  return await prisma.user.findMany({ select });
}

export async function saveUsers({ users }) {
  return prisma.user.createMany({
    data: users.map((user) => pick(user, TWITCH_USER_FIELDS)),
  });
}
