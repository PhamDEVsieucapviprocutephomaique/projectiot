import { useState, useEffect } from "react";
import "../components/Actionhistoryscss.scss"; // Import your CSS file for styling

const Actionhistory = () => {
  const [actionData, setActionData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("asc");

  // Fetch data từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/historyaction/");
        const data = await res.json();

        // Format time to Vietnamese format: YYYY-MM-DD / HH:MM:SS
        const formattedData = data.map((item) => ({
          ...item,
          time: formatTime(item.time),
          timestamp: new Date(item.time), // Thêm timestamp để sort theo thời gian
        }));

        // Giữ tối đa 100 bản ghi (queue)
        if (formattedData.length > 100) {
          setActionData(formattedData.slice(0, 100));
        } else {
          setActionData(formattedData);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
    // Cập nhật mỗi 5 giây
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

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

  // Apply filters and search
  useEffect(() => {
    let result = [...actionData];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((item) => {
        // Map Vietnamese device names to device values
        const deviceMapping = {
          quạt: "device1",
          quat: "device1",
          đèn: "device2",
          den: "device2",
          "điều hòa": "device3",
          "dieu hoa": "device3",
          "điều hào": "device3",
          "dieu hao": "device3",
        };

        // Check if search term matches a device name
        const deviceValue = deviceMapping[term] || term;

        return (
          item.id.toString().includes(term) ||
          item.device.toLowerCase().includes(deviceValue) ||
          item.action.toLowerCase().includes(term) ||
          item.time.toLowerCase().includes(term)
        );
      });
    }

    // Apply device filter
    if (deviceFilter !== "all") {
      result = result.filter((item) => item.device === deviceFilter);
    }

    // Apply action filter
    if (actionFilter !== "all") {
      result = result.filter(
        (item) => item.action.toLowerCase() === actionFilter.toLowerCase()
      );
    }

    // Apply sorting by time
    result.sort((a, b) => {
      const dateA = new Date(a.timestamp || a.time);
      const dateB = new Date(b.timestamp || b.time);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    setFilteredData(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [actionData, searchTerm, deviceFilter, actionFilter, sortOrder]);

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setDeviceFilter("all");
    setActionFilter("all");
    setSortOrder("asc");
  };

  // Handle Enter key press in search input
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      // Just trigger the useEffect by updating state
      setSearchTerm(e.target.value);
    }
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

  return (
    <div className="action-history-container">
      <h1>Action History</h1>

      <div className="search-container">
        <div className="filter-group">
          <select
            value={deviceFilter}
            onChange={(e) => setDeviceFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả thiết bị</option>
            <option value="device1">Quạt</option>
            <option value="device2">Đèn</option>
            <option value="device3">Điều hòa</option>
          </select>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả hành động</option>
            <option value="ON">ON</option>
            <option value="OFF">OFF</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="filter-select"
          >
            <option value="asc">Thời gian: Cũ đến mới</option>
            <option value="desc">Thời gian: Mới đến cũ</option>
          </select>
        </div>

        <div className="search-group">
          <input
            type="text"
            placeholder="Tìm kiếm (ID, Thiết bị, Hành động, Thời gian)"
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="search-button">Tìm kiếm</button>
          <button className="reset-button" onClick={resetFilters}>
            Hủy
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="action-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Thiết bị</th>
              <th>Hành động</th>
              <th>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((item) => (
              <tr key={`${item.id}-${item.time}`}>
                <td>{item.id}</td>
                <td>
                  {item.device === "device1"
                    ? "Quạt"
                    : item.device === "device2"
                    ? "Đèn"
                    : item.device === "device3"
                    ? "Điều hòa"
                    : item.device}
                </td>
                <td className={`action ${item.action.toLowerCase()}`}>
                  {item.action}
                </td>
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
          Trước
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
          Sau
        </button>
      </div>
    </div>
  );
};
export default Actionhistory;
