import consoleStamp from 'console-stamp';
import { map, keyBy } from 'lodash';
import pluralize from 'pluralize';
import { PrismaClient } from '@prisma/client';

import { twitchGetStreamsAll, twitchGetUsersByIds } from '../lib/twitch_api';
import { SCIENCE_AND_TECHNOLOGY_GAME_ID, WEB_DEVELOPMENT_TAG_ID } from '../lib/config';

const prisma = new PrismaClient(process.env.DEBUG ? { log: ['query'] } : {});
consoleStamp(console, { format: ':date(yyyy-mm-dd HH:MM:ss.l).gray :label(7)' });

async function getActiveWebDevStreams() {
  return (
    await twitchGetStreamsAll({
      game: SCIENCE_AND_TECHNOLOGY_GAME_ID,
    })
  ).filter(({ tagIds }) => tagIds.includes(WEB_DEVELOPMENT_TAG_ID));
}

async function identifyNewChannels(streams) {
  const result = await prisma.user.findMany({
    select: {
      twitchId: true,
    },
    where: {
      twitchId: {
        in: map(streams, 'userId'),
      },
    },
  });
  const existingChannels = keyBy(result, 'twitchId');

  return streams.filter((stream) => !existingChannels[stream.userId]);
}

async function saveNewChannels(streams) {
  const result = await twitchGetUsersByIds(map(streams, 'userId'));
  const twitchUsers = keyBy(result, 'id');

  for (const stream of streams) {
    await prisma.queue.upsert({
      where: {
        twitchId: stream.userId,
      },
      update: {},
      create: {
        twitchId: stream.userId,
        name: stream.userName,
        title: stream.title,
        language: stream.language,
        views: twitchUsers[stream.userId].views,
        viewers: stream.viewers,
      },
      select: { name: true, twitchId: true },
    });
  }
}

(async () => {
  console.time('Time spent');

  console.log('Getting current Science & Technology streams');

  const webDevStreams = await getActiveWebDevStreams();
  console.log(`Found ${pluralize('Web Development stream', webDevStreams.length, true)}`);

  const newChannels = await identifyNewChannels(webDevStreams);
  console.log(`Identified ${pluralize('untracked channel', newChannels.length, true)}`);

  await saveNewChannels(newChannels);

  console.log('Disconnecting...');
  await prisma.$disconnect();

  console.timeEnd('Time spent');
})();
