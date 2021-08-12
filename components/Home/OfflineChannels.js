import { useContext } from 'react';

import Section from '../Layout/Section';
import TwitchProfile from './TwitchProfile';

import { useOfflineChannels } from '../../lib/api';
import { HomePageContext } from '../../lib/stores';

export default function OfflineChannels() {
  const { isLoading, error, data: offlineChannels } = useOfflineChannels();
  const { topicFilter } = useContext(HomePageContext);

  if (isLoading || !offlineChannels?.length) return null;

  if (error)
    return (
      <Section>
        <div className='p-2'>Error fetching offline channels: ${error}</div>
      </Section>
    );

  return (
    <Section>
      <div className='px-1 sm:px-3 py-3'>
        <h2 className='font-header text-lg sm:text-xl'>Recently online for '{topicFilter}':</h2>
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 mx-auto'>
          {offlineChannels.map((channel) => (
            <div key={channel.name} className='w-45 align-top my-1 mx-1 sm:mx-2'>
              <TwitchProfile channel={channel} avatarSize='large' />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
