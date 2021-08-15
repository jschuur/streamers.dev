import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import Link from 'next/link';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function PopupMenu({ actions, children }) {
  return (
    <Menu as='div' className='z-10 relative inline-block text-left'>
      {({ open }) => (
        <>
          <div>
            <Menu.Button className='inline-flex justify-center w-full'>{children}</Menu.Button>
          </div>

          <Transition
            show={open}
            as={Fragment}
            enter='transition ease-out duration-100'
            enterFrom='transform opacity-0 scale-95'
            enterTo='transform opacity-100 scale-100'
            leave='transition ease-in duration-75'
            leaveFrom='transform opacity-100 scale-100'
            leaveTo='transform opacity-0 scale-95'
          >
            <Menu.Items
              static
              className='origin-top-right absolute right-0 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none'
            >
              <div className='py-1'>
                {actions.map(({ label, onClick, href }) => (
                  <Menu.Item key={label}>
                    {({ active }) => {
                      const className = classNames(
                        active
                          ? 'bg-gray-100 text-gray-900 visited:text-gray-900 hover:text-grey-900'
                          : 'text-gray-700 visited:text-gray-700 hover:text-gray-700',
                        'font-sans block px-4 py-2 text-sm whitespace-nowrap'
                      );

                      return href ? (
                        <Link href={href}>
                          <a className={className}>{label}</a>
                        </Link>
                      ) : (
                        <div onClick={onClick} className={className}>
                          {label}
                        </div>
                      );
                    }}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
}
