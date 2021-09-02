import AWS from 'aws-sdk';
import { getMinutes } from 'date-fns';
import { merge } from 'lodash';
import minimist from 'minimist';
import pluralize from 'pluralize';
import prettyMilliseconds from 'pretty-ms';
import 'dotenv/config';

const argv = minimist(process.argv.slice(2), {
  boolean: ['fullDetails', 'includePaused'],
  default: { includePaused: false },
});

import { updateAllChannelDetails, updateAllChannelStatuses } from '../lib/channels';
import {
  getChannels,
  getTrackedChannelCount,
  getDistinctCountryCount,
  disconnectDB,
} from '../lib/db';
import { isProd } from '../lib/util';
import logger from '../lib/logger';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

async function saveToS3(data) {
  const fileName = isProd() ? 'live_channels.json' : 'live_channels_dev.json';

  const params = {
    Bucket: process.env.AWS_BUCKET,
    Key: fileName,
    Body: JSON.stringify(data, null, 2),
    CacheControl: 'max-age=0',
    ContentType: 'text/json',
  };

  try {
    const res = await s3.upload(params).promise();

    logger.info(
      `File uploaded successfully: ${process.env.NEXT_PUBLIC_CACHED_CHANNELLIST_URL}/${fileName}`
    );
  } catch ({ message }) {
    logger.error(`Error uploading to S3: ${message}`);
  }
}

async function saveLiveChannelCachedList() {
  logger.info('Saving live channel JSON to S3...');

  const channels = await getChannels({ isLive: true });

  await saveToS3({
    channels,
    trackedChannelCount: await getTrackedChannelCount(),
    distinctCountryCount: await getDistinctCountryCount(),
    createdAt: new Date(),
  });
}

(async () => {
  // Definitions for how often to check channels based on their lastOnline time
  const updateRanges = [
    {
      minDaysSinceOnline: 0,
      maxDaysSinceOnline: 7,
      minuteMark: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    },
    {
      minDaysSinceOnline: 7,
      maxDaysSinceOnline: 14,
      minuteMark: [0, 1, 4, 5],
    },
    {
      minDaysSinceOnline: 14,
      minuteMark: [2, 3],
    },
  ];
  const { fullDetails, includePaused } = argv;
  const start = new Date();
  let updateOptions = {
    updateAll: true,
    includePaused,
  };

  // Identify which channels need to be updated
  const ranges = updateRanges.filter((r) => r.minuteMark.includes(getMinutes(start) % 10));

  if (ranges.length === 0) {
    logger.warn('No update ranges match this time of day (this should not happen)');
    process.exit(1);
  }

  logger.info(`Running ${argv.fullDetails ? 'full details' : 'status'} update`);
  logger.info(`Mode: ${process.env.NODE_ENV}`);

  try {
    // Development mode only runs updates every 10 mins, so it's fine to update everything
    // fullDetails one runs once an hour, so also update everything
    if (process.env.NODE_ENV === 'production' && !fullDetails) {
      for (const { minDaysSinceOnline, maxDaysSinceOnline } of ranges) {
        logger.info(
          `Updating channel range, min: ${minDaysSinceOnline || 'none'}, max: ${
            maxDaysSinceOnline || 'none'
          }`
        );

        await updateAllChannelStatuses({
          ...updateOptions,
          minDaysSinceOnline,
          maxDaysSinceOnline,
          now: start,
        });
      }
    } else
      await (fullDetails
        ? updateAllChannelDetails(updateOptions)
        : updateAllChannelStatuses(updateOptions));

    if (!fullDetails) await saveLiveChannelCachedList();
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
