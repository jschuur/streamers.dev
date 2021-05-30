import { useState, useEffect } from 'react';
import Head from 'next/head';
import { differenceInMinutes } from 'date-fns';
import { minBy, map } from 'lodash';
import pluralize from 'pluralize';

import UserList from '../components/UserList';
import Footer from '../components/Footer';

import { USER_AUTOREFRESH_SECONDS } from '../lib/config';

export default function Home() {
  const [users, setUsers] = useState([]);
  const [loadingError, setLoadingError] = useState(null);

  useEffect(async () => {
    const loadUsers = async ({ refresh = true } = {}) => {
      const response = await fetch(`/api/getUsers${refresh ? '?refresh=1' : ''}`);
      const data = await response.json();

      if (data.error) setLoadingError(data.error);
      else setUsers(data.users);
    };

    // The first refresh always uses DB only data. Later one can sprinkle in Twitch API data
    await loadUsers({ refresh: false });

    const refreshRate =
      process.env.NEXT_PUBLIC_USER_AUTOREFRESH_SECONDS || USER_AUTOREFRESH_SECONDS;
    if (refreshRate) {
      console.log(`Refreshing user list every ${refreshRate} seconds`);
      setInterval(loadUsers, refreshRate * 1000);
    }
  }, []);

  return (
    <>
      <Head>
        <title>streamers.dev - a directory of live coding streamers</title>
        <meta name='description' content='A directory of live coding streamers'></meta>
      </Head>

      <h1 className='text-center font-medium text-2xl sm:text-3xl mt-5'>streamers.dev</h1>
      <h2 className='text-center text-lg sm:text-xl'>
        a curated directory of live coding streamers
      </h2>
      <div className='max-w-6xl mx-auto sm:px-7 py-5'>
        {loadingError ? (
          <>Error: {loadingError}</>
        ) : users.length ? (
          <UserList users={users} />
        ) : (
          <div>Loading...</div>
        )}
        <Footer />
      </div>
    </>
  );
}