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
      <span key={1}>
        <br />
        Currently tracking{' '}
        <a href='https://docs.google.com/spreadsheets/d/1dbE0RjLvyGle1-9nJh9FmRCp3LBmv21sA2brtQccIQE/edit#gid=958169034'>
          {trackedChannelCount}
        </a>{' '}
        channels.{' '}
      </span>
    );
  }

  if (session && adminAuthorised({ session })) {
    extraFooter.push(
      <span key={2}>
        <br />
        <a href='/admin'>Admin</a>. Logged in as {session.user.name} (
        <a className='cursor-pointer' onClick={signOut}>
          logout
        </a>
        )
      </span>
    );
  } else {
    extraFooter.push(
      <span key={3}>
        <a className='cursor-pointer' onClick={() => signIn('twitch')}>
          login
        </a>
      </span>
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
