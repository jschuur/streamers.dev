import { WorldMap } from 'react-svg-worldmap';

import { formatPercentage } from '../../lib/util';

export default function ChannelMap({ data }) {
  return (
    <div className='px-4 py-2'>
      <h2 className='header text-xl'>Total Channels Tracked by Country</h2>
      <WorldMap color='#6441a5' valueSuffix='channels' size='responsive' data={data.countries} />
      <p>
        Based on {data.channelsWithCountriesCount} channels (
        {formatPercentage(data.channelsWithCountriesCount / data.totalChannels)} of total tracked)
        with an identified country.
      </p>
    </div>
  );
}
