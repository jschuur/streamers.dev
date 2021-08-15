import { useQuery } from 'react-query';
import { languageFilterOptions } from './options';
import { useContext, useEffect } from 'react';

import { OFFLINE_CHANNELS_STALE_MINUTES } from './config';
import { HomePageContext } from './stores';

export async function fetchOfflineChannels({ topicFilter, languageFilter }) {
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
  const { topicFilter, languageFilter, categoryFilter } = useContext(HomePageContext);

  // Cache offline channel data for 20 minutes
  return useQuery(
    ['offlineChannels', { topicFilter, languageFilter }],
    () => fetchOfflineChannels({ topicFilter, languageFilter }),
    { staleTime: OFFLINE_CHANNELS_STALE_MINUTES * 60 * 1000 }
  );
}

export const fetchRecentChannels = () =>
  fetch('/api/getRecentChannels')
    .then((response) => response.json())
    .then((result) => result.channels);