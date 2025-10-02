import "../components/Homescss.scss";
import React, { useState, useEffect } from "react";
import Chart from "./Chart";
import "./darkmode.scss"; // Import file darkmode
// thong bao
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Home = () => {
  const [deviceStates, setDeviceStates] = useState({
    led: false,
    fan: false,
    airConditioner: false,
  });
  const [loadingled, setloadingled] = useState(false);
  const [loadingfan, setloadingfan] = useState(false);
  const [loadingair, setloadingair] = useState(false);
  const [loadingText, setLoadingText] = useState({
    led: "",
    fan: "",
    airConditioner: "",
  });

  //darkmode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  // Thêm class dark-mode vào body khi toggle và lưu vào localStorage
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    // Lưu vào localStorage
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);
  //darkmode

  //

  const handleDeviceToggle = async (device) => {
    const newState = !deviceStates[device];
    // setDeviceStates((prev) => ({ ...prev, [device]: newState }));
    setLoadingText((prev) => ({ ...prev, [device]: "loading..." }));
    try {
      const deviceMap = {
        led: "device1",
        fan: "device2",
        airConditioner: "device3",
      };
      const payload = { [deviceMap[device]]: newState ? "on" : "off" };
      await fetch("http://localhost:8000/api/device/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Gọi API liên tục cho đến khi giá trị khác
      const apiUrl = `http://127.0.0.1:8000/api/historyaction/laster/${deviceMap[device]}`;
      let isValueChanged = false;

      while (!isValueChanged) {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const apiValue = data[deviceMap[device]];

        // Kiểm tra nếu giá trị từ API khác với giá trị hiện tại

        if (apiValue !== (!newState ? "on" : "off")) {
          setDeviceStates((prev) => ({
            ...prev,
            [device]: apiValue === "on", // Chuyển "on"/"off" thành boolean
          }));
          isValueChanged = true;
          setLoadingText((prev) => ({ ...prev, [device]: "" }));

          console.log(apiValue);
          if (device === "led" && apiValue === "on") {
            setloadingled(true);
          }
          if (device === "led" && apiValue === "off") {
            console.log("vo duoc roi nhe");
            setloadingled(false);
          }
          if (device === "fan" && apiValue === "on") {
            setloadingfan(true);
          }
          if (device === "fan" && apiValue === "off") {
            setloadingfan(false);
          }
          if (device === "airConditioner" && apiValue === "on") {
            setloadingair(true);
          }
          if (device === "airConditioner" && apiValue === "off") {
            setloadingair(false);
          }

          console.log(
            "pub thanh cong va da cap nhat state moi",
            deviceStates,
            loadingled,
            loadingfan,
            loadingair
          );
        } else {
          console.log("dang gui lai api");
          // Chờ 1 giây trước khi gọi lại
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      }
    } catch (error) {
      setDeviceStates((prev) => ({ ...prev, [device]: !newState }));
      // Ẩn loading text khi lỗi
      setLoadingText((prev) => ({ ...prev, [device]: "" }));
    }
  };
  // xu ly doi loading xong moi bat tat nut

  // Thêm useEffect này để fetch device states từ API

  const [temp, setTemp] = useState(null);
  const [hump, setHump] = useState(null);
  const [light, setLight] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("http://localhost:8000/api/datasensor/latest/");
        const data = await res.json();
        setTemp(data.temperature);
        setHump(data.humidity);
        setLight(data.light);
      } catch (err) {
        console.error("Error fetching:", err);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);
  //thong bao
  const [lightAlertActive, setLightAlertActive] = useState(false);

  // Thêm useEffect cảnh báo ánh sáng (đặt sau useEffect fetch data)
  useEffect(() => {
    let intervalId;

    if (light !== null && light > 50) {
      setLightAlertActive(true);

      // Gửi cảnh báo ngay lập tức
      toast.warning(`⚠️ Ánh sáng quá cao: ${light} lux`, {
        position: "top-right",
        autoClose: false, // Không tự đóng
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        toastId: "light-alert", // ID cố định để không tạo nhiều toast
      });

      // Cứ 3 giây gửi lại cảnh báo nếu ánh sáng vẫn cao
      intervalId = setInterval(() => {
        if (light > 50) {
          toast.warning(`⚠️ Ánh sáng quá cao: ${light} lux`, {
            position: "top-right",
            autoClose: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            toastId: "light-alert",
          });
        }
      }, 3000);
    } else {
      setLightAlertActive(false);
      // Xóa cảnh báo khi ánh sáng trở lại bình thường
      toast.dismiss("light-alert");
    }

    // Cleanup interval khi component unmount hoặc light thay đổi
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [light]); // Chạy khi light thay đổi

  //thong bao
  // Hàm màu gradient theo giá trị
  const getTemperatureColor = (value) => {
    if (value == null) return "#aaa";
    const min = 15; // nhiệt độ thấp nhất
    const max = 40; // nhiệt độ cao nhất
    const ratio = Math.min(Math.max((value - min) / (max - min), 0), 1);
    return `rgb(${Math.floor(255 * ratio)}, 0, 0)`; // đỏ càng mạnh
  };

  const getHumidityColor = (value) => {
    if (value == null) return "#aaa";
    const min = 0;
    const max = 100;
    const ratio = Math.min(Math.max(value / max, 0), 1);
    return `rgb(0, ${Math.floor(150 + 105 * ratio)}, 255)`; // xanh da trời đậm hơn
  };

  const getLightColor = (value) => {
    if (value == null) return "#aaa";
    const min = 0;
    const max = 1000;
    const ratio = Math.min(Math.max(value / max, 0), 1);
    return `rgb(${Math.floor(255)}, ${Math.floor(255 * ratio)}, 0)`; // vàng càng mạnh
  };

  return (
    <div className="environment-monitor">
      <ToastContainer />
      <div className="header-container">
        <div className="date-display">
          {new Date().toLocaleDateString("vi-VN")}
        </div>
        <div className="pwd-text">
          pwd-phamminhduc
          <button
            className="dark-mode-toggle"
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            {isDarkMode ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>
      </div>
      <header className="monitor-header">
        <div className="header-item device-header">Device</div>
        <div
          className="header-item light-header"
          style={{ color: getLightColor(light) }}
        >
          Light : {light} lux
        </div>
        <div
          className="header-item humidity-header"
          style={{ color: getHumidityColor(hump) }}
        >
          Humidity : {hump} %
        </div>
        <div
          className="header-item temperature-header"
          style={{ color: getTemperatureColor(temp) }}
        >
          Temperature : {temp} ºC
        </div>
      </header>

      <div className="monitor-content">
        <div className="content-column device-column">
          <div className="column-content">
            <div className="button-container">
              {/* Đèn */}
              <div className="toggle-item">
                <span className="toggle-label">Đèn</span>
                <button
                  className={`toggle-btn ${
                    loadingled && deviceStates.led ? "active" : ""
                  }`}
                  onClick={() => handleDeviceToggle("led")}
                >
                  {/* <span className="toggle-text">
                    {loadingled && deviceStates.led ? "ON" : "OFF"}
                  </span> */}
                  <div className="toggle-slider"></div>
                </button>
                <span
                  className={`device-icon led-icon ${
                    loadingled && deviceStates.led ? "on" : "off"
                  }`}
                >
                  💡
                </span>
                {loadingText.led && (
                  <span className="loading-text">{loadingText.led}</span>
                )}
              </div>

              {/* Quạt 3 cánh */}
              <div className="toggle-item">
                <span className="toggle-label">Quạt</span>
                <button
                  className={`toggle-btn ${
                    deviceStates.fan && loadingfan ? "active" : ""
                  }`}
                  onClick={() => handleDeviceToggle("fan")}
                >
                  {/* <span className="toggle-text">
                    {deviceStates.fan && loadingfan ? "ON" : "OFF"}
                  </span> */}
                  <div className="toggle-slider"></div>
                </button>
                <span
                  className={`device-icon fan-icon ${
                    deviceStates.fan && loadingfan ? "on" : "off"
                  }`}
                >
                  <svg
                    width="50"
                    height="50"
                    viewBox="0 0 100 100"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="50" cy="50" r="8" fill="#555" />
                    <g fill={deviceStates.fan ? "#00bfff" : "#888"}>
                      <path d="M50 50 L90 50 L70 30 Z" />
                      <path d="M50 50 L50 90 L30 70 Z" />
                      <path d="M50 50 L10 50 L30 30 Z" />
                    </g>
                  </svg>
                </span>
                {loadingText.fan && (
                  <span className="loading-text">{loadingText.fan}</span>
                )}
              </div>

              {/* Điều hòa */}
              <div className="toggle-item">
                <span className="toggle-label">Điều hòa</span>
                <button
                  className={`toggle-btn ${
                    deviceStates.airConditioner && loadingair ? "active" : ""
                  }`}
                  onClick={() => handleDeviceToggle("airConditioner")}
                >
                  {/* <span className="toggle-text">
                    {deviceStates.airConditioner && loadingair ? "ON" : "OFF"}
                  </span> */}
                  <div className="toggle-slider"></div>
                </button>
                <span
                  className={`device-icon ac-icon ${
                    deviceStates.airConditioner && loadingair ? "on" : "off"
                  }`}
                >
                  ❄️
                </span>
                {loadingText.airConditioner && (
                  <span className="loading-text">
                    {loadingText.airConditioner}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="content-column combined-column">
          <div className="column-content">
            <div className="data-display">
              <Chart isDarkMode={isDarkMode} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Home;
