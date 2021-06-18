import { useContext } from 'react';
import { HomePageContext } from '../lib/stores';

import { sortFields, languageFilterOptions, categoryFilterOptions } from '../lib/useChannelList';

export default function ChannelListControls() {
  const {
    sortField,
    setSortField,
    languageFilter,
    setLanguageFilter,
    categoryFilter,
    setCategoryFilter,
  } = useContext(HomePageContext);

  return (
    <div className='text-right'>
      <button
        onClick={() => setSortField((index) => (index + 1) % sortFields.length)}
        type='button'
        className='m-1 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white dark:text-gray-100 bg-blue-300 dark:bg-blue-400 hover:bg-blue-400 dark:hover:bg-blue-500'
      >
        <span className='inline sm:hidden'>By {sortFields[sortField].labelShort}</span>
        <span className='hidden sm:inline'>Sort: {sortFields[sortField].labelLong}</span>
      </button>
      <button
        onClick={() => setLanguageFilter((index) => (index + 1) % languageFilterOptions.length)}
        type='button'
        className='m-1 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white dark:text-gray-200  bg-indigo-600 hover:bg-indigo-700'
      >
        <span className='inline sm:hidden'>Lang</span>
        <span className='hidden sm:inline'>Language</span>:{' '}
        {languageFilterOptions[languageFilter].label}
      </button>
      <button
        onClick={() => setCategoryFilter((index) => (index + 1) % categoryFilterOptions.length)}
        type='button'
        className='m-1 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white dark:text-gray-200 bg-indigo-600 hover:bg-indigo-700'
      >
        <span className='inline sm:hidden'>Cat</span>
        <span className='hidden sm:inline'>Category</span>:{' '}
        {categoryFilterOptions[categoryFilter].label}
      </button>
    </div>
  );
}
