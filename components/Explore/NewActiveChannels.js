import pluralize from 'pluralize';

import ChannelGrid from '../ChannelGrid';
import Section, { SectionText, SectionHeader, SectionBlock } from '../Layout/Section';

import {
  EXPLORE_NEW_ACTIVE_CHANNEL_LIMIT,
  EXPLORE_NEW_ACTIVE_CHANNEL_DAYS,
  EXPLORE_NEW_ACTIVE_CHANNEL_MIN_STREAMS,
} from '../../lib/config';

export default function NewActiveChannels({ channels }) {
  if (!channels?.length) return null;

  return (
    <Section>
      <SectionHeader id={'channels'}>Newly Added Channels by Stream Count</SectionHeader>
      <SectionBlock>
        <ChannelGrid channels={channels} />
      </SectionBlock>

      <SectionText>
        Added in the last {pluralize('day', EXPLORE_NEW_ACTIVE_CHANNEL_DAYS, true)}, with at least{' '}
        {pluralize('stream', EXPLORE_NEW_ACTIVE_CHANNEL_MIN_STREAMS, true)} (max{' '}
        {pluralize('channel', EXPLORE_NEW_ACTIVE_CHANNEL_LIMIT, true)}).
      </SectionText>
    </Section>
  );
}
