import { NextSeo } from 'next-seo';
import { getSession } from 'next-auth/react';

import Layout from '../../components/Layout/Layout';
import RecentlyAddedChannels from '../../components/Admin/RecentlyAddedChannels';

import { adminAuthorised } from '../../lib/util';

export default function AdminRecent() {
  return (
    <Layout page='Admin Dashboard - Recently Added Channels'>
      <NextSeo noindex nofollow />

      <RecentlyAddedChannels />
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!adminAuthorised({ session })) return { redirect: { destination: '/', statusCode: 302 } };

  return { props: {} };
}
