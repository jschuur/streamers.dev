import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import pluralize from 'pluralize';
import { useEffect, useContext } from 'react';
import Loader from 'react-loader-spinner';

import ChannelListEntry from './ChannelListEntry';
import ChannelListControls from './ChannelListControls';

import { HomePageContext } from '../lib/stores';
import { THUMBNAIL_WIDTH } from '../lib/config';
import {
  channelSortOptions,
  languageFilterOptions,
  categoryFilterOptions,
  topicSortOptions,
} from '../lib/options';

import useChannelList from '../hooks/useChannelList';
import useTagSlugs from '../hooks/useTagSlugs';

function VisibleChannelList() {
  const { trackedChannelCount, visibleChannels, loadingError } = useChannelList();
  const { theme } = useTheme();

  if (loadingError) return <div className='m-2'>Error: {loadingError} </div>;
  if (!visibleChannels)
    return (
      <div className='m-2 flex justify-center'>
        <Loader
          type='Bars'
          color={theme === 'dark' ? '#ffffff' : '#000000'}
          height={24}
          width={24}
        />
      </div>
    );
  if (!visibleChannels.length) return <div className='m-2'>No matching channels</div>;

  return (
    <div className='bg-white grid grid-cols-[40%,60%] sm:grid-cols-[220px,147px,1fr] md:grid-cols-[220px,220px,1fr]'>
      {visibleChannels.map((channel, index) => (
        <ChannelListEntry key={channel.twitchId} channel={channel} channelIndex={index} />
      ))}
    </div>
  );
}
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
  } = useContext(HomePageContext);

  const { tagBySlug } = useTagSlugs();
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

  return (
    <div className='shadow overflow-hidden sm:rounded-lg'>
      <ChannelListControls />
      <VisibleChannelList />
    </div>
  );
}
