import { format } from 'date-fns';
import { uniq, map, sortBy } from 'lodash';
import router, { useRouter } from 'next/router';
import { getSession } from 'next-auth/client';
import { useEffect, useRef, useContext, useState } from 'react';
import { useToasts } from 'react-toast-notifications';
import { XCircleIcon } from '@heroicons/react/solid';

import { AdminContext } from '../../lib/stores';
import { showToast } from '../../lib/util';
import useFetch from '../../hooks/useFetch';
import Button from '../../components/Button';
import DropDown from '../../components/DropDown';

const FILTER_DAYS = [1, 2, 3, 7, 14];

const slugify = (str) => str.replace(/[^A-Za-z0-9]+/gi, '');
const tagList = (queue) =>
  uniq(map(queue, 'tag'))
    .filter((tag) => tag)
    .sort()
    .reverse();
const filterChannelsSearch = (channels, searchTerm) =>
  searchTerm
    ? channels.filter(({ title }) => title.toLowerCase().includes(searchTerm.toLowerCase()))
    : channels;
const filterChannelsTag = (channels, tagName) => channels.filter(({ tag }) => tag === tagName);

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

  return <Button onClick={() => callUpdate({ id, status })}>{action}</Button>;
}

function TagQueue({ tagName }) {
  const { queue, queueFilterField, queueSearch } = useContext(AdminContext);

  const [allTagChannels, setAllTagChannels] = useState(filterChannelsTag(queue, tagName));
  const [tagChannels, setTagChannels] = useState(allTagChannels);

  let prevDate;

  useEffect(() => {
    if (queue.length) {
      let tagChannels = filterChannelsTag(queue, tagName);

      setAllTagChannels(() => tagChannels);
      setTagChannels(() => filterChannelsSearch(tagChannels, queueSearch));
    }
  }, [queue]);

  useEffect(() => {
    if (queueSearch) setTagChannels(() => filterChannelsSearch(allTagChannels, queueSearch));
    else setTagChannels(allTagChannels);
  }, [queueSearch]);

  if (tagChannels.length < 1) return null;

  // TODO: Make sure filtered views still work when an entry was deleted
  // TODO: item counter should show search matches (x of y)

  const tagQueue = sortBy(tagChannels, queueFilterField)
    .reverse()
    .map((channel) => {
      let dateHeader = null;
      let currDate = format(new Date(channel[queueFilterField]), 'PPP');

      if (currDate !== prevDate) {
        prevDate = currDate;
        dateHeader = (
          <h3 key={currDate} className='text-lg mt-2'>
            {currDate}
          </h3>
        );
      }

      return (
        <div key={channel.id}>
          {dateHeader}
          <li className='group' key={channel.id}>
            <a target='_new' href={`https://twitch.tv/${channel.name}`}>
              {channel.name}
            </a>{' '}
            ({channel.language} {channel.views}: {channel.title}){' '}
            <div className='py-3 block sm:hidden group-hover:block'>
              <Button visit onClick={() => window.open(`https://twitch.tv/${channel.name}`)}>
                visit {channel.name}
              </Button>
              <QueueAction id={channel.id} status={'ADDED'} action='add' />
              <QueueAction id={channel.id} status={'ADDED'} action='backlog' backlog={1} />
              <QueueAction id={channel.id} status={'PAUSED'} action='pause' />
              <QueueAction id={channel.id} status={'WONTADD'} action="won't add" />
            </div>
          </li>
        </div>
      );
    });

  return (
    <>
      <h2 style={{ scrollMarginTop: 75 }} id={slugify(tagName)} className='text-xl mt-2 mb-1'>
        {tagName} ({tagChannels.length})
      </h2>

      <ul className='mx-2'>{tagQueue}</ul>
    </>
  );
}

function QueueFilters() {
  const { queueDays, setQueueDays } = useContext(AdminContext);

  return (
    <DropDown label={'Filter'} onChange={(e) => setQueueDays(e.target.value)} defaultValue={2}>
      {FILTER_DAYS.map((days) => (
        <option key={days} value={days}>
          {days} days
        </option>
      ))}
      <option key={0} value={0}>
        all
      </option>
    </DropDown>
  );
}

function QueueSortControl() {
  const { queueFilterField, setQueueFilterField } = useContext(AdminContext);

  return (
    <DropDown
      label={'Sort by'}
      onChange={(e) => setQueueFilterField(e.target.value)}
      defaultValue={'updatedAt'}
    >
      <option key={1} value={'updatedAt'}>
        recent update
      </option>
      <option key={2} value={'createdAt'}>
        first discovery
      </option>
    </DropDown>
  );
}

function QueueTagNavigation() {
  const { queue, setTagQueue } = useContext(AdminContext);

  if (queue?.length === 0) return null;

  return (
    <DropDown label={'Navigate'} onChange={(e) => setTagQueue(`#${e.target.value}`)}>
      <option key={''} value={''}>
        Top
      </option>
      {tagList(queue).map((tag) => (
        <option key={tag} value={slugify(tag)}>
          {tag}
        </option>
      ))}
    </DropDown>
  );
}

function QueueSearch() {
  const { queueSearch, setQueueSearch } = useContext(AdminContext);
  const searchRef = useRef();

  useEffect(() => {
    searchRef.current.focus();
  });

  return (
    <div>
      <label htmlFor={'search'} className='block text-sm font-medium text-gray-700'>
        Search titles
      </label>
      <input
        type='text'
        name='search'
        id='search'
        ref={searchRef}
        onChange={(e) => setQueueSearch(e.target.value)}
        className='h-8 w-48 shadow-sm mt-1 pl-2 pr-10 focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border-gray-300 rounded-md'
      />
    </div>
  );
}

export default function ChannelQueues() {
  const { queue, setQueue, queueDays, tagQueue, queueSearch, queueFilterField } =
    useContext(AdminContext);
  const [queueSearchMatches, setQueueSearchMatches] = useState(null);

  useFetch({
    url: `/api/getQueue?filterField=${queueFilterField}${
      queueDays > 0 ? `&days=${queueDays}&` : ''
    }`,
    setter: (data) => setQueue(data.queue),
    dependencies: [queueDays, queueFilterField],
  });

  useEffect(() => {
    if (tagQueue) router.push(tagQueue, null, { shallow: true });
  }, [tagQueue, queueDays, queueFilterField]);

  useEffect(() => {
    setQueueSearchMatches(
      queueSearch?.length ? filterChannelsSearch(queue, queueSearch).length : null
    );
  }, [queueSearch, queue]);

  return (
    <>
      <h2 className='text-2xl pt-2'>Queues</h2>
      {queue && (
        <div className='px-2 py-1'>
          {queueSearchMatches !== null && <>{queueSearchMatches} of </>}
          {queue.length} items listed
        </div>
      )}

      <div className='p-2 bg-blue-50 dark:bg-gray-800 sticky top-0 flex flex-row gap-2'>
        <QueueSearch />
        <QueueFilters />
        <QueueSortControl />
        <QueueTagNavigation />
      </div>
      {!queue ? 'Loading...' : tagList(queue).map((tag) => <TagQueue key={tag} tagName={tag} />)}
    </>
  );
}
