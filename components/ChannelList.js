import { useState, useContext } from 'react';
import { sortBy, sumBy } from 'lodash';
import pluralize from 'pluralize';

import ChannelListEntry from './ChannelListEntry';
import ChannelListControls, { sortFields, languageFilterOptions, categoryFilterOptions } from './ChannelListControls';
import { HomePageContext } from '../lib/stores';

export default function ChannelList({ channels }) {
  const { languageFilter, categoryFilter, sortField } = useContext(HomePageContext);

  let channelList = sortBy(
    channels.filter((channel) => channel.isLive),
    sortFields[sortField].fieldName
  ).reverse();

  if (categoryFilterOptions[categoryFilter].filter)
    channelList = channelList.filter(categoryFilterOptions[categoryFilter].filter);
  if (languageFilterOptions[languageFilter].filter)
    channelList = channelList.filter(languageFilterOptions[languageFilter].filter);

  const totalViewers = sumBy(channelList, 'latestStreamViewers');

  return (
    <div className='flex flex-col'>
      <div className='-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
        <div className='py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8'>
          <div className='shadow overflow-hidden border-b border-gray-200 sm:rounded-lg'>
            <ChannelListControls />
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th
                    scope='col'
                    className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Channel <br />({channelList.length} with{' '}
                    {pluralize('viewer', totalViewers, true)})
                  </th>
                  <th
                    scope='col'
                    width='160px'
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
                {channelList.map((channel, index) => (
                  <ChannelListEntry key={channel.twitchId} channel={channel} channelIndex={index} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
