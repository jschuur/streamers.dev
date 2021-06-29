import { intervalToDuration, formatDuration } from 'date-fns';

import { CODING_GAMENAMES } from './config';

const formatDistanceLocale = {
  xDays: '{{count}} d',
  xSeconds: '{{count}} sec',
  xMinutes: '{{count}} min',
  xHours: '{{count}} h',
};
const shortEnLocale = {
  formatDistance: (token, count) => formatDistanceLocale[token].replace('{{count}}', count),
};

export const formatDurationShort = (duration) =>
  formatDuration(duration, {
    format: ['days', 'hours', 'minutes'],
    locale: shortEnLocale,
  });

export const TwitchLink = ({ username, children }) => (
  <a target='_new' href={`https://twitch.tv/${username}`}>
    {children}
  </a>
);

export const adminAuthorised = ({ session, secret }) =>
  process.env.SKIP_ADMIN_AUTH ||
  session?.user?.isAdmin ||
  (secret && secret === process.env.BOOKMARKLET_SECRET);

export function showToast({ addToast, message, error }) {
  if (message)
    addToast(message, {
      appearance: 'success',
      autoDismissTimeout: 2500,
      autoDismiss: true,
    });
  else if (error) addToast(error, { appearance: 'error' });
}

export const isCoding = ({ latestStreamGameName, alwaysCoding }) =>
  CODING_GAMENAMES.includes(latestStreamGameName) || alwaysCoding;

export const debug = (msg) => process.env.DEBUG && console.debug(msg);
