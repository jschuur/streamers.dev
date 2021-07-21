import { sortBy } from 'lodash';
import { useRouter } from 'next/router';
import { useEffect, useContext } from 'react';

import ChannelListControls from './ChannelListControls';
import LiveChannels from './LiveChannels';
import Section from '../Layout/Section';

import useTagSlugs from '../../hooks/useTagSlugs';

import { HomePageContext } from '../../lib/stores';
import {
  channelSortOptions,
  languageFilterOptions,
  categoryFilterOptions,
  topicSortOptions,
} from '../../lib/options';

export default function ChannelList({ channels, tagSlugs }) {
  const {
    topicFilter,
    setTopicFilter,
    categoryFilter,
    setCategoryFilter,
    channelSort,
    setChannelSort,
    languageFilter,
    setLanguageFilter,
    topicSort,
    setTopicSort,
    offlineChannels,
    setOfflineChannels,
  } = useContext(HomePageContext);

  const { tagBySlug, slugByTag } = useTagSlugs();
  const router = useRouter();
  const { query, isReady } = router;

  function setStateFromQuery(query) {
    const { topic, lang, cat, csort, tsort } = query;

    const routeTopic = tagBySlug(topic) || null;
    if (routeTopic !== topicFilter) setTopicFilter(routeTopic);

    const routeCategory = categoryFilterOptions.findIndex(({ slug }) => slug === cat);
    if (routeCategory !== categoryFilter) setCategoryFilter(routeCategory >= 0 ? routeCategory : 0);

    const routeLanguage = languageFilterOptions.findIndex(({ slug }) => slug === lang);
    if (routeLanguage !== languageFilter) setLanguageFilter(routeLanguage >= 0 ? routeLanguage : 0);

    const routeChannelSort = channelSortOptions.findIndex(({ slug }) => slug === csort);
    if (routeChannelSort !== channelSort)
      setChannelSort(routeChannelSort >= 0 ? routeChannelSort : 0);

    const routeSortTopic = topicSortOptions.findIndex(({ slug }) => slug === tsort);
    if (routeSortTopic !== topicSort) setTopicSort(routeSortTopic >= 0 ? routeSortTopic : 0);
  }

  useEffect(() => {
    // Skip initial pre-hydration call
    if (!isReady) return;

    setStateFromQuery(query);
  }, [query]);

  // Update the offlineChannels list when the topic or language filter changes
  useEffect(() => {
    setOfflineChannels([]);

    if (!topicFilter) return;

    const doFetch = async () => {
      const response = await fetch(
        `/api/getOfflineChannels?topic=${encodeURIComponent(topicFilter)}&lang=${
          languageFilterOptions[languageFilter].slug
        }`
      );
      const { channels, error } = await response.json();

      if (error) console.error(`Error fetching offline channels: ${error}`);
      else setOfflineChannels(sortBy(channels, 'lastOnline').reverse());
    };

    doFetch();
  }, [topicFilter, languageFilter]);

  return (
    <Section>
      <ChannelListControls />
      <LiveChannels />
    </Section>
  );
}
