import { getSession } from 'next-auth/client';
import { withSentry } from '@sentry/nextjs';

import { updateQueueItem } from '../../lib/db';
import { addNewChannel } from '../../lib/channels';
import { adminAuthorised } from '../../lib/util';

const handler = async (req, res) => {
  const { id, status, backlog } = req.body;
  const session = await getSession({ req });

  try {
    if (!adminAuthorised({ session })) return res.status(403).send({ message: 'Access denied' });

    const response = await updateQueueItem({ id: parseInt(id), status });

    if (status === 'ADDED') await addNewChannel({ name: response.name, backlog });

    res.status(200).json({
      message: `Status for channel ${response.name} set to ${status}${backlog ? ' (backlog)' : ''}`,
    });
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
};

export default withSentry(handler);