import { map, keyBy } from 'lodash';
import pluralize from 'pluralize';
import 'dotenv/config';

import { twitchGetStreamsAll, twitchGetUsersByIds } from '../lib/twitch_api';
import { gameIds, codingTagIds } from '../lib/config';
import { logTimeStart, logTimeFinished } from '../lib/util';
import prisma from '../lib/prisma';
import logger from '../lib/logger';

async function getActiveStreams(tagName) {
  const tagId = codingTagIds[tagName];

  return (
    await twitchGetStreamsAll({
      game: [gameIds['Science & Technology'], gameIds['BASIC Programming']],
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

  // Need this to recognise newly queued entries later
  const lastQueueItem = await prisma.queue.findFirst({
    orderBy: {
      id: 'desc',
    },
    select: {
      id: true,
    },
    take: 1,
  });
  const lastQueueItemId = lastQueueItem?.id || 0;

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
      select: { id: true, name: true, createdAt: true },
    });

    // Dumb Prisma workaround to check if a record was added
    if (result.id > lastQueueItemId) {
      logger.info(`Queued https://www.twitch.tv/${result.name}`);
      newQueuedCount++;
    }
  }

  if (newQueuedCount > 0)
    logger.info(`Queued ${pluralize('new channels', newQueuedCount, true)} from ${tagName} search`);
  else logger.info('No new channels needed to be queued');
}

async function findChannels(tagName) {
  logger.info(`Getting current ${tagName} streams`);

  const liveStreams = await getActiveStreams(tagName);
  logger.info(`Found ${pluralize(`${tagName} stream`, liveStreams.length, true)}`);

  if (liveStreams.length === 0) return;

  const newChannels = await identifyNewChannels(liveStreams);
  logger.info(`Identified ${pluralize('untracked channel', newChannels.length, true)}`);

  if (newChannels.length === 0) return;

  await saveNewChannels({ streams: newChannels, tagName });
}

(async () => {
  const start = logTimeStart();

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

  logger.info(`Marking 'PENDING' queue items that exist as channels as 'ADDED'`);
  await prisma.$queryRaw(`
    UPDATE "Queue"
    SET status = 'ADDED'
    WHERE "twitchId" IN
      (SELECT "Channel"."twitchId" FROM "Channel")
      AND status = 'PENDING';
  `);

  logger.info('Disconnecting...');
  await prisma.$disconnect();

  logTimeFinished(start, 'findChannels');
})();
