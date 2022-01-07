import { parseISO, differenceInMinutes } from 'date-fns';
import pluralize from 'pluralize';
import { useSession } from 'next-auth/react';

import TwitchProfile from './TwitchProfile';
import TwitchLink from './TwitchLink';
import SocialButtons from './SocialButtons';
import VideoThumbnail from './VideoThumbnail';
import ChannelBadges from './ChannelBadges';

import { formatDurationShortNow, adminAuthorised } from '../../lib/util';

import {
  STREAM_RECENT_MINUTES,
  MIN_VISIBLE_VIEWER_COUNT,
  THUMBNAIL_WIDTH,
  THUMBNAIL_HEIGHT,
  STREAM_TITLE_WORD_LENGTH_BREAK_WORDS,
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

  const streamAge = formatDurationShortNow({
    start: new Date(startDate),
    format: ['days', 'hours', 'minutes'],
  });

  const { data: session } = useSession();
  const isAdmin = session && adminAuthorised({ session });

  // If a stream title contains a word that is too long, use break-words.
  const breakWords = channel.latestStreamTitle
    .split(/\s+/)
    .some((word) => word.length > STREAM_TITLE_WORD_LENGTH_BREAK_WORDS);

  const tweetMessage = `Interesting stream, by ${
    channel.twitter ? `@${channel.twitter}` : channel.displayName
  }: ${channel.latestStreamTitle}\n\nhttps://twitch.tv/${channel.name}`;
  const tweetStream = () =>
    isAdmin &&
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetMessage)}`);

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
        <div>
          <div
            className={`text-sm sm:text-base font-light text-gray-900 dark:text-gray-300 break-words md:${
              breakWords ? 'break-words' : 'break-normal'
            } mt-1`}
          >
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
            <span onClick={() => tweetStream()} className={isAdmin && 'cursor-pointer'}>
              live for {streamAge}
            </span>
          </div>
        </div>
        <SocialButtons channel={channel} />
      </div>
    </>
  );
}
