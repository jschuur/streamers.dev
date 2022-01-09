import { sum, sumBy } from 'lodash';
import { useTheme } from 'next-themes';
import pluralize from 'pluralize';
import { WorldMap } from 'react-svg-worldmap';
import { useRef, useEffect, useState } from 'react';

import Section, { SectionHeader, SectionText, SectionBlock } from '../Layout/Section';
import { LineChart, BarChart, PieChart } from '../Stats/Chart';

import useRefWidth from '../../hooks/useRefWidth';
import { formatPercentage, formatNumber } from '../../lib/util';

import { STATS_RECENT_STREAMS_DAYS } from '../../lib/config';

const addValueToLegend = (seriesName, opts) =>
  `${seriesName} (${opts.w.globals.series[opts.seriesIndex]})`;

const addValueAndPercentageToLegend = (seriesName, opts) =>
  `${seriesName}:  ${formatNumber(opts.w.globals.series[opts.seriesIndex])} (${formatPercentage(
    opts.w.globals.series[opts.seriesIndex] / sum(opts.w.globals.series)
  )})`;

export function ViewersChart({ data }) {
  return (
    <Section>
      <SectionHeader id={'viewers'}>Concurrent Live Viewers</SectionHeader>

      <SectionBlock>
        <LineChart type='area' group='viewer_channels' series={data} />
      </SectionBlock>
    </Section>
  );
}

export function ChannelsChart({ data }) {
  return (
    <Section>
      <SectionHeader id={'channels'}>Concurrent Live Channels</SectionHeader>

      <SectionBlock>
        <LineChart type='area' group='viewer_channels' series={data} />
      </SectionBlock>
    </Section>
  );
}

export function StreamsChart({ data }) {
  return (
    <Section>
      <SectionHeader id={'streamsByDay'}>{`Streams by Day`}</SectionHeader>

      <SectionBlock>
        <BarChart
          options={{
            xaxis: {
              type: 'datetime',
            },
            // Last bar gets a different color, because it's the current day
            colors: [
              ({ dataPointIndex }) => (dataPointIndex === data.length - 1 ? '#FF4460' : '#008FFB'),
            ],
          }}
          name={'Streams'}
          data={data}
        />
      </SectionBlock>

      <SectionText>
        {formatNumber(sumBy(data, 'y'), 'stream')} in the last{' '}
        {pluralize('day', STATS_RECENT_STREAMS_DAYS, true)}. Currently counts coding and non coding
        streams.
      </SectionText>
    </Section>
  );
}

export function LanguagesCharts({ data: { languagesByStreamsSeries, languagesByViewersSeries } }) {
  return (
    <Section>
      <div className='grid grid-cols-1 md:grid-cols-2'>
        <div>
          <SectionHeader id={'langByLiveStreams'}>
            {`Languages by Live Streams (${formatNumber(sum(languagesByStreamsSeries.data))})`}
          </SectionHeader>

          <SectionBlock>
            <PieChart
              section={false}
              options={{ legend: { position: 'bottom', formatter: addValueToLegend } }}
              labels={languagesByStreamsSeries.labels}
              series={languagesByStreamsSeries.data}
            />
          </SectionBlock>
        </div>
        <div>
          <SectionHeader id={'langByLiveViewers'}>
            {`Languages by Live Viewers (${formatNumber(sum(languagesByViewersSeries.data))})`}
          </SectionHeader>

          <SectionBlock>
            <PieChart
              section={false}
              options={{ legend: { position: 'bottom', formatter: addValueToLegend } }}
              labels={languagesByViewersSeries.labels}
              series={languagesByViewersSeries.data}
            />
          </SectionBlock>
        </div>
      </div>

      <SectionText>
        For currently live channels, marked as coding and based on the Twitch{' '}
        <a href='https://help.twitch.tv/s/article/languages-on-twitch?language=en_US#streamlang'>
          language
        </a>{' '}
        of the streamer being watched, not Twitch language tags or viewer language preferences.
      </SectionText>
    </Section>
  );
}

export function AccountTypeCharts({ data: { channelTypeSeries, broadcasterTypeSeries } }) {
  return (
    <Section>
      <div className='grid grid-cols-1 md:grid-cols-2'>
        <div>
          <SectionHeader id={'broadcasterType'}>{`Twitch Broadcaster Types`}</SectionHeader>

          <SectionBlock>
            <PieChart
              section={false}
              options={{ legend: { position: 'bottom', formatter: addValueAndPercentageToLegend } }}
              labels={broadcasterTypeSeries.labels}
              series={broadcasterTypeSeries.data}
            />
          </SectionBlock>
        </div>
        <div>
          <SectionHeader id={'channelType'}>{`Channel Types`}</SectionHeader>

          <SectionBlock>
            <PieChart
              section={false}
              options={{ legend: { position: 'bottom', formatter: addValueAndPercentageToLegend } }}
              labels={channelTypeSeries.labels}
              series={channelTypeSeries.data}
            />
          </SectionBlock>
        </div>
      </div>

      <SectionText>
        'Standard' channels are any that are not Twitch Partner or Affiliate. Channel types is based
        on manual curation.
      </SectionText>
    </Section>
  );
}

export function OriginsCharts({ data: { countriesByStreamsSeries, countriesByViewersSeries } }) {
  return (
    <Section>
      <div className='grid grid-cols-1 md:grid-cols-2'>
        <div>
          <SectionHeader id={'originByLiveStreams'}>
            {`Channel Origin by Live Streams (${formatNumber(sum(countriesByStreamsSeries.data))})`}
          </SectionHeader>

          <SectionBlock>
            <PieChart
              options={{ legend: { position: 'bottom', formatter: addValueToLegend } }}
              labels={countriesByStreamsSeries.labels}
              series={countriesByStreamsSeries.data}
            />
          </SectionBlock>
        </div>
        <div>
          <SectionHeader id={'originByLivewViewers'}>
            {`Channel Origin by Live Viewers (${formatNumber(sum(countriesByViewersSeries.data))})`}
          </SectionHeader>

          <SectionBlock>
            <PieChart
              options={{ legend: { position: 'bottom', formatter: addValueToLegend } }}
              labels={countriesByViewersSeries.labels}
              series={countriesByViewersSeries.data}
            />
          </SectionBlock>
        </div>
      </div>

      <SectionText>
        For currently live channels, marked as coding and based on both the current location and
        nationality of the streamer (not their viewers). Locations are manually curated, using
        public information from channel and social media profiles. Totals will be greater than
        channel/viewer counts if streamers live in a different location than their nationality.
      </SectionText>
    </Section>
  );
}

export function ChannelMap({ data: { countries, channelsWithCountriesCount, totalChannels } }) {
  const ref = useRef();
  const { theme } = useTheme();
  const { width } = useRefWidth(ref);
  const [mapColors, setMapColors] = useState();

  useEffect(() => {
    setMapColors({
      color: theme === 'dark' ? 'white' : '#6441a5',
      backgroundColor: theme === 'dark' ? '#4B5563' : 'white',
    });
  }, [theme]);

  return (
    <Section>
      <SectionHeader id={'map'}>Total Channels Tracked by Location</SectionHeader>

      <SectionBlock>
        <div ref={ref}>
          {width && (
            <WorldMap
              color={mapColors.color}
              backgroundColor={mapColors.backgroundColor}
              valueSuffix='channels'
              size={width}
              data={countries}
              richInteraction
            />
          )}
        </div>
      </SectionBlock>

      <SectionText>
        {countries.length} countries and regions, based on{' '}
        {formatNumber(channelsWithCountriesCount)} channels (
        {formatPercentage(channelsWithCountriesCount / totalChannels)} of total tracked) with an
        identified location.
      </SectionText>
    </Section>
  );
}

export function LastStreamAgeChart({ data: { categories, data } }) {
  return (
    <Section>
      <SectionHeader id={'channelsByLastStreamed'}>
        Channels by Time Since Last Streamed
      </SectionHeader>

      <SectionBlock>
        <BarChart name={'Channels'} categories={categories} data={data} />
      </SectionBlock>
    </Section>
  );
}

export function TotalChannelsChart({ data }) {
  return (
    <Section>
      <SectionHeader id={'totalTrackedChannels'}>Total Tracked Channels</SectionHeader>

      <SectionBlock>
        <LineChart type='line' series={data} />
      </SectionBlock>
    </Section>
  );
}
