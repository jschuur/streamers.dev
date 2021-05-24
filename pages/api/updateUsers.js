import pluralize from 'pluralize';

import { updateAllUsers } from '../../lib/twitch';

export default async (req, res) => {
  try {
    const userCount = await updateAllUsers({ updateAll: Boolean(req.query.force) });

    res.status(200).send(`${pluralize('users', userCount, true)} updated`);
  } catch ({ message }) {
    res.status(500).send(message);
  }
};
