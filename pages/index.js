import { useState, useEffect } from 'react';
import Head from 'next/head';
import { min, map } from 'lodash';
import pluralize from 'pluralize';

import UserList from '../components/UserList';

import { NEXT_PUBLIC_USER_AUTOREFRESH_SECONDS } from '../lib/config';

export default function Home() {
  const [users, setUsers] = useState([]);
  const [loadingError, setLoadingError] = useState(null);

  useEffect(() => {
    const loadUsers = async () => {
      const response = await fetch('/api/getUsers');
      const data = await response.json();

      if (data.error) setLoadingError(data.error)
      else setUsers(data.users);
    };

    loadUsers();

    const refreshRate =
      process.env.NEXT_PUBLIC_USER_AUTOREFRESH_SECONDS || NEXT_PUBLIC_USER_AUTOREFRESH_SECONDS;
    if (refreshRate) {
      console.log(`Refreshing user list every ${refreshRate} seconds`);
      setInterval(loadUsers, refreshRate * 1000);
    }
  }, []);

  return (
    <>
      <Head>
        <title>streamers.dev - A directory of live coding streamers</title>
        <meta name='description' content='A directory of live coding streamers'></meta>
      </Head>

      <h1 className='text-center text-3xl mt-5'>Streamers.dev</h1>
      <div className='mx-auto px-7 py-5'>
        { loadingError ? <>Error: { loadingError }</> :
          users.length ? <UserList users={users} /> : <div>Loading...</div> }
      </div>
      <footer className='text-right text-xs text-gray-400 px-7'>
        <a href='https://trello.com/b/a9k1kC65'>Work in progress</a> by{' '}
        <a href='https://twitter.com/joostschuur/'>Joost Schuur</a>,{' '}
        <a href='https://twitter.com/StreamersDev'>@StreamersDev</a>
        { users.length && <>
          <br />
          Currently using a curated list of { pluralize('Twitch users', users.length, true) }
          <br />
          {/* Last updated: {new Date(min(map(users, 'updatedAt'))).toGMTString()} */}
        </>}
      </footer>
    </>
  );
}