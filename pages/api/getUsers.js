import { getUsers } from '../../lib/db';
import { updateUserStatuses } from '../../lib/twitch';

export default async (req, res) => {
  try {
    const options = req.query;
    const users = await getUsers();

    // Add in updated status info in case user data in the DB is outdated
    if (options?.refresh) await updateUserStatuses({ users, updateAll: false });

    res.status(200).json({ users });
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
};
