import { ChartOptions } from 'chart.js/auto';
export const priceTypeList = [
  {
    type: "Close Prices",
    value: "c",
  },
  {
    type: "High Prices",
    value: "h",
  },
  {
    type: "Low Prices",
    value: "l",
  },
  {
    type: "Open Prices",
    value: "o",
  },
];

export const chartOptions: ChartOptions<"line"> = {
  maintainAspectRatio: true,
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      grid: {
        color: "rgba(0, 0, 0, 0.1)",
      },
      ticks: {
        color: "rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: {
    legend: {
      display: true,
      position: "bottom",
      labels: {
        color: "rgba(0, 0, 0, 0.5)",
      },
    },
  },
};
