import { format } from 'date-fns';
import { uniq, map, sortBy } from 'lodash';
import router, { useRouter } from 'next/router';
import { getSession } from 'next-auth/client';
import pluralize from 'pluralize';
import { useEffect, useContext, useState, useMemo } from 'react';
import { useToasts } from 'react-toast-notifications';
import { XCircleIcon } from '@heroicons/react/solid';

import Button from '../Button';
import DropDown from '../DropDown';
import Section from '../Layout/Section';
import Badge from '../Badge';

import useFetch from '../../hooks/useFetch';

import { AdminContext } from '../../lib/stores';
import { showToast } from '../../lib/util';

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

function TagQueue({ tagName, navLinks }) {
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
          <h3 key={currDate} className='text-lg text-header mt-2'>
            <a
              className='text-black visited:text-black dark:text-white dark:visited:text-white'
              href={`#${slugify(tagName)}`}
            >
              {currDate}
            </a>
          </h3>
        );
      }

      return (
        <div key={channel.id}>
          {dateHeader}
          <li className='group' key={channel.id}>
            <a target='_blank' href={`https://twitch.tv/${channel.name}`}>
              {channel.name}
            </a>{' '}
            ({channel.language} {channel.views}: {channel.title}){' '}
            <div className='py-3 hidden group-hover:block'>
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
    <Section className='p-2'>
      <div className='group'>
        <h2 style={{ scrollMarginTop: 75 }} id={slugify(tagName)} className='text-xl font-header'>
          {tagName} ({tagChannels.length})
        </h2>
        <div className='py-3 hidden group-hover:block'>{navLinks}</div>
      </div>
      <ul className='mx-2'>{tagQueue}</ul>
    </Section>
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

function QueueNavLinks({ queue, home }) {
  const router = useRouter();

  return (
    <div>
      {!home && (
        <Badge color='green' onClick={() => router.push('#')}>
          Home
        </Badge>
      )}
      {tagList(queue).map((tag) => (
        <Badge key={tag} color='blue' onClick={() => router.push(`#${slugify(tag)}`)}>
          {tag} ({queue.filter((el) => el.tag === tag).length})
        </Badge>
      ))}
    </div>
  );
}

function QueueSearch() {
  const { queueSearch, setQueueSearch } = useContext(AdminContext);

  return (
    <div>
      <label htmlFor={'search'} className='block text-sm font-medium text-gray-700'>
        Search titles
      </label>
      <input
        type='text'
        name='search'
        id='search'
        onChange={(e) => setQueueSearch(e.target.value)}
        className='h-8 w-48 bg-gray-100 border border-gray-200 shadow-sm mt-1 p-2 focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm rounded-md'
      />
    </div>
  );
}

export default function ChannelQueues() {
  const { queue, setQueue, queueDays, tagQueue, queueSearch, queueFilterField } =
    useContext(AdminContext);
  const [queueSearchMatches, setQueueSearchMatches] = useState(null);
  const navLinks = useMemo(() => <QueueNavLinks queue={queue} />, [queue]);

  useFetch({
    url: `/api/getQueue?filterField=${queueFilterField}${
      queueDays > 0 ? `&days=${queueDays}&` : ''
    }`,
    setter: (data) => setQueue(data.queue),
    dependencies: [queueDays, queueFilterField],
  });

  useEffect(() => {
    setQueueSearchMatches(
      queueSearch?.length ? filterChannelsSearch(queue, queueSearch).length : null
    );
  }, [queueSearch, queue]);

  return (
    <>
      <Section className='p-2'>
        <h2 className='text-xl font-header'>Queues</h2>
        {queue && (
          <>
            <div className='px-2 py-1'>
              {queueSearchMatches !== null && <>{queueSearchMatches} of </>}
              {queue.length} {pluralize('match', queue.length, false)}
            </div>
            <QueueNavLinks queue={queue} home />
          </>
        )}

        <div className='p-2 flex flex-row gap-2'>
          <QueueSearch />
          <QueueFilters />
          <QueueSortControl />
        </div>
      </Section>
      {!queue
        ? 'Loading...'
        : tagList(queue).map((tag) => <TagQueue key={tag} tagName={tag} navLinks={navLinks} />)}
    </>
  );
}
