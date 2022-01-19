import { subDays } from 'date-fns';
import { omit, sumBy, orderBy } from 'lodash';

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
        COUNT(*) AS count, t.tag AS name
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
      streams: {
        select: {
          streamType: true,
          peakViewers: true,
        },
      },
    },
    where: {
      createdAt: {
        gt: subDays(new Date(), EXPLORE_NEW_ACTIVE_CHANNEL_DAYS),
      },
    },
  });

  // Can't filter for minimum number of coding streams in Prisma (yet)
  const newActiveChannels = orderBy(
    newActiveChannelsData
      .map((channel) => {
        // Only count streams that had some coding
        const codingStreams = channel?.streams.filter((stream) =>
          stream.streamType.includes('CODING')
        );

        return {
          ...omit(channel, 'streams'),
          streamCount: codingStreams.length,
          peakViewerSum: sumBy(codingStreams, 'peakViewers'),
        };
      })
      .filter((channel) => channel.streamCount > EXPLORE_NEW_ACTIVE_CHANNEL_MIN_STREAMS),
    ['peakViewerSum'],
    ['desc']
  ).slice(0, EXPLORE_NEW_ACTIVE_CHANNEL_LIMIT);

  return { _createdAt: new Date(), data: { topicPopularity, newActiveChannels } };
}
