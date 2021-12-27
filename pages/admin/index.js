import { getSession } from 'next-auth/react';
import { NextSeo } from 'next-seo';
import { ToastProvider } from 'react-toast-notifications';

import Layout from '../../components/Layout/Layout';
import AddChannelForm from '../../components/Admin/AddChannelForm';
import UpdateSpinner from '../../components/Admin/UpdateSpinner';
import ChannelQueues from '../../components/Admin/ChannelQueues';

import { adminAuthorised } from '../../lib/util';
import { AdminProvider } from '../../lib/stores';

export default function AdminIndex() {
  return (
    <AdminProvider>
      <ToastProvider>
        <Layout page='Admin Dashboard'>
          <NextSeo noindex nofollow />

          <UpdateSpinner />
          <AddChannelForm />
          <ChannelQueues />
        </Layout>
      </ToastProvider>
    </AdminProvider>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!adminAuthorised({ session })) return { redirect: { destination: '/', statusCode: 302 } };

  return {
    props: {},
  };
}
