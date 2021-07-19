import consoleStamp from 'console-stamp';
import { sumBy, isEqual } from 'lodash';

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
  return prisma.snapshot.findFirst({
    select: selectFromFields(SNAPSHOT_VALUE_FIELDS),
    where: { timeStamp: now },
  });
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

  // Calculate the current snapshot values
  const liveCodingChannels = codingChannels.length;
  const liveCodingViewers = sumBy(codingChannels, 'latestStreamViewers');
  const totalLiveChannels = liveChannels.length;
  const totalLiveViewers = sumBy(liveChannels, 'latestStreamViewers');

  const snapshotData = {
    peakLiveCodingViewers: Math.max(currentSnapshot?.peakLiveCodingViewers || 0, liveCodingViewers),
    peakLiveCodingChannels: Math.max(
      currentSnapshot?.peakLiveCodingChannels || 0,
      liveCodingChannels
    ),
    totalLiveViewers: Math.max(currentSnapshot?.totalLiveViewers || 0, totalLiveViewers),
    totalLiveChannels: Math.max(currentSnapshot?.totalLiveChannels || 0, totalLiveChannels),
    trackedChannels: Math.max(currentSnapshot?.trackedChannels || 0, trackedChannels),
  };

  // Update the snapshot if anything changed
  if (!isEqual(currentSnapshot, snapshotData)) {
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
