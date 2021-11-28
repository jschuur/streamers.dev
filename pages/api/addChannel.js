import { getSession } from 'next-auth/client';
import { withSentry } from '@sentry/nextjs';

import { addNewChannel } from '../../lib/channels';
import { adminAuthorised } from '../../lib/util';

const handler = async (req, res) => {
  const session = await getSession({ req });

  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', 'https://www.twitch.tv');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // CORS related pre-flight response used by the bookmarklet
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { channelName, backlog, secret, twitchId } = req.body;

    // Authenticate based on logged in state or bookmarklet secret
    if (!adminAuthorised({ session, secret }))
      return res.status(403).send({ message: 'Access denied' });

    let name;

    if (channelName) {
      const match = channelName.match(/https?:\/\/(?:www\.)?twitch.tv\/([\w]*)\/?/i);
      name = match ? match[1] : channelName;
    }

    const response = await addNewChannel({ twitchId, name, backlog });

    res
      .status(200)
      .send({ message: `Channel ${response.name} added${backlog ? ' (backlogged)' : ''}` });
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
};

export default process.env.ENABLE_SENTRY ? withSentry(handler) : handler;