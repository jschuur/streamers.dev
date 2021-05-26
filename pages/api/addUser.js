import { addNewUser } from '../../lib/lib';

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', 'https://www.twitch.tv');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { name } = req.query;

    await addNewUser(name);

    res.status(200).send({ message: `User ${name} added` });
  } catch ({ message }) {
    res.status(500).json({ message });
  }
};
