import React from 'react';

import TwitchAvatar from './TwitchAvatar';
import CountryFlags from './CountryFlags';
import TwitchLink from './TwitchLink';

export default function TwitchProfile({
  channel,
  avatarSize = 'small',
  includeStreamCount = false,
}) {
  const { name, displayName, fullName, streamCount } = channel;

  return (
    <div className={'w-48 align-top'}>
      <div className='flex flex-col'>
        {/* Channel display name  */}
        <div className='text-base sm:text-lg whitespace-nowrap'>
          <TwitchLink username={name}>{displayName}</TwitchLink>
          {includeStreamCount && streamCount && (
            <span className='text-slate-400 dark:text-slate-200'> ({streamCount})</span>
          )}
        </div>
        {/* Channel full name and avatar */}
        <div className='flex'>
          <div className='flex-shrink-0 flex flex-col text-xl md:text-3xl'>
            <TwitchAvatar channel={channel} size={avatarSize} />
          </div>
          <div className='ml-3 text-3xl self-center'>
            <CountryFlags channel={channel} />
          </div>
        </div>
        <div className='text-sm sm:text-base font-light text-gray-500 dark:text-gray-300 mt-1'>
          {fullName}
        </div>
      </div>
    </div>
  );
}
