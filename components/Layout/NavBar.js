import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

import PopupMenu from '../PopupMenu';
import ThemeChanger from '../ThemeChanger';

import { adminAuthorised, profilePictureUrl } from '../../lib/util';

import { TAGLINE } from '../../lib/config';

function NavLink({ href, children }) {
  const { pathname } = useRouter();

  return (
    <Link href={href}>
      <a
        className={`${
          pathname === href && href !== '/' && 'border-b-2 border-black dark:border-gray-100'
        } text-black visited:text-black hover:text-gray-500 dark:visited:text-gray-100 dark:text-gray-300`}
      >
        {children}
      </a>
    </Link>
  );
}
export default function NavBar() {
  const { data: session } = useSession();
  const adminActions = [
    {
      label: 'Live candidates',
      href: '/admin/live',
    },
    {
      label: 'Recently added',
      href: '/admin/recent',
    },
    {
      label: 'Channel Queues',
      href: '/admin#queues',
    },
    {
      label: 'Add Channel',
      href: '/admin#addChannel',
    },
  ];

  return (
    <div className='flex flex-row place-items-center mb-4 sm:mb-6 sm:px-1 shadow sm:rounded-lg font-header text-lg bg-white dark:bg-gray-600'>
      <div className='px-2 my-2'>
        <NavLink href='/'>
          <div className='h-8 w-8 relative'>
            <Image src='/images/river-icon.png' layout='fill' />
          </div>
        </NavLink>
      </div>
      <div className='flex-grow cursor-pointer'>
        <NavLink href='/'>
          <>
            <span>streamers.dev</span>
            <span className='hidden md:inline'>: {TAGLINE}</span>
          </>
        </NavLink>
      </div>
      <div className='pr-4'>
        <NavLink href='/about'>About</NavLink>
      </div>
      <div className='pr-4'>
        <NavLink href='/stats'>Stats</NavLink>
      </div>
      {session && adminAuthorised({ session }) && (
        <div className='pr-4 h-8'>
          <PopupMenu actions={adminActions}>
            <img
              className='h-8 w-8 rounded-full border-2 border-blue-600 cursor-pointer'
              src={profilePictureUrl(session.user.image, 70)}
              alt={session.user.name}
            />
          </PopupMenu>
        </div>
      )}
      <div className='mb-1 pl-2'>
        <ThemeChanger />
      </div>
    </div>
  );
}
