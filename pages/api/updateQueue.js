import { updateQueueItem } from '../../lib/db';
import { addNewUser } from '../../lib/lib';

export default async (req, res) => {
  const { id, status, backlog } = req.query;

  try {
    const response = await updateQueueItem({ id: parseInt(id), status });

    if (status === 'ADDED') await addNewUser({ name: response.name, backlog });

    res.status(200).json({ status: 'OK' });
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
};
