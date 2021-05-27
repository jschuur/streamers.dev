import React from 'react';
import { sortBy } from 'lodash';

import UserListEntry from './UserListEntry';

export default function UserList({ users }) {
  const totalUsers = users.length;
  const userList = sortBy(
    users.filter((user) => user.isLive),
    'latestStreamViewers'
  ).reverse();

  return (
    <div className='flex flex-col'>
      <div className='-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
        <div className='py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8'>
          <div className='shadow overflow-hidden border-b border-gray-200 sm:rounded-lg'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Channel ({userList.length} of {totalUsers} live)
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Stream
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell'
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
