import React from "react";
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
import { useState, useEffect, useRef } from "react";
import "../components/Chart2scss.scss";

// Đăng ký các components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Chart2 = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Nhiệt độ (°C)",
        data: [],
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.1)",
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: "rgb(255, 99, 132)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        yAxisID: "y",
      },
      {
        label: "Độ ẩm (%)",
        data: [],
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.1)",
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: "rgb(54, 162, 235)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        yAxisID: "y1",
      },
    ],
  });

  const [fullChartData, setFullChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Nhiệt độ (°C)",
        data: [],
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.1)",
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: "rgb(255, 99, 132)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 4,
        yAxisID: "y",
      },
      {
        label: "Độ ẩm (%)",
        data: [],
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.1)",
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: "rgb(54, 162, 235)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 4,
        yAxisID: "y1",
      },
    ],
  });

  const [showModal, setShowModal] = useState(false);
  const chartRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/datasensor/");
        const allData = await res.json();

        // Sắp xếp theo id giảm dần (mới nhất lên đầu)
        const sortedData = allData.sort((a, b) => b.id - a.id);

        // Lấy 20 bản ghi mới nhất cho chart nhỏ
        const latest20Data = sortedData.slice(0, 20);
        // Lấy 100 bản ghi mới nhất cho chart lớn
        const latest100Data = sortedData.slice(0, 50);

        // Đảo ngược để thời gian tăng dần từ trái sang phải
        const reversed20Data = latest20Data.reverse();
        const reversed100Data = latest100Data.reverse();

        // Trích xuất thời gian, nhiệt độ và độ ẩm
        const tempValues20 = reversed20Data.map((item) => item.temperature);
        const humidityValues20 = reversed20Data.map((item) => item.humidity);
        const timeLabels20 = reversed20Data.map((item) =>
          new Date(item.time).toLocaleTimeString()
        );

        const tempValues100 = reversed100Data.map((item) => item.temperature);
        const humidityValues100 = reversed100Data.map((item) => item.humidity);
        const timeLabels100 = reversed100Data.map((item) =>
          new Date(item.time).toLocaleTimeString()
        );

        setChartData((prev) => ({
          ...prev,
          labels: timeLabels20,
          datasets: [
            {
              ...prev.datasets[0],
              data: tempValues20,
            },
            {
              ...prev.datasets[1],
              data: humidityValues20,
            },
          ],
        }));

        setFullChartData((prev) => ({
          ...prev,
          labels: timeLabels100,
          datasets: [
            {
              ...prev.datasets[0],
              data: tempValues100,
            },
            {
              ...prev.datasets[1],
              data: humidityValues100,
            },
          ],
        }));
      } catch (err) {
        console.error("Error fetching chart data:", err);
      }
    };

    fetchChartData();
    const interval = setInterval(fetchChartData, 4000);

    return () => clearInterval(interval);
  }, []);

  // Xử lý click ra ngoài modal để đóng
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        chartRef.current &&
        !chartRef.current.contains(event.target)
      ) {
        setShowModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChartClick = () => {
    setShowModal(true);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#333",
          font: {
            size: 12,
            weight: "bold",
          },
        },
      },
      title: {
        display: true,
        text: "Biểu đồ Nhiệt độ & Độ ẩm",
        color: "#333",
        font: {
          size: 16,
          weight: "bold",
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        callbacks: {
          label: function (context) {
            const datasetLabel = context.dataset.label || "";
            if (datasetLabel.includes("Nhiệt độ")) {
              return `${datasetLabel}: ${context.raw}°C`;
            } else {
              return `${datasetLabel}: ${context.raw}%`;
            }
          },
        },
      },
    },
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: true,
          text: "Nhiệt độ (°C)",
          color: "rgb(255, 99, 132)",
          font: {
            size: 12,
            weight: "bold",
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: "rgb(255, 99, 132)",
          font: {
            size: 10,
          },
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        title: {
          display: true,
          text: "Độ ẩm (%)",
          color: "rgb(54, 162, 235)",
          font: {
            size: 12,
            weight: "bold",
          },
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: "rgb(54, 162, 235)",
          font: {
            size: 10,
          },
        },
      },
      x: {
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: "#666",
          maxTicksLimit: 10,
          font: {
            size: 10,
          },
        },
        title: {
          display: true,
          text: "Thời gian",
          color: "#333",
          font: {
            size: 12,
            weight: "bold",
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  };

  const fullChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#333",
          font: {
            size: 14,
            weight: "bold",
          },
        },
      },
      title: {
        display: true,
        text: "Biểu đồ Nhiệt độ & Độ ẩm (100 giá trị gần nhất)",
        color: "#333",
        font: {
          size: 18,
          weight: "bold",
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        callbacks: {
          label: function (context) {
            const datasetLabel = context.dataset.label || "";
            if (datasetLabel.includes("Nhiệt độ")) {
              return `${datasetLabel}: ${context.raw}°C`;
            } else {
              return `${datasetLabel}: ${context.raw}%`;
            }
          },
        },
      },
    },
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: true,
          text: "Nhiệt độ (°C)",
          color: "rgb(255, 99, 132)",
          font: {
            size: 14,
            weight: "bold",
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: "rgb(255, 99, 132)",
          font: {
            size: 12,
          },
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        title: {
          display: true,
          text: "Độ ẩm (%)",
          color: "rgb(54, 162, 235)",
          font: {
            size: 14,
            weight: "bold",
          },
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: "rgb(54, 162, 235)",
          font: {
            size: 12,
          },
        },
      },
      x: {
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: "#666",
          // Giới hạn chỉ hiển thị khoảng 20 điểm trên trục X
          maxTicksLimit: 20,
          font: {
            size: 8,
          },
          // Tự động bỏ qua một số nhãn để hiển thị rõ ràng
          autoSkip: true,
          maxRotation: 0,
          minRotation: 0,
        },
        title: {
          display: true,
          text: "Thời gian",
          color: "#333",
          font: {
            size: 14,
            weight: "bold",
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  };

  return (
    <>
      <div
        style={{
          width: "100%",
          height: "100%",
          padding: "10px",
          minHeight: "300px",
          cursor: "pointer",
        }}
        onClick={handleChartClick}
        ref={chartRef}
      >
        <Line data={chartData} options={chartOptions} />
      </div>

      {showModal && (
        <div
          className="chart-modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="chart-modal-content"
            ref={modalRef}
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "10px",
              width: "80%",
              height: "80%",
              maxWidth: "1200px",
            }}
          >
            <Line data={fullChartData} options={fullChartOptions} />
          </div>
        </div>
      )}
    </>
  );
};

export default Chart2;
