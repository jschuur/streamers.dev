import { sumBy } from 'lodash';
import { useTheme } from 'next-themes';
import pluralize from 'pluralize';

import Loader from '../components/Layout/Loader';
import Layout from '../components/Layout/Layout';
import Section, { SectionText, SectionHeader, SectionBlock } from '../components/Layout/Section';
import RecentStreamTopics from '../components/Explore/RecentStreamTopics';
import ChannelGrid from '../components/ChannelGrid';

import { useExploreData } from '../lib/api';

import {
  EXPLORE_RECENT_STREAM_TOPICS_DAYS,
  EXPLORE_NEW_ACTIVE_CHANNEL_LIMIT,
  EXPLORE_NEW_ACTIVE_CHANNEL_DAYS,
  EXPLORE_NEW_ACTIVE_CHANNEL_MIN_STREAMS,
} from '../lib/config';
import { formatNumber } from '../lib/util';

export function Explore() {
  const { theme } = useTheme();

  // TODO: useQuery cache is never used, due to how the explore page is loaded/mounted
  const { isLoading, error, data: { topicPopularity, newActiveChannels } = {} } = useExploreData();

  if (isLoading)
    return (
      <Section className='p-2'>
        <Loader message='Loading explore data...' theme={theme} />
      </Section>
    );

  if (error) return <Section>Error: {error.message}</Section>;

  return (
    <>
      {topicPopularity?.length && (
        <Section>
          <SectionHeader id={'topics'}>Recent Topics by Stream Count</SectionHeader>
          <SectionBlock>
            <RecentStreamTopics topicPopularity={topicPopularity} />
          </SectionBlock>
          <SectionText>
            {formatNumber(topicPopularity.length, 'topic')} across{' '}
            {formatNumber(sumBy(topicPopularity, 'count'), 'stream')} in the last{' '}
            {formatNumber(EXPLORE_RECENT_STREAM_TOPICS_DAYS, 'day')}, identified by Twitch tags and
            title keywords.
          </SectionText>
        </Section>
      )}
      {newActiveChannels?.length && (
        <Section>
          <SectionHeader id={'channels'}>Most Active Newly Added Channels</SectionHeader>
          <SectionBlock>
            <ChannelGrid channels={newActiveChannels} />
          </SectionBlock>
          <SectionText>
            Added in the last {pluralize('day', EXPLORE_NEW_ACTIVE_CHANNEL_DAYS, true)}, with at
            least {pluralize('stream', EXPLORE_NEW_ACTIVE_CHANNEL_MIN_STREAMS, true)} (max{' '}
            {pluralize('channel', EXPLORE_NEW_ACTIVE_CHANNEL_LIMIT, true)}).
          </SectionText>
        </Section>
      )}
    </>
  );
}

export default function ExplorePage() {
  return (
    <Layout
      page='explore'
      url='https://streamers.dev/explore'
      description='Explore live-coding streamers.'
    >
      <Explore />
    </Layout>
  );
}
