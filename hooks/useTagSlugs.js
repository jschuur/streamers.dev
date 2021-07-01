import { useContext } from 'react';
import { HomePageContext } from '../lib/stores';

export default function useTagSlugs() {
  const { tagSlugs } = useContext(HomePageContext);

  const slugByTag = (str) => tagSlugs.find(({ tag }) => tag === str)?.slug;
  const tagBySlug = (str) => tagSlugs.find(({ slug }) => slug === str)?.tag;

  return { slugByTag, tagBySlug };
}
