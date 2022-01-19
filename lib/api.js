import { useQuery } from 'react-query';
import { languageFilterOptions } from './options';
import { useContext } from 'react';

import { debug } from './util';

import {
  OFFLINE_CHANNELS_STALE_SECONDS,
  CHANNEL_AUTOREFRESH_SECONDS,
  EXPLORE_DATA_STALE_SECONDS,
  STATS_DATA_STALE_SECONDS,
} from './config';
import { HomePageContext } from './stores';

function useQueryWrapper({ key, apiRoute, queryFunction, ...options }) {
  if (!queryFunction) {
    queryFunction = () => {
      debug('useQueryWrapper', `Starting Fetch (${apiRoute})`);
      return fetch(apiRoute).then((res) => {
        debug('useQueryWrapper', `Fetch completed (${apiRoute})`);
        return res.json();
      });
    };
  }

  return useQuery(key, queryFunction, options);
}

export function useOfflineChannels(options) {
  const { topicFilter, languageFilter } = useContext(HomePageContext);

  // TODO: Don't run this for topicFilter === null without causing a React Hooks warning

  return useQueryWrapper({
    key: ['offlineChannels', { topicFilter, languageFilter }],
    apiRoute: `/api/getOfflineChannels?topic=${encodeURIComponent(topicFilter)}&lang=${
      languageFilterOptions[languageFilter].slug
    }`,
    cacheTime: OFFLINE_CHANNELS_STALE_SECONDS * 1000,
    staleTime: OFFLINE_CHANNELS_STALE_SECONDS * 1000,
    ...options,
  });
}

export const useExploreData = (options) =>
  useQueryWrapper({
    key: 'exploreData',
    apiRoute: '/api/getExploreData',
    cacheTime: EXPLORE_DATA_STALE_SECONDS * 1000,
    staleTime: EXPLORE_DATA_STALE_SECONDS * 1000,
    refetchOnMount: false,
    ...options,
  });

export const useStatsData = (options) =>
  useQueryWrapper({
    key: 'statsData',
    apiRoute: '/api/getStatsData',
    cacheTime: STATS_DATA_STALE_SECONDS * 1000,
    staleTime: STATS_DATA_STALE_SECONDS * 1000,
    refetchOnMount: false,
    ...options,
  });

export const useLiveChannels = (options) => {
  return useQueryWrapper({
    key: 'liveChannels',
    apiRoute: '/api/getChannels?refresh=1',
    refetchInterval: CHANNEL_AUTOREFRESH_SECONDS * 1000,
    staleTime: CHANNEL_AUTOREFRESH_SECONDS * 1000,
    cacheTime: CHANNEL_AUTOREFRESH_SECONDS * 1000,
    refetchOnMount: false,
    ...options,
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