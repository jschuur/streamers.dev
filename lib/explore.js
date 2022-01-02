import { subDays } from 'date-fns';
import { omit } from 'lodash';
import slugify from 'slugify';

import { selectFromFields } from './util';
import prisma from './prisma';

import {
  CHANNEL_GRID_FIELDS,
  EXPLORE_NEW_ACTIVE_CHANNEL_DAYS,
  EXPLORE_NEW_ACTIVE_CHANNEL_MIN_STREAMS,
  EXPLORE_NEW_ACTIVE_CHANNEL_LIMIT,
  EXPLORE_RECENT_STREAM_TOPICS_DAYS,
} from './config';

export async function getExploreData() {
  // Can't be done in a Prisma query (yet: https://github.com/prisma/prisma/discussions/10869)
  // TODO: Don't use $queryRawUnsafe (Prisma bug? https://github.com/prisma/prisma/issues/10051)
  const topicPopularity = await prisma.$queryRawUnsafe(`
    SELECT
        COUNT(*) AS count, t.tag AS name, MAX(k.slug) AS slug
    FROM
        "Stream" AS s, "Keyword" AS k
    CROSS JOIN LATERAL UNNEST(s."allTags") AS t(tag)
    WHERE
        k.tag = t.tag AND
        s."startedAt" > (CURRENT_TIMESTAMP - interval '${EXPLORE_RECENT_STREAM_TOPICS_DAYS} day')
    GROUP BY
        t.tag
    ORDER BY count DESC, name ASC`);

  // TODO: Filter by coding stream count
  const newActiveChannelsData = await prisma.channel.findMany({
    select: {
      ...selectFromFields(CHANNEL_GRID_FIELDS),
      _count: {
        select: {
          streams: true,
        },
      },
    },
    orderBy: {
      streams: {
        _count: 'desc',
      },
    },
    where: {
      createdAt: {
        gt: subDays(new Date(), EXPLORE_NEW_ACTIVE_CHANNEL_DAYS),
      },
    },
    take: EXPLORE_NEW_ACTIVE_CHANNEL_LIMIT,
  });

  // Can't filter for minimum number of streams in Prisma ( et)
  const newActiveChannels = newActiveChannelsData
    .filter((channel) => channel?._count?.streams >= EXPLORE_NEW_ACTIVE_CHANNEL_MIN_STREAMS)
    .map((channel) => ({
      ...omit(channel, '_count'),
      streamCount: channel?._count?.streams,
    }));

  // Merge in the slug data
  for (const topic of topicPopularity) {
    if (!topic.slug) {
      topic.slug = slugify(topic.name, { lower: true, remove: '.' });
    }
  }

  return { _createdAt: new Date(), data: { topicPopularity, newActiveChannels } };
}
