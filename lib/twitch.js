import { map } from 'lodash';
import { differenceInSeconds } from 'date-fns';
import pluralize from 'pluralize';

import { twitchGetStreams, twitchGetUsersByIds, twitchGetUsersByNames } from './twitch_api';

import { MAX_STATUS_AGE_SECONDS } from '../lib/config';

// Hit the Twitch API for info on a set of user IDs or names
export async function getUserInfoFromTwitch({ userIds, userNames }) {
  const users = await (userIds ? twitchGetUsersByIds(userIds) : twitchGetUsersByNames(userNames));

  // Rename the 'id' field to twitchID
  users.forEach((user) => {
    user.twitchId = user.id;
    delete user.id;
  });

  // Add details from the current stream for live users
  await updateUserStatuses({ users, updateAll: true });

  return users;
}

// Update a list of users with the latest stream centric data from Twitch
export async function updateUserStatuses({ users, updateAll = false }) {
  const maxStatusAge = process.env.MAX_STATUS_AGE_SECONDS || MAX_STATUS_AGE_SECONDS;
  const now = new Date();

  // Find outdated user entries (always update live users if MAX_STATUS_AGE_SECONDS is set)
  const usersToUpdate = updateAll
    ? users
    : users.filter(
        ({ updatedAt, isLive }) =>
          (process.env.REFRESH_LIVE_USERS && isLive) ||
          differenceInSeconds(now, updatedAt) > maxStatusAge
      );

  if (usersToUpdate?.length) {
    console.log(`Refreshing status for ${pluralize('user', usersToUpdate.length, true)}...`);

    const liveStreams = await twitchGetStreams(map(usersToUpdate, 'twitchId'));
    console.log(`${pluralize('user', liveStreams.length, true)} of those live.`);

    usersToUpdate.forEach((user) => {
      const stream = liveStreams.find(({ userId }) => userId === user.twitchId);

      // Save stream status to the user
      if (stream) {
        user.isLive = true;
        user.lastOnline = new Date();

        user.latestStreamTitle = stream.title;
        user.latestStreamStartedAt = stream.startDate;
        user.latestStreamViewers = stream.viewers;
      } else user.isLive = false;
    });
  }
}
