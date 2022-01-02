import { withSentry } from '@sentry/nextjs';

import { getRecentChannels } from '../../lib/db';

const handler = async (req, res) => {
  try {
    const recentChannelData = await getRecentChannels();

    res.status(200).json(recentChannelData);
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
};

export default process.env.ENABLE_SENTRY ? withSentry(handler) : handler;
