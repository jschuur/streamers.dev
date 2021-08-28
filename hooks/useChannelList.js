import { sortBy, sumBy } from 'lodash';
import { useContext, useEffect, useState } from 'react';

import { useLiveChannels } from '../lib/api';

import { HomePageContext } from '../lib/stores';

import { channelSortOptions, languageFilterOptions, categoryFilterOptions } from '../lib/options';

function aggregateStreamTags({ channels, topicSort }) {
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
  return sortBy(tagList, topicSort ? 'name' : 'count').reverse();
}

function visibleChannelViewerCounts({ allChannels, visibleChannels }) {
  const totalChannelCount = allChannels.length;
  const visibleChannelCount = visibleChannels.length;
  const totalViewerCount = sumBy(allChannels, 'latestStreamViewers');
  const visibleViewerCount = sumBy(visibleChannels, 'latestStreamViewers');

  return { totalChannelCount, visibleChannelCount, totalViewerCount, visibleViewerCount };
}

export default function useChannelList() {
  const {
    languageFilter,
    categoryFilter,
    channelSort,
    topicSort,
    streamTags,
    setStreamTags,
    topicFilter,
    setTopicFilter,
    setLiveCounts,
    setTrackedChannelCount,
    setDistinctCountryCount,
  } = useContext(HomePageContext);
  const [allChannels, setAllChannels] = useState([]);
  const [visibleChannels, setVisibleChannels] = useState(null);
  const { data, error, isFetching } = useLiveChannels();

  const sortStreamTags = ({ tags, topicSort }) =>
    topicSort === 0 ? sortBy(tags, 'count').reverse() : sortBy(tags, 'name');

  // Update allChannels state after the channel list is fetched
  useEffect(() => {
    if (data) {
      setAllChannels(data.channels);
      setTrackedChannelCount(data.trackedChannelCount);
      setDistinctCountryCount(data.distinctCountryCount);
    }
  }, [data]);

  // Update visibleChannels state if filter/sort options are changed
  useEffect(async () => {
    if (allChannels.length) {
      let visibleChannels = sortBy(
        allChannels,
        channelSortOptions[channelSort].fieldName
      ).reverse();

      if (categoryFilterOptions[categoryFilter].filter)
        visibleChannels = visibleChannels.filter(categoryFilterOptions[categoryFilter].filter);
      if (languageFilterOptions[languageFilter].filter)
        visibleChannels = visibleChannels.filter(languageFilterOptions[languageFilter].filter);

      const latestStreamTags = aggregateStreamTags({ channels: visibleChannels, topicSort });

      setStreamTags((tags) => sortStreamTags({ tags: latestStreamTags, topicSort }));

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
