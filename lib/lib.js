import { getAllUserTwitchIds, saveUpdatedUsers, saveUsers } from './db';
import { getUserInfoFromTwitch } from './twitch';

export async function updateAllUsers({ updateAll }) {
  const userIds = await getAllUserTwitchIds();
  const users = await getUserInfoFromTwitch({ userIds, updateAll });

  await saveUpdatedUsers({ users });

  return users.length;
}

export async function addNewUsers(userNames) {
  const users = await getUserInfoFromTwitch({ userNames, updateAll: true });

  await saveUsers({ users });
}
