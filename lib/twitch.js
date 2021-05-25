import { map } from 'lodash';
import { differenceInSeconds } from 'date-fns';
import pluralize from 'pluralize';

import { twitchGetStreams, twitchGetUsersByIds, twitchGetUsersByNames } from './twitch_api';

import { MAX_STATUS_AGE_SECONDS } from '../lib/config';

// Hit the Twitch API for info on a set of user IDs or names
export async function getUserInfoFromTwitch({ userIds, userNames, updateAll = false }) {
  const users = await (userIds
    ? twitchGetUsersByIds(userIds)
    : twitchGetUsersByNames(userNames));

  // Rename the 'id' field to twitchID
  users.forEach((user) => {
    user.twitchId = user.id;
    delete user.id;
  });

  // Add details from the current stream for live users
  await updateUserStatuses({ users, updateAll });

  return users;
}

// Update a list of users with the latest stream centric data from Twitch
export async function updateUserStatuses({ users, updateAll }) {
  // Find outdated user entries
  const now = new Date();
  const usersToUpdate = updateAll
    ? users
    : users.filter(({ updatedAt }) => differenceInSeconds(now, updatedAt) > MAX_STATUS_AGE_SECONDS);

  if (usersToUpdate?.length) {
    console.log(`Refreshing status for ${pluralize('user', usersToUpdate.length, true)}...`);

    const liveStreams = await twitchGetStreams(map(usersToUpdate, 'twitchId'));
    console.log(`${pluralize('user', liveStreams.length, true)} of those live.`);

    usersToUpdate.forEach((user) => {
      const stream = liveStreams.find(({ userId }) => userId === user.twitchId);

      if (stream) {
        user.isLive = true;
        user.lastOnline = new Date();

        // TODO: Spin this off to a Stream model
        user.latestStreamTitle = stream.title;
        user.latestStreamStartedAt = stream.startDate;
        user.latestStreamViewers = stream.viewers;
      } else user.isLive = false;
    });
  }
}
