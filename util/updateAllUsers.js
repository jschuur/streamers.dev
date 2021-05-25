import pluralize from 'pluralize';

import { updateAllUsers } from '../lib/lib.js';
import { disconnectDB } from '../lib/db.js';

(async () => {
  try {
    const userCount = await updateAllUsers({ updateAll: true });
  } catch ({ message }) {
    console.error(`Problem updating all users: ${message}`);
  }

  console.log('Disconnecting...');

  await disconnectDB();
})();
