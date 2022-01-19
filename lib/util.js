import { intervalToDuration, formatDuration } from 'date-fns';
import pluralize from 'pluralize';

import {
  alwaysCodingGameNames,
  sometimesCodingGameNames,
  codingTagIds,
  gameDevStreamTags,
} from './config';

const formatDistanceLocale = {
  lessThanXSeconds: '{{count}}s',
  xSeconds: '{{count}}s',
  halfAMinute: '30s',
  lessThanXMinutes: '{{count}}m',
  xMinutes: '{{count}}m',
  aboutXHours: '{{count}}h',
  xHours: '{{count}}h',
  xDays: '{{count}}d',
  aboutXWeeks: '{{count}}w',
  xWeeks: '{{count}}w',
  aboutXMonths: '{{count}}mo',
  xMonths: '{{count}}mo',
  aboutXYears: '{{count}}y',
  xYears: '{{count}}y',
  overXYears: '{{count}}y',
  almostXYears: '{{count}}y',
};

const shortEnLocale = {
  formatDistance: (token, count) => formatDistanceLocale[token].replace('{{count}}', count),
};

export const formatDurationShortNow = ({ start, format, precision }) => {
  const duration = formatDuration(intervalToDuration({ start, end: new Date() }), {
    format,
    locale: shortEnLocale,
  });

  return precision ? duration.split(' ').slice(0, precision).join(' ') : duration;
};

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
export const isCoding = ({ latestStreamGameName, latestStreamTwitchTags, alwaysCoding }) =>
  alwaysCoding ||
  alwaysCodingGameNames.includes(latestStreamGameName) ||
  ((sometimesCodingGameNames.includes(latestStreamGameName) || !latestStreamGameName) &&
    latestStreamTwitchTags?.some(isCodingTag));

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

export const formatPercentage = (num) =>
  Intl.NumberFormat('en-GB', { style: 'percent', maximumFractionDigits: 1 }).format(num);

export function formatNumber(num, word) {
  const formatted = Intl.NumberFormat('en-US').format(num);

  return word ? `${formatted} ${pluralize(word, num)}` : formatted;
}

// Helper to rename aggregate results
export function cleanupAggregationResults({ data, type = 'count', field, valueField = 0 }) {
  const aggregationField = `_${type}`;
  if (!field) field = type;

  data.forEach((el) => {
    if (el[aggregationField]) {
      el[field] = valueField
        ? el[aggregationField][valueField]
        : Object.values(el[aggregationField])[0];

      delete el[aggregationField];
    }
  });

  return data;
}

export const uppercaseFirst = (str) =>
  typeof str === 'string' ? str.charAt(0).toUpperCase() + str.toLowerCase().slice(1) : str;

export function hasGameDevStreamTag(tags) {
  if (!Array.isArray(tags)) tags = [tags];

  return tags?.includes('Game Development') || tags?.some((tag) => gameDevStreamTags.includes(tag));
}

export function debug(scope, message) {
  if (!message) {
    message = scope;
    scope = 'DEBUG';
  } else scope = `DEBUG: ${scope}`;

  process.env.NODE_ENV === 'development' && console.log(`[${scope}]: ${message}`);
}