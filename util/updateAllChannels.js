import AWS, { ConnectContactLens } from 'aws-sdk';
import consoleStamp from 'console-stamp';
import minimist from 'minimist';
import pluralize from 'pluralize';
import 'dotenv/config';

consoleStamp(console, { format: ':date(yyyy-mm-dd HH:MM:ss.l).gray :label(7)' });
const argv = minimist(process.argv.slice(2), {
  boolean: ['fullDetails', 'includePaused'],
  default: { includePaused: false },
});

import { updateAllChannelDetails, updateAllChannelStatuses } from '../lib/lib';
import { getChannels, disconnectDB } from '../lib/db';
import { isProd } from '../lib/util';

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

    console.log(
      `File uploaded successfully: ${process.env.NEXT_PUBLIC_CACHED_CHANNELLIST_URL}/${fileName}`
    );
  } catch ({ message }) {
    console.error(`Error uploading to S3: ${message}`);
  }
}

(async () => {
  console.time('Time spent');

  console.log(`Running ${argv.fullDetails ? 'full details' : 'status'} update`);
  console.log(`Mode: ${process.env.NODE_ENV}`);

  try {
    const { fullDetails, includePaused } = argv;
    let options = { updateAll: true, includePaused };

    const channels = await (fullDetails
      ? updateAllChannelDetails(options)
      : updateAllChannelStatuses(options));

    if (!fullDetails) {
      console.log('Saving live channel JSON to S3...');
      const liveChannels = await getChannels();

      await saveToS3({
        channels: liveChannels.filter((c) => c.isLive),
        trackedChannelCount: channels.length,
        createdAt: new Date(),
      });
    }
  } catch ({ message }) {
    console.error(`Problem updating all channels: ${message}`);
  }

  console.log('Disconnecting...');
  await disconnectDB();

  console.timeEnd('Time spent');
})();
