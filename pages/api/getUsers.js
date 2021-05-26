import { getUsers } from '../../lib/db';

export default async (req, res) => {
  try {
    const users = await getUsers({ options: req.query, updateAll: true });

    res.status(200).json({ users });
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
};
