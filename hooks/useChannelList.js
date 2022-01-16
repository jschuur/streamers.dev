import { orderBy, sumBy } from 'lodash';
import { useContext, useEffect, useState } from 'react';

import { useLiveChannels } from '../lib/api';

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

export default function useChannelList({ initialChannels }) {
  const {
    languageFilter,
    categoryFilter,
    channelSort,
    topicSort,
    setStreamTags,
    topicFilter,
    setLiveCounts,
    setChannelListMetaData,
  } = useContext(HomePageContext);
  const [allChannels, setAllChannels] = useState([]);
  const [visibleChannels, setVisibleChannels] = useState(null);
  const { data, error, isFetching } = useLiveChannels({ placeholderData: initialChannels });

  // Update allChannels state after the channel list is fetched
  useEffect(() => {
    if (data) {
      const { channels, ...meta } = data;
      meta.cacheFileSize = JSON.stringify(data).length;

      setAllChannels(channels);
      setChannelListMetaData(meta);
    }
  }, [data]);

  // Update visibleChannels state if filter/sort options are changed
  useEffect(async () => {
    if (allChannels?.length) {
      let visibleChannels = orderBy(allChannels, channelSortOptions[channelSort].fieldName, 'desc');

      if (categoryFilterOptions[categoryFilter].filter)
        visibleChannels = visibleChannels.filter(categoryFilterOptions[categoryFilter].filter);
      if (languageFilterOptions[languageFilter].filter)
        visibleChannels = visibleChannels.filter(languageFilterOptions[languageFilter].filter);

      const latestStreamTags = aggregateStreamTags(visibleChannels);

      setStreamTags(() => sortStreamTags({ tags: latestStreamTags, topicSort }));

      if (topicFilter)
        visibleChannels = visibleChannels.filter(({ latestStreamTags }) =>
          latestStreamTags.includes(topicFilter)
        );

      setLiveCounts(visibleChannelViewerCounts({ allChannels, visibleChannels }));
      setVisibleChannels(visibleChannels);
    }
  }, [allChannels, languageFilter, categoryFilter, channelSort, topicFilter]);

  // Resort the list of tags when the topic sort option is changed
  useEffect(() => {
    setStreamTags((tags) => sortStreamTags({ tags, topicSort }));
  }, [topicSort]);

  return { visibleChannels, error, isFetching };
}
