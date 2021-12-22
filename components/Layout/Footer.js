import Link from 'next/link';
import { useContext } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import prettyMilliseconds from 'pretty-ms';

import { adminAuthorised } from '../../lib/util';
import { HomePageContext } from '../../lib/stores';

export default function Footer() {
  const { data: session } = useSession();
  const { channelListMetaData } = useContext(HomePageContext);
  const { trackedChannelCount, distinctCountryCount, updateTime, cacheFileSize } =
    channelListMetaData || {};

  let extraFooter = [];

  if (trackedChannelCount && distinctCountryCount) {
    extraFooter.push(
      <span key={1}>
        <br />
        Currently tracking{' '}
        <Link href='/stats'>
          <a>{trackedChannelCount}</a>
        </Link>{' '}
        channels and {distinctCountryCount} countries.
      </span>
    );
  }

  if (session && adminAuthorised({ session })) {
    extraFooter.push(
      <span key={2}>
        {' '}
        (
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
          {' '}
          (login
        </a>
        )
      </span>
    );
  }

  return (
    <footer className='text-right text-xs text-gray-400 mt-3 px-2'>
      <a href='https://trello.com/b/a9k1kC65'>Work in progress</a> by{' '}
      <a href='https://twitch.tv/joostschuur/'>Joost Schuur</a>.{' '}
      <a href='https://twitter.com/StreamersDev'>@StreamersDev</a>
      {updateTime &&
        cacheFileSize &&
        ` (${prettyMilliseconds(updateTime, { separateMilliseconds: true })}, ${Math.round(
          cacheFileSize / 1024
        )}k)`}
      {extraFooter}
    </footer>
  );
}
