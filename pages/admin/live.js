import { NextSeo } from 'next-seo';
import { getSession } from 'next-auth/client';
import { ToastProvider } from 'react-toast-notifications';

import Layout from '../../components/Layout/Layout';

import { adminAuthorised } from '../../lib/util';
import { AdminProvider } from '../../lib/stores';
import PotentialChannels from '../../components/Admin/PotentialChannels';

export default function AdminLive() {
  return (
    <AdminProvider>
      <ToastProvider>
        <Layout page='Admin Dashboard - Live & Unlisted'>
          <NextSeo noindex nofollow />

          <PotentialChannels />
        </Layout>
      </ToastProvider>
    </AdminProvider>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!adminAuthorised({ session })) return { redirect: { destination: '/', statusCode: 302 } };

  return { props: {} };
}
