import { useSession, signIn, signOut } from 'next-auth/client';

import { adminAuthorised } from '../lib/util';

export default function Footer({ channels }) {
  const [session, loading] = useSession();

  return (
    <footer className='text-right text-xs text-gray-400 mt-3 px-2'>
      <a href='https://trello.com/b/a9k1kC65'>Work in progress</a> by{' '}
      <a href='https://twitter.com/joostschuur/'>Joost Schuur</a>.{' '}
      <a href='https://twitter.com/StreamersDev'>@StreamersDev</a>
      <br />
      Currently tracking{' '}
      <a href='https://docs.google.com/spreadsheets/d/1dbE0RjLvyGle1-9nJh9FmRCp3LBmv21sA2brtQccIQE/edit#gid=958169034'>
        {channels && channels.length}
      </a>{' '}
      channels.
      {session ? (
        <>
          <br />
          {adminAuthorised({ session }) && (
            <>
              <a href='/admin'>Admin</a>.{' '}
            </>
          )}
          Logged in as {session.user.name} (
          <a className='cursor-pointer' onClick={signOut}>
            logout
          </a>
          )
        </>
      ) : (
        <>
          {' '}
          (
          <a className='cursor-pointer' onClick={() => signIn('twitch')}>
            login
          </a>
          )
        </>
      )}
    </footer>
  );
}
