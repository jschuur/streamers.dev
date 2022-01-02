import { sum, sumBy } from 'lodash';
import { WorldMap } from 'react-svg-worldmap';

import Section, { SectionHeader, SectionText, SectionBlock } from '../Layout/Section';
import { LineChart, BarChart, PieChart } from '../Stats/Chart';

import { formatPercentage, formatNumber } from '../../lib/util';

const addValueToLegend = (seriesName, opts) =>
  `${seriesName} (${opts.w.globals.series[opts.seriesIndex]})`;

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
      <SectionHeader id={'streamsByDay'}>{`Streams by Day (${formatNumber(
        sumBy(data, 'y')
      )})`}</SectionHeader>

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
          data={data}
        />
      </SectionBlock>

      <SectionText>Currently counts coding and non coding streams.</SectionText>
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
  return (
    <Section>
      <SectionHeader id={'map'}>Total Channels Tracked by Location</SectionHeader>

      <SectionBlock>
        <WorldMap
          color='#6441a5'
          valueSuffix='channels'
          size='responsive'
          data={countries}
          richInteraction
        />
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
        <BarChart categories={categories} data={data} />
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
