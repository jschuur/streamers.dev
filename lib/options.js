import { isCoding } from './util';

export const sortFields = [
  {
    fieldName: 'latestStreamViewers',
    labelShort: 'stream viewers',
    labelLong: 'Stream viewers (most)',
    slug: 'viewers',
  },
  {
    fieldName: 'latestStreamStartedAt',
    labelShort: 'stream age',
    labelLong: 'Stream age (latest)',
    slug: 'streamage',
  },
  {
    fieldName: 'creationDate',
    labelShort: 'channel age',
    labelLong: 'Channel age (youngest)',
    slug: 'channelage',
  },
];

export const languageFilterOptions = [
  {
    label: 'All',
    slug: 'all',
  },
  {
    label: 'English',
    filter: (channel) => channel.latestStreamLanguage === 'en',
    slug: 'english',
  },
  {
    label: 'Not English',
    filter: (channel) => channel.latestStreamLanguage !== 'en',
    slug: 'notenglish',
  },
];

export const categoryFilterOptions = [
  {
    label: 'Coding',
    filter: isCoding,
    slug: 'coding',
  },
  {
    label: 'Not Coding',
    filter: (channel) => !isCoding(channel),
    slug: 'notcoding',
  },
  {
    label: 'Any',
    slug: 'any',
  },
];

export const topicSortOptions = [
  {
    label: 'by streams',
    slug: '',
  },
  {
    label: 'by name',
    slug: 'name',
  },
];
