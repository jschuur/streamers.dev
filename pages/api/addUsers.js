import { addNewUsers } from '../../lib/twitch';

export default async (req, res) => {
  await addNewUsers(req.query.name.split(','));

  res.status(200).send('Users added');
};
