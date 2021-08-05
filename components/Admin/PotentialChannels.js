import { format, differenceInDays } from 'date-fns';
import { useTheme } from 'next-themes';
import pluralize from 'pluralize';
import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Loader from 'react-loader-spinner';

import Section from '../Layout/Section';
import VideoThumbnail from '../Home/VideoThumbnail';
import PopupMenu from '../PopupMenu';
import { TwitchLink } from '../../lib/util';

import useFetch from '../../hooks/useFetch';

import { NEW_STREAMER_AGE_DAYS } from '../../lib/config';
import { labeledStatement } from '@babel/types';

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
  const now = new Date();

  return (
    <div key={name} className='p-2 group'>
      <div className='relative'>
        <TwitchLink username={name}>
          <VideoThumbnail username={name} width={444} height={250} />
        </TwitchLink>
        <div className='absolute hidden group-hover:block top-0 right-0'>
          <PopupMenu actions={buildChannelActions({ channel, setChannels })} />
        </div>
      </div>
      <div className='pt-1 text-base md:text-lg'>{name}</div>
      <div className='font-light text-xs sm:text-sm text-gray-900 dark:text-gray-300 break-all md:break-normal'>
        {title}
      </div>
      <div className='pt-1 text-tiny sm:text-xs text-gray-400'>
        {numberFormat(viewers)} {pluralize('viewers', viewers)}, {numberFormat(views)}{' '}
        {pluralize('view', views)}, {language},{' '}
        <span
          className={
            differenceInDays(now, new Date(created_at)) <= NEW_STREAMER_AGE_DAYS
              ? 'text-green-500'
              : 'text-gray-400'
          }
        >
          {format(new Date(created_at), 'yyyy-MM-dd')}
        </span>
      </div>
    </div>
  );
}

function PotentialChannelList() {
  const [channels, setChannels] = useState(null);
  const { theme } = useTheme();

  useFetch({
    url: '/api/getPotentialChannels',
    setter: (data) => setChannels(data.channels),
  });

  if (!channels)
    return (
      <div className='flex flex-col place-items-center'>
        <div className='pb-2'>Finding potential live coding channels...</div>
        <Loader
          type='Bars'
          color={theme === 'dark' ? '#ffffff' : '#000000'}
          height={24}
          width={24}
        />
      </div>
    );

  return (
    <>
      <h2 className='font-header text-lg sm:text-xl mb-2'>
        Currently live, potential channels ({channels?.length || 0})
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
  return (
    <Section className='p-2'>
      <Toaster />
      <PotentialChannelList />
    </Section>
  );
}
