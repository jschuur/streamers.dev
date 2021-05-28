export const MAX_STATUS_AGE_SECONDS = 120;
export const USER_AUTOREFRESH_SECONDS = 120;
export const STREAM_RECENT_MINUTES = 30;

// The default user fields sent to the page and updated in full Twitch API updates
export const TWITCH_USER_FIELDS = [
  'twitchId',
  'name',
  'displayName',
  'fullName',
  'isLive',
  'lastOnline',
  'latestStreamTitle',
  'latestStreamStartedAt',
  'latestStreamViewers',
  'description',
  'type',
  'broadcasterType',
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
  'lastOnline',
];
