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

  // Main category groups for visualization
  const mainCategories = [
    "Fiction",
    "Non-Fiction",
    "Children & Young Adult",
    "Special Interest",
    "Religion",
    "Academic",
  ];

  // Mapping of subcategories to main categories
  const categoryMapping = {
    // Fiction
    "General Fiction": "Fiction",
    "Historical Fiction": "Fiction",
    "Mystery & Thriller": "Fiction",
    "Science Fiction": "Fiction",
    "Fantasy": "Fiction",
    "Romance": "Fiction",
    "Horror": "Fiction",
    "Nepali Folk Tales": "Fiction",
    "Nepali Historical Fiction": "Fiction",
    // Non-Fiction
    "Biography & Memoir": "Non-Fiction",
    "Self-Help": "Non-Fiction",
    "History": "Non-Fiction",
    "Business": "Non-Fiction",
    "Health & Wellness": "Non-Fiction",
    "Science & Technology": "Non-Fiction",
    "Religion & Spirituality": "Non-Fiction",
    "Nepali Culture & Heritage": "Non-Fiction",
    "Mountaineering & Adventure": "Non-Fiction",
    // Children & Young Adult
    "Children’s Books": "Children & Young Adult",
    "Young Adult (YA)": "Children & Young Adult",
    "Educational": "Children & Young Adult",
    "Nepali Children’s Stories": "Children & Young Adult",
    // Special Interest
    "Classics": "Special Interest",
    "Poetry": "Special Interest",
    "Graphic Novels": "Special Interest",
    "Cookbooks": "Special Interest",
    "Art & Photography": "Special Interest",
    "Nepali Literature": "Special Interest",
    "Travel & Tourism": "Special Interest",
    // Religion
    "Hinduism": "Religion",
    "Buddhism": "Religion",
    "Islam": "Religion",
    "Christianity": "Religion",
    "Other Religions": "Religion",
    "Nepali Spiritual Traditions": "Religion",
    // Academic
    "Textbooks": "Academic",
    "Reference Books": "Academic",
    "Research & Essays": "Academic",
  };

  // Count books by main category
  const categoryCounts = mainCategories.map((mainCategory) => {
    return books.filter((book) => 
      book.category && categoryMapping[book.category] === mainCategory
    ).length;
  });

  if (isLoading) {
    return <div className="text-center text-gray-500">Loading chart...</div>;
  }

  const data = {
    labels: mainCategories,
    datasets: [
      {
        label: "Books by Category",
        data: categoryCounts,
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)", // Fiction
          "rgba(54, 162, 235, 0.7)", // Non-Fiction
          "rgba(255, 206, 86, 0.7)", // Children & Young Adult
          "rgba(75, 192, 192, 0.7)", // Special Interest
          "rgba(153, 102, 255, 0.7)", // Religion
          "rgba(255, 159, 64, 0.7)", // Academic
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
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
        text: "Books by Category",
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