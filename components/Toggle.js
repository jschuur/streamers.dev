import { Switch } from '@headlessui/react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Toggle({ text, state, setState }) {
  return (
    <Switch.Group as='div' className='flex flex-row justify-end place-items-center'>
      <Switch
        checked={state}
        onChange={setState}
        className={classNames(
          state ? 'bg-green-200' : 'bg-gray-200',
          'relative inline-flex flex-shrink-0 h-4 sm:h-6 w-9 sm:w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none'
        )}
      >
        <span
          aria-hidden='true'
          className={classNames(
            state ? 'translate-x-5' : 'translate-x-0',
            'pointer-events-none inline-block h-3 sm:h-5 w-3 sm:w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
          )}
        />
      </Switch>
      <Switch.Label as='span' className='ml-3'>
        <span className='text-xs sm:text-sm font-medium'>{text}</span>
      </Switch.Label>
    </Switch.Group>
  );
}
