import { intervalToDuration, formatDuration } from 'date-fns';
import pluralize from 'pluralize';

export default function UserListEntry({ user, userIndex }) {
  return (
    <tr key={user.twitchId} className={userIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
      <td className='px-6 py-4 whitespace-nowrap'>
        <div className='flex items-center'>
          <div className='flex-shrink-0 h-10 w-10'>
            <a href={'https://twitch.tv/' + user.displayName}>
              <img className='h-10 w-10 rounded-full' src={user.profilePictureUrl} alt='' />
            </a>
          </div>
          <div className='ml-4'>
            <div className='text-sm font-medium text-gray-900'>
              <a href={'https://twitch.tv/' + user.displayName}>{user.displayName}</a>{' '}
              {user.fullName && <span className='text-gray-500'>({user.fullName})</span>}
            </div>
            <div className='text-sm text-gray-500'></div>
          </div>
        </div>
      </td>
      <td className='px-6 py-4 whitespace-nowrap'>
        <div className='text-sm text-gray-900'>{user.latestStreamTitle}</div>
        <div className='text-sm text-gray-500'>
          {user.latestStreamViewers} {pluralize('viewers', user.latestStreamViewers)}, live for{' '}
          {formatDuration(
            intervalToDuration({ start: user.latestStreamStartedAt, end: new Date() })
          )}
        </div>
      </td>
      <td className='px-6 py-4 whitespace-nowrap'>
        <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'>
          Live
        </span>
      </td>
      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{user.broadcasterType}</td>
    </tr>
  );
}
