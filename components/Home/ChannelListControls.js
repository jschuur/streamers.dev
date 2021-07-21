import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';

import StreamTags from './StreamTags';
import ChannelViewerCounts from './ChannelViewerCounts';

import useFilterNav from '../../hooks/useFilterNav';

import { HomePageContext } from '../../lib/stores';
import {
  channelSortOptions,
  languageFilterOptions,
  categoryFilterOptions,
} from '../../lib/options';

function SortFilterButtons() {
  const {
    channelSort,
    setChannelSort,
    languageFilter,
    setLanguageFilter,
    categoryFilter,
    setCategoryFilter,
  } = useContext(HomePageContext);
  const filterNav = useFilterNav();

  return (
    <div className='py-1 whitespace-nowrap'>
      <button
        onClick={() => filterNav({ channelSort: (channelSort + 1) % channelSortOptions.length })}
        type='button'
        className='m-1 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs sm:text-sm font-medium rounded shadow-sm text-white dark:text-gray-100 bg-blue-300 dark:bg-blue-400 hover:bg-blue-400 dark:hover:bg-blue-500'
      >
        <span className='inline md:hidden'>By {channelSortOptions[channelSort].labelShort}</span>
        <span className='hidden md:inline'>Sort: {channelSortOptions[channelSort].labelLong}</span>
      </button>
      <button
        onClick={() =>
          filterNav({ languageFilter: (languageFilter + 1) % languageFilterOptions.length })
        }
        type='button'
        className='m-1 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs sm:text-sm font-medium rounded shadow-sm text-white dark:text-gray-200  bg-indigo-600 hover:bg-indigo-700'
      >
        <span className='inline md:hidden'>Lang</span>
        <span className='hidden md:inline'>Language</span>:{' '}
        {languageFilterOptions[languageFilter].label}
      </button>
      <button
        onClick={() =>
          filterNav({ categoryFilter: (categoryFilter + 1) % categoryFilterOptions.length })
        }
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
  return (
    <div>
      <div className='bg-white dark:bg-gray-600 px-2 sm:px-4 flex flex-col sm:flex-row-reverse justify-between '>
        <SortFilterButtons />
        <ChannelViewerCounts />
      </div>
      <div className='bg-gray-100 dark:bg-gray-700'>
        <StreamTags />
      </div>
    </div>
  );
}
