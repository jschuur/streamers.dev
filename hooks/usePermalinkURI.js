import { useContext } from 'react';

import { HomePageContext } from '../lib/stores';
import {
  sortFields,
  languageFilterOptions,
  categoryFilterOptions,
  topicSortOptions,
} from '../lib/options';
import useTagSlugs from './useTagSlugs';

// returns the permalink URI based on the current, relevant state
export default function usePermalinkURI() {
  const { tagFilter, categoryFilter, languageFilter, sortField, sortTopics } =
    useContext(HomePageContext);
  const { slugByTag } = useTagSlugs();

  function permalink() {
    var params = {};

    if (tagFilter) params.topic = slugByTag(tagFilter);
    if (sortField) params.csort = sortFields[sortField].slug;
    if (languageFilter) params.lang = languageFilterOptions[languageFilter].slug;
    if (categoryFilter) params.cat = categoryFilterOptions[categoryFilter].slug;
    if (sortTopics) params.tsort = topicSortOptions[sortTopics].slug;

    const querystring = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    return querystring.length ? `/?${querystring}` : '/';
  }

  return permalink;
}
