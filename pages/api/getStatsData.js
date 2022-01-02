import { withSentry } from '@sentry/nextjs';

import { getStatsData } from '../../lib/stats';

const handler = async (req, res) => {
  try {
    const statsData = await getStatsData();

    res.status(200).json(statsData);
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
};

export default process.env.ENABLE_SENTRY ? withSentry(handler) : handler;
