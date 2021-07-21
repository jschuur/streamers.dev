import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

import ThemeChanger from '../ThemeChanger';

import { TAGLINE } from '../../lib/config';

function NavLink({ href, children }) {
  const { pathname } = useRouter();

  return (
    <Link href={href}>
      <a
        className={`${
          pathname === href && href !== '/' && 'border-b-2 border-black dark:border-gray-100'
        } text-black visited:text-black hover:text-gray-500 dark:visited:text-gray-100 dark:text-gray-300 `}
      >
        {children}
      </a>
    </Link>
  );
}
export default function NavBar() {
  return (
    <div className='flex flex-row place-items-center mb-4 sm:mb-6 gap-2 sm:px-1 shadow sm:rounded-lg text-lg bg-white dark:bg-gray-600'>
      <div className='ml-2 h-8 w-8 my-2 relative'>
        <NavLink href='/'>
          <Image src='/images/river-icon.png' layout='fill' />
        </NavLink>
      </div>
      <div className='flex-grow cursor-pointer'>
        <NavLink href='/'>
          <>
            <span className='hidden sm:inline'>{TAGLINE}</span>
            <span className='inline sm:hidden'>streamers.dev</span>
          </>
        </NavLink>
      </div>
      <div className='pr-2'>
        <NavLink href='/about'>About</NavLink>
      </div>
      <div className='pr-2'>
        <NavLink href='/stats'>Stats</NavLink>
      </div>
      <div className='mb-1'>
        <ThemeChanger />
      </div>
    </div>
  );
}
