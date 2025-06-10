import React from "react";
import { Doughnut } from "react-chartjs-2";
import { useFetchAllBooksQuery } from "../../redux/features/Books/BookApi";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const StudyTypeChart = () => {
  const { data: books = [], isLoading } = useFetchAllBooksQuery();

  const genres = ["Islam", "Philosophy", "Novels", "Science", "Self Help"];
  const genreCounts = genres.map(
    (genre) =>
      books.filter(
        (book) => book.genre.toLowerCase() === genre.toLowerCase()
      ).length
  );

  if (isLoading) {
    return <div className="text-center text-gray-500">Loading chart...</div>;
  }

  const data = {
    labels: genres,
    datasets: [
      {
        label: "Books by Genre",
        data: genreCounts,
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
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
        text: "Books by Genre",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed !== null) {
              label += context.parsed + " books";
            }
            return label;
          },
        },
      },
    },
  };

  return <Doughnut data={data} options={options} />;
};

export default StudyTypeChart;
