import { intervalToDuration, formatDuration } from 'date-fns';

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
    format: ['days', 'hours', 'minutes', 'seconds'],
    locale: shortEnLocale,
  });
