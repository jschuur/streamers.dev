import { orderBy, sumBy } from 'lodash';
import pluralize from 'pluralize';
import { useContext, useEffect, useState } from 'react';

import { useLiveChannels } from '../lib/api';
import { debug, hasGameDevStreamTag } from '../lib/util';

import { HomePageContext } from '../lib/stores';

import { channelSortOptions, languageFilterOptions, categoryFilterOptions } from '../lib/options';

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
  return Object.entries(tagCounts).map(([name, count]) => ({ name, count }));
}

function sortStreamTags({ tags, topicSort }) {
  // Make sure API comes after Algorithm and .NET is not at the start
  const sortableString = (str) => str.toLowerCase().replace('.', '');

  return topicSort
    ? orderBy(tags, (tag) => sortableString(tag.name), 'asc')
    : orderBy(tags, ['count', (tag) => sortableString(tag.name)], ['desc', 'asc']);
}

function visibleChannelViewerCounts({ allChannels, visibleChannels }) {
  const totalChannelCount = allChannels.length;
  const visibleChannelCount = visibleChannels.length;
  const totalViewerCount = sumBy(allChannels, 'latestStreamViewers');
  const visibleViewerCount = sumBy(visibleChannels, 'latestStreamViewers');

  return { totalChannelCount, visibleChannelCount, totalViewerCount, visibleViewerCount };
}

export default function useChannelList({ initialChannelData }) {
  const {
    languageFilter,
    categoryFilter,
    channelSort,
    topicSort,
    setStreamTags,
    topicFilter,
    setLiveCounts,
    setChannelListMetaData,
    showGameDev,
  } = useContext(HomePageContext);
  const [allChannels, setAllChannels] = useState([]);
  const [visibleChannels, setVisibleChannels] = useState(null);
  const { data, error, isFetching } = useLiveChannels({
    placeholderData: initialChannelData,
  });

  useEffect(() => {
    if (data) {
      const { channels, ...meta } = data;
      meta.cacheFileSize = JSON.stringify(data).length;
      debug(
        'useChannelList',
        `Channel data received for ${pluralize('channel', channels?.length, true)}`
      );

      setAllChannels(channels);
      setChannelListMetaData(meta);
    }
  }, [data]);

  // Update visibleChannels state if filter/sort options are changed
  useEffect(() => {
    if (allChannels?.length) {
      let visibleChannels = orderBy(allChannels, channelSortOptions[channelSort].fieldName, 'desc');

      if (categoryFilterOptions[categoryFilter].filter)
        visibleChannels = visibleChannels.filter(categoryFilterOptions[categoryFilter].filter);
      if (languageFilterOptions[languageFilter].filter)
        visibleChannels = visibleChannels.filter(languageFilterOptions[languageFilter].filter);
      if (!showGameDev)
        visibleChannels = visibleChannels.filter(
          (channel) => !hasGameDevStreamTag(channel.latestStreamTags)
        );

      const latestStreamTags = aggregateStreamTags(visibleChannels);

      setStreamTags(() => sortStreamTags({ tags: latestStreamTags, topicSort }));

      if (topicFilter)
        visibleChannels = visibleChannels.filter(({ latestStreamTags }) =>
          latestStreamTags.includes(topicFilter)
        );

      setLiveCounts(visibleChannelViewerCounts({ allChannels, visibleChannels }));
      setVisibleChannels(visibleChannels);
    }
  }, [allChannels, languageFilter, categoryFilter, channelSort, topicFilter, showGameDev]);

  // Resort the list of tags when the topic sort option is changed
  useEffect(() => {
    setStreamTags((tags) => sortStreamTags({ tags, topicSort }));
  }, [topicSort]);

  return { visibleChannels, error, isFetching };
}
