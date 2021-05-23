import Head from 'next/head'
import Image from 'next/image';

import UserList from '../components/UserList';

import { getUsers } from '../lib/twitch';

export default function Home({ users }) {
  return (
    <>
      <h1 className='text-center text-3xl mt-5'>Streamers.dev</h1>
      <div className='mx-auto px-7 py-3'>
        <UserList users={users} />
      </div>
      <footer className='text-right text-xs text-gray-400 px-7'>
        Work in progress by{' '}
        <a href='https://twitter.com/joostschuur/'>
          Joost Schuur
        </a>
      </footer>
    </>
  );
}

export async function getServerSideProps() {
  const fields = [
    'twitchId',
    'name',
    'displayName',
    'fullName',
    'isLive',
    'latestStreamTitle',
    'latestStreamStartedAt',
    'latestStreamViewers',
    'profilePictureUrl',
    'description',
    'broadcasterType',
    'country',
  ];

  const users = await getUsers({ fields });

  return { props: { users } };
}