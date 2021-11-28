import { withSentry } from '@sentry/nextjs';

import { getPotentialChannels } from '../../lib/channels';

const handler = async (req, res) => {
  try {
    const channels = await getPotentialChannels();

    res.status(200).json({ channels });
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
};

export default process.env.ENABLE_SENTRY ? withSentry(handler) : handler;
