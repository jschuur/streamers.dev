import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

import Section from '../Layout/Section';

export default function BarChart({ series, title, type, group }) {
  const options = {
    chart: {
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      animations: {
        enabled: false,
      },
      id: title,
      group,
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      x: {
        format: 'dd MMM (H TT)',
      },
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
        <Chart options={options} series={series} type={type} height={320} />
      </div>
    </Section>
  );
}
