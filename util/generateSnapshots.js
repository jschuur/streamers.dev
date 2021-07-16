import consoleStamp from 'console-stamp';
import { sumBy } from 'lodash';

import prisma from '../lib/prisma';

import { isCoding, selectFromFields } from '../lib/util';

consoleStamp(console, { format: ':date(yyyy-mm-dd HH:MM:ss.l).gray :label(7)' });

const now = new Date();
now.setMinutes(0);
now.setSeconds(0);
now.setMilliseconds(0);

const SNAPSHOT_CHANNEL_FIELDS = [
  'latestStreamGameName',
  'latestStreamTags',
  'latestStreamTwitchTags',
  'latestStreamViewers',
  'alwaysCoding',
];

async function getRecentSnapshotValue({ type }) {
  const result = await prisma.snapshot.findFirst({ where: { timeStamp: now, type } });

  return result?.value;
}

async function upsertSnapshotValue({ type, value }) {
  await prisma.snapshot.upsert({
    where: { type_timeStamp: { timeStamp: now, type } },
    update: { value },
    create: { timeStamp: now, type, value },
  });
}

async function saveMaxSnapshotValue({ type, value }) {
  const recentValue = await getRecentSnapshotValue({ type });

  if (!recentValue || value > recentValue) {
    console.log(`New ${type}: ${value}`);

    await upsertSnapshotValue({
      timeStamp: now,
      type,
      value,
    });
  }
}

async function saveTrackedChannelCountSnapshot() {
  console.log('Checking recent tracked channel count');

  const options = {
    where: {
      isHidden: false,
      isPaused: false,
    },
    _count: { name: true },
  };

  const result = await prisma.channel.aggregate(options);
  const trackedChannelCount = result?._count.name || 0;

  await saveMaxSnapshotValue({
    type: 'TRACKEDCHANNELS',
    value: trackedChannelCount,
  });
}

async function saveLiveCountSnapshots() {
  const snapshots = [
    {
      type: 'PEAKVIEWERS',
      value: ({ liveChannels }) => sumBy(liveChannels, 'latestStreamViewers'),
    },
    {
      type: 'PEAKVIEWERS_CODING',
      value: ({ codingChannels }) => sumBy(codingChannels, 'latestStreamViewers'),
    },
    {
      type: 'PEAKVIEWERS_NONCODING',
      value: ({ nonCodingChannels }) => sumBy(nonCodingChannels, 'latestStreamViewers'),
    },
    {
      type: 'PEAKPERCENTAGE_VIEWERS_NONCODING',
      value: ({ liveChannels, nonCodingChannels }) => {
        const totalViewers = sumBy(liveChannels, 'latestStreamViewers');

        return totalViewers
          ? parseFloat((sumBy(nonCodingChannels, 'latestStreamViewers') / totalViewers).toFixed(4))
          : 0;
      },
    },
    {
      type: 'PEAKCHANNELS',
      value: ({ liveChannels }) => liveChannels.length,
    },
    {
      type: 'PEAKCHANNELS_CODING',
      value: ({ codingChannels }) => codingChannels.length,
    },
    {
      type: 'PEAKCHANNELS_NONCODING',
      value: ({ nonCodingChannels }) => nonCodingChannels.length,
    },
    {
      type: 'PEAKPERCENTAGE_CHANNELS_NONCODING',
      value: ({ liveChannels, nonCodingChannels }) =>
        liveChannels.length
          ? parseFloat((nonCodingChannels.length / liveChannels.length).toFixed(4))
          : 0,
    },
  ];

  const options = {
    select: selectFromFields(SNAPSHOT_CHANNEL_FIELDS),
    where: {
      isHidden: false,
      isPaused: false,
      isLive: true,
    },
  };

  const liveChannels = await prisma.channel.findMany(options);
  const codingChannels = liveChannels.filter((channel) => isCoding(channel));
  const nonCodingChannels = liveChannels.filter((channel) => !isCoding(channel));

  for (const { type, value } of snapshots) {
    await saveMaxSnapshotValue({
      type,
      value: value({ liveChannels, codingChannels, nonCodingChannels }),
    });
  }
}

(async () => {
  console.time('Time spent');

  try {
    await saveTrackedChannelCountSnapshot();
    await saveLiveCountSnapshots();

    // TODO: Save by language
  } catch ({ message }) {
    console.error(`Error: ${message}`);
  }

  console.log('Disconnecting...');
  await prisma.$disconnect();

  console.timeEnd('Time spent');
})();
