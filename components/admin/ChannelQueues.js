import { getSession } from 'next-auth/client';
import { useEffect, useContext } from 'react';
import { useToasts } from 'react-toast-notifications';

import { AdminContext } from '../../lib/stores';
import { showToast } from '../../lib/util';

function QueueAction({ id, action, status, ...params }) {
  const { queue, setQueue, setIsUpdating } = useContext(AdminContext);
  const { addToast } = useToasts();

  // TODO: Queue up API requests
  async function callUpdate({ id, status }) {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, status, ...params }),
    };

    setIsUpdating((state) => state + 1);

    fetch('/api/updateQueue', options)
      .then((res) => res.json())
      .then(({ message, error }) => {
        showToast({ addToast, message, error });

        setQueue((queue) => queue.filter((channel) => channel.id !== id));
      })
      .catch((error) => showToast({ addToast, error: error.message }))
      .finally(() => setIsUpdating((state) => state - 1));
  }

  return (
    <>
      [
      <a className='cursor-pointer' onClick={() => callUpdate({ id, status })}>
        {action}
      </a>
      ]{' '}
    </>
  );
}

function TagQueue({ tagName }) {
  const { queue } = useContext(AdminContext);
  const tagChannels = queue.filter(({ tag }) => tag === tagName);

  return (
    <>
      <h2 className='text-xl mt-2 mb-1'>
        {tagName} ({tagChannels.length})
      </h2>

      <ul className='mx-2'>
        {tagChannels.map((channel) => (
          <li key={channel.id}>
            <a target='_new' href={`https://twitch.tv/${channel.name}`}>
              {channel.name}
            </a>{' '}
            ({channel.language} {channel.views}: {channel.title}){' '}
            <QueueAction id={channel.id} status={'ADDED'} action='add' />
            <QueueAction id={channel.id} status={'ADDED'} action='backlog' backlog={1} />
            <QueueAction id={channel.id} status={'PAUSED'} action='pause' />
            <QueueAction id={channel.id} status={'WONTADD'} action="won't add" />
          </li>
        ))}
      </ul>
    </>
  );
}

export default function ChannelQueues() {
  const { queue, setQueue, setIsUpdating } = useContext(AdminContext);
  const addToast = useToasts();

  useEffect(() => {
    setIsUpdating((state) => state + 1);

    const loadQueue = async () => {
      const response = await fetch('/api/getQueue');
      const { queue, error } = await response.json();

      if (error) showToast({ addToast, error });
      else setQueue(queue);

      setIsUpdating((state) => state - 1);
    };

    loadQueue();
  }, []);

  return (
    <>
      <h2 className='text-2xl pt-2'>Queues</h2>

      {!queue ? (
        'Loading...'
      ) : (
        <>
          <TagQueue tagName='Web Development' />
          <TagQueue tagName='Software Development' />
          <TagQueue tagName='Programming' />
          <TagQueue tagName='Game Development' />
        </>
      )}
    </>
  );
}
