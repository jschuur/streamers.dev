import dynamic from 'next/dynamic';
import { merge } from 'lodash';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

import Section from '../Layout/Section';

const initialChartOptions = ({ title, group }) => ({
  chart: {
    id: title,
    group,
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
    animations: {
      enabled: false,
    },
  },
  dataLabels: {
    enabled: false,
  },
  title: {
    text: title,
    align: 'left',
    style: {
      fontSize: '20px',
      fontWeight: 'normal',
      fontFamily: 'Inter',
    },
  },
  stroke: {
    width: 1,
  },
});

export function LineChart({ series, title, type, group }) {
  const options = {
    tooltip: {
      x: {
        format: 'dd MMM (H TT)',
      },
    },
    xaxis: {
      type: 'datetime',
      labels: {
        datetimeFormatter: {
          day: 'dd MMM (ddd)',
        },
      },
      tooltip: {
        enabled: false,
      },
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      labels: {
        minWidth: 40,
      },
    },
  };

  return (
    <Section>
      <div className='py-1'>
        <Chart
          options={merge(initialChartOptions({ title, group }), options)}
          series={series}
          type={type}
          height={320}
        />
      </div>
    </Section>
  );
}

export function BarChart({ data, categories, title, group }) {
  const options = {
    xaxis: {
      categories,
    },
  };

  return (
    <Section>
      <div className='py-1'>
        <Chart
          options={merge(initialChartOptions({ title, group }), options)}
          series={[{ name: title, data }]}
          type='bar'
          height={320}
        />
      </div>
    </Section>
  );
}

export function PieChart({ series, labels, title, group }) {
  const options = {
    labels,
  };

  console.log({ options });
  return (
    <Section>
      <div className='py-1'>
        <Chart
          options={merge(initialChartOptions({ title, group }), options)}
          series={series}
          type='pie'
          height={320}
        />
      </div>
    </Section>
  );
}
