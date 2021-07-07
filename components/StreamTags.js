import sortBy from 'lodash.sortby';
import Link from 'next/link';
import pluralize from 'pluralize';
import { useContext, useState, useEffect } from 'react';

import { HomePageContext } from '../lib/stores';
import { topicSortOptions } from '../lib/options';
import useTagSlugs from '../hooks/useTagSlugs';

import Badge from './Badge';

function StreamTagsEntry({ name, count }) {
  const { tagFilter, setTagFilter } = useContext(HomePageContext);
  const { slugByTag } = useTagSlugs();

  let onClick, color;

  if (name !== tagFilter) {
    onClick = () => setTagFilter(name);
    color = 'blue';
  }

  return (
    <Badge color={color} onClick={onClick}>
      {name} ({count})
    </Badge>
  );
}

function StreamTagsReset() {
  const liveTopicsCount = () => pluralize('Live Topic', streamTags.length, true);

  const { tagFilter, setTagFilter, streamTags, sortTopics, setSortTopics } =
    useContext(HomePageContext);
  const [liveTopics, setLiveTopics] = useState(liveTopicsCount);
  let onClick, color;

  useEffect(() => {
    setLiveTopics(() => liveTopicsCount());
  }, [streamTags]);

  if (tagFilter) {
    onClick = () => setTagFilter(null);
    color = 'purple';
  } else {
    onClick = () => setSortTopics((index) => (index + 1) % topicSortOptions.length);
    color = 'green';
  }

  return (
    <Badge color={color} onClick={onClick}>
      {liveTopics} ({topicSortOptions[sortTopics].label})
    </Badge>
  );
}

export default function StreamTags() {
  const { streamTags, setTagFilter, categoryFilter } = useContext(HomePageContext);

  if (!streamTags.length) return null;
  // Don't use tags for the non-coding section
  if (categoryFilter === 1) return null;

  return (
    <div className='py-2 sm:py-3 text-black font-medium dark:text-white'>
      <StreamTagsReset />
      {streamTags.map(({ name, count }) => (
        <StreamTagsEntry key={name} name={name} count={count} />
      ))}
    </div>
  );
}


