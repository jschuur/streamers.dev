import { format, differenceInDays } from 'date-fns';
import { useTheme } from 'next-themes';
import pluralize from 'pluralize';
import { useState } from 'react';
import Loader from 'react-loader-spinner';

import Section from '../Layout/Section';
import VideoThumbnail from '../Home/VideoThumbnail';
import { TwitchLink } from '../../lib/util';

import useFetch from '../../hooks/useFetch';

import { NEW_STREAMER_AGE_DAYS } from '../../lib/config';

const numberFormat = new Intl.NumberFormat().format;

function PotentialChannelList() {
  const [channels, setChannels] = useState(null);
  const { theme } = useTheme();
  const now = new Date();

  useFetch({
    url: '/api/getPotentialChannels',
    setter: (data) => setChannels(data.channels),
  });

  if (!channels)
    return (
      <div className='py-2 flex justify-center'>
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
          channels.map(({ name, title, views, viewers, language, created_at }) => (
            <div key={name} className='p-2'>
              <TwitchLink username={name}>
                <VideoThumbnail username={name} width={444} height={250} />
              </TwitchLink>
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
          ))
        ) : (
          <i>No channels found.</i>
        )}
      </div>
    </>
  );
}

export default function PotentialChannels() {
  return (
    <Section className='p-2'>
      <PotentialChannelList />
    </Section>
  );
}
