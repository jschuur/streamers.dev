import { getQueue } from '../../lib/db';

export default async (req, res) => {
  try {
    const queue = await getQueue();

    res.status(200).json({ queue });
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
};
