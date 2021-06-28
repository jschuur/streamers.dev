import sortBy from 'lodash.sortby';
import Link from 'next/link';
import pluralize from 'pluralize';
import { useContext } from 'react';

import { HomePageContext } from '../lib/stores';

import Badge from './Badge';

function StreamTagsEntry({ name, count }) {
  const { tagFilter, setTagFilter } = useContext(HomePageContext);
	let onClick, color;

	if (name !== tagFilter) {
		onClick = () => { setTagFilter(name) };
		color = 'blue';
	}

  return (
    <Badge color={color} onClick={onClick}>
      {name} ({count})
    </Badge>
  );
}

function StreamTagsAllEntry() {
  const { tagFilter, setTagFilter, streamTags } = useContext(HomePageContext);
  const liveTopics = pluralize('Live Topic', streamTags.length, true);
	let onClick, color = 'gray';

	if (tagFilter) {
		onClick = () => setTagFilter(null);
		color = 'purple';
	}

  return (
    <Badge color={color} onClick={onClick}>
      {liveTopics}
    </Badge>
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
				.map(({ name, count }) => <StreamTagsEntry key={name} name={name} count={count} />)}
    </div>
  );
}
