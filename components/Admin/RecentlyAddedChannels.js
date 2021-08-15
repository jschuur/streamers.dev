import { differenceInDays } from 'date-fns';
import { sortBy, groupBy } from 'lodash';
import { useTheme } from 'next-themes';
import pluralize from 'pluralize';
import { useQuery } from 'react-query';

import Loader from '../../components/Layout/Loader';
import TwitchProfile from '../../components/Home/TwitchProfile';
import { fetchRecentChannels } from '../../lib/api';

function groupChannelsByDate(channels) {
  return groupBy(sortBy(channels, 'createdAt').reverse(), ({ createdAt }) => {
    const days = differenceInDays(new Date(), new Date(createdAt));

    return days > 0 ? `${pluralize('day', days, true)} ago` : 'Less than 24 hours ago';
  });
}

export default function RecentlyAddedChannels() {
  const { theme } = useTheme();

  const {
    isLoading,
    error,
    data: recentChannels,
  } = useQuery('recentChannels', fetchRecentChannels);

  if (isLoading) return <Loader message='Loading recently added channels...' theme={theme} />;

  return recentChannels?.length ? (
    <div>
      <h2 className='font-header text-lg sm:text-xl'>
        Recently added channels without details ({recentChannels.length})
      </h2>
      {Object.entries(groupChannelsByDate(recentChannels)).map(([header, channels]) => (
        <div key={header}>
          <h3 className='font-header font-light text-sm sm:text-base mt-2'>{header}</h3>
          <div className='flex flex-row flex-wrap px-1 sm:px-2 pb-1'>
            {channels.map((channel) => (
              <div key={channel.name} className='align-top my-1 mx-1 sm:mx-2'>
                <TwitchProfile key={channel.name} channel={channel} avatarSize='large' />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div> No new channels in need of updating found</div>
  );
}
