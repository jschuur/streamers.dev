import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function BarChart({ data, title, type }) {
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
        fontFamily: 'Raleway',
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
  };

  const series = [
    {
      name: 'viewers',
      data,
    },
  ];

  return <Chart options={options} series={series} type={type} height={320} />;
}
