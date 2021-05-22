import Head from 'next/head'
import Image from 'next/image';

import StreamerList from '../components/StreamerList';

import { getUsers } from '../lib/twitch';

export default function Home({ users }) {
  return (
    <div>
      <h1>Streamers.dev</h1>
      <StreamerList users={users} />
    </div>
  );
}

export async function getServerSideProps() {
  const fields = [
    'twitchId',
    'name',
    'displayName',
    'isLive',
    'latestStreamTitle',
    'latestStreamStartedAt',
    'profilePictureUrl',
    'description',
    'country',
  ];

  const users = await getUsers({ fields });

  return { props: { users } };
}