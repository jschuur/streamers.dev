import { parseISO, intervalToDuration, differenceInMinutes } from 'date-fns';
import pluralize from 'pluralize';
import getUnicodeFlagIcon from 'country-flag-icons/unicode';
import { by639_1 } from 'iso-language-codes';

import SocialButtons from './SocialButtons';
import VideoThumbnail from './VideoThumbnail';
import { RedBadge, GreenBadge } from './Badge';

import { formatDurationShort, TwitchLink } from '../lib/util';

import { STREAM_RECENT_MINUTES } from '../lib/config';

export default function UserListEntry({ user, userIndex }) {
  const startDate = parseISO(user.latestStreamStartedAt),
    now = new Date();

    console.log(user.broadcasterType);
  return (
    <tr className={userIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
      <td className='px-2 py-2 align-top'>
        <div className='flex items-start'>
          <div className='flex-shrink-0 h-10 w-10 align-center'>
            <TwitchLink username={user.name}>
              <img
                className={`h-10 w-10 rounded-full ${
                  user.broadcasterType === 'partner'
                    ? 'border-purple-600 border-[3px]'
                    : user.broadcasterType === 'affiliate' && 'border-blue-600 border-[3px]'
                }`}
                src={user.profilePictureUrl}
                alt={`Avatar for ${user.displayName}`}
              />
            </TwitchLink>
            <div className='text-center text-xs md:text-base mt-1'>
              {user.country && <>{getUnicodeFlagIcon(user.country.toUpperCase())}</>}
              {user.country2 && <>{getUnicodeFlagIcon(user.country2.toUpperCase())}</>}
            </div>
          </div>
          <div className='ml-4'>
            <div className='text-gray-900'>
              <TwitchLink username={user.name}>{user.displayName}</TwitchLink>
              <br />
              <div className='text-xs md:text-sm text-gray-500 mt-1'>
                {user.fullName && <>{user.fullName}</>}
              </div>
            </div>
            <div className='text-sm text-gray-500'></div>
          </div>
        </div>
      </td>
      <td className='px-2 py-2 align-top hidden md:table-cell'>
        <TwitchLink username={user.name}>
          <VideoThumbnail username={user.name} width={200} height={120} />
        </TwitchLink>
      </td>
      <td
        className='py-2 px-2 align-top cursor-pointer'
        onClick={() => (window.location.href = `https://twitch.tv/${user.name}`)}
      >
        {user.latestStreamLanguage && user.latestStreamLanguage !== 'en' && (
          <GreenBadge>{by639_1[user.latestStreamLanguage].name}</GreenBadge>
        )}
        {user.latestStreamGameName && user.latestStreamGameName !== 'Science & Technology' && (
          <RedBadge>{user.latestStreamGameName}</RedBadge>
        )}
        <div className='text-sm text-gray-900 break-words md:break-normal mt-1'>
          {user.latestStreamTitle}
        </div>
        <div
          className={`text-xs mt-1 text-right ${
            differenceInMinutes(now, startDate) <= STREAM_RECENT_MINUTES
              ? 'text-green-500'
              : 'text-gray-400'
          }`}
        >
          {user.latestStreamViewers} {pluralize('viewers', user.latestStreamViewers)}, live for{' '}
          {formatDurationShort(intervalToDuration({ start: startDate, end: now }))}
        </div>
      </td>
      <td className='px-2 py-2 align-top hidden sm:table-cell'>
        <SocialButtons user={user} />
      </td>
    </tr>
  );
}
