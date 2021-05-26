import { pick, map } from 'lodash';
import { PrismaClient } from '@prisma/client';

import { updateUserStatuses } from './twitch';

import { TWITCH_USER_FIELDS } from './config';

const prisma = new PrismaClient(process.env.DEBUG ? { log: ['query'] } : {});

export async function disconnectDB() {
  return prisma.$disconnect();
}

export async function saveUpdatedUsers({ users, fields = TWITCH_USER_FIELDS }) {
  await prisma.$transaction(
    users.map((user) => {
      const { twitchId } = user;
      const data = pick(user, fields);

      // TODO: Use id to optimise for Prisma
      return prisma.user.update({
        where: { twitchId },
        data,
      });
    })
  );
}

export async function getAllUserTwitchIds() {
  const users = await prisma.user.findMany({ select: { twitchId: true } });

  return map(users, 'twitchId');
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

export async function getUsers({ fields = TWITCH_USER_FIELDS, updateAll }) {
  // TODO: Add filter for hidden users here

  const select = {
    ...fields.reduce((acc, field) => ({ ...acc, [field]: true }), {}),
    updatedAt: true,
  };
  const users = await prisma.user.findMany({ select });

  // TODO: convert dates

  // Add in updated status info in case user data is outdated
  await updateUserStatuses({ users, updateAll });

  return users;
}

export async function saveUsers({ users }) {
  await prisma.user.createMany({
    data: users.map((user) => pick(user, TWITCH_USER_FIELDS)),
  });
}
