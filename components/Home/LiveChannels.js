import { useTheme } from 'next-themes';

import ChannelListEntry from './ChannelListEntry';
import Loader from '../Layout/Loader';

import useChannelList from '../../hooks/useChannelList';
import useFilterNav from '../../hooks/useFilterNav';

export default function LiveChannels() {
  const { visibleChannels, error } = useChannelList();
  const { theme } = useTheme();
  const filterNav = useFilterNav();

  if (error) return <div className='py-2'>Error: {error} </div>;

  if (!visibleChannels)
    return (
      <div className='py-2 bg-gray-100 dark:bg-gray-700'>
        <Loader message='Loading live channel list...' theme={theme} />
      </div>
    );

  if (!visibleChannels?.length)
    return (
      <div className='m-2'>
        No matching live channels.{' '}
        <a className='cursor-pointer' onClick={() => filterNav({ reset: 'filter' })}>
          Reset filters
        </a>{' '}
        or{' '}
        <a
          className='cursor-pointer'
          href='https://www.twitch.tv/directory/game/Science%20%26%20Technology?tl=3dc8f084-d886-4264-b20f-8bd5f90562b5'
        >
          watch some cute animals
        </a>{' '}
        instead.
      </div>
    );

  return (
    <div className='bg-white grid grid-cols-[40%,60%] sm:grid-cols-[220px,147px,1fr] md:grid-cols-[220px,220px,1fr]'>
      {visibleChannels.map((channel, index) => (
        <ChannelListEntry key={channel.twitchId} channel={channel} channelIndex={index} />
      ))}
    </div>
  );
}
