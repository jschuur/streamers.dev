import { withSentry } from '@sentry/nextjs';

import { getOfflineChannels } from '../../lib/db';

const handler = async (req, res) => {
  try {
    const { topic, lang } = req.query;
    const offlineChannelData = await getOfflineChannels({ topic, lang });

    res.status(200).json(offlineChannelData);
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
};

export default process.env.ENABLE_SENTRY ? withSentry(handler) : handler;
