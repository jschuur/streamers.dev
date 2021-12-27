import { partition } from 'lodash';

import { addOrUpdateStream, setStreamsLastOnline, setStreamsOffline } from './db';
import logger from './logger';

export async function saveStreams(channels) {
  if (channels.length === 0) return;

  const [onlineChannels, offlineChannels] = partition(channels, 'isLive');

  logger.info(`Saving updated streams...`);

  for (const channel of onlineChannels) await addOrUpdateStream(channel);

  // Batch update the last online date for online channels
  if (onlineChannels.length) await setStreamsLastOnline(onlineChannels);

  // Batch update any stream for offline channels. A bit aggressive right now, optimise later
  if (offlineChannels.length) await setStreamsOffline(offlineChannels);

  logger.info(`...finished saving updated streams.`);
}
