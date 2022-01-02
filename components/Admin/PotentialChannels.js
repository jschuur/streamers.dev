import { RefreshIcon, DotsVerticalIcon } from '@heroicons/react/solid';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

import Section, { SectionBlock } from '../Layout/Section';
import Loader from '../Layout/Loader';
import VideoThumbnail from '../Home/VideoThumbnail';
import TwitchLink from '../Home/TwitchLink';
import PopupMenu from '../PopupMenu';

import { formatDurationShortNow } from '../../lib/util';
import { usePotentialChannels } from '../../lib/api';

const numberFormat = new Intl.NumberFormat().format;

// Creates the popup menu options for a channel
function buildChannelActions({ channel, setChannels }) {
  const actions = [
    ['Add', 'Adding'],
    ['Backlog', 'Backlogging'],
    ['Game Dev', (name) => `Backlogging ${name} (gamedev)...`],
    ['Pause', 'Pausing'],
    ['Hide', 'Hiding'],
  ];

  return actions.map(([label, message]) => ({
    label,
    onClick: () => {
      callToast({
        message:
          typeof message === 'function' ? message(channel.name) : `${message} ${channel.name}...`,
        action: label,
        channel,
        setChannels,
      });
    },
  }));
}

async function actionRequest({ uri, params }) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    };

    fetch(uri, options)
      .then((res) => res.json())
      .then(({ message, error }) => {
        if (error) reject(error);
        resolve(message);
      });
  });
}

// Handle the action associated with a channel when selected
async function processChannelAction({ action, channel }) {
  const actions = {
    Add: (channel) =>
      actionRequest({ uri: '/api/addChannel', params: { twitchId: channel.twitchId } }),
    Backlog: (channel) =>
      actionRequest({ uri: '/api/addChannel', params: { twitchId: channel.twitchId, backlog: 1 } }),
    'Game Dev': (channel) =>
      actionRequest({
        uri: '/api/updateQueue',
        params: { twitchId: channel.twitchId, status: 'GAMEDEV' },
      }),
    Pause: (channel) =>
      actionRequest({
        uri: '/api/updateQueue',
        params: { twitchId: channel.twitchId, status: 'PAUSED' },
      }),
    Hide: (channel) =>
      actionRequest({
        uri: '/api/updateQueue',
        params: { twitchId: channel.twitchId, status: 'HIDDEN' },
      }),
  };

  return actions[action]
    ? actions[action](channel)
    : new Promise((resolve, reject) => reject(`Unknown action '${action}'`));
}

// Start a react-hot-toast notification with progress animation and promise based action call
function callToast({ action, message, channel, setChannels }) {
  toast.promise(
    processChannelAction({ action, channel }),
    {
      loading: message,
      success: (message) => {
        setChannels((channels) => channels.filter(({ name }) => channel.name !== name));

        return `Success: ${message}`;
      },
      error: (message) => `Error: ${message}`,
    },
    {
      duration: 3000,
      className: 'border border-gray-400',
      style: {
        minWidth: '400px',
      },
    }
  );
}

function PotentialChannelCard({ channel, setChannels }) {
  const { name, title, views, viewers, language, created_at } = channel;

  const channelAge = formatDurationShortNow({
    start: new Date(created_at),
    format: ['years', 'months', 'days'],
    precision: 2,
  });

  return (
    <div key={name} className='p-2 group'>
      <div className='relative'>
        <TwitchLink username={name}>
          <VideoThumbnail username={name} width={444} height={250} />
        </TwitchLink>
        <div className='absolute hidden group-hover:block top-0 right-0'>
          <PopupMenu actions={buildChannelActions({ channel, setChannels })}>
            <DotsVerticalIcon className='h-5 w-5 bg-black text-white my-1' aria-hidden='true' />
          </PopupMenu>
        </div>
        <div className='absolute font-sans text-sm text-white bg-black px-1 hidden group-hover:block bottom-0 right-0'>
          {numberFormat(viewers)}&middot;{numberFormat(views)}&middot;{language}&middot;
          {channelAge}
        </div>
      </div>
      <div className='pt-1 text-base md:text-lg'>{name}</div>
      <div className='font-light text-xs sm:text-sm text-gray-900 dark:text-gray-300 break-all md:break-normal'>
        {title}
      </div>
    </div>
  );
}

function PotentialChannelList({ refetch, isRefetching, initialChannels }) {
  const [channels, setChannels] = useState(initialChannels);

  return (
    <>
      <h2 className='font-header text-lg sm:text-xl mb-2 flex'>
        <div className='flex-grow'>
          Currently live, potential channels ({channels?.length || 0})
        </div>
        <div onClick={refetch}>
          <RefreshIcon
            className={`${
              isRefetching && 'animate-spin transform rotate-180'
            } h-5 w-5 mt-2 mr-2 cursor-pointer`}
          />
        </div>
      </h2>

      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4'>
        {channels?.length ? (
          channels.map((channel) => (
            <PotentialChannelCard key={channel.name} channel={channel} setChannels={setChannels} />
          ))
        ) : (
          <i>None currently found</i>
        )}
      </div>
    </>
  );
}

export default function PotentialChannels() {
  const { theme } = useTheme();

  const { data, isLoading, refetch, isRefetching } = usePotentialChannels();

  if (isLoading)
    return (
      <Section>
        <Loader message='Finding potential live coding channels...' theme={theme} />
      </Section>
    );

  if (!data || !data.channels) return <Section>Error: No live channels data found</Section>;

  return (
    <Section>
      <Toaster />
      <SectionBlock>
        <PotentialChannelList
          initialChannels={data.channels}
          refetch={refetch}
          isRefetching={isRefetching}
        />
      </SectionBlock>
    </Section>
  );
}
