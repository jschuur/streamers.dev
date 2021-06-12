import { useState, createContext } from 'react';
import { getSession } from 'next-auth/client';
import { ToastProvider } from 'react-toast-notifications';

import AddChannelForm from '../../components/admin/AddChannelForm';
import UpdateSpinner from '../../components/admin/UpdateSpinner';
import ChannelQueues from '../../components/admin/ChannelQueues';

import { adminAuthorised } from '../../lib/util';
import { AdminProvider } from '../../lib/stores';

export default function AdminIndex() {
  return (
    <AdminProvider>
      <ToastProvider>
        <UpdateSpinner />
        <div className='container mx-auto px-10'>
          <h1 className='text-3xl pt-4'>Admin Dashboard</h1>
          <AddChannelForm />
          <ChannelQueues />
        </div>
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
