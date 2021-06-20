import { getQueue } from '../../lib/db';

export default async (req, res) => {
  try {
    const { days, filterField } = req.query;

    const queue = await getQueue({ days, filterField });

    res.status(200).json({ queue });
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
};
