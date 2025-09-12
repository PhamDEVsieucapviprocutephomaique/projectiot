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

const Chart = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Cường độ ánh sáng (lux)",
        data: [],
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
      },
    ],
  });

  const [fullChartData, setFullChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Cường độ ánh sáng (lux)",
        data: [],
        borderColor: "rgb(255, 193, 7)",
        backgroundColor: "rgba(255, 193, 7, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "rgb(255, 152, 0)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
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
        const latest100Data = sortedData.slice(0, 60);

        // Đảo ngược để thời gian tăng dần từ trái sang phải
        const reversed20Data = latest20Data.reverse();
        const reversed100Data = latest100Data.reverse();

        // Trích xuất giờ (HH:MM:SS) và giá trị ánh sáng
        const lightValues20 = reversed20Data.map((item) => item.light);
        const timeLabels20 = reversed20Data.map((item) =>
          new Date(item.time).toLocaleTimeString()
        );

        const lightValues100 = reversed100Data.map((item) => item.light);
        const timeLabels100 = reversed100Data.map((item) =>
          new Date(item.time).toLocaleTimeString()
        );

        setChartData((prev) => ({
          ...prev,
          labels: timeLabels20,
          datasets: [
            {
              ...prev.datasets[0],
              data: lightValues20,
            },
          ],
        }));

        setFullChartData((prev) => ({
          ...prev,
          labels: timeLabels100,
          datasets: [
            {
              ...prev.datasets[0],
              data: lightValues100,
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
        text: "Biểu đồ ánh sáng",
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
      },
    },
    scales: {
      y: {
        beginAtZero: true,
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
          text: "Cường độ (lux)",
          color: "#333",
          font: {
            size: 12,
            weight: "bold",
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
        text: "Biểu đồ ánh sáng (100 giá trị gần nhất)",
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
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: "#666",
          maxTicksLimit: 10,
          font: {
            size: 12,
          },
        },
        title: {
          display: true,
          text: "Cường độ (lux)",
          color: "#333",
          font: {
            size: 14,
            weight: "bold",
          },
        },
      },
      x: {
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: "#666",
          maxTicksLimit: 20,
          font: {
            size: 8,
          },
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
  };

  return (
    <>
      <div
        className="chart-container"
        onClick={handleChartClick}
        style={{ cursor: "pointer" }}
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

export default Chart;
