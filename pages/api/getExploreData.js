import { withSentry } from '@sentry/nextjs';

import { getExploreData } from '../../lib/explore';

const handler = async (req, res) => {
  try {
    const exploreData = await getExploreData();

    res.status(200).json(exploreData);
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
};

export default process.env.ENABLE_SENTRY ? withSentry(handler) : handler;
