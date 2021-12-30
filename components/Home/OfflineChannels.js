import { useContext } from 'react';

import Section, { SectionHeader, SectionBlock, SectionText } from '../Layout/Section';
import ChannelGrid from '../ChannelGrid';

import { useOfflineChannels } from '../../lib/api';
import { HomePageContext } from '../../lib/stores';

export default function OfflineChannels() {
  const { isLoading, error, data: offlineChannels } = useOfflineChannels();
  const { topicFilter } = useContext(HomePageContext);

  if (isLoading || !offlineChannels?.length) return null;

  if (error)
    return (
      <Section>
        <SectionText>Error fetching offline channels: ${error}</SectionText>
      </Section>
    );

  // TODO: Define recent in section footer
  return (
    <Section>
      <SectionHeader id={'recent'}>Recently online for '{topicFilter}'</SectionHeader>
      <SectionBlock>
        <ChannelGrid channels={offlineChannels} />
      </SectionBlock>
    </Section>
  );
}
