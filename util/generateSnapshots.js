import consoleStamp from 'console-stamp';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient(process.env.DEBUG ? { log: ['query'] } : {});
consoleStamp(console, { format: ':date(yyyy-mm-dd HH:MM:ss.l).gray :label(7)' });

const now = new Date();
now.setMinutes(0);
now.setSeconds(0);
now.setMilliseconds(0);

// TODO: Dry these two up
async function saveTrackedUserCount() {
  const timeType = { timeStamp: now, type: 'TRACKEDUSERS' };

  // Get last viewer count for this hour
  let result = await prisma.snapshot.findFirst({ where: timeType });
  const recentUserCount = result?.value;

  // Get current user count
  result = await prisma.user.aggregate({
    _count: {
      name: true,
    },
  });
  const userCount = result._count.name;

  // Save new snapshot if higher
  if (!recentUserCount || !(userCount <= recentUserCount)) {
    await prisma.snapshot.upsert({
      where: { type_timeStamp: timeType },
      update: { ...timeType, value: userCount },
      create: { ...timeType, value: userCount },
    });
  }

  console.log(`Tracker users: ${userCount}`);
}

async function saveConcurrentViewerCount() {
  const timeType = { timeStamp: now, type: 'PEAKVIEWERS' };

  // Get last viewer count for this hour
  let result = await prisma.snapshot.findFirst({ where: timeType });
  const recentViewCount = result?.value;

  // Get current viewer count
  result = await prisma.user.aggregate({
    _sum: {
      latestStreamViewers: true,
    },
    where: {
      isLive: true,
    },
  });
  const viewerCount = result._sum.latestStreamViewers;

  // Save new snapshot if higher
  if (!recentViewCount || !(viewerCount <= recentViewCount)) {
    await prisma.snapshot.upsert({
      where: { type_timeStamp: timeType },
      update: { ...timeType, value: viewerCount },
      create: { ...timeType, value: viewerCount },
    });
  }

  console.log(`Viewer count: ${viewerCount}`);
}

(async () => {
  console.time('Time spent');

  await saveConcurrentViewerCount();
  await saveTrackedUserCount();

  console.log('Disconnecting...');
  await prisma.$disconnect();

  console.timeEnd('Time spent');
})();
