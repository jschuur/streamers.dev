import pluralize from 'pluralize';
import { useContext, useState, useEffect } from 'react';

import Badge from './Badge';

import { HomePageContext } from '../lib/stores';
import { topicSortOptions } from '../lib/options';

import useFilterNav from '../hooks/useFilterNav';

function StreamTagsEntry({ name, count }) {
  const { topicFilter } = useContext(HomePageContext);
  const filterNav = useFilterNav();

  let onClick, color;

  if (name !== topicFilter) {
    onClick = () => filterNav({ topicFilter: name });
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

  const { topicFilter, streamTags, topicSort } = useContext(HomePageContext);
  const [liveTopics, setLiveTopics] = useState(liveTopicsCount);
  const filterNav = useFilterNav();
  let onClick, color;

  useEffect(() => {
    setLiveTopics(() => liveTopicsCount());
  }, [streamTags]);

  if (topicFilter) {
    onClick = () => filterNav({ topicFilter: null });
    color = 'purple';
  } else {
    onClick = () => filterNav({ topicSort: (topicSort + 1) % topicSortOptions.length });
    color = 'green';
  }

  return (
    <Badge color={color} onClick={onClick}>
      {liveTopics} ({topicSortOptions[topicSort].label})
    </Badge>
  );
}

export default function StreamTags() {
  const { streamTags, categoryFilter } = useContext(HomePageContext);

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
