import { useQuery } from 'react-query';
import { languageFilterOptions } from './options';
import { useContext, useState } from 'react';

import {
  OFFLINE_CHANNELS_STALE_MINUTES,
  CACHED_LIVE_CHANNELS_URL,
  CHANNEL_AUTOREFRESH_SECONDS,
  EXPLORE_DATA_STALE_MINUTES,
  STATS_DATA_STALE_MINUTES,
} from './config';
import { HomePageContext } from './stores';

function useQueryWrapper({ key, apiRoute, queryFunction, cacheMinutes, ...options }) {
  return useQuery(key, apiRoute ? () => fetch(apiRoute).then((res) => res.json()) : queryFunction, {
    staleTime: cacheMinutes * 60 * 1000,
    cacheTime: cacheMinutes * 60 * 1000,
    ...options,
  });
}

export function useOfflineChannels(options) {
  const { topicFilter, languageFilter } = useContext(HomePageContext);

  return useQueryWrapper({
    key: ['offlineChannels', { topicFilter, languageFilter }],
    apiRoute: `/api/getOfflineChannels?topic=${encodeURIComponent(topicFilter)}&lang=${
      languageFilterOptions[languageFilter].slug
    }`,
    cacheMinutes: OFFLINE_CHANNELS_STALE_MINUTES,
    ...options,
  });
}

export const useExploreData = (options) =>
  useQueryWrapper({
    key: 'exploreData',
    apiRoute: '/api/getExploreData',
    cacheMinutes: EXPLORE_DATA_STALE_MINUTES,
    ...options,
  });

export const useStatsData = (options) =>
  useQueryWrapper({
    key: 'statsData',
    apiRoute: '/api/getStatsData',
    cacheMinutes: STATS_DATA_STALE_MINUTES,
    ...options,
  });

export const useLiveChannels = () => {
  const [firstFetch, setFirstFetch] = useState(true);

  async function fetchLiveChannels() {
    // Grab channels from the cached S3 URL for the first time (to skip API call cold starts)
    const response = await fetch(firstFetch ? CACHED_LIVE_CHANNELS_URL : '/api/getChannels');
    setFirstFetch(false);

    if (!response.ok) throw new Error(`Can't get live channels list`);

    return response.json();
  }

  // TODO: Convert to useQueryWrapper
  return useQuery('liveChannels', fetchLiveChannels, {
    refetchInterval: CHANNEL_AUTOREFRESH_SECONDS * 1000,
    staleTime: CHANNEL_AUTOREFRESH_SECONDS * 1000,
    cacheTime: CHANNEL_AUTOREFRESH_SECONDS * 1000,
    refetchOnMount: false,
  });
};

export const useRecentChannels = (options) =>
  useQueryWrapper({
    key: 'recentChannels',
    apiRoute: '/api/getRecentChannels',
    refetchOnMount: false,
    ...options,
  });

export const usePotentialChannels = (options) =>
  useQueryWrapper({
    key: 'potentialChannels',
    apiRoute: '/api/getPotentialChannels',
    refetchOnMount: false,
    ...options,
  });