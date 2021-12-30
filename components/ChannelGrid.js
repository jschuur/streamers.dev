import TwitchProfile from './Home/TwitchProfile';

export default function ChannelGrid({ channels }) {
  return (
    <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 mx-auto'>
      {channels.map((channel) => (
        <div key={channel.name} className='align-top my-1 mx-1 sm:mx-2'>
          <TwitchProfile channel={channel} avatarSize='large' />
        </div>
      ))}
    </div>
  );
}
