import { isYesterday } from 'date-fns';
import { map, cloneDeep } from 'lodash';

import { saveUpdatedChannels, saveChannels, getChannel, getChannels } from './db';
import { getChannelInfoFromTwitch, updateChannelStatuses } from './twitch';

import { STATUS_UPDATE_FIELDS, TWITCH_CHANNEL_FIELDS } from './config';

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
} = {}) {
  // Save the current state, so we know what channels to update in the DB later
  const lastChannelState = await getChannels({
    fields: ['id', 'twitchId', 'displayName', 'isLive', 'updatedAt'],
    includePaused,
  });

  const channels = statusOnly
    ? cloneDeep(lastChannelState)
    : await getChannelInfoFromTwitch({
        userIds: map(lastChannelState, 'twitchId'),
        updateStatus: true,
      });

  await updateChannelStatuses({ channels, updateAll });
  await saveUpdatedChannels({
    channels,
    lastChannelState,
    updateAll: !statusOnly,
    fields: statusOnly ? STATUS_UPDATE_FIELDS : TWITCH_CHANNEL_FIELDS,
  });

  return channels;
}

export async function addNewChannel({ name, backlog }) {
  // See if channel already exists
  const channel = await getChannel({ name });
  if (channel) throw new Error(`Channel ${name} already listed`);

  const channels = await getChannelInfoFromTwitch({ userNames: [name] });
  if (channels.length === 0) throw new Error(`Channel ${name} not found on Twitch`);

  if (backlog) {
    channels[0].isHidden = true;
    channels[0].isPaused = true;
    channels[0].isLive = false;
  } else await updateChannelStatuses({ channels, updateAll: true });

  await saveChannels({ channels });
}
