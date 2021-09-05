import { withSentry } from '@sentry/nextjs';

import { getStatsData } from '../../lib/stats';

const handler = async (req, res) => {
  try {
    const stats = await getStatsData();

    res.status(200).json({ stats });
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
};

export default withSentry(handler);
