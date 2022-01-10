import { filter } from 'lodash';

import { addOrUpdateStream, setStreamsLastOnline, setStreamsOffline } from './db';
import { isCodingTag } from './util';
import logger from './logger';

import { alwaysCodingGameNames, sometimesCodingGameNames } from './config';

export async function saveStreams(channels) {
  if (channels.length === 0) return;

  const onlineChannels = filter(channels, 'isLive');

  logger.info(`Saving updated streams...`);

  for (const channel of onlineChannels) await addOrUpdateStream(channel);

  // Batch update the last online date for online channels
  if (onlineChannels.length) await setStreamsLastOnline(onlineChannels);

  // Batch update any stream for offline channels.
  await setStreamsOffline({ channels, onlineChannels });

  logger.info(`...finished saving updated streams.`);
}

export const isCodingStream = ({ currentGameName, currentTwitchTags, channel }) =>
  channel.alwaysCoding ||
  alwaysCodingGameNames.includes(currentGameName) ||
  ((sometimesCodingGameNames.includes(currentGameName) || !currentGameName) &&
    currentTwitchTags?.some(isCodingTag));

export const wasCodingStream = ({ allGameNames, allTags, channel }) =>
  channel.alwaysCoding ||
  Object.keys(allTags).length > 0 ||
  allGameNames.some((gamename) => alwaysCodingGameNames.includes(gamename));

export function streamType(stream) {
  if (isCodingStream(stream)) return 'CODING';

  // TODO: Add other stream types (e.g. GAMEDEV)

  if (stream.currentGameName === 'Just Chatting') return 'CHATTING';

  return 'OTHER';
}
