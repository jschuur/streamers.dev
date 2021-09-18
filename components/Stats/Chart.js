import dynamic from 'next/dynamic';
import { merge } from 'lodash';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

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

export function LineChart({ series, title, type, group, options: additionalOptions = {} }) {
  const options = merge(initialChartOptions({ title, group }), additionalOptions, {
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
  });

  return (
    <div className='py-1'>
      <Chart options={options} series={series} type={type} height={320} />
    </div>
  );
}

export function BarChart({ data, categories, title, group, options: additionalOptions }) {
  const options = merge(initialChartOptions({ title, group }), additionalOptions, {
    xaxis: {
      categories,
    },
  });

  return (
    <div className='py-1'>
      <Chart options={options} series={[{ name: title, data }]} type='bar' height={320} />
    </div>
  );
}

export function PieChart({ series, labels, title, group, options: additionalOptions }) {
  const options = merge(initialChartOptions({ title, group }), additionalOptions, {
    labels,
  });

  return (
    <div className='py-1'>
      <Chart options={options} series={series} type='pie' height={480} />
    </div>
  );
}
