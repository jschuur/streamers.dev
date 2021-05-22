import pluralize from 'pluralize';

import { getAllUserIds, getUserInfoFromTwitch, updateUserInfo } from '../../lib/twitch';

export default async (req, res) => {
  try {
    const userIds = await getAllUserIds();
    const users = await getUserInfoFromTwitch({ userIds, updateAll: Boolean(req.query.force) });

    await updateUserInfo({ users });

    res.status(200).send(`${pluralize('users', users.length, true)} updated`);
  } catch ({ message }) {
    res.status(500).send(message);
  }
};
