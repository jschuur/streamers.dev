import { map, keyBy } from 'lodash';
import pluralize from 'pluralize';

import { addOrUpdateStream, markStreamsOffline } from './db';
import logger from './logger';

export async function saveStreams(channels) {
  if (channels.length === 0) return;

  let offlineChannelIds = [];

  logger.info(`Saving updated streams...`);

  for (const channel of channels) {
    if (channel.isLive) await addOrUpdateStream(channel);
    else offlineChannelIds.push(channel.id);
  }

  // Batch update any stream for offline channels. A bit aggressive right now, optimise later
  if (offlineChannelIds.length) await markStreamsOffline(offlineChannelIds);

  logger.info(`...finished saving updated streams.`);
}
