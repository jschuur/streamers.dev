import pluralize from 'pluralize';
import { useContext } from 'react';

import Section, { SectionHeader, SectionBlock, SectionText } from '../Layout/Section';
import ChannelGrid from '../ChannelGrid';

import { useOfflineChannels } from '../../lib/api';
import { HomePageContext } from '../../lib/stores';

import { OFFLINE_CHANNELS_LIMIT, OFFLINE_CHANNELS_RECENT_DAYS } from '../../lib/config';

export default function OfflineChannels() {
  const { isLoading, error, data: offlineChannels } = useOfflineChannels();
  const { topicFilter } = useContext(HomePageContext);

  if (isLoading || !offlineChannels?.channels?.length) return null;

  if (error)
    return (
      <Section>
        <SectionText>Error fetching offline channels: ${error}</SectionText>
      </Section>
    );

  return (
    <Section>
      <SectionHeader iid={'recent'}>Recently online for '{topicFilter}'</SectionHeader>
      <SectionBlock>
        <ChannelGrid channels={offlineChannels.channels} />
      </SectionBlock>

      <SectionText>
        Online in the last {pluralize('day', OFFLINE_CHANNELS_RECENT_DAYS, true)}, identified by
        Twitch tags and title keywords (max {pluralize('channel', OFFLINE_CHANNELS_LIMIT, true)}).
      </SectionText>
    </Section>
  );
}
