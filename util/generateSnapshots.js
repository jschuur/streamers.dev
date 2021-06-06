import consoleStamp from 'console-stamp';

import prisma from '../lib/prisma';;
consoleStamp(console, { format: ':date(yyyy-mm-dd HH:MM:ss.l).gray :label(7)' });

const now = new Date();
now.setMinutes(0);
now.setSeconds(0);
now.setMilliseconds(0);

const FILTER_LIVE_CHANNEL = { isLive: true };
const FILTER_LIVE_CODING_CHANNEL = { isLive: true, OR: [{ latestStreamGameName: { equals: 'Science & Technology' } }, { alwaysCoding: { equals: true } },], };
const FILTER_LIVE_NON_CODING_CHANNEL = {
  isLive: true,
  latestStreamGameName: { not: 'Science & Technology' },
  alwaysCoding: false,
};

async function getRecentSnapshotValue({ type }) {
  const result = await prisma.snapshot.findFirst({ where: { timeStamp: now, type } });

  return result?.value;
}

async function upsertSnapshotValue({ type, value }) {
  await prisma.snapshot.upsert({
    where: { type_timeStamp: { timeStamp: now, type } },
    update: { value },
    create: { timeStamp: now, type, value},
  });
}

async function getCurrentCount({ filter = {}, sumBy }) {
  const options = {
    where: {
      isHidden: false,
      isPaused: false,
      ...filter,
    },
  };

  if (sumBy === 'viewers') options['_sum'] = { latestStreamViewers: true }
  else options['_count'] = { name: true };

  const result = await prisma.user.aggregate(options);

  return (sumBy === 'viewers' ? (result?._sum.latestStreamViewers || 0) : (result?._count.name || 0));
}

async function saveMaxSnapshotValue({ type, filter, current, sumBy }) {
  const recentValue = await getRecentSnapshotValue({ type });
  const currentValue = (typeof current  !== 'undefined') ? current : (await getCurrentCount({ filter, sumBy }));

  if (!recentValue || (currentValue > recentValue)) {
    console.log(`New ${type}: ${currentValue}`);

    await upsertSnapshotValue({
      timeStamp: now,
      type,
      value: currentValue,
    });
  }

  return currentValue;
}

async function saveTrackedChannelCountSnapshot() {
  console.log('Checking recent tracked channel count');

  await saveMaxSnapshotValue({
    type: 'TRACKEDCHANNELS',
    current: await getCurrentCount({ sumBy: 'channels' }),
  });
}

async function saveLiveCountSnapshots({ sumBy }) {
  console.log(`Checking recent ${sumBy} counts`);

  // Get last viewer counts for this hour
  const currentTotal = await saveMaxSnapshotValue({
    sumBy,
    type: `PEAK${sumBy.toUpperCase()}`,
    filter: FILTER_LIVE_CHANNEL,
  });

  await saveMaxSnapshotValue({
    sumBy,
    type: `PEAK${sumBy.toUpperCase()}_CODING`,
    filter: FILTER_LIVE_CODING_CHANNEL,
  });

  const currentNonCoding = await saveMaxSnapshotValue({
    sumBy,
    type: `PEAK${sumBy.toUpperCase()}_NONCODING`,
    filter: FILTER_LIVE_NON_CODING_CHANNEL,
  });

  if (currentTotal)
    await saveMaxSnapshotValue({
      type: `PEAKPERCENTAGE_${sumBy.toUpperCase()}_NONCODING`,
      current: parseFloat((currentNonCoding / currentTotal).toFixed(4)),
    });
}

(async () => {
  console.time('Time spent');

  try {
    await saveTrackedChannelCountSnapshot();
    await saveLiveCountSnapshots({ sumBy: 'viewers' });
    await saveLiveCountSnapshots({ sumBy: 'channels' });

    // TODO: Save by language
  } catch ({ message }) {
    console.error(`Error: ${message}`);;
  }

  console.log('Disconnecting...');
  await prisma.$disconnect();

  console.timeEnd('Time spent');
})();
