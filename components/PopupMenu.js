import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { DotsVerticalIcon } from '@heroicons/react/solid';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function PopupMenu({ actions }) {
  return (
    <Menu as='div' className='z-10 relative inline-block text-left'>
      {({ open }) => (
        <>
          <div>
            <Menu.Button className='inline-flex justify-center w-full bg-black'>
              <DotsVerticalIcon className='h-5 w-5 bg-black text-white my-1' aria-hidden='true' />
            </Menu.Button>
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
                {actions.map(({ label, onClick }) => (
                  <Menu.Item key={label}>
                    {({ active }) => (
                      <div
                        onClick={onClick}
                        className={classNames(
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                          'block px-4 py-2 text-sm whitespace-nowrap'
                        )}
                      >
                        {label}
                      </div>
                    )}
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
