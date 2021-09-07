import { sumBy } from 'lodash';
import prettyMilliseconds from 'pretty-ms';

import prisma from '../lib/prisma';
import { selectFromFields } from '../lib/util';
import logger from '../lib/logger';

import { SNAPSHOT_CHANNEL_FIELDS, SNAPSHOT_VALUE_FIELDS } from '../lib/config';

const now = new Date();
now.setMinutes(0);
now.setSeconds(0);
now.setMilliseconds(0);

async function getLiveChannels() {
  return prisma.channel.findMany({
    select: selectFromFields(SNAPSHOT_CHANNEL_FIELDS),
    where: {
      isHidden: false,
      isPaused: false,
      isLive: true,
    },
  });
}

async function getCurrentSnapshot() {
  const result = await prisma.snapshot.findFirst({
    select: selectFromFields(SNAPSHOT_VALUE_FIELDS),
    where: { timeStamp: now },
  });

  return {
    trackedChannels: result?.trackedChannels || -1,
    peakLiveCodingViewers: result?.peakLiveCodingViewers || -1,
    peakLiveCodingChannels: result?.peakLiveCodingChannels || -1,
    totalLiveViewers: result?.totalLiveViewers || -1,
    totalLiveChannels: result?.totalLiveChannels || -1,
  };
}

async function getTrackedChannels() {
  const result = await prisma.channel.aggregate({
    where: {
      isHidden: false,
      isPaused: false,
    },
    _count: { name: true },
  });

  return result?._count.name || 0;
}

async function updateSnapshot() {
  logger.info('Updating snapshot');

  const currentSnapshot = await getCurrentSnapshot();
  const liveChannels = await getLiveChannels();
  const trackedChannels = await getTrackedChannels();

  const codingChannels = liveChannels.filter(({ isCoding }) => isCoding);

  // Calculate the current metrics
  const liveCodingChannels = codingChannels.length;
  const liveCodingViewers = sumBy(codingChannels, 'latestStreamViewers');
  const totalLiveChannels = liveChannels.length;
  const totalLiveViewers = sumBy(liveChannels, 'latestStreamViewers');

  logger.verbose(
    `Latest metrics: ${JSON.stringify({
      liveCodingViewers,
      totalLiveViewers,
      liveCodingChannels,
      totalLiveChannels,
      trackedChannels,
    })}`
  );

  let snapshotData = {};

  if (trackedChannels > currentSnapshot.trackedChannels)
    snapshotData.trackedChannels = trackedChannels;

  // Keep viewer counts when coding channel viewers are highest
  if (liveCodingViewers > currentSnapshot.peakLiveCodingViewers) {
    snapshotData.peakLiveCodingViewers = liveCodingViewers;
    snapshotData.totalLiveViewers = totalLiveViewers;
  }

  // Keep channel counts when coding channel count is at the highest
  if (liveCodingChannels > currentSnapshot.peakLiveCodingChannels) {
    snapshotData.peakLiveCodingChannels = liveCodingChannels;
    snapshotData.totalLiveChannels = totalLiveChannels;
  }

  // Save new or update recent snapshot if there are changes
  if (Object.entries(snapshotData).length) {
    await prisma.snapshot.upsert({
      where: { timeStamp: now },
      update: { ...snapshotData },
      create: { timeStamp: now, ...snapshotData },
    });
    logger.info(`Snapshot updated (${JSON.stringify(snapshotData)})`);
  } else logger.info('No snapshot updated needed');
}

(async () => {
  const start = new Date();

  try {
    await updateSnapshot();
  } catch ({ message }) {
    logger.error(`Error: ${message}`);
  }

  logger.info('Disconnecting...');
  await prisma.$disconnect();

  logger.info(
    `Time spent (updateSnapshot): ${prettyMilliseconds(new Date() - start, {
      separateMilliseconds: true,
    })}`
  );
})();
