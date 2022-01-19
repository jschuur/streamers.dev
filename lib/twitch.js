import { map, flatMap, uniq } from 'lodash';
import { differenceInSeconds } from 'date-fns';
import pluralize from 'pluralize';

import {
  twitchGetStreamsByIds,
  twitchGetUsersByIds,
  twitchGetUsersByNames,
  twitchGetStreamTagsByIds,
} from './twitch_api';
import { isCoding } from './util';
import logger from './logger';

import { MAX_STATUS_AGE_SECONDS } from './config';

// Hit the Twitch API for info on a set of user IDs or names
export async function getChannelInfoFromTwitch({ userIds, userNames }) {
  logger.info(
    `Getting Twitch channel details for ${pluralize(
      'channel',
      (userIds || userNames).length,
      true
    )}`
  );

  const channels = await (userIds
    ? twitchGetUsersByIds(userIds)
    : twitchGetUsersByNames(userNames));

  // Rename the 'id' field to twitchID
  channels.forEach((channel) => {
    channel.twitchId = channel.id;
    delete channel.id;
  });

  return channels;
}

// Update a list of channels with the latest stream centric data from Twitch
export async function updateChannelStatuses({ channels, updateAll = false }) {
  const maxStatusAge = process.env.MAX_STATUS_AGE_SECONDS || MAX_STATUS_AGE_SECONDS;
  const now = new Date();

  // Find outdated channel entries (always update live channels if REFRESH_LIVE_CHANNELS is set)
  // In theory the backend refreshes the DB before MAX_STATUS_AGE is hit, so unless REFRESH_LIVE_CHANNELS
  // is set, this kind of refresh should never cause a Twitch API hit.
  const channelsToUpdate = updateAll
    ? channels
    : channels.filter(
        ({ updatedAt, isLive }) =>
          (process.env.REFRESH_LIVE_CHANNELS && isLive) ||
          differenceInSeconds(now, updatedAt) > maxStatusAge
      );

  if (channelsToUpdate?.length) {
    logger.info(`Refreshing status for ${pluralize('channel', channelsToUpdate.length, true)}...`);

    const liveStreams = await twitchGetStreamsByIds(map(channelsToUpdate, 'twitchId'));
    logger.info(`${pluralize('channel', liveStreams.length, true)} of those live.`);

    // Look up all the tag IDs used by the live streams
    const tagData = await twitchGetStreamTagsByIds(uniq(flatMap(liveStreams, 'tagIds')));

    channelsToUpdate.forEach((channel) => {
      const stream = liveStreams.find(({ userId }) => userId === channel.twitchId);

      // Save stream status to the channel
      if (stream) {
        channel.latestStreamTwitchId = stream.id;
        channel.latestStreamTitle = stream.title;
        channel.latestStreamStartedAt = stream.startDate;
        channel.latestStreamViewers = stream.viewers;
        channel.latestStreamLanguage = stream.language;
        channel.latestStreamGameName = stream.gameName;

        // Use English tag names
        channel.latestStreamTwitchTags =
          stream?.tagIds.map(
            (tag) =>
              tagData.find((t) => t.id === tag)?.getName('en-us') || `Unknown tag ID (${tag})`
          ) || [];

        channel.isLive = true;
        channel.isCoding = isCoding(channel);
        channel.lastOnline = new Date();

        // Keep the highest viewer count, even across streams for now
        if (stream.viewers > channel.latestStreamPeakViewers)
          channel.latestStreamPeakViewers = stream.viewers;
      } else {
        channel.isLive = false;
        channel.isCoding = false;

        // Clear other data, including the title to satisfy Twitch TOS
        channel.latestStreamPeakViewers = 0;
        channel.latestStreamGameName = null;
        // channel.latestStreamTitle = null;
        channel.latestStreamTags = [];
        channel.latestStreamTwitchTags = [];
      }
    });
  }
}
