import pluralize from 'pluralize';

import { updateAllUsers, disconnectDB } from '../lib/twitch.js';

(async () => {
  try {
    const userCount = await updateAllUsers({ updateAll: true });

    console.log(`${pluralize('users', userCount, true)} updated`);
  } catch ({ message }) {
    console.error(`Problem updating all users: ${message}`);
  }

  console.log('Disconnecting...');
  await disconnectDB();
})();
