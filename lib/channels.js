import { isYesterday } from 'date-fns';
import { map, cloneDeep, orderBy, pick } from 'lodash';

import { saveUpdatedChannels, saveChannels, getChannel, getChannels } from './db';
import { saveStreams } from './stream';
import { getChannelInfoFromTwitch, updateChannelStatuses } from './twitch';
import { twitchGetStreamsAll, twitchGetUsersByIds } from './twitch_api';
import { addStreamTags } from './tags';

import prisma from './prisma';

import {
  STATUS_UPDATE_FIELDS,
  PROFILE_CHANGE_FIELDS,
  TWITCH_CHANNEL_FIELDS,
  ALWAYS_CODING_GAMENAMES,
  SOMETIMES_CODING_GAMENAMES,
  gameIds,
  codingTagIds,
  gameCodingTagIds,
} from './config';

// Updates for full set of channel details for some or all channels via Twitch API
export async function updateAllChannelDetails(options) {
  return updateChannelDetails(options);
}

// Only update the current status details for all channels
export async function updateAllChannelStatuses(options) {
  return updateChannelDetails({ statusOnly: true, ...options });
}

async function updateChannelDetails({
  statusOnly = false,
  updateAll = false,
  includePaused = false,
  minDaysSinceOnline,
  maxDaysSinceOnline,
  updatePercentage = 1,
  now,
} = {}) {
  // Save the current state, so we know what channels to update in the DB later
  const lastChannelState = await getChannels({
    includePaused,
    minDaysSinceOnline,
    maxDaysSinceOnline,
    updatePercentage,
    now,
  });

  let channels;

  if (statusOnly) {
    channels = cloneDeep(lastChannelState);
    await updateChannelStatuses({
      channels,
      updateAll,
    });
  } else {
    channels = await getChannelInfoFromTwitch({
      userIds: map(lastChannelState, 'twitchId'),
    });
  }

  // Parse keywords from stream title (for live channels)
  await addStreamTags(channels);

  await saveUpdatedChannels({
    channels,
    lastChannelState,
    updateAll: !statusOnly,
    fields: statusOnly ? STATUS_UPDATE_FIELDS : TWITCH_CHANNEL_FIELDS,
  });

  if (statusOnly) await saveStreams(channels);

  return channels;
}

export async function addNewChannel({ name, twitchId, backlog }) {
  // See if channel already exists
  const channel = await getChannel(
    twitchId
      ? { twitchId }
      : {
          name: {
            equals: name,
            mode: 'insensitive', // Default value: default
          },
        }
  );
  const channelNameOrId = name || `ID ${twitchId}`;

  if (channel) throw new Error(`Channel ${channelNameOrId} already listed`);

  const channels = await getChannelInfoFromTwitch(
    twitchId ? { userIds: [twitchId] } : { userNames: [name] }
  );
  if (channels.length === 0) throw new Error(`Channel ${channelNameOrId} not found on Twitch`);

  if (backlog) {
    channels[0].isHidden = true;
    channels[0].isPaused = true;
    channels[0].isLive = false;
  } else await updateChannelStatuses({ channels, updateAll: true });

  await addStreamTags(channels);

  await saveChannels({ channels });

  return pick(channels[0], ['twitchId', 'name']);
}

// Find new channels that look like they are live coding
export async function getPotentialChannels() {
  // Get all channels that are in live coding categories
  const liveStreams = await twitchGetStreamsAll({
    game: ALWAYS_CODING_GAMENAMES.map((game) => gameIds[game]),
  });

  const validCodingTagIds = Object.values(codingTagIds);
  const validGameCodingTagIds = Object.values(gameCodingTagIds);

  // Remove channels that are already tracked or don't use the right tags
  const liveCodingStreams = liveStreams.filter(
    (stream) =>
      validCodingTagIds.some((tagId) => stream.tagIds.includes(tagId)) &&
      !validGameCodingTagIds.some((tagId) => stream.tagIds.includes(tagId))
  );

  // Out of the coding streams, find out which are already in the channels table
  const existingChannels = await prisma.channel.findMany({
    select: { twitchId: true },
    where: { twitchId: { in: map(liveCodingStreams, 'userId') } },
  });
  const existingChannelTwitchIds = map(existingChannels, 'twitchId');

  // Also find channels in the queue not as 'pending'
  const existingChannelsInQueue = await prisma.queue.findMany({
    select: { twitchId: true },
    where: { twitchId: { in: map(liveCodingStreams, 'userId') }, NOT: { status: 'PENDING' } },
  });
  const existingChannelsInQueueIds = map(existingChannelsInQueue, 'twitchId');

  // Get user info for channels that are not already in the DB
  const liveCodingUsers = await twitchGetUsersByIds(
    map(
      liveCodingStreams.filter(
        ({ userId }) =>
          !existingChannelTwitchIds.includes(userId) && !existingChannelsInQueueIds.includes(userId)
      ),
      'userId'
    )
  );

  // ...and build a custom object with the user and stream info
  const potentialChannels = liveCodingUsers
    .map((user) => {
      const stream = liveCodingStreams.find((stream) => user.id === stream.userId);

      return stream
        ? {
            name: stream.userName,
            twitchId: stream.userId,
            title: stream.title,
            created_at: user.creationDate,
            viewers: stream.viewers,
            views: user.views,
            language: stream.language,
          }
        : null;
    })
    .filter(Boolean);

  return orderBy(potentialChannels, ['viewers'], ['desc']);
}