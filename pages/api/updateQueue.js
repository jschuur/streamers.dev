import { getSession } from 'next-auth/react';
import { withSentry } from '@sentry/nextjs';

import { getQueueItem, addOrUpdateQueueItem, updateQueueItemStatus } from '../../lib/db';
import { addNewChannel } from '../../lib/channels';
import { twitchGetStreamsByIds, twitchGetUsersByIds } from '../../lib/twitch_api';
import { adminAuthorised } from '../../lib/util';

const handler = async (req, res) => {
  const { status, twitchId, backlog } = req.body;
  const id = parseInt(req.body.id) || null;
  let stream, user, response;

  const session = await getSession({ req });

  try {
    if (!adminAuthorised({ session })) return res.status(403).send({ message: 'Access denied' });

    // Look up channel and stream info if needed
    if (!id) {
      const queueItem = await getQueueItem({ twitchId });

      if (!queueItem) {
        stream = (await twitchGetStreamsByIds([twitchId]))[0] || null;
        user = (await twitchGetUsersByIds([twitchId]))[0] || null;

        if (!user)
          throw new Error(`No user found when adding queue item using twitchId ${twitchId}`);

        response = await addOrUpdateQueueItem({ twitchId, stream, user, status });
      } else response = await updateQueueItemStatus({ twitchId, status });
    }

    // TODO: Eventually remove this and call addNewChannel directly from the old queue commands
    if (status === 'ADDED') await addNewChannel({ name: response.name, backlog });

    res.status(200).json({
      message: `Status for channel ${response.name} set to ${status}${backlog ? ' (backlog)' : ''}`,
    });
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
};

export default process.env.ENABLE_SENTRY ? withSentry(handler) : handler;
