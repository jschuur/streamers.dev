import { useContext } from 'react';
import { useSession, signIn, signOut } from 'next-auth/client';

import { adminAuthorised } from '../lib/util';
import { HomePageContext } from '../lib/stores';

export default function Footer() {
  const [session, loading] = useSession();
  const { trackedChannelCount } = useContext(HomePageContext);
  let extraFooter = [];

  if (trackedChannelCount) {
    extraFooter.push(
      <>
        <br />
        Currently tracking{' '}
        <a href='https://docs.google.com/spreadsheets/d/1dbE0RjLvyGle1-9nJh9FmRCp3LBmv21sA2brtQccIQE/edit#gid=958169034'>
          {trackedChannelCount}
        </a>{' '}
        channels.{' '}
      </>
    );
  }

  if (session && adminAuthorised({ session })) {
    extraFooter.push(
      <>
        <br />
        <a href='/admin'>Admin</a>. Logged in as {session.user.name} (
        <a className='cursor-pointer' onClick={signOut}>
          logout
        </a>
        )
      </>
    );
  } else {
    extraFooter.push(
      <>
        <a className='cursor-pointer' onClick={() => signIn('twitch')}>
          login
        </a>
      </>
    );
  }

  return (
    <footer className='text-right text-xs text-gray-400 mt-3 px-2'>
      <a href='https://trello.com/b/a9k1kC65'>Work in progress</a> by{' '}
      <a href='https://twitter.com/joostschuur/'>Joost Schuur</a>.{' '}
      <a href='https://twitter.com/StreamersDev'>@StreamersDev</a>
      { extraFooter }

    </footer>
  );
}
