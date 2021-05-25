import Head from 'next/head';
import pluralize from 'pluralize';

import UserList from '../components/UserList';

import { getUsers } from '../lib/twitch';
import { TWITCH_USER_FIELDS } from '../lib/config.js';
import { min, map } from 'lodash';

export default function Home({ users }) {
  return (
    <>
      <Head>
        <title>streamers.dev - A directory of live coding streamers</title>
        <meta name="description" content="A directory of live coding streamers"></meta>
      </Head>

      <h1 className='text-center text-3xl mt-5'>Streamers.dev</h1>
      <div className='mx-auto px-7 py-5'>
        <UserList users={users} />
      </div>
      <footer className='text-right text-xs text-gray-400 px-7'>
        <a href='https://trello.com/b/a9k1kC65'>Work in progress</a> by{' '}
        <a href='https://twitter.com/joostschuur/'>Joost Schuur</a>,{' '}
        <a href='https://twitter.com/StreamersDev'>@StreamersDev</a>
        <br />
        Currently using a curated list of {pluralize('Twitch users', users.length, true)}
        <br />
        Last updated: {min(map(users, 'updatedAt')).toGMTString()}
      </footer>
    </>
  );
}

export async function getServerSideProps() {
  const users = await getUsers({ fields: TWITCH_USER_FIELDS });

  return { props: { users } };
}
