import { getChannels } from '../../lib/db';
import { updateChannelStatuses } from '../../lib/twitch';

export default async (req, res) => {
  try {
    const { refresh, includeOffline } = req.query;
    const channels = await getChannels();

    // Add in updated status info in case channel data in the DB is outdated (or for live channels if configured)
    if (parseInt(refresh)) await updateChannelStatuses({ channels, updateAll: false });

    res.status(200).json({
      channels: parseInt(includeOffline) ? channels : channels.filter((c) => c.isLive),
      trackedChannelCount: channels.length,
    });
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
};
