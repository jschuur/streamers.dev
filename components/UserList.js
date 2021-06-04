import { useState } from 'react';
import { sortBy, sumBy } from 'lodash';
import pluralize from 'pluralize';

import UserListEntry from './UserListEntry';

const sortFields = [
  {
    fieldName: 'latestStreamViewers',
    labelShort: 'stream viewers',
    labelLong: 'Stream viewers (most)',
  },
  {
    fieldName: 'latestStreamStartedAt',
    labelShort: 'stream age',
    labelLong: 'Stream age (latest)',
  },
  {
    fieldName: 'creationDate',
    labelShort: 'channel age',
    labelLong: 'Channel age (youngest)',
  },
];

export default function UserList({ users }) {
  const [isCoding, setIsCoding] = useState(true);
  const [isEnglish, setIsEnglish] = useState(false);
  const [sortField, setSortField] = useState(0);

  const totalUsers = users.length;

  let userList = sortBy(
    users.filter((user) => user.isLive),
    sortFields[sortField].fieldName
  ).reverse();

  if (isCoding)
    userList = userList.filter(
      (user) => user.latestStreamGameName === 'Science & Technology' || user.alwaysCoding
    );
  if (isEnglish)
    userList = userList.filter((user) => user.latestStreamLanguage === 'en');

  const totalViewers = sumBy(userList, 'latestStreamViewers');

  return (
    <div className='flex flex-col'>
      <div className='-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
        <div className='py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8'>
          <div className='shadow overflow-hidden border-b border-gray-200 sm:rounded-lg'>
            <div className='text-right'>
              <button
                onClick={() => {
                  let newSortField = sortField + 1;
                  if (newSortField >= sortFields.length) newSortField = 0;

                  setSortField(newSortField);
                }}
                type='button'
                className='m-1 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-300 hover:bg-blue-400'
              >
                <span className='inline sm:hidden'>By {sortFields[sortField].labelShort}</span>
                <span className='hidden sm:inline'>Sort: {sortFields[sortField].labelLong}</span>
              </button>
              <button
                onClick={() => setIsEnglish(!isEnglish)}
                type='button'
                className='m-1 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700'
              >
                <span className='inline sm:hidden'>Lang</span>

                <span className='hidden sm:inline'>Language</span>: {isEnglish ? 'English' : 'Any'}
              </button>
              <button
                onClick={() => setIsCoding(!isCoding)}
                type='button'
                className='m-1 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700'
              >
                In: {isCoding ? 'Science & Tech' : 'Anywhere'}
              </button>
            </div>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th
                    scope='col'
                    className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Channel <br />({userList.length} with {pluralize('viewer', totalViewers, true)})
                  </th>
                  <th
                    scope='col'
                    width='140px'
                    className=' text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell'
                  >
                    Stream
                  </th>
                  <th
                    scope='col'
                    className='text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3'
                  >
                    <span className='md:hidden'>Stream</span>
                  </th>
                  <th
                    scope='col'
                    width='120px'
                    className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell'
                  >
                    Links
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {userList.map((user, index) => (
                  <UserListEntry key={user.twitchId} user={user} userIndex={index} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
