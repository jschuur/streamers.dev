import { sumBy } from 'lodash';

import Badge from '../Badge';
import Section, { SectionText, SectionHeader, SectionBlock } from '../Layout/Section';

import useFilterNav from '../../hooks/useFilterNav';

import { formatNumber } from '../../lib/util';
import { gameDevStreamTags } from '../../lib/config';

import { EXPLORE_RECENT_STREAM_TOPICS_DAYS } from '../../lib/config';

// TODO: Create a shared stream topic badge list component between the nav and this
function RecentStreamTopicsBadge({ name, count }) {
  const filterNav = useFilterNav();

  let color = 'gray';
  const gameDev = gameDevStreamTags.includes(name);
  const onClick = () => filterNav({ topicFilter: name });

  if (count >= 100) color = 'purple';
  else if (count >= 25) color = 'red';
  else if (count >= 10) color = 'green';
  else if (count > 1) color = 'blue';

  return (
    <Badge color={color} onClick={onClick}>
      {gameDev && <span className='pr-2'>🎮</span>}
      {name} ({count})
    </Badge>
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
        title keywords.
      </SectionText>
    </Section>
  );
}
