import { parseISO, intervalToDuration, differenceInMinutes } from 'date-fns';
import pluralize from 'pluralize';

import TwitchProfile from './TwitchProfile';
import TwitchAvatar from './TwitchAvatar';
import SocialButtons from './SocialButtons';
import VideoThumbnail from './VideoThumbnail';
import CountryFlags from './CountryFlags';
import ChannelBadges from './ChannelBadges';

import { formatDurationShort, TwitchLink } from '../../lib/util';

import {
  STREAM_RECENT_MINUTES,
  MIN_VISIBLE_VIEWER_COUNT,
  THUMBNAIL_WIDTH,
  THUMBNAIL_HEIGHT,
} from '../../lib/config';

export default function ChannelListEntry({ channel, channelIndex = 0 }) {
  const startDate = parseISO(channel.latestStreamStartedAt),
    now = new Date();
  const rowColor =
    channel.channelType === 'BRAND'
      ? 'bg-purple-100 dark:bg-indigo-800'
      : channelIndex % 2 === 0
      ? 'bg-white dark:bg-gray-600'
      : 'bg-gray-100 dark:bg-gray-700';

  const openProfile = () => window.open(`https://twitch.tv/${channel.name}`, '_blank');

  return (
    <>
      {/* Channel profile */}
      <div className={`px-2 sm:px-3 py-2 align-top ${rowColor}`}>
        <TwitchProfile channel={channel} />
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
          <div className='text-sm sm:text-base font-light text-gray-900 dark:text-gray-300 break-all md:break-normal mt-1'>
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
