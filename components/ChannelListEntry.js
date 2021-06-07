import { parseISO, intervalToDuration, differenceInMinutes } from 'date-fns';
import pluralize from 'pluralize';

import SocialButtons from './SocialButtons';
import VideoThumbnail from './VideoThumbnail';
import CountryFlags from './CountryFlags';
import ChannelBadges from './ChannelBadges';

import { formatDurationShort, TwitchLink } from '../lib/util';

import { STREAM_RECENT_MINUTES, MIN_VISIBLE_VIEWER_COUNT } from '../lib/config';

export default function ChannelListEntry({ channel, channelIndex }) {
  const startDate = parseISO(channel.latestStreamStartedAt),
    now = new Date();

  return (
    <tr
      className={
        channel.channelType === 'BRAND'
          ? 'bg-purple-100'
          : channelIndex % 2 === 0
          ? 'bg-white'
          : 'bg-gray-50'
      }
    >
      <td className='px-2 py-2 align-top'>
        <div className='flex items-start'>
          <div className='flex-shrink-0 h-10 w-10 align-center'>
            <TwitchLink channelname={channel.name}>
              <img
                className={`h-10 w-10 rounded-full ${
                  channel.broadcasterType === 'partner'
                    ? 'border-purple-600 border-[3px]'
                    : channel.broadcasterType === 'affiliate' && 'border-blue-600 border-[3px]'
                }`}
                src={channel.profilePictureUrl}
                alt={`Avatar for ${channel.displayName}`}
              />
            </TwitchLink>
            <CountryFlags channel={channel} />
          </div>
          <div className='ml-4'>
            <div className='text-gray-900'>
              <TwitchLink username={channel.name}>{channel.displayName}</TwitchLink>
              <br />
              <div className='text-xs md:text-sm text-gray-500 mt-1'>
                {channel.fullName && <>{channel.fullName}</>}
              </div>
            </div>
            <div className='text-sm text-gray-500'></div>
          </div>
        </div>
      </td>
      <td className='px-2 py-2 align-top hidden md:table-cell'>
        <TwitchLink username={channel.name}>
          <VideoThumbnail username={channel.name} width={200} height={120} />
        </TwitchLink>
      </td>
      <td
        className='py-2 px-2 align-top cursor-pointer'
        onClick={() => (window.location.href = `https://twitch.tv/${channel.name}`)}
      >
        <ChannelBadges channel={channel} />
        <div className='text-sm text-gray-900 break-all md:break-normal mt-1'>
          {channel.latestStreamTitle}
        </div>
        <div
          className={`text-xs mt-1 text-right ${
            differenceInMinutes(now, startDate) <= STREAM_RECENT_MINUTES
              ? 'text-green-500'
              : 'text-gray-400'
          }`}
        >
          {channel.latestStreamViewers >= MIN_VISIBLE_VIEWER_COUNT && (
            <>{pluralize('viewers', channel.latestStreamViewers, true)}, </>
          )}
          live for {formatDurationShort(intervalToDuration({ start: startDate, end: now }))}
        </div>
      </td>
      <td className='px-2 py-2 align-top hidden sm:table-cell'>
        <SocialButtons channel={channel} />
      </td>
    </tr>
  );
}
