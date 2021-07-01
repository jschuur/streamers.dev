import { differenceInSeconds, parseISO } from 'date-fns';
import { sortBy, sumBy } from 'lodash';
import { useContext, useEffect, useState } from 'react';

import { HomePageContext } from '../lib/stores';

import { sortFields, languageFilterOptions, categoryFilterOptions } from '../lib/options';
import { CHANNEL_AUTOREFRESH_SECONDS, CACHED_LIVE_CHANNELS_URL } from '../lib/config';

function aggregateStreamTags({ channels, sortTopics }) {
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
  return sortBy(tagList, sortTopics ? 'name' : 'count').reverse();
}

export default function useChannelList() {
  const {
    languageFilter,
    categoryFilter,
    sortField,
    sortTopics,
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

  const sortStreamTags = ({ tags, sortTopics }) =>
    sortTopics === 0 ? sortBy(tags, 'count').reverse() : sortBy(tags, 'name');

  useEffect(async () => {
    const loadChannels = async ({ refresh, fallback } = {}) => {
      // Skip updating the channel list when the tab is hidden to save on API calls
      if (document.visibilityState && document.visibilityState !== 'visible') return;

      // Initial page load gets live channels from S3, to avoid serverless API ROUTE cold start delays
      // (until the site is popular enough to not need it)
      const liveChannelsURL = refresh
        ? `/api/getChannels?refresh=1`
        : fallback
        ? `/api/getChannels`
        : CACHED_LIVE_CHANNELS_URL;

      try {
        const response = await fetch(liveChannelsURL);
        const data = await response.json();

        // Fallback, incase the cached channel list is out of date
        if (
          data.createdAt &&
          differenceInSeconds(new Date(), parseISO(data.createdAt)) >
            CHANNEL_AUTOREFRESH_SECONDS * 2
        ) {
          console.log(
            'Cached live channel list out of date, using API fallback for initial page load'
          );

          loadChannels({ fallback: true });
        } else {
          if (data.error) setLoadingError(data.error);
          else {
            setAllChannels(data.channels);
            setTrackedChannelCount(data.trackedChannelCount);
          }
        }
      } catch ({ message }) {
        // Try the API if the cache file URL is broken
        if (liveChannelsURL === CACHED_LIVE_CHANNELS_URL) {
          console.log(
            `Error loading cached live channel URL (${message}). Using API fallback for initial page load`
          );

          loadChannels({ fallback: true });
        }
      }
    };

    await loadChannels();

    // Later channel list refreshes can sprinkle in Twitch API data
    if (CHANNEL_AUTOREFRESH_SECONDS) {
      console.log(`Refreshing channel list every ${CHANNEL_AUTOREFRESH_SECONDS} seconds`);
      setInterval(() => loadChannels({ refresh: true }), CHANNEL_AUTOREFRESH_SECONDS * 1000);
    }
  }, []);

  useEffect(async () => {
    if (allChannels.length) {
      let channelList = sortBy(allChannels, sortFields[sortField].fieldName).reverse();

      if (categoryFilterOptions[categoryFilter].filter)
        channelList = channelList.filter(categoryFilterOptions[categoryFilter].filter);
      if (languageFilterOptions[languageFilter].filter)
        channelList = channelList.filter(languageFilterOptions[languageFilter].filter);

      const latestStreamTags = aggregateStreamTags({ channels: channelList, sortTopics });

      // If we've filtered down to an empty list, switch back to all tags
      if (
        tagFilter &&
        categoryFilter !== 1 &&
        !latestStreamTags?.find(({ name }) => name === tagFilter)
      ) {
        setTagFilter(null);
      } else {
        setStreamTags((tags) => sortStreamTags({ tags: latestStreamTags, sortTopics }));

        if (tagFilter)
          channelList = channelList.filter(({ latestStreamTags }) =>
            latestStreamTags.includes(tagFilter)
          );

        setVisibleChannels(channelList);
        setChannelViewers(sumBy(channelList, 'latestStreamViewers'));
      }
    }
  }, [allChannels, languageFilter, categoryFilter, sortField, tagFilter]);

  useEffect(() => {
    setStreamTags((tags) => sortStreamTags({ tags, sortTopics }));
  }, [sortTopics]);

  return { visibleChannels, channelViewers, loadingError };
}
