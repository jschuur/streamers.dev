import { useEffect, useContext } from 'react';
import { useImage } from 'react-image';

import { CountryFlagsRow } from './CountryFlags';
import { TwitchLink } from '../lib/util';

import { profilePictureUrl } from '../lib/util';
import { HomePageContext } from '../lib/stores';

import { DEFAULT_AVATAR_URL } from '../lib/config';

// TODO: Abstract this and the original in ChannelListEntry into a reusable component
function OfflineChannelEntry({ channel }) {
  const { name, displayName, fullName, broadcasterType } = channel;
  const { src: profilePictureSrc } = useImage({
    srcList: [profilePictureUrl(channel.profilePictureUrl, 70), DEFAULT_AVATAR_URL],
    useSuspense: false,
  });

  return (
    <div className='w-50 px-2 py-2 align-top' key={name}>
      <div className='flex flex-col mx-2'>
        {/* Channel display name  */}
        <div className='text-base sm:text-lg text-gray-700'>
          <TwitchLink username={name}>{displayName}</TwitchLink>
        </div>

        {/* Channel full name and avatar */}
        <div className='flex'>
          <div className='flex-shrink-0 flex flex-col text-xl md:text-3xl mt-1'>
            <TwitchLink username={name}>
              <img
                className={`h-16 w-16 rounded-full ${
                  broadcasterType === 'partner'
                    ? 'border-purple-600 border-[3px]'
                    : broadcasterType === 'affiliate' && 'border-blue-600 border-[3px]'
                }`}
                src={profilePictureSrc}
                alt={`Avatar for ${displayName}`}
              />
            </TwitchLink>
          </div>
          <div className='text-base text-gray-500 font-light dark:text-gray-300 ml-3 mt-1'>
            {fullName && (
              <>
                {fullName}
                <br />
              </>
            )}
            <span className='text-xl md:text-3xl '>
              <CountryFlagsRow channel={channel} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OfflineChannels() {
  const { offlineChannels, topicFilter, categoryFilter } = useContext(HomePageContext);

  // Skip when there are no channels or when we're in the Non-Coding section
  if (!offlineChannels?.length || categoryFilter === 1) return null;

  return (
    <div className='px-2 sm:px-3 py-2 shadow overflow-hidden sm:rounded-lg mt-4 bg-white dark:bg-gray-600'>
      <h2 className='text-lg sm:text-xl'>Recently online channels for '{topicFilter}':</h2>
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 mx-auto'>
        {offlineChannels.map((channel) => (
          <OfflineChannelEntry channel={channel} />
        ))}
      </div>
    </div>
  );
}
