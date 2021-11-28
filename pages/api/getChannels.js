import { uniq, map } from 'lodash';
import { withSentry } from '@sentry/nextjs';

import { getChannels, getTrackedChannelCount, getDistinctCountryCount } from '../../lib/db';
import { updateChannelStatuses } from '../../lib/twitch';

const handler = async (req, res) => {
  try {
    const { refresh } = req.query;
    const channels = await getChannels({ isLive : true });

    // Add in updated status info in case channel data in the DB is outdated (or for live channels if configured)
    if (parseInt(refresh)) await updateChannelStatuses({ channels, updateAll: false });

    res.status(200).json({
      channels,
      trackedChannelCount: await getTrackedChannelCount(),
      distinctCountryCount: await getDistinctCountryCount(),
    });
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
};

export default process.env.ENABLE_SENTRY ? withSentry(handler) : handler;
