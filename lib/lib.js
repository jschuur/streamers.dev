import { isYesterday } from 'date-fns';
import { map, cloneDeep } from 'lodash';

import { getAllUserTwitchIds, saveUpdatedUsers, saveUsers, getUser, getUsers } from './db';
import { getUserInfoFromTwitch, updateUserStatuses } from './twitch';

import { STATUS_UPDATE_FIELDS, TWITCH_USER_FIELDS } from './config';

// Updates for full set of user details for some or all users via Twitch API
export async function updateAllUserDetails(options) {
  return updateUserDetails(options);
}

// Only update the current status details for all users
export async function updateAllUserStatuses(options) {
  return updateUserDetails({ statusOnly: true, ...options });
}

async function updateUserDetails({
  statusOnly = false,
  updateAll = false,
  includePaused = false,
} = {}) {
  // Save the current state, so we know what users to update in the DB later
  const lastUserState = await getUsers({
    fields: ['id', 'twitchId', 'displayName', 'isLive', 'updatedAt'],
    includePaused,
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

export async function addNewUser({ name, backlog }) {
  // See if user already exists
  const user = await getUser({ name });
  if (user) throw new Error(`User ${name} already listed`);

  const users = await getUserInfoFromTwitch({ userNames: [name] });
  if (users.length === 0) throw new Error(`User ${name} not found on Twitch`);

  await updateUserStatuses({ users });

  if (backlog) {
    users[0].isHidden = true;
    users[0].isPaused = true;
  }

  await saveUsers({ users });
}
