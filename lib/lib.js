import { getAllUserTwitchIds, saveUpdatedUsers, saveUsers, getUser } from './db';
import { getUserInfoFromTwitch } from './twitch';

export async function updateAllUsers({ updateAll }) {
  const userIds = await getAllUserTwitchIds();
  const users = await getUserInfoFromTwitch({ userIds, updateAll });

  await saveUpdatedUsers({ users });

  return users.length;
}

export async function addNewUser(userName) {
  // See if user already exists
  const user = await getUser({ userName });
  if (user) throw new Error(`User ${userName} already listed`);

  const users = await getUserInfoFromTwitch({ userNames: [userName], updateAll: true });

  await saveUsers({ users });
}
