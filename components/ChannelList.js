import pluralize from 'pluralize';

import ChannelListEntry from './ChannelListEntry';
import ChannelListControls from './ChannelListControls';

import { HomePageContext } from '../lib/stores';
import { useChannelList } from '../lib/useChannelList';

export default function ChannelList({ channels }) {
  const { trackedChannelCount, visibleChannels, channelViewers, loadingError } = useChannelList();

  return (
    <div className='flex flex-col'>
      <div className='-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
        <div className='py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8'>
          <div className='shadow overflow-hidden border-b border-gray-200 dark:border-gray-500 sm:rounded-lg'>
            <ChannelListControls />
            {loadingError ? (
              <>Error: {loadingError}</>
            ) : visibleChannels.length ? (
              <table className='min-w-full divide-y-0 divide-gray-200'>
                <thead className='bg-gray-50 dark:bg-gray-700'>
                  <tr>
                    <th
                      scope='col'
                      className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Channel <br />({visibleChannels.length} with{' '}
                      {pluralize('viewer', channelViewers, true)})
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
                <tbody className='bg-white divide-y-0 divide-gray-200'>
                  {visibleChannels.map((channel, index) => (
                    <ChannelListEntry
                      key={channel.twitchId}
                      channel={channel}
                      channelIndex={index}
                    />
                  ))}
                </tbody>
              </table>
            ) : (
              <div className='m-2'>Loading...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
