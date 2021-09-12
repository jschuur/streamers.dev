import { map, keyBy } from 'lodash';
import pluralize from 'pluralize';
import prettyMilliseconds from 'pretty-ms';
import 'dotenv/config';

import { twitchGetStreamsAll, twitchGetUsersByIds } from '../lib/twitch_api';
import { gameIds, codingTagIds, gameCodingTagIds, ALWAYS_CODING_GAMENAMES } from '../lib/config';
import prisma from '../lib/prisma';
import logger from '../lib/logger';
import { addOrUpdateQueueItem } from '../lib/db';

async function getActiveStreams(tagName) {
  const tagId = codingTagIds[tagName] || gameCodingTagIds[tagName];

  return (
    await twitchGetStreamsAll({
      game: ALWAYS_CODING_GAMENAMES.map((game) => gameIds[game]),
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

  logger.info(`Attempting to queue new pending channels...`);

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
    const result = await addOrUpdateQueueItem({
      twitchId: stream.userId,
      stream,
      user: twitchUsers[stream.userId],
      tagName,
    });

    // Dumb Prisma workaround to check if a record was added
    if (result.id > lastQueueItemId) {
      logger.info(`...queued https://www.twitch.tv/${result.name}`);
      newQueuedCount++;
    }
  }

  if (newQueuedCount > 0)
    logger.info(
      `...added ${pluralize('new channels', newQueuedCount, true)} to the ${tagName} queue`
    );
  else logger.info(`...no new ${tagName} channels needed to be queued`);
}

async function findChannels(tagName) {
  logger.info(`Getting current ${tagName} streams`);

  const liveStreams = await getActiveStreams(tagName);
  logger.info(`Found ${pluralize(`${tagName} live stream`, liveStreams.length, true)}`);

  if (liveStreams.length === 0) return;

  const newChannels = await identifyNewChannels(liveStreams);
  logger.info(`...of which there are ${pluralize('untracked channel', newChannels.length, true)}`);

  if (newChannels.length === 0) return;

  await saveNewChannels({ streams: newChannels, tagName });
}

(async () => {
  const start = new Date();

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

  logger.info(
    `Time spent (findChannels): ${prettyMilliseconds(new Date() - start, {
      separateMilliseconds: true,
    })}`
  );
})();
