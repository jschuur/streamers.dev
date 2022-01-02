import ChannelListEntry from './ChannelListEntry';

import useChannelList from '../../hooks/useChannelList';
import useFilterNav from '../../hooks/useFilterNav';

export default function LiveChannels({ initialChannels }) {
  const { visibleChannels, error } = useChannelList({ initialChannels });
  const filterNav = useFilterNav();

  if (error) return <div className='py-2'>Error: {error} </div>;

  if (!visibleChannels) return null;

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
          href='https://www.twitch.tv/directory/game/Animals%2C%20Aquariums%2C%20and%20Zoos'
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
