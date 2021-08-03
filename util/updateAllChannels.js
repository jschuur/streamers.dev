import AWS from 'aws-sdk';
import { uniq, map } from 'lodash';
import minimist from 'minimist';
import pluralize from 'pluralize';
import prettyMilliseconds from 'pretty-ms';
import 'dotenv/config';

const argv = minimist(process.argv.slice(2), {
  boolean: ['fullDetails', 'includePaused'],
  default: { includePaused: false },
});

import { updateAllChannelDetails, updateAllChannelStatuses } from '../lib/channels';
import { getChannels, disconnectDB } from '../lib/db';
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

(async () => {
  const start = new Date();

  logger.info(`Running ${argv.fullDetails ? 'full details' : 'status'} update`);
  logger.info(`Mode: ${process.env.NODE_ENV}`);

  try {
    const { fullDetails, includePaused } = argv;
    let options = { updateAll: true, includePaused };

    const channels = await (fullDetails
      ? updateAllChannelDetails(options)
      : updateAllChannelStatuses(options));

    if (!fullDetails) {
      logger.info('Saving live channel JSON to S3...');
      const liveChannels = await getChannels();

      await saveToS3({
        channels: liveChannels.filter((c) => c.isLive),
        trackedChannelCount: channels.length,
        distinctCountryCount: uniq([...map(channels, 'country'), ...map(channels, 'country2')])
          .length,
        createdAt: new Date(),
      });
    }
  } catch ({ message }) {
    logger.error(`Problem updating all channels: ${message}`);
  }

  logger.info('Disconnecting...');
  await disconnectDB();

  logger.info(
    `Time spent (updateSnapshot): ${prettyMilliseconds(new Date() - start, {
      separateMilliseconds: true,
    })}`
  );
})();
