import { useContext } from 'react';

import { HomePageContext } from '../lib/stores';

export default function useTagSlugs() {
  const { tagSlugs, setTagSlugs } = useContext(HomePageContext);

  const slugByTag = (str) => tagSlugs.find(({ tag }) => tag === str)?.slug || null;
  const tagBySlug = (str) => tagSlugs.find(({ slug }) => slug === str)?.tag || null;

  return { setTagSlugs, slugByTag, tagBySlug };
}
