import { useContext } from 'react';
import { HomePageContext } from '../lib/stores';

export const sortFields = [
  {
    fieldName: 'latestStreamViewers',
    labelShort: 'stream viewers',
    labelLong: 'Stream viewers (most)',
  },
  {
    fieldName: 'latestStreamStartedAt',
    labelShort: 'stream age',
    labelLong: 'Stream age (latest)',
  },
  {
    fieldName: 'creationDate',
    labelShort: 'channel age',
    labelLong: 'Channel age (youngest)',
  },
];

export const languageFilterOptions = [
  {
    label: 'All',
  },
  {
    label: 'English',
    filter: (channel) => channel.latestStreamLanguage === 'en',
  },
  {
    label: 'Not English',
    filter: (channel) => channel.latestStreamLanguage !== 'en',
  },
];

export const categoryFilterOptions = [
  {
    label: 'Coding',
    filter: (channel) =>
      channel.latestStreamGameName === 'Science & Technology' || channel.alwaysCoding,
  },
  {
    label: 'Not Coding',
    filter: (channel) =>
      channel.latestStreamGameName !== 'Science & Technology' && !channel.alwaysCoding,
  },
  {
    label: 'Any',
  },
];

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
        className='m-1 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-300 hover:bg-blue-400'
      >
        <span className='inline sm:hidden'>By {sortFields[sortField].labelShort}</span>
        <span className='hidden sm:inline'>Sort: {sortFields[sortField].labelLong}</span>
      </button>
      <button
        onClick={() => setLanguageFilter((index) => (index + 1) % languageFilterOptions.length)}
        type='button'
        className='m-1 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700'
      >
        <span className='inline sm:hidden'>Lang</span>
        <span className='hidden sm:inline'>Language</span>:{' '}
        {languageFilterOptions[languageFilter].label}
      </button>
      <button
        onClick={() => setCategoryFilter((index) => (index + 1) % categoryFilterOptions.length)}
        type='button'
        className='m-1 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700'
      >
        <span className='inline sm:hidden'>Cat</span>
        <span className='hidden sm:inline'>Category</span>:{' '}
        {categoryFilterOptions[categoryFilter].label}
      </button>
    </div>
  );
}
