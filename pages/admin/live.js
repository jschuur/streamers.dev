import { NextSeo } from 'next-seo';
import { getSession } from 'next-auth/react';
import { ToastProvider } from 'react-toast-notifications';

import Layout from '../../components/Layout/Layout';
import PotentialChannels from '../../components/Admin/PotentialChannels';

import { adminAuthorised } from '../../lib/util';

export default function AdminLive() {
  return (
    <ToastProvider>
      <Layout page='Admin Dashboard - Live & Unlisted'>
        <NextSeo noindex nofollow />

        <PotentialChannels />
      </Layout>
    </ToastProvider>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!adminAuthorised({ session })) return { redirect: { destination: '/', statusCode: 302 } };

  return { props: {} };
}
