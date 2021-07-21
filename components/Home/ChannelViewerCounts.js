import pluralize from 'pluralize';
import { useContext } from 'react';

import { HomePageContext } from '../../lib/stores';

const numberFormat = new Intl.NumberFormat().format;

export default function ChannelViewerCounts() {
  const { liveCounts } = useContext(HomePageContext);

  if (!liveCounts) return null;

  const { totalChannelCount, visibleChannelCount, totalViewerCount, visibleViewerCount } =
    liveCounts;
  const showRatio = totalChannelCount !== visibleChannelCount;

  return (
    <div className='px-1 pt-0 pb-1 sm:pb-2 flex flex-wrap sm:pt-3 text-lg'>
      <span className='mr-3 whitespace-nowrap'>
        {showRatio ? `${numberFormat(visibleChannelCount)} / ` : ''}
        {numberFormat(totalChannelCount)} {pluralize('channel', totalChannelCount, false)}
      </span>
      <span className='whitespace-nowrap'>
        {showRatio ? `${numberFormat(visibleViewerCount)} / ` : ''}
        {numberFormat(totalViewerCount)} {pluralize('viewer', totalViewerCount, false)}
      </span>
    </div>
  );
}
