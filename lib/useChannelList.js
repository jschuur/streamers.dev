import { differenceInSeconds, parseISO } from 'date-fns';
import { sortBy, sumBy } from 'lodash';
import { useContext, useEffect, useState } from 'react';

import { HomePageContext } from './stores';
import { isCoding } from '../lib/util';

import StreamTags from '../components/StreamTags';

import { CHANNEL_AUTOREFRESH_SECONDS } from '../lib/config';

const refreshRate =
  process.env.NEXT_PUBLIC_CHANNEL_AUTOREFRESH_SECONDS || CHANNEL_AUTOREFRESH_SECONDS;
const cachedLiveChannelsURL = `${process.env.NEXT_PUBLIC_CACHED_CHANNELLIST_URL}/live_channels${
  process.env.NODE_ENV === 'development' ? '_dev' : ''
}.json`;

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
    filter: isCoding,
  },
  {
    label: 'Not Coding',
    filter: (channel) => !isCoding(channel),
  },
  {
    label: 'Any',
  },
];

function aggregateStreamTags(channels) {
  let tagCounts = {};

  // Count the tags used
  channels.forEach(({ latestStreamTags }) => {
    if (latestStreamTags)
      latestStreamTags.forEach((tag) => {
        if (tagCounts[tag]) tagCounts[tag]++;
        else tagCounts[tag] = 1;
      });
  });

  if (tagCounts === {}) return [];

  // Sort the list of tags by channel usage
  const tagList = Object.entries(tagCounts).map(([name, count]) => ({ name, count }));
  return sortBy(tagList, 'count').reverse();
}

export function useChannelList() {
  const {
    languageFilter,
    categoryFilter,
    sortField,
    streamTags,
    setStreamTags,
    tagFilter,
    setTagFilter,
    setTrackedChannelCount,
  } = useContext(HomePageContext);
  const [allChannels, setAllChannels] = useState([]);
  const [visibleChannels, setVisibleChannels] = useState(null);
  const [channelViewers, setChannelViewers] = useState(0);
  const [loadingError, setLoadingError] = useState(null);

  useEffect(async () => {
    const loadChannels = async ({ refresh, fallback } = {}) => {
      // Initial page load gets live channels from S3, to avoid serverless API ROUTE cold start delays
      // (until the site is popular enough to not need it)
      const liveChannelsURL = refresh
        ? `/api/getChannels?refresh=1`
        : fallback
          ? `/api/getChannels`
          : cachedLiveChannelsURL;
      try {
        const response = await fetch(liveChannelsURL);
        const data = await response.json();

        // Fallback, incase the cached channel list is out of date
        if (
          data.createdAt &&
          differenceInSeconds(new Date(), parseISO(data.createdAt)) > CHANNEL_AUTOREFRESH_SECONDS * 2
        ) {
          console.log('Cached live channel list out of date, using API fallback for initial page load');

          loadChannels({ fallback: true });
        }
        else {
          if (data.error) setLoadingError(data.error);
          else {
            setAllChannels(data.channels);
            setTrackedChannelCount(data.trackedChannelCount);
          }
        }
      } catch ({ message }) {
        // Try the API if the cache file URL is broken
        if (liveChannelsURL === cachedLiveChannelsURL) {
          console.log(`Error loading ached live channel URL (${message}). Using API fallback for initial page load`);

          loadChannels({ fallback: true });
        }
      }
    };

    await loadChannels();

    // Later channel list refreshes can sprinkle in Twitch API data
    if (refreshRate) {
      console.log(`Refreshing channel list every ${refreshRate} seconds`);
      setInterval(() => loadChannels({ refresh: true }), refreshRate * 1000);
    }
  }, []);

  useEffect(async () => {
    if (allChannels.length) {
      let channelList = sortBy(allChannels, sortFields[sortField].fieldName).reverse();

      if (categoryFilterOptions[categoryFilter].filter)
        channelList = channelList.filter(categoryFilterOptions[categoryFilter].filter);
      if (languageFilterOptions[languageFilter].filter)
        channelList = channelList.filter(languageFilterOptions[languageFilter].filter);

      const latestStreamTags = aggregateStreamTags(channelList);

      // If we've filtered down to an empty list, switch back to all tags
      if (tagFilter && (categoryFilter !== 1) && !latestStreamTags?.find(({ name }) => name === tagFilter)) {
        setTagFilter(null);
      } else {
        setStreamTags(latestStreamTags);

        if (tagFilter)
          channelList = channelList.filter(({ latestStreamTags }) =>
            latestStreamTags.includes(tagFilter)
          );

        setVisibleChannels(channelList);
        setChannelViewers(sumBy(channelList, 'latestStreamViewers'));
      }
    }
  }, [allChannels, languageFilter, categoryFilter, sortField, tagFilter]);

  return { visibleChannels, channelViewers, loadingError };
}
