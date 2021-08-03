import { intervalToDuration, formatDuration } from 'date-fns';

import { ALWAYS_CODING_GAMENAMES, SOMETIMES_CODING_GAMENAMES, codingTagIds } from './config';

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
  <a target='_blank' href={`https://twitch.tv/${username}`}>
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

export const isCodingTag = (str) => Boolean(codingTagIds[str]);

// Channels count as coding when alwaysCoding is true, they are in certain categories or
// they are in another list of categories and use certain tags
export const isCoding = ({
  latestStreamGameName,
  latestStreamTags,
  latestStreamTwitchTags,
  alwaysCoding,
}) =>
  alwaysCoding ||
  ALWAYS_CODING_GAMENAMES.includes(latestStreamGameName) ||
  ((SOMETIMES_CODING_GAMENAMES.includes(latestStreamGameName) || !latestStreamGameName) &&
    (latestStreamTwitchTags.some(isCodingTag) || latestStreamTags.length));

// Shallow equal comparison (https://stackoverflow.com/a/63211992/122864)
export const shallowEq = (a, b) =>
  [...Object.keys(a), ...Object.keys(b)].every((k) => b[k] === a[k]);

// Use a smaller profile picture
export function profilePictureUrl(url, size) {
  // Look for URLs like https://static-cdn.jtvnw.net/jtv_user_pictures/9b9b9b2d-2cd2-4ef5-ba90-f1c8a8076343-profile_image-300x300.png
  const matches = url.match(/(.+)-(\d+)x(\d+)\.(png|jpg|gif)/i);
  if (!matches) return url;

  const [, base, , , extension] = matches;

  return `${base}-${size}x${size}.${extension}`;
}

export const isProd = () => process.env.NODE_ENV === 'production';
export const isDev = () => process.env.NODE_ENV === 'development';

export const selectFromFields = (fields) =>
  fields.reduce((acc, field) => ({ ...acc, [field]: true }), {});
