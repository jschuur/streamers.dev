import { withSentry } from '@sentry/nextjs';

import { getLiveChannelData } from '../../lib/db';
import { updateChannelStatuses } from '../../lib/twitch';

const handler = async (req, res) => {
  try {
    const { refresh } = req.query;

    const liveChannelData = await getLiveChannelData();

    // Add in updated status info in case channel data in the DB is outdated (or for live channels if configured)
    if (parseInt(refresh)) await updateChannelStatuses({ channels: liveChannelData.channels });

    res.status(200).json(liveChannelData);
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
};

export default process.env.ENABLE_SENTRY ? withSentry(handler) : handler;
