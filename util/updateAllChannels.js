import minimist from 'minimist';
import prettyMilliseconds from 'pretty-ms';
import 'dotenv/config';

const argv = minimist(process.argv.slice(2), {
  boolean: ['fullDetails', 'includePaused', 'localTest'],
  default: { includePaused: false },
});

import { updateAllChannelDetails, updateAllChannelStatuses } from '../lib/channels';
import { disconnectDB } from '../lib/db';
import logger from '../lib/logger';

// Definitions to stagger checks for channels that haven't been live for a while,
// to avoid hitting the Twitch API too often.
const updateRanges = [
  {
    description: 'last online up to 7 days ago',
    maxDaysSinceOnline: 7,
    updatePercentage: 1,
  },
  {
    description: 'last online 8-14 days ago',
    minDaysSinceOnline: 7,
    maxDaysSinceOnline: 14,
    updatePercentage: 0.5,
  },
  {
    description: 'last online over 15-28 days ago',
    minDaysSinceOnline: 14,
    maxDaysSinceOnline: 28,
    updatePercentage: 0.25,
  },
  {
    description: 'last online over 28 days ago',
    minDaysSinceOnline: 28,
    updatePercentage: 0.2,
  },
];

async function updateRange({ range, now }) {
  const { description, ...rangeOptions } = range;
  const { includePaused } = argv;

  logger.info(`Updating channels (${description})`);

  return await updateAllChannelStatuses({
    updateAll: true,
    includePaused,
    now,
    ...rangeOptions,
  });
}

(async () => {
  const start = new Date();
  const { fullDetails, includePaused, localTest } = argv;

  logger.info(`Running ${argv.fullDetails ? 'full details' : 'status'} update`);
  logger.info(`Mode: ${process.env.NODE_ENV}`);
  localTest && logger.info('Running in local test mode');

  try {
    // Development mode only runs updates every 10 mins, so it's fine to update everything
    // fullDetails one runs once an hour, so also update everything
    if ((localTest || process.env.NODE_ENV === 'production') && !fullDetails) {
      let count = 0;

      for (const range of updateRanges)
        count += (await updateRange({ range, now: start })).length || 0;

      logger.info(`Total channels update: ${count}`);
    } else {
      const updateOptions = {
        updateAll: true,
        includePaused,
      };

      await (fullDetails
        ? updateAllChannelDetails(updateOptions)
        : updateAllChannelStatuses(updateOptions));
    }
  } catch ({ message }) {
    logger.error(`Problem updating all channels: ${message}`);
  }

  logger.info('Disconnecting...');
  await disconnectDB();

  logger.info(
    `Time spent (updateAllChannels): ${prettyMilliseconds(new Date() - start, {
      separateMilliseconds: true,
    })}`
  );
})();
