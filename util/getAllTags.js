import consoleStamp from 'console-stamp';
import jsonfile from 'jsonfile';
import { ApiClient } from '@twurple/api';
import { ClientCredentialsAuthProvider } from '@twurple/auth';
import 'dotenv/config';

consoleStamp(console, { format: ':date(yyyy-mm-dd HH:MM:ss.l).gray :label(7)' });

const authProvider = new ClientCredentialsAuthProvider(
  process.env.TWITCH_CLIENT_ID,
  process.env.TWITCH_CLIENT_SECRET
);
const apiClient = new ApiClient({ authProvider });

(async () => {
  console.time('Time spent');

  console.log('Getting all tags from Twitch...');
  const tags = await apiClient.helix.tags.getAllStreamTagsPaginated().getAll();

  console.log(`Received ${tags.length} tags`);
  const tagsEnglish = tags.map((tag) => ({
    id: tag.id,
    isAuto: tag.isAuto,
    name: tag.getName('en-us'),
    description: tag.getDescription('en-us'),
  }));

  console.log('Saving English tag names');
  jsonfile.writeFileSync('tmp/tags.json', tagsEnglish, { spaces: 2 });

  const tagsDevelopment = tagsEnglish.filter((tag) => tag?.description?.includes('development'));

  console.log(`Saving tags matching 'development' in the description`);
  jsonfile.writeFileSync('tmp/tags_development.json', tagsDevelopment, { spaces: 2 });

  console.timeEnd('Time spent');
})();
