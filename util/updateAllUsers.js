import consoleStamp from 'console-stamp';
import minimist from 'minimist';
import pluralize from 'pluralize';

consoleStamp(console, { format: ':date(yyyy-mm-dd HH:MM:ss.l).gray :label(7)' });
const argv = minimist(process.argv.slice(2));

import { updateAllUserDetails, updateAllUserStatuses } from '../lib/lib.js';
import { disconnectDB } from '../lib/db.js';

(async () => {
  console.time('Time spent');
  console.log(`Running ${argv.fullDetails ? 'full details' : 'status'} update`);

  try {
    const userCount = await (argv.fullDetails ? updateAllUserDetails() : updateAllUserStatuses());
  } catch ({ message }) {
    console.error(`Problem updating all users: ${message}`);
  }

  console.log('Disconnecting...');
  await disconnectDB();

  console.timeEnd('Time spent');
})();
