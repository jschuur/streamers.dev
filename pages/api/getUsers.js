import { getUsers } from '../../lib/db';
import { updateUserStatuses } from '../../lib/twitch';

export default async (req, res) => {
  try {
    const users = await getUsers({ options: req.query });

    // Add in updated status info in case user data is outdated
    await updateUserStatuses({ users, updateAll: false });

    res.status(200).json({ users });
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
};
