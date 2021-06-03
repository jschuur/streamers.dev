export const MAX_STATUS_AGE_SECONDS = 120;
export const USER_AUTOREFRESH_SECONDS = 120;
export const STREAM_RECENT_MINUTES = 30;

// The default user fields sent to the page and updated in full Twitch API updates
export const TWITCH_USER_FIELDS = [
  'twitchId',
  'name',
  'displayName',
  'fullName',
  'country',
  'country2',
  'team',
  'isLive',
  'alwaysCoding',
  'lastOnline',
  'latestStreamTitle',
  'latestStreamStartedAt',
  'latestStreamViewers',
  'latestStreamLanguage',
  'latestStreamGameName',
  'description',
  'type',
  'broadcasterType',
  'channelType',
  'profilePictureUrl',
  'creationDate',
  'views',
  'homepage',
  'youtube',
  'twitter',
  'github',
  'discord',
  'instagram',
];

// The status fields updated more frequently
export const STATUS_UPDATE_FIELDS = [
  'isLive',
  'latestStreamTitle',
  'latestStreamStartedAt',
  'latestStreamViewers',
  'latestStreamLanguage',
  'latestStreamGameName',
  'lastOnline',
];

export const gameIds = {
  'Science & Technology': '509670',
};

export const tagIds = {
  'Web Development': 'c23ce252-cf78-4b98-8c11-8769801aaf3a',
  'Software Development': '6f86127d-6051-4a38-94bb-f7b475dde109',
  'Game Development': 'f588bd74-e496-4d11-9169-3597f38a5d25',
  Programming: 'a59f1e4e-257b-4bd0-90c7-189c3efbf917',
};