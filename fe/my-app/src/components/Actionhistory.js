import React, { useState, useEffect, useRef, useCallback } from "react";
import "../components/Actionhistoryscss.scss";
const Actionhistory = () => {
  const [actionData, setActionData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [pageSizeInput, setPageSizeInput] = useState("10");
  const [totalPages, setTotalPages] = useState(1);

  // Refs để tránh re-render không cần thiết
  const searchTimeoutRef = useRef(null);

  // Fetch total pages từ API
  const fetchTotalPages = useCallback(
    async (
      pageSize = recordsPerPage,
      device = deviceFilter,
      action = actionFilter
    ) => {
      try {
        const filterData = {};
        if (device && device !== "all") {
          filterData.device = device;
        }
        if (action && action !== "all") {
          filterData.action = action;
        }
        filterData.page_size = pageSize;

        const res = await fetch(
          "http://192.168.70.133:8000/api/historyaction/countpage/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(filterData),
          }
        );
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setTotalPages(data.total_pages);
      } catch (err) {
        console.error("Error fetching total pages:", err);
      }
    },
    [recordsPerPage, deviceFilter, actionFilter]
  );

  // Fetch data với filter từ API
  const fetchData = useCallback(
    async (
      device = deviceFilter,
      action = actionFilter,
      page = currentPage,
      pageSize = recordsPerPage
    ) => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // THÊM

        // Chuẩn bị data để gửi lên API
        const filterData = {};
        if (device && device !== "all") {
          filterData.device = device;
        }
        if (action && action !== "all") {
          filterData.action = action;
        }
        // Thêm pagination parameters
        filterData.page = page;
        filterData.page_size = pageSize;

        // CONSOLE LOG PARAMETERS
        console.log("Filter API Request parameters:", filterData);

        const res = await fetch(
          "http://192.168.70.133:8000/api/historyaction/filter/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(filterData),
          }
        );

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const filteredData = await res.json();
        console.log("📥 DATA RECEIVED for page", page, ":", filteredData);
        console.log("📊 Data length:", filteredData.length);

        // Format thời gian cho dữ liệu nhận về
        const formattedData = filteredData.map((item) => ({
          ...item,
          time: formatTime(item.time),
        }));

        // CHỈ CẬP NHẬT STATE NẾU DỮ LIỆU THỰC SỰ THAY ĐỔI
        setActionData((prevData) => {
          if (JSON.stringify(prevData) === JSON.stringify(formattedData)) {
            return prevData;
          }
          return formattedData;
        });

        // Fetch total pages sau khi có data
        await fetchTotalPages(pageSize, device, action);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [deviceFilter, actionFilter, currentPage, recordsPerPage, fetchTotalPages]
  );

  // Fetch search data từ API search time
  const fetchSearchData = useCallback(
    async (searchValue, page = currentPage, pageSize = recordsPerPage) => {
      if (!searchValue.trim()) {
        fetchData();
        return;
      }

      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // CONSOLE LOG PARAMETERS
        console.log("Search API Request parameters:", {
          time: searchValue,
          page: page,
          page_size: pageSize,
        });

        const res = await fetch(
          "http://192.168.70.133:8000/api/historyaction/search/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              time: searchValue,
              page: page,
              page_size: pageSize,
            }),
          }
        );

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const searchResults = await res.json();

        // Format thời gian cho dữ liệu nhận về
        const formattedData = searchResults.map((item) => ({
          ...item,
          time: formatTime(item.time),
        }));

        setActionData(formattedData);

        // Fetch total pages cho search
        await fetchTotalPages(pageSize);
      } catch (err) {
        console.error("Error searching data:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchData, currentPage, recordsPerPage, fetchTotalPages]
  );

  // Format thời gian
  const formatTime = (timeString) => {
    if (!timeString) return "";
    try {
      if (timeString.includes("T")) {
        const [datePart, timePart] = timeString.split("T");
        const cleanTimePart = timePart.split(".")[0];
        return `${datePart} / ${cleanTimePart}`;
      }
      return timeString;
    } catch (error) {
      return timeString;
    }
  };

  // Debounce search
  const handleSearch = useCallback(
    (value, page = 1, pageSize = recordsPerPage) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        if (value.trim() === "") {
          fetchData(deviceFilter, actionFilter, page, pageSize);
        } else {
          fetchSearchData(value, page, pageSize);
        }
        setCurrentPage(page);
      }, 500);
    },
    [fetchData, fetchSearchData, deviceFilter, actionFilter, recordsPerPage]
  );

  useEffect(() => {
    // CHỈ FETCH DATA KHI COMPONENT MOUNT
    fetchData();

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []); // Empty dependency array - chỉ chạy 1 lần

  // Cập nhật filteredData khi actionData thay đổi
  useEffect(() => {
    setFilteredData(actionData);
  }, [actionData]);

  // Handle filter change
  const handleFilterChange = (device, action) => {
    setDeviceFilter(device);
    setActionFilter(action);
    setCurrentPage(1);
    fetchData(device, action, 1, recordsPerPage);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleSearch(value, 1, recordsPerPage);
  };

  // Handle search khi nhấn Enter
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch(searchTerm, 1, recordsPerPage);
    }
  };

  // Handle search button click
  const handleSearchClick = () => {
    handleSearch(searchTerm, 1, recordsPerPage);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setDeviceFilter("all");
    setActionFilter("all");
    setCurrentPage(1);
    fetchData("all", "all", 1, recordsPerPage);
  };

  // Sử dụng trực tiếp filteredData (đã được API phân trang)
  const currentRecords = filteredData;

  // Change page
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);

    if (searchTerm.trim()) {
      // Nếu đang search, gọi API search với page mới
      fetchSearchData(searchTerm, pageNumber, recordsPerPage);
    } else {
      // Nếu không, gọi API filter với page mới
      fetchData(deviceFilter, actionFilter, pageNumber, recordsPerPage);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      pageNumbers.push(1);
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) endPage = 4;
      else if (currentPage >= totalPages - 2) startPage = totalPages - 3;

      if (startPage > 2) pageNumbers.push("...");
      for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
      if (endPage < totalPages - 1) pageNumbers.push("...");
      if (totalPages > 1) pageNumbers.push(totalPages);
    }
    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  const handlePageSizeInputChange = (e) => setPageSizeInput(e.target.value);
  const handlePageSizeFocus = (e) => {
    e.target.select();
    setPageSizeInput("");
  };

  const handlePageSizeBlur = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 10) {
      setRecordsPerPage(value);
      setPageSizeInput(value.toString());
      setCurrentPage(1);

      if (searchTerm.trim()) {
        fetchSearchData(searchTerm, 1, value);
      } else {
        fetchData(deviceFilter, actionFilter, 1, value);
      }
    } else {
      setPageSizeInput(recordsPerPage.toString());
    }
  };

  const handlePageSizeKeyPress = (e) => {
    if (e.key === "Enter") {
      const value = parseInt(e.target.value);
      if (!isNaN(value) && value >= 10) {
        setRecordsPerPage(value);
        setPageSizeInput(value.toString());
        setCurrentPage(1);

        if (searchTerm.trim()) {
          fetchSearchData(searchTerm, 1, value);
        } else {
          fetchData(deviceFilter, actionFilter, 1, value);
        }
        e.target.blur();
      }
    }
  };

  const incrementPageSize = () => {
    const newSize = recordsPerPage + 1;
    setRecordsPerPage(newSize);
    setPageSizeInput(newSize.toString());
    setCurrentPage(1);

    if (searchTerm.trim()) {
      fetchSearchData(searchTerm, 1, newSize);
    } else {
      fetchData(deviceFilter, actionFilter, 1, newSize);
    }
  };

  const decrementPageSize = () => {
    const newSize = Math.max(10, recordsPerPage - 1);
    setRecordsPerPage(newSize);
    setPageSizeInput(newSize.toString());
    setCurrentPage(1);

    if (searchTerm.trim()) {
      fetchSearchData(searchTerm, 1, newSize);
    } else {
      fetchData(deviceFilter, actionFilter, 1, newSize);
    }
  };

  // Copy thời gian
  const copyTime = (time) => {
    navigator.clipboard
      .writeText(time)
      .then(() => console.log("Copied:", time));
  };

  return (
    <div className="action-history-container">
      <h1> {new Date().toLocaleDateString("vi-VN")}</h1>

      <div className="search-container">
        <div className="filter-group">
          <div className="filter-controls">
            <label>Filter by: </label>
            <select
              className="filter-select"
              value={deviceFilter}
              onChange={(e) => handleFilterChange(e.target.value, actionFilter)}
              disabled={isLoading}
            >
              <option value="all">All Devices</option>
              <option value="device1">Quạt</option>
              <option value="device2">Đèn</option>
              <option value="device3">Điều hòa</option>
            </select>

            <select
              className="filter-select"
              value={actionFilter}
              onChange={(e) => handleFilterChange(deviceFilter, e.target.value)}
              disabled={isLoading}
            >
              <option value="all">All Actions</option>
              <option value="on">ON</option>
              <option value="off">OFF</option>
            </select>

            {isLoading && <span className="loading-text">Loading...</span>}
          </div>
        </div>

        <div className="search-group">
          <input
            type="text"
            placeholder="Tìm kiếm theo thời gian..."
            className="search-input"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button
            className="search-button"
            onClick={handleSearchClick}
            disabled={isLoading}
          >
            Tìm kiếm
          </button>
          <button
            className="reset-button"
            onClick={resetFilters}
            disabled={isLoading}
          >
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
              <th>Copy</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((item, index) => (
              <tr key={`${item.id}-${item.time}-${index}`}>
                <td>
                  {item.id || index + 1 + (currentPage - 1) * recordsPerPage}
                </td>
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
                <td>
                  <button
                    className="copy-time-btn"
                    onClick={() => copyTime(item.time)}
                    disabled={isLoading}
                  >
                    Copy
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination-container">
        <div className="pagination-info">
          Hiển thị{" "}
          {filteredData.length === 0
            ? 0
            : (currentPage - 1) * recordsPerPage + 1}{" "}
          đến{" "}
          {Math.min(
            currentPage * recordsPerPage,
            (currentPage - 1) * recordsPerPage + filteredData.length
          )}{" "}
          trong tổng số {totalPages * recordsPerPage} bản ghi
          {(deviceFilter !== "all" || actionFilter !== "all" || searchTerm) && (
            <span className="filter-info">
              {" "}
              | Đang lọc:
              {deviceFilter !== "all" &&
                ` Thiết bị: ${
                  deviceFilter === "device1"
                    ? "Quạt"
                    : deviceFilter === "device2"
                    ? "Đèn"
                    : "Điều hòa"
                }`}
              {actionFilter !== "all" && ` Hành động: ${actionFilter}`}
              {searchTerm && ` Thời gian: "${searchTerm}"`}
            </span>
          )}
        </div>

        <div className="pagination-controls">
          <div className="page-size-selector">
            <label>Hiển thị: </label>
            <div className="page-size-control">
              <button
                className="page-size-btn"
                onClick={decrementPageSize}
                disabled={recordsPerPage <= 10 || isLoading}
              >
                -
              </button>
              <input
                type="number"
                min="10"
                value={pageSizeInput}
                onChange={handlePageSizeInputChange}
                onFocus={handlePageSizeFocus}
                onBlur={handlePageSizeBlur}
                onKeyPress={handlePageSizeKeyPress}
                className="page-size-input"
                disabled={isLoading}
              />
              <button
                className="page-size-btn"
                onClick={incrementPageSize}
                disabled={isLoading}
              >
                +
              </button>
            </div>
            <span>bản ghi </span>
          </div>

          <div className="pagination-buttons">
            <button
              className="pagination-button"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
            >
              Trước
            </button>

            {pageNumbers.map((number, index) =>
              number === "..." ? (
                <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                  ...
                </span>
              ) : (
                <button
                  key={number}
                  className={`pagination-button ${
                    currentPage === number ? "active" : ""
                  }`}
                  onClick={() => paginate(number)}
                  disabled={isLoading}
                >
                  {number}
                </button>
              )
            )}

            <button
              className="pagination-button"
              onClick={() => paginate(currentPage + 1)}
              disabled={
                currentPage === totalPages || totalPages === 0 || isLoading
              }
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Actionhistory;
