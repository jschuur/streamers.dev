import { differenceInDays } from 'date-fns';
import { sortBy, groupBy } from 'lodash';
import { useTheme } from 'next-themes';
import pluralize from 'pluralize';

import Loader from '../../components/Layout/Loader';
import ChannelGrid from '../../components/ChannelGrid';
import Section, {
  SectionHeader,
  SectionSubHeader,
  SectionBlock,
} from '../../components/Layout/Section';

import { useRecentChannels } from '../../lib/api';

function groupChannelsByDate(channels) {
  return groupBy(sortBy(channels, 'createdAt').reverse(), ({ createdAt }) => {
    const days = differenceInDays(new Date(), new Date(createdAt));

    return days > 0 ? `${pluralize('day', days, true)} ago` : 'Less than 24 hours ago';
  });
}

export default function RecentlyAddedChannels() {
  const { theme } = useTheme();

  const { isLoading, data: recentChannels } = useRecentChannels();

  if (isLoading) return <Loader message='Loading recently added channels...' theme={theme} />;

  const { channels } = recentChannels;

  return channels?.length ? (
    <Section>
      <SectionHeader>Recently added channels without details ({channels.length})</SectionHeader>
      <SectionBlock>
        {Object.entries(groupChannelsByDate(channels)).map(([header, channels]) => (
          <div key={header}>
            <SectionSubHeader>{header}</SectionSubHeader>
            <ChannelGrid channels={channels} />
          </div>
        ))}
      </SectionBlock>
    </Section>
  ) : (
    <div> No new channels in need of updating found</div>
  );
}
