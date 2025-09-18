import React, { useState, useEffect } from "react";
import "../components/Datasensor.scss";

const Datasensor = () => {
  const [sensorData, setSensorData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("time");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isDefaultView, setIsDefaultView] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/datasensor/");
        const allData = await res.json();

        // Format time to Vietnamese format: YYYY-MM-DD / HH:MM:SS
        const formattedData = allData.map((item) => ({
          ...item,
          time: formatTime(item.time),
          timestamp: new Date(item.time), // Thêm timestamp để sort theo thời gian
        }));

        // Mặc định sort theo thời gian mới nhất (desc)
        const sortedByTime = formattedData.sort(
          (a, b) => b.timestamp - a.timestamp
        );

        // Lấy 100 bản ghi mới nhất
        const recentData = sortedByTime.slice(0, 100);

        // Thêm displayId từ 1-100 theo thứ tự thời gian
        const dataWithDisplayId = recentData.map((item, index) => ({
          ...item,
          displayId: index + 1,
        }));

        setSensorData(dataWithDisplayId);

        // Nếu là default view, áp dụng sort mặc định
        if (isDefaultView) {
          const sorted = sortData(dataWithDisplayId, "time", "desc");
          setFilteredData(sorted);
        } else {
          // Giữ sort hiện tại
          const sorted = sortData(dataWithDisplayId, sortType, sortOrder);
          setFilteredData(sorted);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    // Only set up interval if we're in default view
    let interval;
    if (isDefaultView) {
      fetchData();
      interval = setInterval(fetchData, 5000);
    } else {
      fetchData(); // Still fetch once even if not default view
    }

    return () => clearInterval(interval);
  }, [sortType, sortOrder, isDefaultView]);

  // Format time from "2025-09-18T22:14:44.267098" to "2025-09-18 / 22:14:44"
  const formatTime = (timeString) => {
    if (!timeString) return "";

    try {
      // Handle ISO format: 2025-09-18T22:14:44.267098
      if (timeString.includes("T")) {
        const [datePart, timePart] = timeString.split("T");
        const cleanTimePart = timePart.split(".")[0]; // Remove milliseconds

        return `${datePart} / ${cleanTimePart}`;
      }

      // Return original if format is unexpected
      return timeString;
    } catch (error) {
      console.error("Error formatting time:", error);
      return timeString;
    }
  };

  // Function to sort data
  const sortData = (data, type, order) => {
    return [...data].sort((a, b) => {
      let valueA, valueB;

      switch (type) {
        case "temperature":
          valueA = parseFloat(a.temperature);
          valueB = parseFloat(b.temperature);
          break;
        case "humidity":
          valueA = parseFloat(a.humidity);
          valueB = parseFloat(b.humidity);
          break;
        case "light":
          valueA = parseFloat(a.light);
          valueB = parseFloat(b.light);
          break;
        case "time":
          valueA = a.timestamp;
          valueB = b.timestamp;
          break;
        case "id":
        default:
          valueA = a.displayId;
          valueB = b.displayId;
      }

      if (order === "asc") {
        return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
      } else {
        return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
      }
    });
  };

  // Handle search
  const handleSearch = () => {
    if (!searchTerm) {
      // Reset to default view
      const sorted = sortData(sensorData, "time", "desc");
      setFilteredData(sorted);
      setSortType("time");
      setSortOrder("desc");
      setIsDefaultView(true);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = sensorData.filter(
      (item) =>
        item.displayId.toString().includes(term) ||
        item.temperature.toString().includes(term) ||
        item.humidity.toString().includes(term) ||
        item.light.toString().includes(term) ||
        item.time.toLowerCase().includes(term)
    );

    setFilteredData(filtered);
    setCurrentPage(1);
    setIsDefaultView(false);
  };

  // Clear search and return to default view
  const clearSearch = () => {
    setSearchTerm("");
    const sorted = sortData(sensorData, "time", "desc");
    setFilteredData(sorted);
    setSortType("time");
    setSortOrder("desc");
    setCurrentPage(1);
    setIsDefaultView(true);
  };

  // Handle sort change - instant sorting
  const handleSortChange = (type) => {
    let newOrder = "asc";

    // If clicking the same header, toggle order
    if (sortType === type) {
      newOrder = sortOrder === "asc" ? "desc" : "asc";
    }

    setSortType(type);
    setSortOrder(newOrder);

    // Apply sorting immediately to filteredData
    const sorted = sortData(filteredData, type, newOrder);
    setFilteredData(sorted);

    setIsDefaultView(false);
    setCurrentPage(1);
  };

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  // Get current records
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredData.slice(
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

  // Function to get sort indicator
  const getSortIndicator = (type) => {
    if (sortType !== type) return "▲▼";
    return sortOrder === "asc" ? "▲" : "▼";
  };

  return (
    <div className="sensor-data-container">
      <h1>Data Sensor</h1>

      <div className="controls-container">
        <div className="sort-controls">
          <label>Sort by: </label>
          <select
            value={sortType}
            onChange={(e) => {
              const type = e.target.value;
              setSortType(type);
              setIsDefaultView(false);
              // Apply sorting immediately
              const sorted = sortData(filteredData, type, sortOrder);
              setFilteredData(sorted);
            }}
            className="sort-select"
          >
            <option value="id">ID</option>
            <option value="temperature">Temperature</option>
            <option value="humidity">Humidity</option>
            <option value="light">Light</option>
            <option value="time">Time</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => {
              const order = e.target.value;
              setSortOrder(order);
              setIsDefaultView(false);
              // Apply sorting immediately
              const sorted = sortData(filteredData, sortType, order);
              setFilteredData(sorted);
            }}
            className="sort-order-select"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search (ID, Temperature, Humidity, Light, or Time)"
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className="search-button" onClick={handleSearch}>
            Search
          </button>
          <button className="clear-search-button" onClick={clearSearch}>
            Clear
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="sensor-table">
          <thead>
            <tr>
              <th onClick={() => handleSortChange("id")}>
                ID {getSortIndicator("id")}
              </th>
              <th onClick={() => handleSortChange("temperature")}>
                Temperature (°C) {getSortIndicator("temperature")}
              </th>
              <th onClick={() => handleSortChange("humidity")}>
                Humidity (%) {getSortIndicator("humidity")}
              </th>
              <th onClick={() => handleSortChange("light")}>
                Light (mits) {getSortIndicator("light")}
              </th>
              <th onClick={() => handleSortChange("time")}>
                Time {getSortIndicator("time")}
              </th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((item, index) => (
              <tr key={`${item.id}-${index}`}>
                <td>{item.displayId}</td>
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
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Datasensor;
