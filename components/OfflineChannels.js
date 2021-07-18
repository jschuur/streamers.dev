import { useEffect, useContext } from 'react';

import TwitchProfile from './TwitchProfile';

import { HomePageContext } from '../lib/stores';

export default function OfflineChannels() {
  const { offlineChannels, topicFilter, categoryFilter } = useContext(HomePageContext);

  // Skip when there are no channels or when we're in the Non-Coding section
  if (!offlineChannels?.length || categoryFilter === 1) return null;

  return (
    <div className='px-2 sm:px-3 py-2 shadow-md overflow-hidden sm:rounded-lg mt-4 bg-white dark:bg-gray-600'>
      <h2 className='text-lg sm:text-xl'>Recently online for '{topicFilter}':</h2>
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 mx-auto'>
        {offlineChannels.map((channel) => (
          <div key={channel.name} className='w-45 align-top my-1 mx-1 sm:mx-2'>
            <TwitchProfile channel={channel} avatarSize='large' />
          </div>
        ))}
      </div>
    </div>
  );
}
