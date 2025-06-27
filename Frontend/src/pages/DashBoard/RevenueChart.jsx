import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import PropTypes from 'prop-types';

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const RevenueChart = ({ monthlySales }) => {
  const labels = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const salesData = labels.map((_, index) => {
    const monthData = monthlySales.find((item) => item.month === index + 1);
    return monthData ? monthData.totalSales : 0;
  });

  const ordersData = labels.map((_, index) => {
    const monthData = monthlySales.find((item) => item.month === index + 1);
    return monthData ? monthData.totalOrders : 0;
  });

  const data = {
    labels,
    datasets: [
      {
        label: "Monthly Sales (NRS)",
        data: salesData,
        backgroundColor: "rgba(34, 197, 94, 0.7)",
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 1,
      },
      {
        label: "Monthly Orders",
        data: ordersData,
        backgroundColor: "rgba(54, 162, 235, 0.7)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Monthly Sales and Orders",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += context.dataset.label.includes("Sales")
                ? `$${context.parsed.y}`
                : context.parsed.y;
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Amount",
        },
      },
      x: {
        title: {
          display: true,
          text: "Month",
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
};

RevenueChart.propTypes = {
  monthlySales: PropTypes.array.isRequired,
};

export default RevenueChart;
