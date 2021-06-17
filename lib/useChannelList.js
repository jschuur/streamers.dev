import { sortBy, sumBy } from 'lodash';
import { useContext, useEffect, useState } from 'react';

import { HomePageContext } from './stores';

import { CHANNEL_AUTOREFRESH_SECONDS } from '../lib/config';

const refreshRate =
  process.env.NEXT_PUBLIC_CHANNEL_AUTOREFRESH_SECONDS || CHANNEL_AUTOREFRESH_SECONDS;

export const sortFields = [
  {
    fieldName: 'latestStreamViewers',
    labelShort: 'stream viewers',
    labelLong: 'Stream viewers (most)',
  },
  {
    fieldName: 'latestStreamStartedAt',
    labelShort: 'stream age',
    labelLong: 'Stream age (latest)',
  },
  {
    fieldName: 'creationDate',
    labelShort: 'channel age',
    labelLong: 'Channel age (youngest)',
  },
];

export const languageFilterOptions = [
  {
    label: 'All',
  },
  {
    label: 'English',
    filter: (channel) => channel.latestStreamLanguage === 'en',
  },
  {
    label: 'Not English',
    filter: (channel) => channel.latestStreamLanguage !== 'en',
  },
];

export const categoryFilterOptions = [
  {
    label: 'Coding',
    filter: (channel) =>
      channel.latestStreamGameName === 'Science & Technology' || channel.alwaysCoding,
  },
  {
    label: 'Not Coding',
    filter: (channel) =>
      channel.latestStreamGameName !== 'Science & Technology' && !channel.alwaysCoding,
  },
  {
    label: 'Any',
  },
];

export function useChannelList() {
  const { languageFilter, categoryFilter, sortField, setTrackedChannelCount } =
    useContext(HomePageContext);
  const [allChannels, setAllChannels] = useState([]);
  const [visibleChannels, setVisibleChannels] = useState([]);
  const [channelViewers, setChannelViewers] = useState(0);
  const [loadingError, setLoadingError] = useState(null);

  useEffect(async () => {
    const loadChannels = async ({ refresh = true } = {}) => {
      const response = await fetch(`/api/getChannels${refresh ? '?refresh=1' : ''}`);
      const data = await response.json();

      if (data.error) setLoadingError(data.error);
      else {
        setAllChannels(data.channels);
        setTrackedChannelCount(data.trackedChannelCount);
      }
    };

    // The first refresh always uses DB only data. Later one can sprinkle in Twitch API data
    await loadChannels({ refresh: false });

    if (refreshRate) {
      console.log(`Refreshing channel list every ${refreshRate} seconds`);
      setInterval(loadChannels, refreshRate * 1000);
    }
  }, []);

  useEffect(async () => {
    if (allChannels.length) {
      let channelList = sortBy(allChannels, sortFields[sortField].fieldName).reverse();

      if (categoryFilterOptions[categoryFilter].filter)
        channelList = channelList.filter(categoryFilterOptions[categoryFilter].filter);
      if (languageFilterOptions[languageFilter].filter)
        channelList = channelList.filter(languageFilterOptions[languageFilter].filter);

      setVisibleChannels(channelList);
      setChannelViewers(sumBy(channelList, 'latestStreamViewers'));
    }
  }, [allChannels, languageFilter, categoryFilter, sortField]);

  return { visibleChannels, channelViewers, loadingError };
}
