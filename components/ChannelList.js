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
  sortFields,
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
    setTagSlugs,
    setTagFilter,
    setSortField,
    setCategoryFilter,
    setLanguageFilter,
    setSortTopics,
  } = useContext(HomePageContext);
  const { tagBySlug } = useTagSlugs();
  const router = useRouter();
  const query = router.query;

  // Initialise the status list of tags and slugs loaded at build time
  useEffect(() => {
    setTagSlugs(tagSlugs);
  }, []);

  useEffect(() => {
    const { topic, lang, cat, csort, tsort } = query;

    if (topic) setTagFilter(tagBySlug(topic));
    if (lang) setLanguageFilter(languageFilterOptions.findIndex(({ slug }) => slug === lang));
    if (cat) setCategoryFilter(categoryFilterOptions.findIndex(({ slug }) => slug === cat));
    if (csort) setSortField(sortFields.findIndex(({ slug }) => slug === csort));
    if (tsort) setSortTopics(topicSortOptions.findIndex(({ slug }) => slug === tsort));
  }, [query]);

  return (
    <div className='shadow overflow-hidden sm:rounded-lg'>
      <ChannelListControls />
      <VisibleChannelList />
    </div>
  );
}
