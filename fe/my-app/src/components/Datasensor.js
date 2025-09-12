import React, { useState, useEffect } from "react";
import "../components/Datasensor.scss"; // Import your CSS file for styling
// let globalSensorData = [];
const Datasensor = () => {
  // Dữ liệu mẫu
  const [sensorData, setSensorData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/datasensor/");
        const allData = await res.json();

        // Lấy 100 bản ghi cuối cùng (dựa vào id lớn nhất)
        const sortedData = allData.sort((a, b) => b.id - a.id); // Sắp xếp giảm dần theo id
        const last100Data = sortedData.slice(0, 100); // Lấy 100 cái đầu (id lớn nhất)

        setSensorData(last100Data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 4000);

    return () => clearInterval(interval);
  }, []);
  // const sensorData = [
  //   {
  //     id: 18825,
  //     temperature: 28,
  //     humidity: 44,
  //     light: 1024,
  //     time: "13:44:40 16/10/2025",
  //   },
  //   {
  //     id: 18826,
  //     temperature: 28,
  //     humidity: 44,
  //     light: 1024,
  //     time: "13:44:42 16/10/2025",
  //   },
  //   {
  //     id: 18827,
  //     temperature: 28,
  //     humidity: 44,
  //     light: 1024,
  //     time: "13:44:44 16/10/2025",
  //   },
  //   {
  //     id: 18828,
  //     temperature: 28,
  //     humidity: 44,
  //     light: 1024,
  //     time: "13:44:46 16/10/2025",
  //   },
  //   {
  //     id: 18829,
  //     temperature: 28,
  //     humidity: 44,
  //     light: 1024,
  //     time: "13:44:48 16/10/2025",
  //   },
  //   {
  //     id: 18830,
  //     temperature: 28,
  //     humidity: 44,
  //     light: 1024,
  //     time: "13:44:50 16/10/2025",
  //   },
  //   {
  //     id: 18831,
  //     temperature: 28,
  //     humidity: 44,
  //     light: 1024,
  //     time: "13:44:52 16/10/2025",
  //   },
  //   {
  //     id: 18832,
  //     temperature: 28,
  //     humidity: 44,
  //     light: 1024,
  //     time: "13:44:54 16/10/2025",
  //   },
  //   {
  //     id: 18833,
  //     temperature: 28,
  //     humidity: 44,
  //     light: 1024,
  //     time: "13:44:56 16/10/2025",
  //   },
  //   {
  //     id: 18834,
  //     temperature: 28,
  //     humidity: 44,
  //     light: 1024,
  //     time: "13:44:58 16/10/2025",
  //   },
  //   {
  //     id: 18835,
  //     temperature: 28,
  //     humidity: 44,
  //     light: 1024,
  //     time: "13:45:00 16/10/2025",
  //   },
  //   {
  //     id: 18836,
  //     temperature: 28,
  //     humidity: 44,
  //     light: 1024,
  //     time: "13:45:02 16/10/2025",
  //   },
  //   {
  //     id: 18837,
  //     temperature: 28,
  //     humidity: 44,
  //     light: 1024,
  //     time: "13:45:04 16/10/2025",
  //   },
  //   {
  //     id: 18838,
  //     temperature: 28,
  //     humidity: 44,
  //     light: 1024,
  //     time: "13:45:06 16/10/2025",
  //   },
  //   {
  //     id: 18839,
  //     temperature: 28,
  //     humidity: 44,
  //     light: 1024,
  //     time: "13:45:08 16/10/2025",
  //   },
  //   {
  //     id: 18840,
  //     temperature: 28,
  //     humidity: 44,
  //     light: 1024,
  //     time: "13:45:10 16/10/2025",
  //   },
  //   {
  //     id: 18841,
  //     temperature: 28,
  //     humidity: 44,
  //     light: 1024,
  //     time: "13:45:12 16/10/2025",
  //   },
  //   {
  //     id: 18842,
  //     temperature: 28,
  //     humidity: 44,
  //     light: 1024,
  //     time: "13:45:14 16/10/2025",
  //   },
  //   {
  //     id: 18843,
  //     temperature: 28,
  //     humidity: 44,
  //     light: 1024,
  //     time: "13:45:16 16/10/2025",
  //   },
  //   {
  //     id: 18844,
  //     temperature: 28,
  //     humidity: 44,
  //     light: 1024,
  //     time: "13:45:18 16/10/2025",
  //   },
  // ];

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const totalPages = Math.ceil(sensorData.length / recordsPerPage);

  // Get current records
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = sensorData.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="sensor-data-container">
      <h1>Data Sensor</h1>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search (ID, Temperature, Humidity, Light, or Time)"
          className="search-input"
        />
        <button className="search-button">Search</button>
      </div>

      <div className="table-container">
        <table className="sensor-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Temperature (°C) ▲▼</th>
              <th>Humidity (%) ▲▼</th>
              <th>Light (mits) ▲▼</th>
              <th>Time ▲▼</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((item, index) => (
              <tr key={`${item.id}-${index}`}>
                <td>{item.id}</td>
                <td>{item.temperature}</td>
                <td>{item.humidity}</td>
                <td>{item.light}</td>
                <td>{item.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="pagination">
        <button
          className="pagination-button"
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        {pageNumbers.map((number) => (
          <button
            key={number}
            className={`pagination-button ${
              currentPage === number ? "active" : ""
            }`}
            onClick={() => paginate(number)}
          >
            {number}
          </button>
        ))}

        <button
          className="pagination-button"
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Datasensor;
