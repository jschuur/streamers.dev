import consoleStamp from 'console-stamp';
import { differenceInSeconds } from 'date-fns';
import { map, keyBy } from 'lodash';
import pluralize from 'pluralize';
import 'dotenv/config';

import { twitchGetStreamsAll, twitchGetUsersByIds } from '../lib/twitch_api';
import { gameIds, tagIds } from '../lib/config';
import prisma from '../lib/prisma';

consoleStamp(console, { format: ':date(yyyy-mm-dd HH:MM:ss.l).gray :label(7)' });

async function getActiveStreams(tagName) {
  const tagId = tagIds[tagName];

  return (
    await twitchGetStreamsAll({
      game: gameIds['Science & Technology'],
    })
  ).filter(({ tagIds }) => tagIds.includes(tagId));
}

async function identifyNewChannels(streams) {
  const result = await prisma.channel.findMany({
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

async function saveNewChannels({ streams, tagName }) {
  const result = await twitchGetUsersByIds(map(streams, 'userId'));
  const twitchUsers = keyBy(result, 'id');
  let newQueuedCount = 0;
  const now = new Date();

  for (const stream of streams) {
    const result = await prisma.queue.upsert({
      where: {
        twitchId: stream.userId,
      },
      update: {
        updatedAt: now,
        title: stream.title,
        language: stream.language,
        views: twitchUsers[stream.userId].views,
        viewers: stream.viewers,
      },
      create: {
        twitchId: stream.userId,
        name: stream.userName,
        title: stream.title,
        language: stream.language,
        tag: tagName,
        views: twitchUsers[stream.userId].views,
        viewers: stream.viewers,
      },
      select: { name: true, createdAt: true },
    });

    // Dumb Prisma workaround to check if a record was added
    if (differenceInSeconds(new Date(), result.createdAt) < 10) {
      console.log(`Queued https://www.twitch.tv/${result.name}`);
      newQueuedCount++;
    }
  }

  if (newQueuedCount > 0)
    console.log(`Queued ${pluralize('new channels', newQueuedCount, true)} from ${tagName} search`);
  else console.log('No new channels needed to be queued');
}

async function findChannels(tagName) {
  console.log(`Getting current ${tagName} streams`);

  const liveStreams = await getActiveStreams(tagName);
  console.log(`Found ${pluralize(`${tagName} stream`, liveStreams.length, true)}`);

  if (liveStreams.length === 0) return;

  const newChannels = await identifyNewChannels(liveStreams);
  console.log(`Identified ${pluralize('untracked channel', newChannels.length, true)}`);

  if (newChannels.length === 0) return;

  await saveNewChannels({ streams: newChannels, tagName });
}

(async () => {
  console.time('Time spent');

  await findChannels('Web Development');
  await findChannels('Software Development');
  await findChannels('Programming');
  await findChannels('Game Development');
  await findChannels('Desktop Development');
  await findChannels('Mobile Development');
  await findChannels('JavaScript');
  await findChannels('Python');
  await findChannels('Rust');
  await findChannels('PHP');
  await findChannels('C++');

  console.log('Disconnecting...');
  await prisma.$disconnect();

  console.timeEnd('Time spent');
})();
