import { map } from 'lodash';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import pluralize from 'pluralize';
import { useEffect, useContext } from 'react';
import Loader from 'react-loader-spinner';

import ChannelListEntry from './ChannelListEntry';
import ChannelListControls from './ChannelListControls';
import OfflineChannels from './OfflineChannels';

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
import useFilterNav from '../hooks/useFilterNav';

function VisibleChannelList() {
  const { trackedChannelCount, visibleChannels, loadingError } = useChannelList();
  const { theme } = useTheme();
  const filterNav = useFilterNav();

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
  if (!visibleChannels.length)
    return (
      <div className='m-2'>
        No matching live channels.{' '}
        <a className='cursor-pointer' onClick={() => filterNav({ reset: true })}>
          Reset filters
        </a>{' '}
        or{' '}
        <a
          className='cursor-pointer'
          href='https://www.twitch.tv/directory/game/Science%20%26%20Technology?tl=3dc8f084-d886-4264-b20f-8bd5f90562b5'
        >
          watch some cute animals
        </a>{' '}
        instead.
      </div>
    );

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
    if (!topicFilter) return setOfflineChannels([]);

    const doFetch = async () => {
      const response = await fetch(
        `/api/getOfflineChannels?topic=${encodeURIComponent(topicFilter)}&lang=${
          languageFilterOptions[languageFilter].slug
        }`
      );
      const { channels, error } = await response.json();

      if (error) console.error(`Error fetching offline channels: ${error}`);
      else setOfflineChannels(channels);
    };

    doFetch();
  }, [topicFilter, languageFilter]);

  return (
    <>
      <div className='shadow overflow-hidden sm:rounded-lg'>
        <ChannelListControls />
        <VisibleChannelList />
      </div>
      <OfflineChannels />
    </>
  );
}
