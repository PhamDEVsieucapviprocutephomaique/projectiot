import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "../components/Chartscss.scss";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Chart = ({ isDarkMode = false }) => {
  const [sensorData, setSensorData] = useState({
    labels: [],
    light: [],
    temperature: [],
    humidity: [],
  });

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const res = await fetch("http://192.168.70.133:8000/api/datasensor/");
        const allData = await res.json();

        const latestData = allData
          .sort((a, b) => b.id - a.id)
          .slice(0, 20)
          .reverse();

        setSensorData({
          labels: latestData.map((item) =>
            new Date(item.time).toLocaleTimeString()
          ),
          light: latestData.map((item) => item.light),
          temperature: latestData.map((item) => item.temperature),
          humidity: latestData.map((item) => item.humidity),
        });
      } catch (err) {
        console.error("Error fetching chart data:", err);
      }
    };

    fetchChartData();
    const interval = setInterval(fetchChartData, 5000);
    return () => clearInterval(interval);
  }, []);

  const chartData = {
    labels: sensorData.labels,
    datasets: [
      {
        label: "Cường độ ánh sáng (lux)",
        data: sensorData.light,
        borderColor: "rgb(255, 193, 7)",
        backgroundColor: "rgba(255, 193, 7, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "rgb(255, 152, 0)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: "y",
      },
      {
        label: "Nhiệt độ (°C)",
        data: sensorData.temperature,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.1)",
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: "rgb(255, 99, 132)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: "y1",
      },
      {
        label: "Độ ẩm (%)",
        data: sensorData.humidity,
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.1)",
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: "rgb(54, 162, 235)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: "y1",
      },
    ],
  };
  // cái này là để fix các màu chữ ở trên
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    transitions: {
      active: { animation: { duration: 0 } },
      resize: { animation: { duration: 0 } },
      show: { animation: { duration: 0 } },
      hide: { animation: { duration: 0 } },
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: isDarkMode ? "white" : "#333", // đây mấy cái chữ cường độ ánh sáng
          font: { size: 12, weight: "bold" },
        },
      },
      title: {
        display: true,
        text: "Biểu đồ Ánh sáng, Nhiệt độ & Độ ẩm", // cái này tuong tự
        color: isDarkMode ? "white" : "#333",
        font: { size: 16, weight: "bold" },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || "";
            if (label.includes("Nhiệt độ")) return `${label}: ${context.raw}°C`;
            if (label.includes("Độ ẩm")) return `${label}: ${context.raw}%`;
            return `${label}: ${context.raw}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        position: "left",
        title: {
          display: true,
          text: "Ánh sáng (lux)",
          color: isDarkMode ? "white" : "#ffca05",
        },
        grid: {
          color: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
        },
        ticks: { color: isDarkMode ? "white" : "#ffca05" },
      },
      y1: {
        beginAtZero: true,
        position: "right",
        title: {
          display: true,
          text: "Nhiệt độ / Độ ẩm",
          color: isDarkMode ? "white" : "#ff6384",
        },
        grid: { drawOnChartArea: false },
        ticks: { color: isDarkMode ? "white" : "#36a2eb" },
      },
      x: {
        grid: {
          color: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
        },
        ticks: {
          color: isDarkMode ? "white" : "#666",
          maxTicksLimit: 20,
          font: { size: 10 },
        },
        title: {
          display: true,
          text: "Thời gian",
          color: isDarkMode ? "white" : "#333",
        },
      },
    },
    interaction: { intersect: false, mode: "index" },
  };

  return (
    <div style={{ width: "100%", height: "500px", padding: "10px" }}>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default Chart;
