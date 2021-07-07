import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';

import StreamTags from './StreamTags';
import ChannelViewerCounts from './ChannelViewerCounts';

import { HomePageContext } from '../lib/stores';
import { sortFields, languageFilterOptions, categoryFilterOptions } from '../lib/options';
import usePermalinkURI from '../hooks/usePermalinkURI';

function SortFilterButtons() {
  const {
    sortField,
    setSortField,
    languageFilter,
    setLanguageFilter,
    categoryFilter,
    setCategoryFilter,
  } = useContext(HomePageContext);

  return (
    <div className='py-1 whitespace-nowrap'>
      <button
        onClick={() => setSortField((index) => (index + 1) % sortFields.length)}
        type='button'
        className='m-1 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs sm:text-sm font-medium rounded shadow-sm text-white dark:text-gray-100 bg-blue-300 dark:bg-blue-400 hover:bg-blue-400 dark:hover:bg-blue-500'
      >
        <span className='inline md:hidden'>By {sortFields[sortField].labelShort}</span>
        <span className='hidden md:inline'>Sort: {sortFields[sortField].labelLong}</span>
      </button>
      <button
        onClick={() => setLanguageFilter((index) => (index + 1) % languageFilterOptions.length)}
        type='button'
        className='m-1 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs sm:text-sm font-medium rounded shadow-sm text-white dark:text-gray-200  bg-indigo-600 hover:bg-indigo-700'
      >
        <span className='inline md:hidden'>Lang</span>
        <span className='hidden md:inline'>Language</span>:{' '}
        {languageFilterOptions[languageFilter].label}
      </button>
      <button
        onClick={() => setCategoryFilter((index) => (index + 1) % categoryFilterOptions.length)}
        type='button'
        className='m-1 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs sm:text-sm font-medium rounded shadow-sm text-white dark:text-gray-200 bg-indigo-600 hover:bg-indigo-700'
      >
        <span className='inline md:hidden'>Cat</span>
        <span className='hidden md:inline'>Category</span>:{' '}
        {categoryFilterOptions[categoryFilter].label}
      </button>
    </div>
  );
}

export default function ChannelListControls() {
  const {
    tagFilter,
    sortField,
    languageFilter,
    categoryFilter,
    sortTopics,
  } = useContext(HomePageContext);
  const permalink = usePermalinkURI();
  const router = useRouter();

  // Centrally change the page URL when the relevant state changes
  useEffect(() => {
    router.push(permalink());
  }, [tagFilter, languageFilter, categoryFilter, sortField, sortTopics]);

  return (
    <div className='px-2 sm:px-3'>
      <div className='flex flex-col sm:flex-row-reverse justify-between '>
        <SortFilterButtons />
        <ChannelViewerCounts />
      </div>
      <div>
        <StreamTags />
      </div>
    </div>
  );
}
