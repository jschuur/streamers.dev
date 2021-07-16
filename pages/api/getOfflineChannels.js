import { withSentry } from '@sentry/nextjs';

import { getOfflineChannels } from '../../lib/db';

const handler = async (req, res) => {
  try {
    const { topic, lang } = req.query;
    const channels = await getOfflineChannels({ topic, lang });

    res.status(200).json({ channels });
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
};

export default withSentry(handler);
