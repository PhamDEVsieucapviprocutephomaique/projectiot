import "../components/Homescss.scss";
import React, { useState, useEffect, useRef } from "react";
import Chart from "./Chart";
import "./darkmode.scss";
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

  // const eventSourceRef = useRef(null);

  // ✅ 1. Lấy trạng thái ban đầu khi web load
  useEffect(() => {
    async function fetchInitialDeviceStates() {
      try {
        const deviceMap = {
          led: "device1",
          fan: "device2",
          airConditioner: "device3",
        };

        const newDeviceStates = {};

        for (const [device, apiDevice] of Object.entries(deviceMap)) {
          const response = await fetch(
            `http://127.0.0.1:8000/api/historyaction/laster/${apiDevice}`
          );
          const data = await response.json();
          const apiValue = data[apiDevice];

          newDeviceStates[device] = apiValue === "on";

          if (device === "led") {
            setloadingled(apiValue === "on");
          } else if (device === "fan") {
            setloadingfan(apiValue === "on");
          } else if (device === "airConditioner") {
            setloadingair(apiValue === "on");
          }
        }

        setDeviceStates(newDeviceStates);
        console.log("Initial device states:", newDeviceStates);
      } catch (error) {
        console.error("Error fetching initial device states:", error);
      }
    }

    fetchInitialDeviceStates();
  }, []);

  // ✅ 2. Kết nối SSE để nhận realtime update từ backend
  useEffect(() => {
    const eventSource = new EventSource(
      "http://127.0.0.1:8000/api/device/stream/"
    );

    eventSource.onopen = () => {
      console.log("✅ SSE Connected - readyState:", eventSource.readyState);
    };
    eventSource.onmessage = (event) => {
      console.log("🎉 🎉 🎉 FINALLY RECEIVED IN FRONTEND:", event.data);

      const data = JSON.parse(event.data);
      console.log("📡 Parsed data:", data);
      const deviceMap = {
        device1: "led",
        device2: "fan",
        device3: "airConditioner",
      };

      const device = deviceMap[data.device];
      const isOn = data.action === "on";

      // Cập nhật state khi nhận được từ backend
      setDeviceStates((prev) => ({ ...prev, [device]: isOn }));

      if (device === "led") {
        setloadingled(isOn);
        console.log(`💡 LED ${isOn ? "ON" : "OFF"}`);
      }
      if (device === "fan") {
        setloadingfan(isOn);
        console.log(`🌀 Fan ${isOn ? "ON" : "OFF"}`);
      }
      if (device === "airConditioner") {
        setloadingair(isOn);
        console.log(`❄️ AC ${isOn ? "ON" : "OFF"}`);
      }

      // toast.success(`✅ ${device} đã ${isOn ? "bật" : "tắt"}`, {
      //   position: "top-right",
      //   autoClose: 2000,
      // });
    };
    eventSource.onerror = (error) => {
      console.error(
        "❌ SSE Error - readyState:",
        eventSource.readyState,
        error
      );
    };
  }, []);

  // Dark mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // ✅ 3. Handle toggle - CHỈ GỬI LỆNH, SSE sẽ tự động cập nhật UI
  const handleDeviceToggle = async (device) => {
    const newState = !deviceStates[device];

    try {
      const deviceMap = {
        led: "device1",
        fan: "device2",
        airConditioner: "device3",
      };

      const payload = { [deviceMap[device]]: newState ? "on" : "off" };

      console.log("📤 Sending command:", payload);

      // Gửi lệnh lên backend
      const response = await fetch("http://127.0.0.1:8000/api/device/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {}
  };

  // Sensor data
  const [temp, setTemp] = useState(null);
  const [hump, setHump] = useState(null);
  const [light, setLight] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          "http://127.0.0.1:8000/api/datasensor/latest/"
        );
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

  // Light alert
  const [lightAlertActive, setLightAlertActive] = useState(false);

  useEffect(() => {
    let intervalId;

    if (light !== null && light > 50) {
      setLightAlertActive(true);

      toast.warning(`⚠️ Ánh sáng quá cao: ${light} lux`, {
        position: "top-right",
        autoClose: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        toastId: "light-alert",
      });

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
      toast.dismiss("light-alert");
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [light]);

  // Color functions
  const getTemperatureColor = (value) => {
    if (value == null) return "#aaa";
    const min = 15;
    const max = 40;
    const ratio = Math.min(Math.max((value - min) / (max - min), 0), 1);
    return `rgb(${Math.floor(255 * ratio)}, 0, 0)`;
  };

  const getHumidityColor = (value) => {
    if (value == null) return "#aaa";
    const min = 0;
    const max = 100;
    const ratio = Math.min(Math.max(value / max, 0), 1);
    return `rgb(0, ${Math.floor(150 + 105 * ratio)}, 255)`;
  };

  const getLightColor = (value) => {
    if (value == null) return "#aaa";
    const min = 0;
    const max = 1000;
    const ratio = Math.min(Math.max(value / max, 0), 1);
    return `rgb(${Math.floor(255)}, ${Math.floor(255 * ratio)}, 0)`;
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
                  <div className="toggle-slider"></div>
                </button>
                <span
                  className={`device-icon led-icon ${
                    loadingled && deviceStates.led ? "on" : "off"
                  }`}
                >
                  💡
                </span>
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
                  <div className="toggle-slider"></div>
                </button>
                <span
                  className={`device-icon ac-icon ${
                    deviceStates.airConditioner && loadingair ? "on" : "off"
                  }`}
                >
                  ❄️
                </span>
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
