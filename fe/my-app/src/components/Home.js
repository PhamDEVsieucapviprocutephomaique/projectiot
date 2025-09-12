import "../components/Homescss.scss";
import React, { useState, useEffect } from "react";
import Chart from "./Chart";
import Chart2 from "./Chart2";
const Home = () => {
  // 1. Khởi tạo state với giá trị từ localStorage
  const [deviceStates, setDeviceStates] = useState(() => {
    const savedStates = localStorage.getItem("deviceStates");
    return savedStates
      ? JSON.parse(savedStates)
      : {
          led: false,
          fan: false,
          airConditioner: false,
        };
  });

  // 2. Thêm useEffect để lưu vào localStorage khi state thay đổi
  useEffect(() => {
    localStorage.setItem("deviceStates", JSON.stringify(deviceStates));
  }, [deviceStates]);

  const handleDeviceToggle = async (device) => {
    const newState = !deviceStates[device];

    setDeviceStates((prev) => ({
      ...prev,
      [device]: newState,
    }));

    try {
      const deviceMap = {
        led: "device1",
        fan: "device2",
        airConditioner: "device3",
      };

      const payload = {
        [deviceMap[device]]: newState ? "on" : "off",
      };
      console.log(payload);

      try {
        const response = await fetch("http://localhost:8000/api/device/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        console.log("Response từ BE:", data);
      } catch (error) {
        console.error("Lỗi:", error);
      }
    } catch (error) {
      setDeviceStates((prev) => ({
        ...prev,
        [device]: !newState,
      }));
    }
  };
  const [temp, setTemp] = useState(null);
  const [hump, setHump] = useState(null);
  const [light, setLight] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("http://localhost:8000/api/datasensor/latest/");
        const data = await res.json();

        // set vào state
        setTemp(data.temperature);
        setHump(data.humidity);
        setLight(data.light);
      } catch (err) {
        console.error("Error fetching:", err);
      }
    }

    fetchData(); // gọi 1 lần khi mount
    const interval = setInterval(fetchData, 5000); // gọi lại mỗi 5s

    return () => clearInterval(interval); // cleanup khi unmount
  }, []);
  return (
    <div className="environment-monitor">
      {/* Header với 4 phần tử */}
      <div className="iaaaa">ptit1234567890</div>
      <header className="monitor-header">
        <div className="header-item device-header">Device </div>
        <div className="header-item light-header">Light : {light} lux</div>
        <div className="header-item humidity-header">Humidity : {hump} %</div>
        <div className="header-item temperature-header">
          Temperature : {temp} ºC
        </div>
      </header>
      {console.log(light)}

      {/* Nội dung chính */}
      <div className="monitor-content">
        {/* Cột Device với 3 nút dọc */}
        <div className="content-column device-column">
          <div className="column-content">
            <div className="button-container">
              <div className="toggle-item">
                <span className="toggle-label">Đèn</span>
                <button
                  className={`toggle-btn ${deviceStates.led ? "active" : ""}`}
                  onClick={() => handleDeviceToggle("led")}
                >
                  <span className="toggle-text">
                    {deviceStates.led ? "ON" : "OFF"}
                  </span>
                  <div className="toggle-slider"></div>
                </button>
              </div>

              <div className="toggle-item">
                <span className="toggle-label">quat</span>
                <button
                  className={`toggle-btn ${deviceStates.fan ? "active" : ""}`}
                  onClick={() => handleDeviceToggle("fan")}
                >
                  <span className="toggle-text">
                    {deviceStates.fan ? "ON" : "OFF"}
                  </span>
                  <div className="toggle-slider"></div>
                </button>
                {/* <span className="toggle-label">FAN</span> */}
              </div>

              <div className="toggle-item">
                <span className="toggle-label">điều hoa</span>
                <button
                  className={`toggle-btn ${
                    deviceStates.airConditioner ? "active" : ""
                  }`}
                  onClick={() => handleDeviceToggle("airConditioner")}
                >
                  <span className="toggle-text">
                    {deviceStates.airConditioner ? "ON" : "OFF"}
                  </span>
                  <div className="toggle-slider"></div>
                </button>
                {/* <span className="toggle-label">điều hoa</span> */}
              </div>
            </div>
          </div>
        </div>

        {/* Cột Light */}
        <div className="content-column light-column">
          <div className="column-content">
            <div className="data-display">
              {/* <span>Light Data</span> */}
              <Chart></Chart>
            </div>
          </div>
        </div>

        {/* Cột chung cho Humidity và Temperature */}
        <div className="content-column combined-column">
          <div className="column-content">
            <div className="data-display">
              {/* <span>Humidity & Temperature Data</span> */}
              <Chart2></Chart2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Home;
