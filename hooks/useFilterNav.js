import { useRouter } from 'next/router';
import { useContext } from 'react';

import {
  channelSortOptions,
  languageFilterOptions,
  categoryFilterOptions,
  topicSortOptions,
} from '../lib/options';
import { HomePageContext } from '../lib/stores';
import useTagSlugs from './useTagSlugs';

// Change the page URL based on the relevant filter state fields
export default function useFilterNav() {
  const { slugByTag } = useTagSlugs();
  const router = useRouter();
  const { topicFilter, categoryFilter, languageFilter, channelSort, topicSort } =
    useContext(HomePageContext);

  return function filterNav({ reset, ...newConditions }) {
    //  Merge current filter state with update
    let conditions = {};
    let params = {};

    if (reset !== 'all')
      conditions = {
        reset,
        topicFilter,
        categoryFilter,
        languageFilter,
        channelSort,
        topicSort,
        ...newConditions,
      };

    if (reset === 'filter')
      conditions = {
        ...conditions,
        topicFilter: null,
        categoryFilter: 0,
        languageFilter: 0,
      };

    // Put together the querystring parameters
    if (conditions.topicFilter) params.topic = slugByTag(conditions.topicFilter);
    if (conditions.channelSort) params.csort = channelSortOptions[conditions.channelSort].slug;
    if (conditions.languageFilter)
      params.lang = languageFilterOptions[conditions.languageFilter].slug;
    if (conditions.categoryFilter)
      params.cat = categoryFilterOptions[conditions.categoryFilter].slug;
    if (conditions.topicSort) params.tsort = topicSortOptions[conditions.topicSort].slug;

    // Create the actual querystring
    const querystring = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    // Change the page URL. A useEffect in index.html will kick in when router.query changes to update the state
    router.push(querystring.length ? `/?${querystring}` : '/', undefined, { shallow: true });
  };
}
