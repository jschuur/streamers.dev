import pluralize from 'pluralize';

import UserList from '../components/UserList';

import { getUsers } from '../lib/twitch';

export default function Home({ users }) {
  return (
    <>
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
