import { useQuery } from 'react-query';
import { languageFilterOptions } from './options';
import { useContext, useState } from 'react';

import {
  OFFLINE_CHANNELS_STALE_MINUTES,
  CACHED_LIVE_CHANNELS_URL,
  CHANNEL_AUTOREFRESH_SECONDS,
} from './config';
import { HomePageContext } from './stores';

export async function fetchOfflineChannels({ topicFilter, languageFilter }) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve) => {
    if (!topicFilter) return resolve([]);

    const response = await fetch(
      `/api/getOfflineChannels?topic=${encodeURIComponent(topicFilter)}&lang=${
        languageFilterOptions[languageFilter].slug
      }`
    );
    const { channels, error } = await response.json();

    if (error) throw new Error(error);

    return resolve(channels);
  });
}

export function useOfflineChannels() {
  const { topicFilter, languageFilter } = useContext(HomePageContext);

  // Cache offline channel data for 20 minutes
  return useQuery(
    ['offlineChannels', { topicFilter, languageFilter }],
    () => fetchOfflineChannels({ topicFilter, languageFilter }),
    { staleTime: OFFLINE_CHANNELS_STALE_MINUTES * 60 * 1000 }
  );
}

export const useLiveChannels = () => {
  const [firstFetch, setFirstFetch] = useState(true);

  async function fetchLiveChannels() {
    // Grab channels from the cached S3 URL for the first time (to skip API call cold starts)
    const response = await fetch(firstFetch ? CACHED_LIVE_CHANNELS_URL : '/api/getChannels');
    setFirstFetch(false);

    if (!response.ok) throw new Error(`Can't get live channels list`);

    return response.json();
  }

  return useQuery('liveChannels', fetchLiveChannels, {
    refetchInterval: CHANNEL_AUTOREFRESH_SECONDS * 1000,
    staleTime: CHANNEL_AUTOREFRESH_SECONDS * 1000,
    cacheTime: CHANNEL_AUTOREFRESH_SECONDS * 1000,
    refetchOnMount: false,
  });
};

export async function fetchRecentChannels() {
  const response = await fetch('/api/getRecentChannels');

  if (!response.ok) throw new Error('Network error fetching /api/getRecentChannels');

  const result = await response.json();

  return result.channels;
}
