import { useEffect, useState } from 'react';

function ActionLink({ url, action }) {
  return (
    <>
      [
      <a target='_new' href={url}>
        {action}
      </a>
      ]{' '}
    </>
  );
}
function TagQueue({ tagName, queue }) {
  const tagChannels = queue.filter(({ tag }) => tag === tagName);

  return (
    <>
      <h2 className='text-xl mt-2 mb-1'>
        {tagName} ({tagChannels.length})
      </h2>

      <ul className='mx-2'>
        {tagChannels.map((channel) => (
          <li key={channel.id} >
            <a href={`https://twitch.tv/${channel.name}`}>{channel.name}</a> ({channel.language}{' '}
            {channel.views}: {channel.title}){' '}
            <ActionLink url={ '/api/updateQueue?id=' + channel.id + '&status=ADDED'} action='add' />
            <ActionLink url={ '/api/updateQueue?id=' + channel.id + '&status=ADDED&backlog=1'} action='backlog' />
            <ActionLink url={ '/api/updateQueue?id=' + channel.id + '&status=PAUSED'} action='paused' />
            <ActionLink url={ '/api/updateQueue?id=' + channel.id + '&status=WONTADD'} action="won't add" />
          </li>
        ))}
      </ul>
    </>
  );
}

// Simple queue of potential channels to add
export default function Queue() {
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    const loadQueue = async () => {
      const response = await fetch('/api/getQueue');
      const data = await response.json();

      if (data.error) setLoadingError(data.error);
      else setQueue(data.queue);
    };

    loadQueue();
  }, []);

  return (
    <div className='container mx-auto px-10'>
      <h1 className='text-2xl pt-2'>Queues</h1>

      {!queue ? (
        'Loading...'
      ) : (
        <>
          <TagQueue tagName='Web Development' queue={queue} />
          <TagQueue tagName='Software Development' queue={queue} />
          <TagQueue tagName='Programming' queue={queue} />
          <TagQueue tagName='Game Development' queue={queue} />
        </>
      )}
    </div>
  );
}