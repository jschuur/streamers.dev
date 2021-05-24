import { pick, map } from 'lodash';
import { differenceInMinutes } from 'date-fns';
import pluralize from 'pluralize';
import { PrismaClient } from '@prisma/client';
import { ApiClient } from 'twitch';
import { ClientCredentialsAuthProvider } from 'twitch-auth';

import { MAX_STATUS_AGE_MINS, TWITCH_USER_FIELDS } from '../lib/config.js';

// TODO: Use RefreshableAuthProvider
const authProvider = new ClientCredentialsAuthProvider(
  process.env.TWITCH_CLIENT_ID,
  process.env.TWITCH_CLIENT_SECRET
);
const apiClient = new ApiClient({ authProvider });
const prisma = new PrismaClient();

export async function disconnectDB() {
  return prisma.$disconnect();
}

export async function getAllUserIds() {
  let id = 'twitchId';
  let users = await prisma.user.findMany({ select: { twitchId: true } });

  if (users.length === 0) {
    users = await apiClient.helix.users.getUsersByNames(DEFAULT_USERNAMES);
    id = 'id';
  }

  return users.map((user) => user[id]);
}

export async function getUsers({ fields }) {
  const select = {
    ...fields.reduce((acc, field) => ({ ...acc, [field]: true }), {}),
    updatedAt: true,
  };
  const users = await prisma.user.findMany({ select });

  await updateStatuses({ users });

  return users;
}

export async function updateStatuses({ users, updateAll, skipUpdate = false }) {
  // Find updateUsers user entries
  const now = new Date();
  const updateUsers = updateAll
    ? users
    : users.filter(({ updatedAt }) => differenceInMinutes(now, updatedAt) > MAX_STATUS_AGE_MINS);

  if (updateUsers.length) {
    console.log(`Refreshing status for ${pluralize('user', updateUsers.length, true)}...`);

    const liveStreams = (
      await apiClient.helix.streams.getStreams({ userId: map(updateUsers, 'twitchId') })
    ).data;

    console.log(`${pluralize('user', liveStreams.length, true)} live.`);
    updateUsers.forEach((user) => {
      const stream = liveStreams.find(({ userId }) => userId === user.twitchId);

      if (stream) {
        user.isLive = true;
        user.latestStreamTitle = stream.title;
        user.latestStreamStartedAt = stream.startDate;
        user.latestStreamViewers = stream.viewers;
        user.lastOnline = new Date();
      } else user.isLive = false;
    });

    if (!skipUpdate)
      await updateUserInfo({
        users: updateUsers,
        fields: ['isLive', 'latestStreamTitle', 'latestStreamStartedAt', 'lastOnline'],
      });
  }
}

export async function addNewUsers(userNames) {
  const users = await getUserInfoFromTwitch({ userNames, updateAll: true, skipUpdate: true });

  await prisma.user.createMany({
    data: users.map((user) => pick(user, TWITCH_USER_FIELDS)),
  });
}

export async function getUserInfoFromTwitch({
  userIds,
  userNames,
  addLiveStatus = true,
  updateAll = false,
  skipUpdate = false,
}) {
  if (userNames) userIds = map(await apiClient.helix.users.getUsersByNames(userNames), 'id');

  const users = await apiClient.helix.users.getUsersByIds(userIds);

  // Rename the 'id' field to twitchID
  users.forEach((user) => {
    user.twitchId = user.id;
    delete user.id;
  });

  // TODO: Get rid of this clunky skipUpdate thing
  if (addLiveStatus) await updateStatuses({ users, updateAll, skipUpdate });

  return users;
}

export async function getLiveStreams(userIds) {
  return (await apiClient.helix.streams.getStreams({ userId: userIds })).data;
}

export async function updateUserInfo({ users, fields = TWITCH_USER_FIELDS }) {
  await prisma.$transaction(users.map(user => {
    const { twitchId } = user;
    const data = pick(user, fields);

    return prisma.user.update({
      where: { twitchId },
      data,
    });
  }));
}

export async function updateAllUsers({ updateAll }) {
  const userIds = await getAllUserIds();
  const users = await getUserInfoFromTwitch({ userIds, updateAll });

  await updateUserInfo({ users });

  return users.length;
}
