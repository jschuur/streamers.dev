import { useContext } from 'react';
import Head from 'next/head';
import { DefaultSeo } from 'next-seo';

import NavBar from './NavBar';
import Footer from './Footer';

import useTagSlugs from '../../hooks/useTagSlugs';
import { TAGLINE } from '../../lib/config';

import { HomePageContext } from '../../lib/stores';

export default function Layout({ page = 'Home', description, children, url }) {
  const { topicFilter } = useContext(HomePageContext);
  const { slugByTag } = useTagSlugs();

  // Build some fields based on the current topic
  const title =
    page === 'Home'
      ? topicFilter
        ? `streamers.dev - Live coding streams about ${topicFilter}`
        : `streamers.dev - ${TAGLINE}`
      : `streamers.dev - ${page}`;
  const pageDescription =
    page === 'Home' && topicFilter
      ? `Discover Twitch live-coding channels featuring ${topicFilter}`
      : description;
  const pageUrl =
    page === 'Home' && topicFilter ? `https://streamers.dev/?topic=${slugByTag(topicFilter)}` : url;

  return (
    <>
      <Head></Head>
      <DefaultSeo
        title={title}
        openGraph={{
          type: 'website',
          locale: 'en_GB',
          url: pageUrl,
          site_name: 'streamers.dev',
          title,
          description: pageDescription,
          images: [
            {
              url: 'https://streamers.dev/images/streamersdev_preview.jpg',
              width: 1200,
              height: 630,
              alt: 'streamers.dev front page',
            },
          ],
        }}
        twitter={{
          site: '@StreamersDev',
          cardType: 'summary_large_image',
        }}
        additionalLinkTags={[
          {
            rel: 'shortcut icon',
            href: '/favicon.ico',
            sizes: '48x48',
          },
          {
            rel: 'icon',
            href: '/favicon-32x32.png',
            sizes: '32x32',
          },
          {
            rel: 'icon',
            href: '/favicon-16x16.png',
            sizes: '16x16',
          },
          {
            rel: 'apple-touch-icon',
            href: '/apple-touch-icon.png',
            sizes: '180x180',
          },
        ]}
      />

      <div className='max-w-5xl mx-auto sm:px-7 py-4 sm:py-5'>
        <NavBar />

        {children}

        <Footer />
      </div>
    </>
  );
}
