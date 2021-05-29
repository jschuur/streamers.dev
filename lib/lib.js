import { isYesterday } from 'date-fns';
import { map, cloneDeep } from 'lodash';

import { getAllUserTwitchIds, saveUpdatedUsers, saveUsers, getUser, getUsers } from './db';
import { getUserInfoFromTwitch, updateUserStatuses } from './twitch';

import { STATUS_UPDATE_FIELDS, TWITCH_USER_FIELDS } from './config';

// Updates for full set of user details for some or all users via Twitch API
export async function updateAllUserDetails({ updateAll }) {
  return updateUserDetails({ updateAll });
}

// Only update the current status details for all users
export async function updateAllUserStatuses({ updateAll }) {
  return updateUserDetails({ statusOnly: true, updateAll });
}

async function updateUserDetails({ statusOnly = false, updateAll = false } = {}) {
  // Save the current state, so we know what users to update in the DB later
  const lastUserState = await getUsers({
    fields: ['id', 'twitchId', 'displayName', 'isLive', 'updatedAt'],
  });

  const users = statusOnly
    ? cloneDeep(lastUserState)
    : await getUserInfoFromTwitch({ userIds: map(lastUserState, 'twitchId') });

  await updateUserStatuses({ users, updateAll });
  await saveUpdatedUsers({
    users,
    lastUserState,
    updateAll: !statusOnly,
    fields: statusOnly ? STATUS_UPDATE_FIELDS : TWITCH_USER_FIELDS,
  });

  return users.length;
}

export async function addNewUser(userName) {
  // See if user already exists
  const user = await getUser({ userName });
  if (user) throw new Error(`User ${userName} already listed`);

  const users = await getUserInfoFromTwitch({ userNames: [userName]  });
  await updateUserStatuses({ users });

  await saveUsers({ users });
}
