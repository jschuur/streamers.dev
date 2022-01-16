export const MAX_STATUS_AGE_SECONDS = parseInt(process.env.MAX_STATUS_AGE_SECONDS) || 120;
export const CHANNEL_AUTOREFRESH_SECONDS =
  parseInt(process.env.NEXT_PUBLIC_CHANNEL_AUTOREFRESH_SECONDS) || 120;
export const POTENTIAL_CHANNELS_AUTOREFRESH_SECONDS =
  parseInt(process.env.NEXT_PUBLIC_POTENTIAL_CHANNELS_AUTOREFRESH_SECONDS) || 600;
export const STREAM_RECENT_MINUTES = 30;
export const MIN_VISIBLE_VIEWER_COUNT = 10;
export const NEW_STREAMER_AGE_DAYS = 180;
export const THUMBNAIL_WIDTH = 200;
export const THUMBNAIL_HEIGHT = Math.round(THUMBNAIL_WIDTH / (16 / 9));
export const CACHED_LIVE_CHANNELS_URL = `${
  process.env.NEXT_PUBLIC_CACHED_CHANNELLIST_URL
}/live_channels${process.env.NODE_ENV === 'development' ? '_dev' : ''}.json`;
export const OFFLINE_CHANNELS_RECENT_DAYS =
  parseInt(process.env.NEXT_PUBLIC_OFFLINE_CHANNELS_RECENT_DAYS) || 14;
export const OFFLINE_CHANNELS_LIMIT = parseInt(process.env.NEXT_PUBLIC_OFFLINE_CHANNELS_LIMIT) || 24;
export const DEFAULT_AVATAR_URL =
  'https://static-cdn.jtvnw.net/user-default-pictures-uv/ebe4cd89-b4f4-4cd9-adac-2f30151b4209-profile_image-70x70.png';
export const TAGLINE = 'Find the perfect live-coding streams';
export const CHART_DAYS_DEFAULT = 14;
export const STATS_RECENT_STREAMS_DAYS = 28;
export const STREAM_TITLE_WORD_LENGTH_BREAK_WORDS = 40;
export const OFFLINE_CHANNELS_STALE_SECONDS =
  parseInt(process.env.NEXT_PUBLIC_OFFLINE_CHANNELS_STALE_SECONDS) || 20 * 60;
export const STATS_DATA_STALE_SECONDS =
  parseInt(process.env.NEXT_PUBLIC_STATS_DATA_STALE_SECONDS) || 30 * 60;
export const EXPLORE_DATA_STALE_SECONDS =
  parseInt(process.env.NEXT_PUBLIC_EXPLORE_DATA_STALE_SECONDS) || 30 * 60;
export const HOME_DATA_STALE_SECONDS =
  parseInt(process.env.NEXT_PUBLIC_HOME_DATA_STALE_SECONDS) || 2 * 60;
export const EXPLORE_RECENT_STREAM_TOPICS_DAYS =
  parseInt(process.env.NEXT_PUBLIC_EXPLORE_RECENT_STREAM_TOPICS_DAYS) || 14;
export const EXPLORE_NEW_ACTIVE_CHANNEL_DAYS =
  parseInt(process.env.NEXT_PUBLIC_EXPLORE_NEW_ACTIVE_CHANNEL_DAYS) || 31;
export const EXPLORE_NEW_ACTIVE_CHANNEL_MIN_STREAMS =
  parseInt(process.env.NEXT_PUBLIC_EXPLORE_NEW_ACTIVE_CHANNEL_MIN_STREAMS) || 5;
export const EXPLORE_NEW_ACTIVE_CHANNEL_LIMIT =
  parseInt(process.env.NEXT_PUBLIC_EXPLORE_NEW_ACTIVE_CHANNEL_LIMIT) || 48;

// The default channel fields sent to the page and updated in full Twitch API updates
export const TWITCH_CHANNEL_FIELDS = [
  'twitchId',
  'name',
  'displayName',
  'fullName',
  'countries',
  'team',
  'isLive',
  'isCoding',
  'alwaysCoding',
  'lastOnline',
  'latestStreamTitle',
  'latestStreamStartedAt',
  'latestStreamViewers',
  'latestStreamPeakViewers',
  'latestStreamLanguage',
  'latestStreamGameName',
  'latestStreamTags',
  'latestStreamTwitchTags',
  'allStreamTags',
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
  'id',
  'twitchId',
  'displayName',
  'updatedAt',
  'isLive',
  'isCoding',
  'latestStreamTitle',
  'latestStreamStartedAt',
  'latestStreamViewers',
  'latestStreamPeakViewers',
  'latestStreamLanguage',
  'latestStreamGameName',
  'latestStreamTags',
  'latestStreamTwitchTags',
  'allStreamTags',
  'lastOnline',
];

// Profile fields that can change over time
export const PROFILE_CHANGE_FIELDS = [
  'name',
  'displayName',
  'description',
  'type',
  'broadcasterType',
  'views',
  'profilePictureUrl',
];

// Stream fields that can change over time
export const STREAM_CHANGE_FIELDS = [
  'isCoding',
  'streamType',
  'isLive',
  'title',
  'viewers',
  'peakViewers',
  'language',
  'currentGameName',
  'allGameNames',
  'currentTags',
  'allTags',
  'currentTwitchTags',
  'allTwitchTags',
];

export const CHANNEL_GRID_FIELDS = [
  'name',
  'displayName',
  'fullName',
  'broadcasterType',
  'profilePictureUrl',
  'countries',
  'lastOnline',
  'latestStreamLanguage',
];

export const SNAPSHOT_CHANNEL_FIELDS = [
  'latestStreamGameName',
  'latestStreamTags',
  'latestStreamTwitchTags',
  'latestStreamViewers',
  'isCoding',
  'alwaysCoding',
];

export const SNAPSHOT_VALUE_FIELDS = [
  'peakLiveCodingViewers',
  'peakLiveCodingChannels',
  'totalLiveViewers',
  'totalLiveChannels',
  'trackedChannels',
];

const twitchGameNames = {
  'Software and Game Development': {
    id: '1469308723',
    alwaysCoding: true,
    findChannels: true,
  },
  'Science & Technology': {
    id: '509670',
    alwaysCoding: true,
    findChannels: true,
  },
  'BASIC Programming': {
    id: '21548',
    alwaysCoding: true,
    findChannels: true,
  },
  'Talk Shows & Podcasts': {
    id: '417752',
    alwaysCoding: true,
    findChannels: true,
  },
  'The Developer': {
    id: '1733188376',
    alwaysCoding: true,
    findChannels: true,
  },
  'Under Development': {
    id: '509868',
    alwaysCoding: true,
    findChannels: true,
  },
  'Just Chatting': {
    id: '509658',
    sometimesCoding: true,
  },
  Art: {
    id: '509660',
    sometimesCoding: true,
  },
};

// A stream under these Twitch game namies is always considered a coding
// stream (unless overridden per stream)
export const alwaysCodingGameNames = Object.keys(twitchGameNames).reduce(
  (acc, key) => (twitchGameNames[key].alwaysCoding ? acc.concat(key) : acc),
  []
);

// A stream under this Twitch game name, needs stream tags identified to be a
// coding stream (unless overridden per stream)
export const sometimesCodingGameNames = Object.keys(twitchGameNames).reduce(
  (acc, key) => (twitchGameNames[key].sometimesCoding ? acc.concat(key) : acc),
  []
);

// Game names where findChannels looks for new channels
export const findChannelGameNames = Object.keys(twitchGameNames).reduce(
  (acc, key) =>
    twitchGameNames[key].findChannels ? { ...acc, [key]: twitchGameNames[key].id } : acc,
  {}
);

// All the tags as of December 24th, 2021: https://gist.github.com/jschuur/78d120e67f5e1e461b04aaabb1389888

const twitchTags = {
  'Web Development': {
    guid: 'c23ce252-cf78-4b98-8c11-8769801aaf3a',
    isCoding: true,
    findChannels: true,
  },
  JavaScript: {
    guid: 'b741fd1d-e96d-49b8-9f2d-03a631c33e04',
    isCoding: true,
    streamTag: true,
    findChannels: true,
  },
  Python: {
    guid: 'd9861c1f-7414-4216-98a7-0dc4716aa04e',
    isCoding: true,
    streamTag: true,
    findChannels: true,
  },
  Rust: {
    guid: 'b23d8969-29f8-4f75-ad44-2772e3d28ec4',
    isCoding: true,
    streamTag: true,
    findChannels: true,
  },
  PHP: {
    guid: '60a9f03f-4c87-4307-be57-31c85347f0b6',
    isCoding: true,
    streamTag: true,
    findChannels: true,
  },
  Haskell: {
    guid: '40b4ab92-3559-4574-a827-e8ba6e653b87',
    isCoding: true,
    streamTag: true,
    findChannels: true,
  },
  'C#': {
    guid: 'c8f444c9-774a-4bbc-9669-f5eabb915c42',
    isCoding: true,
    streamTag: true,
    findChannels: true,
  },
  'F#': {
    guid: '9104b6e5-c5b2-4ef6-a370-83f126241838',
    isCoding: true,
    streamTag: true,
    findChannels: true,
  },
  'C++': {
    guid: '2b194c54-bc5f-4c4c-85f7-32f03ab0fd7c',
    isCoding: true,
    streamTag: true,
    findChannels: true,
  },
  Java: {
    guid: 'db2217e3-bed5-419a-9143-550aa15451c8',
    isCoding: true,
    streamTag: true,
    findChannels: true,
  },
  'Desktop Development': {
    guid: 'a106f013-6e26-4f27-9a4b-01e9d76084e2',
    isCoding: true,
    streamTag: true,
    findChannels: true,
  },
  'Mobile Development': {
    guid: '6e23d976-33ec-47e8-b22b-3727acd41862',
    isCoding: true,
    streamTag: true,
    findChannels: true,
  },
  'Software Development': {
    guid: '6f86127d-6051-4a38-94bb-f7b475dde109',
    isCoding: true,
    findChannels: true,
  },
  Programming: {
    guid: 'a59f1e4e-257b-4bd0-90c7-189c3efbf917',
    isCoding: true,
    findChannels: true,
  },
  Engineering: {
    guid: 'dff0aca6-52fe-4cc4-a93a-194852b522f0',
    isCoding: true,
  },
  'Game Development': {
    guid: 'f588bd74-e496-4d11-9169-3597f38a5d25',
    isCoding: true,
    streamTag: true,
    gameDev: true,
    findChannels: true,
  },
  Unity: {
    guid: 'cb8be71b-4d29-408e-b7bf-551ca26ea5b9',
    isCoding: true,
    streamTag: ['Game Development', 'Unity'],
    gameDev: true,
  },
  'Unreal Engine': {
    guid: 'bfedff64-c53a-4e6f-bda4-9eeb36dc8853',
    isCoding: true,
    streamTag: ['Game Development', 'Unreal Engine'],
    gameDev: true,
  },
  'Godot Engine': {
    guid: '89295d65-9346-48a3-99d7-0922cc8e9550',
    isCoding: true,
    streamTag: ['Game Development', 'Godot Engine'],
    gameDev: true,
  },
  Design: {
    guid: '7b49f69a-5d95-4c94-b7e3-66e2c0c6f6c6',
    isCoding: true,
    streamTag: true,
  },
  Linux: {
    guid: '15f4833a-1691-4cc1-a4a5-020d130ac94d',
    streamTag: 'Unix',
  },
  Vtuber: {
    guid: '52d7e4cc-633d-46f5-818c-bb59102d9549',
    streamTag: 'VTuber',
  },
  'Co-Working': {
    guid: '0739209c-9ef5-4ae0-997c-ccbeb864ca61',
    streamTag: 'Coworking',
  },
  'Pixel Art': {
    guid: '3c0a4e1f-6863-4dad-bb4e-538326306bef',
    streamTag: 'Pixel Art',
  },
  '3D Modeling': {
    guid: 'b97ee881-e15a-455d-9876-657fcba7cfd8',
    streamTag: '3D Modeling',
  },
  'Level Design': {
    guid: '85a78d1f-77e7-468e-a3e5-76ed7c99864b',
    streamTag: 'Level Design',
  },
};

// Twitch tags used for live-coding streams
export const codingTagIds = Object.keys(twitchTags).reduce(
  (acc, key) => (twitchTags[key].isCoding ? { ...acc, [key]: twitchTags[key].guid } : acc),
  {}
);

// Twitch tags that map to topic tags
export const twitchTagsToStreamTags = Object.entries(twitchTags).reduce(
  (acc, [key, { streamTag }]) =>
    streamTag
      ? {
          ...acc,
          [key]: streamTag === true ? key : streamTag,
        }
      : acc,
  {}
);

// Twitch tabs specifically used by game development streams
export const gameDevTagIds = Object.keys(twitchTags).reduce(
  (acc, key) => (twitchTags[key].gameDev ? { ...acc, [key]: twitchTags[key].guid } : acc),
  {}
);

// Twitch tags to use when adding channels to the queue
export const findChannelTags = Object.keys(twitchTags).reduce(
  (acc, key) => (twitchTags[key].findChannels ? { ...acc, [key]: twitchTags[key].guid } : acc),
  {}
);

// TODO: Migrate this to the database
export const gameDevStreamTags = [
  'Game Development',
  'Unreal Engine',
  'Godot Engine',
  'Unity',
  'Web Game',
  'PixiJS',
  'Phaser',
  'PlayCanvas',
  'GameMaker Studio',
  'PlayFul',
  'Game Jam',
  'Global Game Jam',
  'Ludum Dare',
  'Blender',
  'Minecraft',
  'RTS Game',
  'RPG Game',
  'MMORPG',
  'Puzzle',
  'Roguelike',
  'Wordle',
  'Blender',
  'Monogame',
  'Game Boy',
  'Pixel Art',
  '3D Modeling',
  'Level Design',
  'Platform Game',
  'Game Design',
  'Game Engine',
];