import { withSentry } from '@sentry/nextjs';

import { getRecentChannels } from '../../lib/db';

const handler = async (req, res) => {
  try {
    const channels = await getRecentChannels();

    res.status(200).json({
      channels,
    });
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
};

export default withSentry(handler);
