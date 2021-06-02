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

export const SCIENCE_AND_TECHNOLOGY_GAME_ID = '509670';
export const WEB_DEVELOPMENT_TAG_ID = 'c23ce252-cf78-4b98-8c11-8769801aaf3a';
