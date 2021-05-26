import { parseISO, intervalToDuration, formatDuration, differenceInMinutes } from 'date-fns';
import pluralize from 'pluralize';

import SocialButtons from './SocialButtons';

import { STREAM_RECENT_MINUTES } from '../lib/config';

export default function UserListEntry({ user, userIndex }) {
  const startDate = parseISO(user.latestStreamStartedAt),
    now = new Date();

  return (
    <tr className={userIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
      <td className='px-6 py-4 align-top'>
        <div className='flex items-start'>
          <div className='flex-shrink-0 h-10 w-10'>
            <a href={'https://twitch.tv/' + user.displayName}>
              <img
                className='h-10 w-10 rounded-full'
                src={user.profilePictureUrl}
                alt={`Avatar for ${user.displayName}`}
              />
            </a>
          </div>
          <div className='ml-4'>
            <div className='text-sm font-medium text-gray-900'>
              <a href={'https://twitch.tv/' + user.name}>{user.displayName}</a> <br />
              <div className='text-gray-500 mt-1'>{user.fullName && <>{ user.fullName }</>}</div>
              <div className='block sm:hidden mt-2'>
                <SocialButtons user={user} />
              </div>
            </div>
            <div className='text-sm text-gray-500'></div>
          </div>
        </div>
      </td>
      <td
        className='px-6 py-2 align-top cursor-pointer'
        onClick={() => (window.location.href = `https://twitch.tv/${user.name}`)}
      >
        <div className='text-sm text-gray-900'>{user.latestStreamTitle}</div>
        <div
          className={`text-xs mt-1 ${
            differenceInMinutes(now, startDate) <= STREAM_RECENT_MINUTES
              ? 'text-green-500'
              : 'text-gray-400'
          }`}
        >
          {user.latestStreamViewers} {pluralize('viewers', user.latestStreamViewers)}, live for{' '}
          {formatDuration(intervalToDuration({ start: startDate, end: now }), {
            format: ['years', 'months', 'weeks', 'days', 'hours', 'minutes'],
          })}
        </div>
      </td>
      <td className='px-2 py-2 align-top hidden sm:table-cell'>
        <SocialButtons user={user} />
      </td>
    </tr>
  );
}
