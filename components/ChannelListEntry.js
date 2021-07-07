import { parseISO, intervalToDuration, differenceInMinutes } from 'date-fns';
import pluralize from 'pluralize';

import SocialButtons from './SocialButtons';
import VideoThumbnail from './VideoThumbnail';
import CountryFlags from './CountryFlags';
import ChannelBadges from './ChannelBadges';

import { formatDurationShort, TwitchLink, profilePictureUrl } from '../lib/util';

import {
  STREAM_RECENT_MINUTES,
  MIN_VISIBLE_VIEWER_COUNT,
  THUMBNAIL_WIDTH,
  THUMBNAIL_HEIGHT,
} from '../lib/config';

export default function ChannelListEntry({ channel, channelIndex }) {
  const startDate = parseISO(channel.latestStreamStartedAt),
    now = new Date();
  const rowColor =
    channel.channelType === 'BRAND'
      ? 'bg-purple-100 dark:bg-indigo-800'
      : channelIndex % 2 === 0
      ? 'bg-white dark:bg-gray-600'
      : 'bg-gray-100 dark:bg-gray-700';

  const openProfile = () => window.open(`https://twitch.tv/${channel.name}`, '_new');

  return (
    <>
      {/* Channel profile */}
      <div className={`px-2 py-2 align-top cursor-pointer ${rowColor}`} onClick={openProfile}>
        <div className='flex flex-col mx-2'>
          {/* Channel display name  */}
          <div className='text-base sm:text-lg text-gray-700'>
            <TwitchLink username={channel.name}>{channel.displayName}</TwitchLink>
          </div>

          {/* Channel full name and avatar */}
          <div className='flex'>
            <div className='flex-shrink-0 flex flex-col text-xl md:text-3xl mt-1'>
              <TwitchLink username={channel.name}>
                <img
                  className={`h-10 w-10 rounded-full ${
                    channel.broadcasterType === 'partner'
                      ? 'border-purple-600 border-[3px]'
                      : channel.broadcasterType === 'affiliate' && 'border-blue-600 border-[3px]'
                  }`}
                  src={profilePictureUrl(channel.profilePictureUrl, 70)}
                  alt={`Avatar for ${channel.displayName}`}
                />
              </TwitchLink>
              <CountryFlags channel={channel} />
            </div>
            <div className='text-base text-gray-500 font-light dark:text-gray-300 ml-3 mt-1'>
              {channel.fullName && <>{channel.fullName}</>}
            </div>
          </div>
        </div>
      </div>
      {/* Stream thumbnail */}
      <div className={`px-2 py-2 align-top hidden sm:block ${rowColor}`}>
        <TwitchLink username={channel.name}>
          <VideoThumbnail
            username={channel.name}
            width={THUMBNAIL_WIDTH}
            height={THUMBNAIL_HEIGHT}
          />
        </TwitchLink>
      </div>
      {/* Stream details */}
      <div className={`py-2 px-2 align-top  ${rowColor}`}>
        <ChannelBadges channel={channel} />
        <div className='cursor-pointer' onClick={openProfile}>
          <div className='text-sm sm:text-base text-gray-900 dark:text-gray-300 break-all md:break-normal mt-1'>
            {channel.latestStreamTitle}
          </div>
          <div
            className={`text-xs sm:text-sm mt-2 text-right ${
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
        </div>
        <SocialButtons channel={channel} />
      </div>
    </>
  );
}
