import { sumBy } from 'lodash';
import Link from 'next/link';

import Badge from '../Badge';
import Section, { SectionText, SectionHeader, SectionBlock } from '../Layout/Section';

import { formatNumber } from '../../lib/util';

import { EXPLORE_RECENT_STREAM_TOPICS_DAYS } from '../../lib/config';

function RecentStreamTopicsBadge({ name, count, slug }) {
  const url = `/?topic=${slug}`;
  let color = 'gray';

  if (count >= 100) color = 'purple';
  else if (count >= 25) color = 'red';
  else if (count >= 10) color = 'green';
  else if (count > 1) color = 'blue';

  return (
    <Link href={url} passHref>
      <Badge color={color}>
        {name} ({count})
      </Badge>
    </Link>
  );
}

export default function RecentStreamTopics({ topics }) {
  if (!topics?.length) return null;

  return (
    <Section>
      <SectionHeader id={'topics'}>Recent Topics by Stream Count</SectionHeader>
      <SectionBlock>
        {topics.map((topic) => (
          <RecentStreamTopicsBadge key={topic.name} {...topic} />
        ))}
      </SectionBlock>

      <SectionText>
        {formatNumber(topics.length, 'topic')} across{' '}
        {formatNumber(sumBy(topics, 'count'), 'stream')} in the last{' '}
        {formatNumber(EXPLORE_RECENT_STREAM_TOPICS_DAYS, 'day')}, identified by Twitch tags and
        title keywords. Only a small subset of Twitch{' '}
        <a href='https://www.twitch.tv/directory/game/Software%20and%20Game%20Development?tl=f588bd74-e496-4d11-9169-3597f38a5d25'>
          game development streams
        </a>{' '}
        currently tracked.
      </SectionText>
    </Section>
  );
}
