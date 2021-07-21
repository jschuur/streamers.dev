import consoleStamp from 'console-stamp';
import { sumBy } from 'lodash';

import prisma from '../lib/prisma';
import { isCoding, selectFromFields } from '../lib/util';

import { SNAPSHOT_CHANNEL_FIELDS, SNAPSHOT_VALUE_FIELDS } from '../lib/config';

consoleStamp(console, { format: ':date(yyyy-mm-dd HH:MM:ss.l).gray :label(7)' });

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
  const currentSnapshot = await getCurrentSnapshot();
  const liveChannels = await getLiveChannels();
  const trackedChannels = await getTrackedChannels();

  const codingChannels = liveChannels.filter((channel) => isCoding(channel));

  // Calculate the current metrics
  const liveCodingChannels = codingChannels.length;
  const liveCodingViewers = sumBy(codingChannels, 'latestStreamViewers');
  const totalLiveChannels = liveChannels.length;
  const totalLiveViewers = sumBy(liveChannels, 'latestStreamViewers');

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
    console.log(`Snapshot updated (${JSON.stringify(snapshotData)})`);
  } else console.log('No snapshot updated needed');
}

(async () => {
  console.time('Time spent');

  try {
    await updateSnapshot();
  } catch ({ message }) {
    console.error(`Error: ${message}`);
  }

  console.log('Disconnecting...');
  await prisma.$disconnect();

  console.timeEnd('Time spent');
})();
