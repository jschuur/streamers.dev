import sortBy from 'lodash.sortby';
import Link from 'next/link';
import { useContext } from 'react';

import { HomePageContext } from '../lib/stores';

function StreamTagsEntry({ name, count }) {
  const { tagFilter, setTagFilter } = useContext(HomePageContext);

  return name === tagFilter ? (
    <span>
      {name} ({count})
    </span>
  ) : (
    <button
      className={`text-blue-400 ${name === tagFilter ? 'font-bold' : 'font-base'}`}
      onClick={() => {
        setTagFilter(name);
      }}
    >
      {name} ({count})
    </button>
  );
}

function StreamTagsAllEntry() {
  const { tagFilter, setTagFilter } = useContext(HomePageContext);

  return (
    <span className='mr-2'>
      {tagFilter ? (
        <button className='text-blue-400 font-medium' onClick={() => setTagFilter(null)}>
          Live Topics
        </button>
      ) : (
        'Live Topics'
      )}{' '}
      >
    </span>
  );
}
export default function StreamTags() {
  const { streamTags, setTagFilter, categoryFilter } = useContext(HomePageContext);

  if (!streamTags.length) return null;
  // Don't use tags for the non-coding section
  if (categoryFilter === 1) return null;

  // TODO: Reset to 'All' when toggling other filter controls?
  // TODO: Don't show in non Coding
  return (
    <div className='py-2 px-4 text-sm sm:text-base text-black font-medium dark:text-white'>
      <StreamTagsAllEntry />
      {streamTags
        .map(({ name, count }) => <StreamTagsEntry key={name} name={name} count={count} />)
        .reduce((acc, tag) => [acc, ` ${String.fromCharCode(8226)} `, tag])}
    </div>
  );
}
