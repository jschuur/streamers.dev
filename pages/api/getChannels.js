import { getChannels } from '../../lib/db';
import { updateChannelStatuses } from '../../lib/twitch';

export default async (req, res) => {
  try {
    const options = req.query;
    const channels = await getChannels();

    // Add in updated status info in case channel data in the DB is outdated
    if (options?.refresh) await updateChannelStatuses({ channels, updateAll: false });

    res.status(200).json({ channels });
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
};
