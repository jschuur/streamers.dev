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
        format: 'dd MMM (H TT GMT)',
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

  return <Chart options={options} series={series} type={type} height={320} />;
}

export function BarChart({ data, categories, name, title, group, options: additionalOptions }) {
  const options = merge(
    initialChartOptions({ title, group }),
    additionalOptions,
    categories
      ? {
          xaxis: {
            categories,
          },
        }
      : {}
  );

  // TODO: handle more than one dataset
  return <Chart options={options} series={[{ name, data }]} type='bar' height={320} />;
}

export function PieChart({ series, labels, title, group, options: additionalOptions }) {
  const options = merge(initialChartOptions({ title, group }), additionalOptions, {
    labels,
  });

  return <Chart options={options} series={series} type='pie' height={480} />;
}
