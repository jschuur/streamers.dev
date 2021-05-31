import { getSnapshots } from '../../lib/db';

export default async (req, res) => {
  try {
    const snapshots = await getSnapshots(req.query);

    res.status(200).json({ snapshots });
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
};
