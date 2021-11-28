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
export const OFFLINE_CHANNELS_LIMIT =
  parseInt(process.env.NEXT_PUBLIC_OFFLINE_CHANNELS_LIMIT) || 12;
export const DEFAULT_AVATAR_URL =
  'https://static-cdn.jtvnw.net/user-default-pictures-uv/ebe4cd89-b4f4-4cd9-adac-2f30151b4209-profile_image-70x70.png';
export const TAGLINE = 'Find the perfect live-coding streams';
export const CHART_DAYS_DEFAULT = 14;
export const STREAM_TITLE_WORD_LENGTH_BREAK_WORDS = 40;
export const OFFLINE_CHANNELS_STALE_MINUTES = 20;

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

export const OFFLINE_CHANNEL_FIELDS = [
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

export const ALWAYS_CODING_GAMENAMES = [
  'Science & Technology',
  'Software and Game Development',
  'BASIC Programming',
  'Talk Shows & Podcasts',
  'The Developer',
  'Under Development',
];

export const SOMETIMES_CODING_GAMENAMES = ['Just Chatting', 'Design', 'Art'];

// Game IDs where findChannels looks for new channels
export const gameIds = {
  'Software and Game Development': '1469308723',
  'Science & Technology': '509670',
  'BASIC Programming': '21548',
  'Just Chatting': '509658',
  'Talk Shows & Podcasts': '417752',
  'BASIC Programming': '21548',
  'The Developer': '1733188376',
  'Under Development': '509868',
};

// All the tags as of July 14th, 2021: https://gist.github.com/jschuur/78d120e67f5e1e461b04aaabb1389888
export const codingTagIds = {
  'Web Development': 'c23ce252-cf78-4b98-8c11-8769801aaf3a',
  'Software Development': '6f86127d-6051-4a38-94bb-f7b475dde109',
  'Game Development': 'f588bd74-e496-4d11-9169-3597f38a5d25',
  Programming: 'a59f1e4e-257b-4bd0-90c7-189c3efbf917',
  JavaScript: 'b741fd1d-e96d-49b8-9f2d-03a631c33e04',
  Engineering: 'dff0aca6-52fe-4cc4-a93a-194852b522f0',
  'Mobile Development': '6e23d976-33ec-47e8-b22b-3727acd41862',
  'Desktop Development': 'a106f013-6e26-4f27-9a4b-01e9d76084e2',
  Python: 'd9861c1f-7414-4216-98a7-0dc4716aa04e',
  'C#': 'c8f444c9-774a-4bbc-9669-f5eabb915c42',
  'F#': '9104b6e5-c5b2-4ef6-a370-83f126241838',
  JavaScript: 'b741fd1d-e96d-49b8-9f2d-03a631c33e04',
  'C++': '2b194c54-bc5f-4c4c-85f7-32f03ab0fd7c',
  Java: 'db2217e3-bed5-419a-9143-550aa15451c8',
  Rust: 'b23d8969-29f8-4f75-ad44-2772e3d28ec4',
  PHP: '60a9f03f-4c87-4307-be57-31c85347f0b6',
  Unity: 'cb8be71b-4d29-408e-b7bf-551ca26ea5b9',
  'Unreal Engine': 'bfedff64-c53a-4e6f-bda4-9eeb36dc8853',
};

export const gameCodingTagIds = {
  'Game Development': 'f588bd74-e496-4d11-9169-3597f38a5d25',
  Unity: 'cb8be71b-4d29-408e-b7bf-551ca26ea5b9',
  'Unreal Engine': 'bfedff64-c53a-4e6f-bda4-9eeb36dc8853',
};

export const FIND_CHANNEL_TAGS = [
  'Web Development',
  'Software Development',
  'Programming',
  'Game Development',
  'Desktop Development',
  'Mobile Development',
  'JavaScript',
  'Python',
  'Rust',
  'PHP',
  'C++',
];
